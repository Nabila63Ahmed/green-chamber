import { Router } from 'express';
import * as _ from 'lodash';
import {
  getTemperatureRecords,
  getLastTemperatureRecord,
  searchTemperatureRecords,
  insertTemperatureRecord,
} from '../services/temperature';
import {
  getHumidityRecords,
  getLastHumidityRecord,
  searchHumidityRecords,
  insertHumidityRecord,
} from '../services/humidity';
import {
  getMotionRecords,
  getLastMotionRecord,
  insertMotionRecord,
} from '../services/motion';
import { getEvents } from '../datasources/google-calendar';
import { now, add, subtract, startOf, toISOString } from '../utilities';

/* Definition of api endpoint of the server */
export default ({ amqp, channel, calendar, state }) => {
  const api = Router();

  api.get('/ping', (req, res) => {
    return res.json({
      error: null,
      data: 'Pong',
    });
  });

  /* Get all temperature records */
  api.get('/temperature', async (req, res) => {
    try {
      const retrievedTemperatureRecords = await getTemperatureRecords();

      return res.json({
        error: null,
        data: {
          count: retrievedTemperatureRecords.length,
          temperatureRecords: retrievedTemperatureRecords,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Get latest temperature record */
  api.get('/temperature/current', async (req, res) => {
    try {
      const retrievedTemperatureRecord = await getLastTemperatureRecord();

      return res.json({
        error: null,
        data: {
          temperatureRecord: retrievedTemperatureRecord,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Get all today's temperature records */
  api.get('/temperature/today', async (req, res) => {
    try {
      const createdAfter = startOf('day')(now());

      const retrievedTemperatureRecords = await searchTemperatureRecords({
        createdAfter,
      });

      return res.json({
        error: null,
        data: {
          count: retrievedTemperatureRecords.length,
          temperatureRecords: retrievedTemperatureRecords,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Insert a temperature record */
  api.post('/temperature', async (req, res) => {
    try {
      const createdTemperatureRecord = await insertTemperatureRecord(req.body);

      return res.json({
        error: null,
        data: {
          temperatureRecord: createdTemperatureRecord,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Get the state of the fan from local state */
  api.get('/fan', (req, res) => {
    return res.json({
      error: null,
      data: {
        isFanOn: state.isFanOn,
      },
    });
  });

  /* Update the state of the fan in the local state, and publish the update on RMQ */
  api.post('/fan', async (req, res) => {
    if (!_.isNil(req.body.value) && _.isBoolean(req.body.value)) {
      const value = req.body.value;

      state.isFanOn = value;

      await amqp.publish({
        channel,
        exchangeName: 'actuators-exchange',
        routingKey: 'actuators.plugwise.fan',
        messageJSON: { value },
      });

      return res.json({
        error: null,
        data: { value },
      });
    }
    return res.status(500).json({
      error: 'Wrong value error',
      data: null,
    });
  });

  /* Get all humidity records */
  api.get('/humidity', async (req, res) => {
    try {
      const retrievedHumidityRecords = await getHumidityRecords();

      return res.json({
        error: null,
        data: {
          count: retrievedHumidityRecords.length,
          humidityRecords: retrievedHumidityRecords,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Get latest humidity record */
  api.get('/humidity/current', async (req, res) => {
    try {
      const retrievedHumidityRecord = await getLastHumidityRecord();

      return res.json({
        error: null,
        data: {
          humidityRecord: retrievedHumidityRecord,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Get all today's humidity records */
  api.get('/humidity/today', async (req, res) => {
    try {
      const createdAfter = startOf('day')(now());

      const retrievedHumidityRecords = await searchHumidityRecords({
        createdAfter,
      });

      return res.json({
        error: null,
        data: {
          count: retrievedHumidityRecords.length,
          humidityRecords: retrievedHumidityRecords,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Insert a humidity record */
  api.post('/humidity', async (req, res) => {
    try {
      const createdHumidityRecord = await insertHumidityRecord(req.body);

      return res.json({
        error: null,
        data: {
          humidityRecord: createdHumidityRecord,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Get all motion records */
  api.get('/motion', async (req, res) => {
    try {
      const retrievedMotionRecords = await getMotionRecords();

      return res.json({
        error: null,
        data: {
          count: retrievedMotionRecords.length,
          motionRecords: retrievedMotionRecords,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Get latest motion record */
  api.get('/motion/current', async (req, res) => {
    try {
      const retrievedMotionRecord = await getLastMotionRecord();

      return res.json({
        error: null,
        data: {
          motionRecords: retrievedMotionRecord,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Insert a motion record */
  api.post('/motion', async (req, res) => {
    try {
      const createdMotionRecord = await insertMotionRecord(req.body);

      return res.json({
        error: null,
        data: {
          motionRecord: createdMotionRecord,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Get the state of the lamp from local state */
  api.get('/lamp', (req, res) => {
    return res.json({
      error: null,
      data: { isLampOn: state.isLampOn },
    });
  });

  /* Update the state of the lamp in the local state
   *  and publish the update on RMQ */
  api.post('/lamp', async (req, res) => {
    if (!_.isNil(req.body.value) && _.isBoolean(req.body.value)) {
      const value = req.body.value;

      state.isLampOn = value;
      await amqp.publish({
        channel,
        exchangeName: 'actuators-exchange',
        routingKey: 'actuators.plugwise.lamp',
        messageJSON: { value },
      });

      return res.json({
        error: null,
        data: { value },
      });
    }
    return res.status(500).json({
      error: 'Wrong value error',
      data: null,
    });
  });

  /* Get all events starting now */
  api.get('/events', async (req, res) => {
    try {
      const events = await getEvents({
        calendar,
        query: {
          calendarId: 'green.chamber.iot@gmail.com',
          timeMin: toISOString(now()),
          singleEvents: true,
          orderBy: 'startTime',
        },
      });

      return res.json({
        error: null,
        data: {
          count: events.length,
          events,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Get ongoing event and update the lcd display in state and screen */
  api.get('/events/current', async (req, res) => {
    try {
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

      if (events.length > 0) {
        const [firstEvent] = events;

        const text = `Current meeting: ${firstEvent.summary}`;
        state.lcdDisplayText = text;

        await amqp.publish({
          channel,
          exchangeName: 'actuators-exchange',
          routingKey: 'actuators.lcd',
          messageJSON: { value: text },
        });

        return res.json({
          error: null,
          data: {
            event: firstEvent,
          },
        });
      }

      const text = 'No ongoing event';
      state.lcdDisplayText = text;

      await amqp.publish({
        channel,
        exchangeName: 'actuators-exchange',
        routingKey: 'actuators.lcd',
        messageJSON: { value: text },
      });

      return res.status(404).json({
        error: 'Not Found',
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  /* Get the state of the lcd from local state */
  api.get('/lcd', (req, res) => {
    return res.json({
      error: null,
      data: { lcdDisplayText: state.lcdDisplayText },
    });
  });

  return api;
};
