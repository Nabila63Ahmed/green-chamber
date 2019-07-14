/* eslint-disable quotes */
import axios from 'axios';
import fs from 'fs';
import _ from 'lodash';
import {
  getLastTemperatureRecord,
  insertTemperatureRecord,
} from '../services/temperature';
import {
  getLastHumidityRecord,
  insertHumidityRecord,
} from '../services/humidity';
import { getLastMotionRecord, insertMotionRecord } from '../services/motion';
import { getEvents } from '../datasources/google-calendar';
import { now, add, subtract, toISOString } from '../utilities';
import * as amqp from '../amqp';

const state = {
  lamp: false,
  fan: false,
  motion: 0,
  temperature: 24,
  humidity: 40,
  meeting: false,
};

// Domain is static and it is loaded from the file
let domain = '';

fs.readFile('./src/logic/data/domain.pddl', 'utf8', (err, domainContent) => {
  if (err) throw err;

  domain = domainContent;
});

// Problem changes and it is defined as string
let problem = `(define (problem problem-green-chamber)
  (:domain green-chamber)
  (:objects
    calendar_o - calendar
    temperature_o - temperature
    humidity_o - humidity
    motion_o - motion
    lamp_o - lamp
    fan_o - fan)\n`;

const goal = `(:goal
    (and (comfort)
         (efficiency)
    )))`;

const solve = async (domain, problem) => {
  let initialState = `(:init\n`;
  initialState = `${initialState} ${state.lamp ? ' (on lamp_o)\n' : ''}`;
  initialState = `${initialState} ${state.fan ? ' (on fan_o)\n' : ''}`;
  initialState = `${initialState} ${
    state.motion === 1 ? ' (movement motion_o)\n' : ''
  }`;
  initialState = `${initialState} (= (current_temperature) ${state.temperature})\n`;
  initialState = `${initialState} (= (current_humidity) ${state.humidity})\n`;
  initialState = `${initialState} ${
    state.meeting ? ' (meeting calendar_o)\n' : ''
  }`;
  initialState = `${initialState})\n`;
  problem = `${problem} ${initialState} ${goal}`;

  // console.log(domain);
  // console.log(problem);

  let actions = [];

  try {
    const response = await axios.post(
      'http://solver.planning.domains/solve-and-validate',
      {
        domain,
        problem,
      },
    );
    // console.log(response.data);
    response.data.result.plan.forEach(value => {
      actions.push(value.name);
      // console.log(value.name);
    });
  } catch (error) {
    console.log(error.data);
  }
  return actions;
};

const preprocessing = async ({ serverState, calendar, channel }) => {
  const temperature = await getLastTemperatureRecord();
  state.temperature = _.get(temperature, 'value', 24);

  const humidity = await getLastHumidityRecord();
  state.humidity = _.get(humidity, 'value', 40);

  const motion = await getLastMotionRecord();
  state.motion = _.get(motion, 'value', 0);

  state.lamp = serverState.isLampOn;
  state.fan = serverState.isFanOn;

  const minTime = subtract('minutes')(1)(now());
  const maxTime = add('minutes')(1)(now());

  const events = await getEvents({
    calendar,
    query: {
      calendarId: 'green.chamber.iot@gmail.com',
      timeMin: toISOString(minTime),
      timeMax: toISOString(maxTime),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 10,
    },
  });

  state.meeting = events.length > 0;

  if (events.length > 0) {
    const [firstEvent] = events;

    const text = `Current meeting: ${firstEvent.summary}`;
    state.lcdDisplayText = text;

    await amqp.publish({
      channel,
      exchangeName: 'actuators-exchange',
      routingKey: 'actuators.lcd',
      messageJSON: {
        value: text,
      },
    });
  } else {
    const text = 'No ongoing event';
    state.lcdDisplayText = text;

    await amqp.publish({
      channel,
      exchangeName: 'actuators-exchange',
      routingKey: 'actuators.lcd',
      messageJSON: {
        value: text,
      },
    });
  }
};

const postprocessing = async ({
  serverState,
  channel,
  actions,
  // io
}) => {
  if (actions.length > 0) {
    actions.forEach(async action => {
      const actionName = action.substring(1, action.length).split(' ')[0];
      switch (actionName) {
        case 'switch-on-lamp':
          console.log(actionName);
          serverState.isLampOn = true;
          state.lamp = true;
          await amqp.publish({
            channel,
            exchangeName: 'actuators-exchange',
            routingKey: 'actuators.plugwise.lamp',
            messageJSON: {
              value: true,
            },
          });
          // io.sockets.emit('lamp-state-changed', true );
          break;

        case 'switch-off-lamp':
          console.log(actionName);
          serverState.isLampOn = false;
          state.lamp = false;
          await amqp.publish({
            channel,
            exchangeName: 'actuators-exchange',
            routingKey: 'actuators.plugwise.lamp',
            messageJSON: {
              value: false,
            },
          });
          // io.sockets.emit('lamp-state-changed', false );
          break;

        case 'switch-on-fan':
          console.log(actionName);
          serverState.isFanOn = true;
          state.fan = true;
          await amqp.publish({
            channel,
            exchangeName: 'actuators-exchange',
            routingKey: 'actuators.plugwise.fan',
            messageJSON: {
              value: true,
            },
          });
          // io.sockets.emit('fan-state-changed', true );
          break;

        case 'switch-off-fan':
          console.log(actionName);
          serverState.isFanOn = false;
          state.fan = false;
          await amqp.publish({
            channel,
            exchangeName: 'actuators-exchange',
            routingKey: 'actuators.plugwise.fan',
            messageJSON: {
              value: false,
            },
          });
          // io.sockets.emit('fan-state-changed', false );
          break;

        default:
          console.log(actionName);
      }
    });
  }
};

/**
 * Process received message
 * 1. send record through socket to the connected client
 * 2. insert record into the database
 * 3. execute actions given by the planner
 */
export const handleMessageReceived = async ({
  routingKey,
  message,
  serverState,
  calendar,
  channel,
  // io
}) => {
  const route = routingKey.split('.');

  if (route[0] === 'sensors') {
    const type = route[1];

    await preprocessing({
      serverState,
      calendar,
      channel,
    });

    if (type === 'temperature') {
      state.temperature = message.value;
      // io.sockets.emit('temperature-changed', message);
      await insertTemperatureRecord(message);
    }

    if (type === 'humidity') {
      state.humidity = message.value;
      // io.sockets.emit('humidity-changed', message);
      await insertHumidityRecord(message);
    }

    if (type === 'motion') {
      state.motion = message.value;
      await insertMotionRecord(message);
    }

    const actions = await solve(domain, problem);

    await postprocessing({
      serverState,
      channel,
      actions,
      // io,
    });
  }

  return null;
};
