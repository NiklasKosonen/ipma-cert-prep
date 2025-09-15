import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { BarChart3, Users, BookOpen, TrendingUp, Eye, MessageSquare } from 'lucide-react';

export const TraineeDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { 
    topics, subtopics, kpis, questions, 
    attempts, attemptItems, users 
  } = useData();

  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Get all student attempts
  const studentAttempts = attempts.filter(attempt => 
    users.find(u => u.id === attempt.userId)?.role === 'user'
  );

  // Filter attempts by selected topic and user
  const filteredAttempts = studentAttempts.filter(attempt => {
    const question = questions.find(q => q.id === attempt.questionIds[0]);
    const subtopic = subtopics.find(s => s.id === question?.subtopicId);
    const topic = topics.find(t => t.id === subtopic?.topicId);
    
    const topicMatch = !selectedTopic || topic?.id === selectedTopic;
    const userMatch = !selectedUser || attempt.userId === selectedUser;
    
    return topicMatch && userMatch;
  });

  // Calculate statistics
  const totalStudents = users.filter(u => u.role === 'user').length;
  const totalAttempts = filteredAttempts.length;
  const averageScore = filteredAttempts.length > 0 
    ? filteredAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / filteredAttempts.length 
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kouluttajapaneeli</h1>
          <p className="text-gray-600">Seuraa opiskelijoiden edistymistä ja vastauksia</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Opiskelijat</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tenttisuoritukset</p>
                <p className="text-2xl font-bold text-gray-900">{totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Keskiarvo</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aiheita</p>
                <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Suodattimet</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aihe
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Kaikki aiheet</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opiskelija
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Kaikki opiskelijat</option>
                {users.filter(u => u.role === 'user').map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name || student.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Student Attempts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Opiskelijoiden tenttisuoritukset</h3>
            
            {filteredAttempts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Ei tenttisuorituksia valituilla suodattimilla</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opiskelija
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aihe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Päivämäärä
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pisteet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tila
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Toiminnot
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAttempts.map((attempt) => {
                      const student = users.find(u => u.id === attempt.userId);
                      const question = questions.find(q => q.id === attempt.questionIds[0]);
                      const subtopic = subtopics.find(s => s.id === question?.subtopicId);
                      const topic = topics.find(t => t.id === subtopic?.topicId);
                      
                      return (
                        <tr key={attempt.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student?.name || student?.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {topic?.title} → {subtopic?.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString('fi-FI')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreColor(attempt.score || 0)}`}>
                              {attempt.score || 0}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              attempt.submittedAt ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {attempt.submittedAt ? 'Valmis' : 'Kesken'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => {
                                // View student answers
                                console.log('View student answers for attempt:', attempt.id);
                              }}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Näytä</span>
                            </button>
                            <button
                              onClick={() => {
                                // Give feedback
                                console.log('Give feedback for attempt:', attempt.id);
                              }}
                              className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>Palaute</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
