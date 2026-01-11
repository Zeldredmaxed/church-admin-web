'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { DollarSign, TrendingUp, Calendar, Download, Filter, Loader2 } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

interface Donation {
  id: string;
  amount: number; // Stored in CENTS
  currency: string;
  status: string; // "pending", "succeeded"
  paymentId: string;
  userId?: string | null; // Optional: Guests can give without login
  createdAt: string;
}

interface TransactionWithUser extends Donation {
  user?: User;
}

export default function FinancesPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCollected: 0,
    avgDonation: 0,
    recentTransactions: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Map donations to include user data
    const mapped = donations.map((donation) => {
      const user = donation.userId ? users.find((u) => u.id === donation.userId) : undefined;
      return { ...donation, user };
    });
    setTransactions(mapped);
    calculateStats(mapped);
  }, [donations, users]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsRes, usersRes] = await Promise.all([
        api.get('/donations'),
        api.get('/users'),
      ]);

      setDonations(donationsRes.data);
      setUsers(usersRes.data);
    } catch (error: any) {
      console.error('Error fetching finances data:', error);
      alert('Failed to load finances data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions: TransactionWithUser[]) => {
    // Only count succeeded donations
    const succeeded = transactions.filter((t) => t.status === 'succeeded');
    
    // Total Collected: Sum of all succeeded donations (convert cents to dollars)
    const totalCollected = succeeded.reduce((sum, t) => sum + t.amount, 0) / 100;
    
    // Avg. Donation: Average amount per transaction
    const avgDonation = succeeded.length > 0 ? totalCollected / succeeded.length : 0;
    
    // Recent Transactions: Count of donations in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = succeeded.filter(
      (t) => new Date(t.createdAt) >= thirtyDaysAgo
    ).length;

    setStats({
      totalCollected,
      avgDonation,
      recentTransactions: recent,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleExportCSV = () => {
    // Placeholder for CSV export functionality
    alert('CSV export functionality will be implemented soon.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading finances data...</p>
        </div>
      </div>
    );
  }

  // Filter only succeeded donations for display
  const succeededTransactions = transactions.filter((t) => t.status === 'succeeded');

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finances & Giving</h1>
          <p className="text-gray-600">Track donations and financial transactions</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Picker (Visual Only) */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Date Range</span>
            </button>
          </div>
          {/* Export CSV Button (Visual Only) */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Collected Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Collected</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalCollected)}</p>
          <p className="text-xs text-gray-500 mt-1">All time donations</p>
        </div>

        {/* Avg. Donation Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Avg. Donation</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.avgDonation)}</p>
          <p className="text-xs text-gray-500 mt-1">Per transaction</p>
        </div>

        {/* Recent Transactions Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Recent Transactions</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.recentTransactions}</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          <p className="text-sm text-gray-600 mt-1">All successful donations</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fund
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {succeededTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                succeededTransactions.map((transaction) => {
                  const isGuest = !transaction.userId || !transaction.user;
                  const donorName = isGuest
                    ? 'Guest'
                    : `${transaction.user!.firstName} ${transaction.user!.lastName}`;
                  const donorInitials = isGuest
                    ? 'GU'
                    : getInitials(transaction.user!.firstName, transaction.user!.lastName);

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      {/* Donor Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {isGuest ? (
                            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-sm mr-3">
                              {donorInitials}
                            </div>
                          ) : transaction.user!.avatarUrl ? (
                            <img
                              src={transaction.user!.avatarUrl}
                              alt={donorName}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                              {donorInitials}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{donorName}</div>
                            {!isGuest && (
                              <div className="text-sm text-gray-500">{transaction.user!.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Amount Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(transaction.amount / 100)}
                        </div>
                      </td>

                      {/* Fund Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">General Tithe</div>
                      </td>

                      {/* Date Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Succeeded
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with count */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {succeededTransactions.length} {succeededTransactions.length === 1 ? 'transaction' : 'transactions'}
          </p>
        </div>
      </div>
    </div>
  );
}
