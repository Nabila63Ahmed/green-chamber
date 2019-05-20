import amqp from 'amqplib';

export const receiveFromQueue = channel => queueName => {
  return consumePromisified(channel)(queueName);
};

export const sendToQueue = channel => queueName => messageString => {
  return channel.sendToQueue(queueName, Buffer.from(messageString));
};

export const assertQueue = channel => queueName => {
  return channel.assertQueue(queueName);
};

export const createChannel = connection => {
  return connection.createChannel();
};

export const createConnection = uri => {
  return amqp.connect(uri);
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
