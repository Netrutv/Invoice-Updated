const connectDB = require('./lib/mongoose');
const Invoice = require('./lib/Invoice');

function parseInvoiceDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        // DD/MM/YYYY → MM/DD/YYYY
        if (parts[0].length <= 2) {
            return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
        }
    }
    return new Date(dateStr);
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await connectDB();

        const invoices = await Invoice.find();
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const monthlyInvoices = invoices.filter(inv => {
            const d = parseInvoiceDate(inv.date);
            return d && !isNaN(d) && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });

        const totalRevenue = monthlyInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
        const pending = invoices
            .filter(i => i.status === 'Unpaid')
            .reduce((s, i) => s + (i.grandTotal || 0), 0);

        const monthlyData = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date(thisYear, thisMonth - i, 1);
            const m = d.getMonth();
            const y = d.getFullYear();
            const key = new Date(y, m, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            monthlyData[key] = invoices
                .filter(inv => {
                    const id = parseInvoiceDate(inv.date);
                    return id && !isNaN(id) && id.getMonth() === m && id.getFullYear() === y;
                })
                .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
        }

        return res.status(200).json({ totalRevenue, pending, count: monthlyInvoices.length, monthlyData });

    } catch (err) {
        console.error('[/api/stats] Error:', err.message);
        return res.status(500).json({ error: err.message });
    }
};
