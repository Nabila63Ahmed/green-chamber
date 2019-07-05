import amqp from 'amqplib';

/* Consume message on a specified queue */
export const consume = ({ channel, queueName, onMessageReceived }) => {
  return channel.consume(queueName, onMessageReceived);
};

/* Publish a message with a specified routing key */
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

/* Create exchange if nonexistent */
export const assertExchange = ({ channel, exchangeName }) => {
  return channel.assertExchange(exchangeName, 'topic');
};

/* Create queue if nonexistent */
export const assertQueue = ({ channel, queueName }) => {
  return channel.assertQueue(queueName, { exclusive: true });
};

/* Create channel */
export const createChannel = ({ connection }) => {
  return connection.createChannel();
};

/* Create connection */
export const createConnection = ({ connectionUri }) => {
  return amqp.connect(connectionUri);
};
