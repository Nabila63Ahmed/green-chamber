import amqp from 'amqplib';

export const consume = ({ channel, queueName, onMessageReceived }) => {
  return channel.consume(queueName, onMessageReceived);
};

export const publish = ({ channel, exchangeName, routingKey, messageJSON }) => {
  return channel.publish(
    exchangeName,
    routingKey,
    Buffer.from(JSON.stringify(messageJSON)),
  );
};

export const bindQueueToExchange = ({
  channel,
  exchangeName,
  queueName,
  routingKey,
}) => {
  return channel.bindQueue(queueName, exchangeName, routingKey);
};

export const assertExchange = ({ channel, exchangeName }) => {
  return channel.assertExchange(exchangeName, 'topic');
};

export const assertQueue = ({ channel, queueName }) => {
  return channel.assertQueue(queueName, { exclusive: false });
};

export const createChannel = ({ connection }) => {
  return connection.createChannel();
};

export const createConnection = ({ connectionUri }) => {
  return amqp.connect(connectionUri);
};
