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
    const retrievedTemperatures = await getAllTemperatures();

    return res.json({
      error: null,
      data: {
        count: retrievedTemperatures.length,
        temperatures: retrievedTemperatures,
      },
    });
  });

  api.post('/temperatures', async (req, res) => {
    const createdTemperature = await insertTemperature(req.body);

    return res.json({
      error: null,
      data: {
        temperature: createdTemperature,
      },
    });
  });

  return api;
};
