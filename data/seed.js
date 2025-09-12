const mongoose = require('mongoose');
   const fs = require('fs');
   const path = require('path');
   const Product = require('../models/Product');
   require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

   const connectDB = async () => {
     try {
       console.log('MONGO_URI:', process.env.MONGO_URI); // Debug MONGO_URI
       if (!process.env.MONGO_URI) {
         throw new Error('MONGO_URI is not defined in .env file');
       }
       await mongoose.connect(process.env.MONGO_URI, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
       });
       console.log('MongoDB connected');
     } catch (err) {
       console.error('MongoDB connection error:', err);
       process.exit(1);
     }
   };

   const seedProducts = async () => {
     try {
       await connectDB();
       const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf-8'));
       await Product.deleteMany({});
       await Product.insertMany(products);
       console.log('Products seeded successfully');
       process.exit(0);
     } catch (err) {
       console.error('Error seeding products:', err);
       process.exit(1);
     }
   };

   seedProducts();