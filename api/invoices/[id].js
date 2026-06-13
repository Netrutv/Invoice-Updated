const connectDB = require('../lib/mongoose');
const Invoice = require('../lib/Invoice');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    await connectDB();

    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            await Invoice.findByIdAndUpdate(id, req.body);
            return res.status(200).json({ message: 'Updated' });
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await Invoice.findByIdAndDelete(id);
            return res.status(200).json({ message: 'Deleted' });
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }

    res.status(405).json({ message: 'Method not allowed' });
};
