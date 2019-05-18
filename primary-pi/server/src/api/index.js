import { Router } from 'express';

export default () => {
  const api = Router();

  api.get('/ping', (req, res) => {
    res.json({
      error: null,
      data: 'Pong',
    });
  });

  return api;
};
