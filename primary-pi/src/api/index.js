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
// import { insertEvent, insertEvents, getEvents } from '../services/events';
import { now, startOfDay } from '../utilities';

export default ({ amqp, channel, calendar, getEvents, state }) => {
  const api = Router();

  api.get('/ping', (req, res) => {
    return res.json({
      error: null,
      data: 'Pong',
    });
  });

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

  api.get('/temperature/today', async (req, res) => {
    try {
      const createdAfter = startOfDay(now());

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

  api.get('/fan', (req, res) => {
    return res.json({ isFanOn: state.isFanOn });
  });

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
        data: value,
      });
    }
    return res.status(500).json({
      error: 'Wrong value error',
      data: null,
    });
  });

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

  api.get('/humidity/current', async (req, res) => {
    try {
      const retrievedHumidityRecord = await getLastHumidityRecord();

      return res.json({
        error: null,
        data: {
          humidityRecords: retrievedHumidityRecord,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  api.get('/humidity/today', async (req, res) => {
    try {
      const createdAfter = startOfDay(now());

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

  api.get('/lamp', (req, res) => {
    return res.json({ isLampOn: state.isLampOn });
  });

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
        data: value,
      });
    }
    return res.status(500).json({
      error: 'Wrong value error',
      data: null,
    });
  });

  api.get('/events', async (req, res) => {
    try {
      const events = await getEvents({
        calendar,
        query: {
          calendarId: 'green.chamber.iot@gmail.com',
          timeMin: new Date().toISOString(),
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

  api.get('/events/current', async (req, res) => {
    try {
      const minTime = new Date();
      minTime.setTime(minTime.getTime() - 1 * 60 * 1000);
      const maxTime = new Date();
      maxTime.setTime(maxTime.getTime() + 1 * 60 * 1000);
      const events = await getEvents({
        calendar,
        query: {
          calendarId: 'green.chamber.iot@gmail.com',
          timeMin: minTime.toISOString(),
          timeMax: maxTime.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 10,
        },
      });
      if (events.length) {
        const text = "There's an ongoing event";
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
            count: events.length,
            events,
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
      return res.json({
        error: null,
        data: 'No current event',
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  api.get('/lcd', (req, res) => {
    return res.json({ state });
  });

  return api;
};
