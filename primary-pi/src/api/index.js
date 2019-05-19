import { Router } from 'express';
import { insertTemperature, getAllTemperatures } from '../services/temperature';

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
      const retrievedTemperatures = await getAllTemperatures();

      return res.json({
        error: null,
        data: {
          count: retrievedTemperatures.length,
          temperatures: retrievedTemperatures,
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
      const createdTemperature = await insertTemperature(req.body);

      return res.json({
        error: null,
        data: {
          temperature: createdTemperature,
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
