  const express = require('express');
  const dotenv = require('dotenv');
  const cookieParser = require('cookie-parser');
  const cors = require('cors');
  const connectDb = require('./config/db');
  const path = require('path');
  const multer = require('multer');

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'Uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only images are allowed'), false);
      }
    },
  });

  dotenv.config();
  connectDb();

  const auth = require('./routes/authRoutes');
  const pets = require('./routes/petsRoutes');
  const appointments = require('./routes/appointmentRoutes');
  const insurance = require('./routes/insuranceRoutes');
  const documents = require('./routes/documents');
  const products = require('./routes/productRoutes');
  const orders = require('./routes/orders');
  const health = require('./routes/healthRoutes');
  const notificationRoutes = require('./routes/notificationRoutes');
  const productRatingRoutes = require('./routes/productRatingRoutes');
  const users = require('./routes/userRoutes');
  const availabilityRoutes = require('./routes/availabilityRoutes');
  const vetRoutes = require('./routes/vetRoutes');

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://furshield.vercel.app',
    credentials: true,
  }));
  app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
  app.use('/api/auth', auth);
  app.use('/api/pets', pets);
  app.use('/api/appointments', appointments);
  app.use('/api/insurance', insurance);
  app.use('/api/documents', documents);
  app.use('/api/products', products);
  app.use('/api/orders', orders);
  app.use('/api/health', health);
  app.use('/api/health-records', require('./routes/HealthRecordsRoutes')); 
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', productRatingRoutes);
  app.use('/api/users', users);
  app.use('/api/availability', availabilityRoutes);
  app.use('/api/vet', vetRoutes);

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Server Error',
    });
  });

  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });