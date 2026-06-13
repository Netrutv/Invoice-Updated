const connectDB = require('./lib/mongoose');
const Profile = require('./lib/Profile');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    await connectDB();

    if (req.method === 'GET') {
        try {
            const profile = await Profile.findOne({ profileType: 'main_profile' });
            return res.status(200).json(profile || {});
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const { name, address, gstin, upi } = req.body;
            const profile = await Profile.findOneAndUpdate(
                { profileType: 'main_profile' },
                { name, address, gstin, upi, updatedAt: Date.now() },
                { upsert: true, new: true }
            );
            return res.status(200).json(profile);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    res.status(405).json({ message: 'Method not allowed' });
};
