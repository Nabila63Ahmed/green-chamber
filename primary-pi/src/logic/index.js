/* eslint-disable quotes */
import axios from 'axios';
import fs, { stat } from 'fs';
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
  temperature: 20,
  humidity: 45,
  meeting: false,
};

// Domain is static and it is loaded from the file
let domain = '';

fs.readFile('./src/logic/data/domain.pddl', 'utf8', (err, domainContent) => {
  if (err) throw err;

  domain = domainContent;
});

// Problem changes and it is defined as string
var problem = `(define (problem problem-green-chamber)
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

// function convertToPDDL(problem, goal) {
//   // var initialState = `(:init
//   //   (on fanO)
//   //   (movement motionO)
//   //   (meeting calendarO))\n`;
//
//   let initialState = `(:init\n`;
//   initialState = `${initialState} ${state.lamp ? ' (on lampO)\n' : ''}`;
//   initialState = `${initialState} ${state.fan ? ' (on fanO)\n' : ''}`;
//   initialState = `${initialState} ${
//     state.motion == 1 ? ' (movement motionO)\n' : ''
//   }`;
//   initialState = `${initialState} (= (current_temperature) ${state.temperature})\n`;
//   initialState = `${initialState} (= (current_humidity) ${state.humidity})\n`;
//   initialState = `${initialState} ${
//     state.meeting ? ' (meeting calendarO)\n' : ''
//   }`;
//   initialState = `${initialState})\n`;
//
//   // goal = `${goal} ${
//   //   state.hot || state.damp ? ' (on fanO)' : ' (not (on fanO))'
//   // }\n`;
//   // goal = `${goal} ${
//   //   state.movement && state.meeting ? ' (on lampO)' : ' (not (on lampO))'
//   // }\n`;
//   // goal = `${goal} ${
//   //   state.meeting ? ' (occupied lcdO)' : ' (not (occupied lcdO))'
//   // }`;
//   // goal = `${goal}))`;
//
//   problem = `${problem} ${initialState} ${goal}`;
//   console.log(problem);
//   console.log(domain);
//
//   solve();
// }

function solve(domain, problem, serverState, channel) {
  let initialState = `(:init\n`;
  initialState = `${initialState} ${state.lamp ? ' (on lamp_o)\n' : ''}`;
  initialState = `${initialState} ${state.fan ? ' (on fan_o)\n' : ''}`;
  initialState = `${initialState} ${
    state.motion == 1 ? ' (movement motion_o)\n' : ''
  }`;
  initialState = `${initialState} (= (current_temperature) ${state.temperature})\n`;
  initialState = `${initialState} (= (current_humidity) ${state.humidity})\n`;
  initialState = `${initialState} ${
    state.meeting ? ' (meeting calendar_o)\n' : ''
  }`;
  initialState = `${initialState})\n`;
  problem = `${problem} ${initialState} ${goal}`;

  console.log(domain);
  console.log(problem);

  var actions = [];

  axios
    .post('http://solver.planning.domains/solve-and-validate', {
      domain,
      problem,
    })
    .then(res => {
      // console.log(res.data);
      res.data.result.plan.forEach(value => {
        actions.push(value.name);
        //console.log(value.name);
      });

      postprocessing({
        serverState,
        channel,
        actions,
      });
    })
    .catch(error => {
      console.error(error.data);
    });
}

const preprocessing = async ({ serverState, calendar, channel }) => {
  const temperature = await getLastTemperatureRecord();
  state.temperature = _.get(temperature, 'value', 25);

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
  // state.lcd = events.length > 0;

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
  actions.forEach(async action => {
    switch (action) {
      case '(switch-on-lamp lamp_o motion_o calendar_o)':
        console.log(action);
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

      case '(switch-off-lamp lamp_o motion_o calendar_o)':
        console.log(action);
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

      case '(switch-on-fan fan_o calendar_o motion_o)':
        console.log(action);
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

      case '(switch-off-fan fan_o calendar_o motion_o)':
        console.log(action);
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

      case '(do-nothing-comfort fan_o motion_o calendar_o)':
        console.log(action);
        // io.sockets.emit('fan-state-changed', false );
        break;

      case '(do-nothing-efficiency lamp_o motion_o calendar_o)':
        console.log(action);
        // io.sockets.emit('fan-state-changed', false );
        break;

      // case 'show-occupied':
      //   break;

      // case 'show-free':
      //   break;

      default:
    }
  });
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
      // console.log(`Temperature: ${message.value}`);
      state.temperature = message.value;

      // io.sockets.emit('temperature-changed', message);
      await insertTemperatureRecord(message);
    }

    if (type === 'humidity') {
      // console.log(`Humidity: ${message.value}`);
      state.humidity = message.value;

      // io.sockets.emit('humidity-changed', message);
      await insertHumidityRecord(message);
    }

    if (type === 'motion') {
      // console.log(`Motion: ${message.value}`);
      state.motion = message.value;

      await insertMotionRecord(message);
    }

    solve(domain, problem, serverState, channel);

    // const actions = solve();
    //
    // await postprocessing({
    //   serverState,
    //   channel,
    //   actions
    // });
  }

  return null;
};
