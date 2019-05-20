import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import * as amqp from './amqp';
import api from './api';

(async () => {
  const connectionUri = 'amqp://localhost';
  const queueName = 'queue-1';

  const connection = await amqp.createConnection(connectionUri);
  const channel = await amqp.createChannel(connection);
  const queue = await amqp.assertQueue(channel)(queueName);

  await amqp.sendToQueue(channel)(queueName)('Hello world');

  const message = await amqp.receiveFromQueue(channel)(queueName);

  if (message) {
    console.log('MESSAGE >', message.content.toString());
  }
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
