import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { UserProfile, Subscription } from '../../types';
import EmailReminderManager from '../../components/EmailReminderManager';

const CustomerDashboard: React.FC = () => {
  const { users, subscriptions, extendSubscription, checkSubscriptionExpiry } = useData();
  const { user } = useAuth();
  const [extensionDays, setExtensionDays] = useState(30);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');
  const [expiryStatus, setExpiryStatus] = useState<{ expired: UserProfile[], expiringSoon: UserProfile[] }>({ expired: [], expiringSoon: [] });
  const [showEmailManager, setShowEmailManager] = useState(false);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const status = checkSubscriptionExpiry();
    setExpiryStatus(status);
  }, [checkSubscriptionExpiry, subscriptions]);

  const getSubscription = (userId: string): Subscription | undefined => {
    return subscriptions.find(s => s.userId === userId);
  };

  const getSubscriptionStatus = (subscription?: Subscription): { status: string, color: string, daysLeft?: number } => {
    if (!subscription) {
      return { status: 'No Subscription', color: 'text-gray-500' };
    }

    if (!subscription.isActive) {
      return { status: 'Inactive', color: 'text-gray-500' };
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return { status: 'Expired', color: 'text-red-600' };
    } else if (daysLeft <= 7) {
      return { status: `Expires in ${daysLeft} days`, color: 'text-yellow-600' };
    } else {
      return { status: `Active (${daysLeft} days left)`, color: 'text-green-600' };
    }
  };

  const filteredUsers = users.filter(user => {
    const subscription = getSubscription(user.id);
    const status = getSubscriptionStatus(subscription);

    switch (filter) {
      case 'active':
        return status.status.includes('Active');
      case 'expired':
        return status.status === 'Expired';
      case 'expiring':
        return status.status.includes('Expires in');
      default:
        return true;
    }
  });

  const handleExtendSubscription = async (userId: string) => {
    try {
      await extendSubscription(userId, extensionDays);
      alert(`Subscription extended by ${extensionDays} days successfully!`);
      // Refresh the expiry status
      const status = checkSubscriptionExpiry();
      setExpiryStatus(status);
    } catch (error) {
      console.error('Failed to extend subscription:', error);
      alert('Failed to extend subscription. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalUsers = () => users.length;
  const getActiveUsers = () => users.filter(u => getSubscriptionStatus(getSubscription(u.id)).status.includes('Active')).length;
  const getExpiredUsers = () => expiryStatus.expired.length;
  const getExpiringUsers = () => expiryStatus.expiringSoon.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
            <p className="mt-2 text-gray-600">Manage customer subscriptions and access</p>
          </div>
          <button
            onClick={() => setShowEmailManager(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <span>📧</span>
            <span>Email Reminders</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalUsers()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{getActiveUsers()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-semibold text-gray-900">{getExpiringUsers()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">❌</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expired</p>
                <p className="text-2xl font-semibold text-gray-900">{getExpiredUsers()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Users</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired Users</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Customer List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const subscription = getSubscription(user.id);
                  const status = getSubscriptionStatus(subscription);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'trainer' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.companyName || user.companyCode || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className={`font-medium ${status.color}`}>
                            {status.status}
                          </div>
                          {subscription && (
                            <div className="text-gray-500">
                              Expires: {formatDate(subscription.endDate)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.role === 'user' && subscription && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              max="365"
                              value={extensionDays}
                              onChange={(e) => setExtensionDays(Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Days"
                            />
                            <button
                              onClick={() => handleExtendSubscription(user.id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Extend
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found matching the current filter.</p>
            </div>
          )}
        </div>

        {/* Expiry Alerts */}
        {(expiryStatus.expired.length > 0 || expiryStatus.expiringSoon.length > 0) && (
          <div className="mt-8 space-y-4">
            {expiryStatus.expired.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400 text-xl">❌</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {expiryStatus.expired.length} user(s) with expired subscriptions
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {expiryStatus.expired.map(user => user.email).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {expiryStatus.expiringSoon.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400 text-xl">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      {expiryStatus.expiringSoon.length} user(s) with subscriptions expiring within 7 days
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      {expiryStatus.expiringSoon.map(user => user.email).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Email Reminder Manager Modal */}
        {showEmailManager && (
          <EmailReminderManager onClose={() => setShowEmailManager(false)} />
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
