import { Router } from 'express';
import * as _ from 'lodash';
import {
  getTemperatureRecords,
  getLastTemperatureRecord,
  insertTemperatureRecord,
} from '../services/temperature';
import {
  getHumidityRecords,
  getLastHumidityRecord,
  insertHumidityRecord,
} from '../services/humidity';
import {
  getMotionRecords,
  getLastMotionRecord,
  insertMotionRecord,
} from '../services/motion';
// import { insertEvent, insertEvents, getEvents } from '../services/events';

export default ({ amqp, channel, calendar, state }) => {
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
    return res.json({ state });
  });

  api.post('/fan', async (req, res) => {
    if (!_.isNil(req.body.value) && _.isBoolean(req.body.value)) {
      const value = req.body.value;

      state.isFanOn = value;

      await amqp.publish({
        channel,
        exchangeName: 'actuators-exchange',
        routingKey: 'actuators.plugwise.fan.queue',
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

  api.get('/light', (req, res) => {
    return res.json({ state });
  });

  api.post('/light', async (req, res) => {
    if (!_.isNil(req.body.value) && _.isBoolean(req.body.value)) {
      const value = req.body.value;

      state.isLampOn = value;
      await amqp.publish({
        channel,
        exchangeName: 'actuators-exchange',
        routingKey: 'actuators.plugwise.lamp.queue',
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
      // const retrievedEvents = await getEvents();
      // return res.json({
      //   error: null,
      //   data: {
      //     count: retrievedEvents.length,
      //     events: retrievedEvents,
      //   },
      // });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  api.get('/events/current', async (req, res) => {
    try {
      // const retrievedEvents = await getEvents();
      // return res.json({
      //   error: null,
      //   data: {
      //     count: retrievedEvents.length,
      //     events: retrievedEvents,
      //   },
      // });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  return api;
};
