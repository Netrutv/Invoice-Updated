const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    profileType: { type: String, default: 'main_profile', unique: true },
    name: String,
    address: String,
    gstin: String,
    upi: String,
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
