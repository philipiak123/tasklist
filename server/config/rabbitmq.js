const amqp = require('amqplib');

let channel;

const initRabbitMQ = async () => {
  const connection = await amqp.connect('amqp://localhost');
  channel = await connection.createChannel();
  await channel.assertQueue('emailQueue', { durable: true });
};

const sendToQueue = (queue, message) => {
  if (!channel) {
    console.error('RabbitMQ channel not initialized');
    return;
  }
  
  console.log('Mail to queue');
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

module.exports = { initRabbitMQ, sendToQueue };
