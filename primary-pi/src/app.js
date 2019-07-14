import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import validator from 'validator';
import * as _ from 'lodash';
import mongoose from 'mongoose';
import socket from 'socket.io';
import * as amqp from './amqp';
import api from './api';
import * as logic from './logic';
import {
  initializeJWT,
  initializeCalendar,
  key,
} from './datasources/google-calendar';

(async () => {
  /* Authenticate with Google API */
  const jwt = initializeJWT({
    key,
    scopes: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  /* Initialize Google Calendar */
  const calendar = initializeCalendar({
    jwt,
  });

  /* Get all events starting now */
  // const events = await getEvents({
  //   calendar,
  //   query: {
  //     calendarId: 'green.chamber.iot@gmail.com',
  //     timeMin: new Date().toISOString(),
  //     singleEvents: true,
  //     orderBy: 'startTime',
  //   },
  // });

  // console.log('EVENTS >', events);

  /* Initialize socket */
  // const io = socket();
  // const socketsPort = 4001;
  //
  // io.listen(socketsPort);
  // // eslint-disable-next-line no-console
  // console.log(`Sockets server listening on port ${socketsPort}...`);

  const connectionUri = 'amqp://localhost';
  const exchangeName1 = 'sensors-exchange';
  const exchangeName2 = 'actuators-exchange';

  const queueName1 = 'sensors.temperature.queue';
  const queueName2 = 'sensors.humidity.queue';
  const queueName3 = 'sensors.motion.queue';
  // const queueName4 = 'actuators.plugwise.lamp.queue';
  // const queueName5 = 'actuators.plugwise.fan.queue';
  // const queueName6 = 'actuators.lcd.queue';

  const routingKey1 = 'sensors.temperature';
  const routingKey2 = 'sensors.humidity';
  const routingKey3 = 'sensors.motion';
  // const routingKey4 = 'actuators.plugwise.lamp';
  // const routingKey5 = 'actuators.plugwise.fan';
  // const routingKey6 = 'actuators.lcd';

  /* AMQP connection, channel creation */
  const connection = await amqp.createConnection({
    connectionUri,
  });
  const channel = await amqp.createChannel({
    connection,
  });

  /* AMQP Exchanges creation */
  await amqp.assertExchange({
    channel,
    exchangeName: exchangeName1,
  });
  await amqp.assertExchange({
    channel,
    exchangeName: exchangeName2,
  });

  /* AMQP Queues creation */
  await amqp.assertQueue({
    channel,
    queueName: queueName1,
  });
  await amqp.assertQueue({
    channel,
    queueName: queueName2,
  });
  await amqp.assertQueue({
    channel,
    queueName: queueName3,
  });
  // await amqp.assertQueue({ channel, queueName: queueName4 });
  // await amqp.assertQueue({ channel, queueName: queueName5 });
  // await amqp.assertQueue({ channel, queueName: queueName6 });

  /* AMQP queues bindings to exchange */
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
    routingKey: routingKey3,
  });

  // await amqp.bindQueueToExchange({
  //   channel,
  //   exchangeName: exchangeName2,
  //   queueName: queueName4,
  //   routingKey: routingKey4,
  // });

  // await amqp.bindQueueToExchange({
  //   channel,
  //   exchangeName: exchangeName2,
  //   queueName: queueName5,
  //   routingKey: routingKey5,
  // });

  // await amqp.bindQueueToExchange({
  //   channel,
  //   exchangeName: exchangeName2,
  //   queueName: queueName6,
  //   routingKey: routingKey6,
  // });

  /* ***************************************************************************** */

  await amqp.publish({
    channel,
    exchangeName: exchangeName1,
    routingKey: routingKey1,
    messageJSON: {
      value: Math.random() * 25 + 15,
      createdAt: Date.now(),
    },
  });

  // await amqp.publish({
  //   channel,
  //   exchangeName: exchangeName1,
  //   routingKey: routingKey2,
  //   messageJSON: { value: Math.random() * 25 + 15, createdAt: Date.now() },
  // });

  /* ***************************************************************************** */

  /* Handle messages consumed by the server */
  const handleMessageReceived = async message => {
    if (message) {
      if (
        _.isNil(message.content) ||
        !validator.isJSON(message.content.toString())
      ) {
        console.log('ERROR > Invalid Message Content');
        return;
      }

      const messageJSON = JSON.parse(message.content.toString());

      if (_.isNil(messageJSON.value) || _.isNil(messageJSON.createdAt)) {
        console.log('ERROR > Invalid Message Content');
        return;
      }

      /* Implementation conditional logic */
      await logic.handleMessageReceived({
        routingKey: message.fields.routingKey,
        message: messageJSON,
        serverState: state,
        calendar,
        channel,
        // io,
      });

      console.log('MESSAGE >', messageJSON);
      console.log('ROUTING KEY >', message.fields.routingKey);
    }
  };

  // io.on('connection', () => {
  /* Consume messages on the sensor's queues */
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

  amqp.consume({
    channel,
    queueName: queueName3,
    onMessageReceived: handleMessageReceived,
  });
  // });

  // amqp.consume({
  //   channel,
  //   queueName: queueName4,
  //   onMessageReceived: handleMessageReceived,
  // });

  // amqp.consume({
  //   channel,
  //   queueName: queueName5,
  //   onMessageReceived: handleMessageReceived,
  // });

  // amqp.consume({
  //   channel,
  //   queueName: queueName6,
  //   onMessageReceived: handleMessageReceived,
  // });

  /* Initialize server volatile state */
  const state = {
    isFanOn: false,
    isLampOn: false,
    lcdDisplayText: '',
  };

  /* Connect to MongoDB */
  const mongodbConnectionString = 'mongodb://127.0.0.1/green-chamber';
  mongoose.connect(mongodbConnectionString, {
    useNewUrlParser: true,
  });

  /* Initialize and run server */
  const app = express();
  const httpPort = 4000;

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );
  app.use(cors());

  app.use(
    '/api/',
    api({
      amqp,
      channel,
      calendar,
      state,
    }),
  );

  app.listen(httpPort, () => {
    // eslint-disable-next-line no-console
    console.log(`HTTP server listening on port ${httpPort}...`);
  });
})();
