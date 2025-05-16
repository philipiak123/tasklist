const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const listRoutes = require('./routes/listRoutes');
const { initRabbitMQ } = require('./config/rabbitmq.js');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/list', listRoutes);

initRabbitMQ().then(() => {
  console.log('RabbitMQ connected');
});

// NIE uruchamiamy tutaj `app.listen`

module.exports = app;
