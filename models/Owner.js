const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['owner'], default: 'owner' },
  address: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
ownerSchema.pre('save', async function (next) {
  if (this.isModified('password_hash')) {
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
  }
  next();
});

// Method to compare passwords
ownerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = mongoose.model('Owner', ownerSchema);