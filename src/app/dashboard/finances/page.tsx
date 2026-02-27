'use client';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';
import api from '@/utils/api';

interface Transaction {
  id: string;
  amount: number;
  fund: string;
  status: string;
  createdAt: string;
  donor?: { firstName: string; lastName: string; email: string };
}

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'transactions'>('overview');

  useEffect(() => {
    api.get('/giving/admin').then(r => { setTransactions(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const total = transactions.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + t.amount, 0);
  const avg = transactions.length > 0 ? total / transactions.filter(t => t.status === 'COMPLETED').length : 0;
  const recent30 = transactions.filter(t => {
    const d = new Date(t.createdAt);
    return Date.now() - d.getTime() < 30 * 86400000 && t.status === 'COMPLETED';
  });

  const byFund = transactions.reduce((acc, t) => {
    if (t.status !== 'COMPLETED') return acc;
    acc[t.fund] = (acc[t.fund] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const statusColors: Record<string, string> = {
    COMPLETED: 'bg-green-500/20 text-green-400',
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    FAILED: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-primary-theme mb-1">Finances & Giving</h1>
          <p className="text-muted-theme text-sm">Track donations and financial transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-card-theme border border-border-theme rounded-lg overflow-hidden">
            <button onClick={() => setTab('overview')} className={`px-4 py-2 text-sm font-sans transition-colors ${tab === 'overview' ? 'bg-accent text-black' : 'text-muted-theme hover:text-primary-theme'}`}>Overview</button>
            <button onClick={() => setTab('transactions')} className={`px-4 py-2 text-sm font-sans transition-colors ${tab === 'transactions' ? 'bg-accent text-black' : 'text-muted-theme hover:text-primary-theme'}`}>Transactions</button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Collected', value: `$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: 'All time donations', icon: <DollarSign className="w-5 h-5" />, color: 'text-accent' },
          { label: 'Avg. Donation', value: `$${isNaN(avg) ? '0.00' : avg.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: 'Per transaction', icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-400' },
          { label: 'Recent Transactions', value: recent30.length, sub: 'Last 30 days', icon: <Calendar className="w-5 h-5" />, color: 'text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="card-theme rounded-xl p-5 border border-border-theme">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-muted-theme">{stat.label}</span>
              <span className={`${stat.color} opacity-70`}>{stat.icon}</span>
            </div>
            <div className={`font-serif text-3xl ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-xs text-muted-theme">{stat.sub}</div>
          </div>
        ))}
      </div>

      {tab === 'overview' ? (
        /* Fund Breakdown */
        <div className="card-theme rounded-xl border border-border-theme p-6">
          <h2 className="font-serif text-xl text-primary-theme mb-5">Giving by Fund</h2>
          {Object.keys(byFund).length === 0 ? (
            <p className="text-muted-theme text-sm text-center py-8">No fund data available yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(byFund).sort((a, b) => b[1] - a[1]).map(([fund, amount]) => {
                const pct = total > 0 ? (amount / total) * 100 : 0;
                return (
                  <div key={fund}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-primary-theme">{fund}</span>
                      <span className="text-sm text-accent font-medium">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-2 bg-surface-theme rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-theme mt-0.5 block">{pct.toFixed(1)}% of total</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Transactions Table */
        <div className="card-theme rounded-xl border border-border-theme overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border-theme">
            <h2 className="font-serif text-xl text-primary-theme">Transaction History</h2>
            <span className="text-xs text-muted-theme">All successful donations</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-theme">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-muted-theme mx-auto mb-3" />
              <p className="text-muted-theme">No transactions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-theme">
                    <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-muted-theme font-medium">Donor</th>
                    <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-muted-theme font-medium">Amount</th>
                    <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-muted-theme font-medium">Fund</th>
                    <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-muted-theme font-medium">Date</th>
                    <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-muted-theme font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t.id} className={`border-b border-border-theme/50 hover:bg-surface-theme transition-colors ${i % 2 === 0 ? '' : 'bg-surface-theme/30'}`}>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-primary-theme">{t.donor ? `${t.donor.firstName} ${t.donor.lastName}` : 'Anonymous'}</div>
                        {t.donor?.email && <div className="text-xs text-muted-theme">{t.donor.email}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-accent">${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-theme">{t.fund}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-theme">{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[t.status] || 'bg-white/10 text-white'}`}>{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-border-theme text-xs text-muted-theme">
                Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
