import { Router } from 'express';
import {
  insertTemperatureRecord,
  getAllTemperatureRecords,
} from '../services/temperature';
import {
  insertHumidityRecord,
  getAllHumidityRecords,
} from '../services/humidity';
import { insertMotionRecord, getAllMotionRecords } from '../services/motion';
import {
  insertEventRecord,
  insertEventRecords,
  getAllEventRecords,
} from '../services/event';

export default () => {
  const api = Router();

  api.get('/ping', (req, res) => {
    return res.json({
      error: null,
      data: 'Pong',
    });
  });

  api.get('/temperatures', async (req, res) => {
    try {
      const retrievedTemperatureRecords = await getAllTemperatureRecords();

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

  api.post('/temperatures', async (req, res) => {
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

  api.get('/humidities', async (req, res) => {
    try {
      const retrievedHumidityRecords = await getAllHumidityRecords();

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

  api.post('/humidities', async (req, res) => {
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
      const retrievedMotionRecords = await getAllMotionRecords();

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

  api.get('/events', async (req, res) => {
    try {
      const retrievedEventRecords = await getAllEventRecords();

      return res.json({
        error: null,
        data: {
          count: retrievedEventRecords.length,
          eventRecords: retrievedEventRecords,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  api.post('/events', async (req, res) => {
    try {
      const createdEventRecords = await insertEventRecords(req.body);

      return res.json({
        error: null,
        data: {
          count: createdEventRecords.length,
          eventRecords: createdEventRecords,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  api.post('/event', async (req, res) => {
    try {
      const createdEventRecord = await insertEventRecord(req.body);

      return res.json({
        error: null,
        data: {
          eventRecord: createdEventRecord,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        data: null,
      });
    }
  });

  return api;
};
