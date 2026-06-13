const connectDB = require('../lib/mongoose');
const Invoice = require('../lib/Invoice');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await connectDB();

        const { id } = req.query;

        if (req.method === 'PUT') {
            await Invoice.findByIdAndUpdate(id, req.body, { new: true });
            return res.status(200).json({ message: 'Updated' });
        }

        if (req.method === 'DELETE') {
            await Invoice.findByIdAndDelete(id);
            return res.status(200).json({ message: 'Deleted' });
        }

        if (req.method === 'GET') {
            const invoice = await Invoice.findById(id);
            if (!invoice) return res.status(404).json({ message: 'Not found' });
            return res.status(200).json(invoice);
        }

        return res.status(405).json({ message: 'Method not allowed' });

    } catch (err) {
        console.error('[/api/invoices/:id] Error:', err.message);
        return res.status(500).json({ message: err.message });
    }
};
