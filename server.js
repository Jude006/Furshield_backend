const express = require('express');
require('dotenv').config()
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDb = require('./config/db');
const errorHandler = require('./middleware/error');
connectDb();
const auth = require('./routes/authRoutes');
const pets = require('./routes/petsRoutes');
const appointments = require('./routes/appointmentRoutes');
const insurance = require('./routes/insuranceRoutes');
const documents = require('./routes/documents');
const products = require('./routes/productRoutes');
const cart = require('./routes/cartRoutes');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use('/api/auth', auth);
app.use('/api/pets', pets);
app.use('/api/appointments', appointments);
app.use('/api/insurance', insurance);
app.use('/api/documents', documents);
app.use('/api/products', products);
app.use('/api/cart', cart);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});