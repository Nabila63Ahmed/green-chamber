import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import * as amqp from './amqp';
import api from './api';
import {
  initializeJWT,
  initializeCalendar,
  getEvents,
  key,
} from './datasources/google-calendar';

(async () => {
  const jwt = initializeJWT({
    key,
    scopes: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  const calendar = initializeCalendar({
    jwt,
  });

  const events = await getEvents({
    calendar,
    query: {
      calendarId: 'green.chamber.iot@gmail.com',
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    },
  });

  console.log('EVENTS >', events);

  const connectionUri = 'amqp://localhost';
  const exchangeName1 = 'sensors-exchange';
  const exchangeName2 = 'actuators-exchange';
  // const exchangeName3 = 'api-exchange';

  const queueName1 = 'sensors.temperature.queue';
  const queueName2 = 'sensors.humidity.queue';
  const queueName3 = 'sensors.motion.queue';
  const queueName4 = 'actuators.plugwise.lamp.queue';
  const queueName5 = 'actuators.plugwise.fan.queue';
  const queueName6 = 'actuators.lcd.queue';
  // const queueName7 = 'api.google.calender.queue';

  const routingKey1 = 'sensors.temperature';
  const routingKey2 = 'sensors.humidity';
  const routingKey3 = 'sensors.motion';
  const routingKey4 = 'actuators.plugwise.lamp';
  const routingKey5 = 'actuators.plugwise.fan';
  const routingKey6 = 'actuators.lcd';
  // const routingKey7 = 'api.google.calender';

  const connection = await amqp.createConnection({ connectionUri });
  const channel = await amqp.createChannel({ connection });

  await amqp.assertExchange({ channel, exchangeName: exchangeName1 });
  await amqp.assertExchange({ channel, exchangeName: exchangeName2 });
  // await amqp.assertExchange({ channel, exchangeName: exchangeName3 });

  await amqp.assertQueue({ channel, queueName: queueName1 });
  await amqp.assertQueue({ channel, queueName: queueName2 });
  await amqp.assertQueue({ channel, queueName: queueName3 });
  await amqp.assertQueue({ channel, queueName: queueName4 });
  await amqp.assertQueue({ channel, queueName: queueName5 });
  await amqp.assertQueue({ channel, queueName: queueName6 });
  // await amqp.assertQueue({ channel, queueName: queueName7 });

  await amqp.bindQueueToExchange({
    channel,
    exchangeName: exchangeName1,
    queueName: queueName1,
    routingKey: routingKey1,
  });

  await amqp.bindQueueToExchange({
    channel,
    exchangeName: exchangeName1,
    queueName: queueName2,
    routingKey: routingKey2,
  });

  await amqp.bindQueueToExchange({
    channel,
    exchangeName: exchangeName1,
    queueName: queueName3,
    routingKey3,
  });

  await amqp.bindQueueToExchange({
    channel,
    exchangeName: exchangeName2,
    queueName: queueName4,
    routingKey: routingKey4,
  });

  await amqp.bindQueueToExchange({
    channel,
    exchangeName: exchangeName2,
    queueName: queueName5,
    routingKey: routingKey5,
  });

  await amqp.bindQueueToExchange({
    channel,
    exchangeName: exchangeName2,
    queueName: queueName6,
    routingKey: routingKey6,
  });

  // await amqp.bindQueueToExchange({
  //   channel,
  //   exchangeName: exchangeName3,
  //   queueName: queueName7,
  //   routingKey: routingKey7,
  // });

  await amqp.publish({
    channel,
    exchangeName: exchangeName1,
    routingKey: routingKey1,
    messageJSON: { value: 25.4, createdAt: 647284 },
  });

  await amqp.publish({
    channel,
    exchangeName: exchangeName1,
    routingKey: routingKey2,
    messageJSON: { value: 80, createdAt: 789800 },
  });

  const handleMessageReceived = message => {
    if (message) {
      /**
       *  TODO: Validate that message content is a JSON.
       *  If invalid JSON, early return.
       *
       *  See: isJSON() in https://github.com/chriso/validator.js/
       */

      const messageJSON = JSON.parse(message.content.toString());

      console.log('MESSAGE >', messageJSON);
      console.log('ROUTING KEY >', message.fields.routingKey);

      // TODO: Implement conditional logic
    }
  };

  amqp.consume({
    channel,
    queueName: queueName1,
    onMessageReceived: handleMessageReceived,
  });

  amqp.consume({
    channel,
    queueName: queueName2,
    onMessageReceived: handleMessageReceived,
  });

  const state = {
    isFanOn: false,
    isLampOn: false,
    lcdDisplayText: '',
  };

  const mongodbConnectionString = 'mongodb://127.0.0.1/green-chamber';
  mongoose.connect(mongodbConnectionString, { useNewUrlParser: true });

  const app = express();
  const port = 3000;

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use('/api/', api({ amqp, channel, calendar, state }));

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}...`);
  });
})();
