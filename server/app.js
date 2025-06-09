const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const listRoutes = require('./routes/listRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { initRabbitMQ } = require('./config/rabbitmq.js');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/list', listRoutes);
app.use('/tasks', taskRoutes);

initRabbitMQ().then(() => {
  console.log('RabbitMQ connected');
});


module.exports = app;
