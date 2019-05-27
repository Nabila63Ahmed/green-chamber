import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import * as amqp from './amqp';
import api from './api';

(async () => {
  const connectionUri = 'amqp://localhost';
  const exchangeName = 'exchange-1';
  const queueName = 'queue-1';
  const routingKey = '*';

  const connection = await amqp.createConnection({ connectionUri });
  const channel = await amqp.createChannel({ connection });

  await amqp.assertExchange({ channel, exchangeName });
  await amqp.assertQueue({ channel, queueName });

  await amqp.bindQueueToExchange({
    channel,
    exchangeName,
    queueName,
    routingKey,
  });

  await amqp.publish({
    channel,
    exchangeName,
    routingKey,
    messageJSON: { message: 'Hello World I' },
  });

  await amqp.publish({
    channel,
    exchangeName,
    routingKey,
    messageJSON: { message: 'Hello World II' },
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

      // TODO: Implement conditional logic
    }
  };

  amqp.consume({
    channel,
    queueName,
    onMessageReceived: handleMessageReceived,
  });
})();

const mongodbConnectionString = 'mongodb://127.0.0.1/green-chamber';
mongoose.connect(mongodbConnectionString, { useNewUrlParser: true });

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/', api());

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}...`);
});
