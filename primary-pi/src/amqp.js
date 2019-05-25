import amqp from 'amqplib';

export const consume = ({ channel, queueName }) => {
  return consumePromisified(channel)(queueName);
};

export const publish = ({
  channel,
  exchangeName,
  routingKey,
  messageString,
}) => {
  return channel.publish(exchangeName, routingKey, Buffer.from(messageString));
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
  return channel.assertQueue(queueName, { exclusive: true });
};

export const createChannel = ({ connection }) => {
  return connection.createChannel();
};

export const createConnection = ({ connectionUri }) => {
  return amqp.connect(connectionUri);
};

const consumePromisified = channel => queueName => {
  return new Promise(resolve => {
    channel.consume(
      queueName,
      message => {
        resolve(message);
      },
      { noAck: true },
    );
  });
};
