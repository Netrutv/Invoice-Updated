const connectDB = require('./lib/mongoose');
const Invoice = require('./lib/Invoice');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await connectDB();

        if (req.method === 'GET') {
            const data = await Invoice.find().sort({ createdAt: -1 });
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const newInvoice = new Invoice(req.body);
            await newInvoice.save();
            return res.status(201).json({ message: 'Saved' });
        }

        return res.status(405).json({ message: 'Method not allowed' });

    } catch (err) {
        console.error('[/api/invoices] Error:', err.message);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Duplicate Invoice Number' });
        }
        return res.status(500).json({ message: err.message });
    }
};
