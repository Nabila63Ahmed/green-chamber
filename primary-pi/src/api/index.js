import { Router } from 'express';
import {
  insertTemperatureRecord,
  getTemperatureRecords,
} from '../services/temperature';
import { insertHumidityRecord, getHumidityRecords } from '../services/humidity';
import { insertMotionRecord, getMotionRecords } from '../services/motion';
import { insertEvent, insertEvents, getEvents } from '../services/events';

export default () => {
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

  // api.post('/temperature', async (req, res) => {
  //   try {
  //     /* TODO: Validate request body */

  //     const createdTemperatureRecord = await insertTemperatureRecord(req.body);

  //     return res.json({
  //       error: null,
  //       data: {
  //         temperatureRecord: createdTemperatureRecord,
  //       },
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       error: 'Internal Server Error',
  //       data: null,
  //     });
  //   }
  // });

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

  // api.post('/humidity', async (req, res) => {
  //   try {
  //     /* TODO: Validate request body */

  //     const createdHumidityRecord = await insertHumidityRecord(req.body);

  //     return res.json({
  //       error: null,
  //       data: {
  //         humidityRecord: createdHumidityRecord,
  //       },
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       error: 'Internal Server Error',
  //       data: null,
  //     });
  //   }
  // });

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

  // api.post('/motion', async (req, res) => {
  //   try {
  //     /* TODO: Validate request body */

  //     const createdMotionRecord = await insertMotionRecord(req.body);

  //     return res.json({
  //       error: null,
  //       data: {
  //         motionRecord: createdMotionRecord,
  //       },
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       error: 'Internal Server Error',
  //       data: null,
  //     });
  //   }
  // });

  api.get('/events', async (req, res) => {
    try {
      const retrievedEvents = await getEvents();

      return res.json({
        error: null,
        data: {
          count: retrievedEvents.length,
          events: retrievedEvents,
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
      if (Array.isArray(req.body)) {
        /* TODO: Validate request body */

        const createdEvents = await insertEvents(req.body);

        return res.json({
          error: null,
          data: {
            count: createdEvents.length,
            events: createdEvents,
          },
        });
      }

      /* TODO: Validate request body */

      const createdEvent = await insertEvent(req.body);

      return res.json({
        error: null,
        data: {
          event: createdEvent,
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
