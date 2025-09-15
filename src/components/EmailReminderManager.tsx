import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { processEmailReminders } from '../utils/emailReminder';

interface EmailReminderManagerProps {
  onClose: () => void;
}

const EmailReminderManager: React.FC<EmailReminderManagerProps> = ({ onClose }) => {
  const { users, subscriptions, updateSubscriptionReminderStatus } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    warningSent: number;
    finalSent: number;
    totalFailed: number;
  } | null>(null);

  const handleProcessReminders = async () => {
    setIsProcessing(true);
    setResults(null);

    try {
      const reminderResults = await processEmailReminders(
        users,
        subscriptions,
        updateSubscriptionReminderStatus
      );
      
      setResults(reminderResults);
      console.log('Email reminders processed:', reminderResults);
    } catch (error) {
      console.error('Failed to process email reminders:', error);
      alert('Failed to process email reminders. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPendingReminders = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

    let warningCount = 0;
    let finalCount = 0;

    users.forEach(user => {
      if (user.role !== 'user') return;

      const subscription = subscriptions.find(s => s.userId === user.id && s.isActive);
      if (!subscription) return;

      const endDate = new Date(subscription.endDate);
      
      if (endDate <= sevenDaysFromNow && endDate > oneDayFromNow && !subscription.reminderSent.sevenDays) {
        warningCount++;
      }
      
      if (endDate <= oneDayFromNow && endDate > now && !subscription.reminderSent.oneDay) {
        finalCount++;
      }
    });

    return { warningCount, finalCount };
  };

  const pendingReminders = getPendingReminders();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Email Reminder Manager</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Pending Reminders</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">7-day warnings:</span>
                  <span className="font-semibold text-blue-900">{pendingReminders.warningCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Final reminders:</span>
                  <span className="font-semibold text-blue-900">{pendingReminders.finalCount}</span>
                </div>
              </div>
            </div>

            {results && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Processing Results</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Warning emails sent:</span>
                    <span className="font-semibold text-green-900">{results.warningSent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Final emails sent:</span>
                    <span className="font-semibold text-green-900">{results.finalSent}</span>
                  </div>
                  {results.totalFailed > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-700">Failed:</span>
                      <span className="font-semibold text-red-900">{results.totalFailed}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 mb-4">
              <p><strong>Note:</strong> In development mode, emails are logged to the console instead of being sent.</p>
              <p>In production, this would integrate with an email service like SendGrid or AWS SES.</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleProcessReminders}
              disabled={isProcessing || (pendingReminders.warningCount === 0 && pendingReminders.finalCount === 0)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                isProcessing || (pendingReminders.warningCount === 0 && pendingReminders.finalCount === 0)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Process Reminders'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailReminderManager;
