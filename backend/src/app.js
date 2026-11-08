const cors = require('cors');
const express = require('express');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/demo-images', express.static(path.join(__dirname, '../public/demo-images')));
app.use(routes);
app.use(errorHandler);

module.exports = app;
