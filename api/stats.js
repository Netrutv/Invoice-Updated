const connectDB = require('./lib/mongoose');
const Invoice = require('./lib/Invoice');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    await connectDB();

    try {
        const invoices = await Invoice.find();

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        function parseDate(dateStr) {
            if (!dateStr) return null;
            if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts[0].length <= 2) {
                    return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
                }
            }
            return new Date(dateStr);
        }

        const monthlyInvoices = invoices.filter(inv => {
            const d = parseDate(inv.date);
            return d && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
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
            const monthKey = new Date(y, m, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

            monthlyData[monthKey] = invoices
                .filter(inv => {
                    const invDate = parseDate(inv.date);
                    return invDate && invDate.getMonth() === m && invDate.getFullYear() === y;
                })
                .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
        }

        return res.status(200).json({
            totalRevenue,
            pending,
            count: monthlyInvoices.length,
            monthlyData
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
