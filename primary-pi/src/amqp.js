import amqp from 'amqplib';

/* Consume and return message on queue 'queueName' */
export const consume = ({ channel, queueName, onMessageReceived }) => {
  return channel.consume(queueName, onMessageReceived);
};

/* Publish a message on intended queue via the routingKey */
export const publish = ({ channel, exchangeName, routingKey, messageJSON }) => {
  return channel.publish(
    exchangeName,
    routingKey,
    Buffer.from(JSON.stringify(messageJSON)),
  );
};

/* Binding queue to exchange */
export const bindQueueToExchange = ({
  channel,
  exchangeName,
  queueName,
  routingKey,
}) => {
  return channel.bindQueue(queueName, exchangeName, routingKey);
};

/* Exchange creation */
export const assertExchange = ({ channel, exchangeName }) => {
  return channel.assertExchange(exchangeName, 'topic');
};

/* Queue creation */
export const assertQueue = ({ channel, queueName }) => {
  return channel.assertQueue(queueName, { exclusive: true });
};

/* Channel creation */
export const createChannel = ({ connection }) => {
  return connection.createChannel();
};

/* Connection creation */
export const createConnection = ({ connectionUri }) => {
  return amqp.connect(connectionUri);
};
