import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { BarChart3, Users, BookOpen, TrendingUp, Eye, MessageSquare, Clock, Target, Award, AlertCircle } from 'lucide-react';
import { Attempt } from '../../types';

export const TraineeDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { 
    topics, subtopics, questions, 
    users, getUserAttempts
  } = useData();

  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [sampleData, setSampleData] = useState<any>(null);

  // Load sample data from localStorage if available
  useEffect(() => {
    const stored = localStorage.getItem('sampleTraineeData');
    if (stored) {
      try {
        setSampleData(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing sample data:', error);
      }
    }
  }, []);

  // Get sample exam attempts for detailed view
  const getSampleExamAttempts = () => {
    try {
      const stored = localStorage.getItem('sampleExamAttempts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error parsing sample exam attempts:', error);
      return [];
    }
  };

  // Get all student attempts (async)
  const [allStudentAttempts, setAllStudentAttempts] = useState<Attempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);

  useEffect(() => {
    const loadStudentAttempts = async () => {
      try {
        const studentUsers = users.filter(u => u.role === 'user');
        const attempts: Attempt[] = [];
        
        for (const student of studentUsers) {
          const studentAttempts = await getUserAttempts(student.id);
          attempts.push(...studentAttempts);
        }
        
        setAllStudentAttempts(attempts);
      } catch (error) {
        console.error('Error loading student attempts:', error);
        setAllStudentAttempts([]);
      } finally {
        setAttemptsLoading(false);
      }
    };

    loadStudentAttempts();
  }, [users, getUserAttempts]);

  // Filter attempts by selected topic and user
  const filteredAttempts = allStudentAttempts.filter(attempt => {
    const question = questions.find(q => q.id === attempt.selectedQuestionIds[0]);
    const subtopic = subtopics.find(s => s.id === question?.subtopicId);
    const topic = topics.find(t => t.id === subtopic?.topicId);
    
    const topicMatch = !selectedTopic || topic?.id === selectedTopic;
    const userMatch = !selectedUser || attempt.userId === selectedUser;
    
    return topicMatch && userMatch;
  });

  // Calculate statistics
  const totalStudents = users.filter(u => u.role === 'user').length;
  const totalAttempts = filteredAttempts.length;
  // Note: Score calculation would need to be done from AttemptItems
  const averageScore = 0; // Placeholder - would need to calculate from attempt items

  // const getScoreColor = (score: number) => {
  //   if (score >= 80) return 'text-green-600 bg-green-100';
  //   if (score >= 60) return 'text-yellow-600 bg-yellow-100';
  //   return 'text-red-600 bg-red-100';
  // };

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
                <p className="text-sm font-medium text-gray-600">{t('totalStudents')}</p>
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
                <p className="text-sm font-medium text-gray-600">{t('totalExamAttempts')}</p>
                <p className="text-2xl font-bold text-gray-900">{sampleData?.totalAttempts || totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('traineeAverageScore')}</p>
                <p className="text-2xl font-bold text-gray-900">{sampleData?.averageScore || averageScore.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Opiskelutunnit</p>
                <p className="text-2xl font-bold text-gray-900">{sampleData?.studyHours || '0'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        {sampleData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Progress Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Edistyminen aiheittain
              </h3>
              <div className="space-y-4">
                {sampleData.progressByTopic?.map((topic: any, index: number) => {
                  const passRate = (topic.passed / topic.attempts) * 100;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                        <span className="text-sm text-gray-600">{topic.passed}/{topic.attempts} läpäisty</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${passRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Keskiarvo: {topic.avgScore}/3</span>
                        <span>Läpäisyprosentti: {passRate.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coaching Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Valmennusnäkökulmia
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-900">Keskimääräinen läpäisymäärä</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Opiskelijat läpäisevät tentin keskimäärin {Math.round(sampleData.totalAttempts / sampleData.passedExams)} yrityksellä
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-900">Opiskeluaika</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    Keskimääräinen opiskeluaika on {sampleData.studyHours} tuntia per opiskelija
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="font-medium text-yellow-900">Kehitettävää</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Risk Management -aihe vaatii enemmän harjoittelua (keskiarvo: {sampleData.progressByTopic?.find((t: any) => t.topic === 'Risk Management')?.avgScore}/3)
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-medium text-purple-900">Suositus</h4>
                  </div>
                  <p className="text-sm text-purple-700">
                    Lisää harjoitustehtäviä Risk Management -aiheeseen ja anna yksilöllistä ohjausta heikommille opiskelijoille
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sample Data Generator */}
        {!sampleData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
              <h3 className="text-lg font-medium text-yellow-900">Valmennusanalytiikkaa ei ole vielä</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              Luo esimerkkidata nähdäksesi analytiikkaa ja valmennusnäkökulmia. Tämä auttaa ymmärtämään, miten järjestelmä toimii valmennuksen yhteydessä.
            </p>
            <button
              onClick={() => {
                const sampleData = {
                  totalAttempts: 15,
                  passedExams: 8,
                  studyHours: 24.5,
                  averageScore: 2.3,
                  progressByTopic: [
                    { topic: 'Project Planning', attempts: 5, passed: 3, avgScore: 2.1 },
                    { topic: 'Risk Management', attempts: 4, passed: 2, avgScore: 1.8 },
                    { topic: 'Quality Management', attempts: 6, passed: 3, avgScore: 2.6 }
                  ]
                };
                localStorage.setItem('sampleTraineeData', JSON.stringify(sampleData));
                setSampleData(sampleData);
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Luo esimerkkidata
            </button>
          </div>
        )}

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

        {/* Sample Exam Results - Detailed View */}
        {sampleData && getSampleExamAttempts().length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-600" />
                Esimerkkitenttisuoritukset - Yksityiskohtainen näkymä
              </h3>
              
              <div className="space-y-6">
                {getSampleExamAttempts().map((attempt: any, index: number) => {
                  const topic = topics.find(t => t.id === attempt.topicId);
                  const userNames = ['Anna Virtanen', 'Mikko Koskinen', 'Sari Nieminen'];
                  const userName = userNames[index] || `Opiskelija ${index + 1}`;
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{userName}</h4>
                          <p className="text-sm text-gray-600">{topic?.title || 'Tuntematon aihe'}</p>
                          <p className="text-xs text-gray-500">
                            Suoritettu: {new Date(attempt.submittedAt).toLocaleDateString('fi-FI')} klo {new Date(attempt.submittedAt).toLocaleTimeString('fi-FI')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            attempt.score >= 2.5 ? 'text-green-600' : 
                            attempt.score >= 2.0 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {attempt.score}/3
                          </div>
                          <p className="text-sm text-gray-600">
                            {attempt.score >= 2.5 ? 'Erinomainen' : 
                             attempt.score >= 2.0 ? 'Hyvä' : 'Tarvitsee parannusta'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {attempt.answers.map((answer: string, answerIndex: number) => {
                          const question = questions.find(q => q.id === attempt.selectedQuestionIds[answerIndex]);
                          const subtopic = subtopics.find(s => s.id === question?.subtopicId);
                          
                          return (
                            <div key={answerIndex} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-gray-900 text-sm">
                                  Kysymys {answerIndex + 1}: {subtopic?.title || 'Tuntematon aliaihe'}
                                </h5>
                                <span className="text-xs text-gray-500">
                                  {question?.connectedKPIs?.length || 0} KPI
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{question?.prompt}</p>
                              <div className="bg-white rounded border p-3">
                                <p className="text-sm text-gray-800">{answer}</p>
                              </div>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                                <span>✅ KPI:t havaittu</span>
                                <span>📝 Rakenne: Hyvä</span>
                                <span>🎯 Vastaus: Täydellinen</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>⏱️ Aikaa käytetty: ~15 min</span>
                            <span>📊 KPI:t: {attempt.answers.length}/3</span>
                            <span>🎯 Tarkkuus: {Math.round((attempt.score / 3) * 100)}%</span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Anna palautetta →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
                      const question = questions.find(q => q.id === attempt.selectedQuestionIds[0]);
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
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              N/A
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
