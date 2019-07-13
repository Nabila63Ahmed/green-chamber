import { insertTemperatureRecord } from '../services/temperature';
import { insertHumidityRecord } from '../services/humidity';
import { insertMotionRecord } from '../services/motion';

const axios = require('axios');
var fs = require('fs');

var state = {
  lamp: false,
  fan: true,
  lcd: false,
  motion: false,
  temperature: 20,
  humidity: 45,
  meeting: false,
};

// Domain is static and it is loaded from the file
var domain = '';

fs.readFile('./src/logic/data/domain0.pddl', 'utf8', function(
  err,
  domainContent,
) {
  if (err) throw err;

  domain = domainContent;
});

// Problem changes and it is defined as string
var problem = `(define (problem problem-green-chamber)
  (:domain green-chamber)
  (:objects
    calendarO - calendar
    temperatureO - temperature
    humidityO - humidity
    motionO - motion
    lcdO - lcd
    lampO - lamp
    fanO - fan)\n`;

var goal = `(:goal
    (and
    )))`;

var goalComfort = `(:goal
    (and (comfort)
    )))`;

var goalEfficiency = `(:goal
    (and (efficiency)
    )))`;

var goalPeace = `(:goal
    (and (peace)
    )))`;

function solve() {
  axios
    .post('http://solver.planning.domains/solve-and-validate', {
      domain,
      problem,
    })
    .then(res => {
      // console.log(res.data);
      res.data.result.plan.forEach(function(value) {
        console.log(value.action);
      });
    })
    .catch(error => {
      console.error(error.data);
    });
}

function convertToPDDL(problem, goal) {
  // var initialState = `(:init
  //   (on fanO)
  //   (movement motionO)
  //   (meeting calendarO))\n`;

  var initialState = `(:init\n`;
  initialState = `${initialState} ${state.lamp ? ' (on lampO)\n' : ''}`;
  initialState = `${initialState} ${state.fan ? ' (on fanO)\n' : ''}`;
  initialState = `${initialState} ${state.lcd ? ' (occupied lcdO)\n' : ''}`;
  initialState = `${initialState} ${
    state.movement ? ' (movement motionO)\n' : ''
  }`;
  initialState = `${initialState} (= (current_temperature) ${state.temperature})\n`;
  initialState = `${initialState} (= (current_humidity) ${state.humidity})\n`;
  initialState = `${initialState} ${
    state.meeting ? ' (meeting calendarO)\n' : ''
  }`;
  initialState = `${initialState})\n`;

  // goal = `${goal} ${
  //   state.hot || state.damp ? ' (on fanO)' : ' (not (on fanO))'
  // }\n`;
  // goal = `${goal} ${
  //   state.movement && state.meeting ? ' (on lampO)' : ' (not (on lampO))'
  // }\n`;
  // goal = `${goal} ${
  //   state.meeting ? ' (occupied lcdO)' : ' (not (occupied lcdO))'
  // }`;
  // goal = `${goal}))`;

  problem = `${problem} ${initialState} ${goal}`;
  console.log(problem);
  console.log(domain);

  solve();
}

/**
 * Process received message
 * 1. send record through socket to the connected client
 * 2. insert record into the database
 */
export const handleMessageReceived = ({
  routingKey,
  message,
  // io
}) => {
  const route = routingKey.split('.');

  if (route[0] === 'sensors') {
    const type = route[1];

    if (type === 'temperature') {
      console.log('Temperature: ' + message.value);
      state.temperature = message.value;
      goal = goalComfort;
      //solve();

      // io.sockets.emit('temperature-changed', message);
      // return insertTemperatureRecord(message);
    }

    if (type === 'humidity') {
      console.log('Humidity: ' + message.value);
      state.humidity = message.value;
      goal = goalComfort;

      // io.sockets.emit('humidity-changed', message);
      // return insertHumidityRecord(message);
    }

    if (type === 'motion') {
      console.log('Motion: ' + message.value);
      state.motion = message.value;
      goal = goalEfficiency;

      // return insertMotionRecord(message);
    }

    convertToPDDL(problem, goal);
  }

  return null;
};
