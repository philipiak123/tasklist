require('dotenv').config(); // ← Załaduj zmienne z .env
const amqp = require('amqplib');
const nodemailer = require('nodemailer');

const runWorker = async () => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'emailQueue';

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const { to, subject, text } = JSON.parse(msg.content.toString());

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to,
          subject,
          text,
        });

        console.log(`Email send to ${to}`);
        channel.ack(msg);
      } catch (error) {
        console.error('Error:', error);
        channel.nack(msg);
      }
    }
  });

  console.log('Email worker working...');
};

runWorker();
