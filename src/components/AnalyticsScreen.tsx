import { ArrowLeft, TrendingUp, TrendingDown, Target, Clock, AlertCircle, CheckCircle, Award, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface AnalyticsScreenProps {
  onNavigate: (screen: string) => void;
}

export default function AnalyticsScreen({ onNavigate }: AnalyticsScreenProps) {
  // TODO: Fetch real analytics data from Firestore when implemented
  // Practice time data (last 7 days)
  const practiceData = [
    { day: 'Mon', minutes: 0, mistakes: 0 },
    { day: 'Tue', minutes: 0, mistakes: 0 },
    { day: 'Wed', minutes: 0, mistakes: 0 },
    { day: 'Thu', minutes: 0, mistakes: 0 },
    { day: 'Fri', minutes: 0, mistakes: 0 },
    { day: 'Sat', minutes: 0, mistakes: 0 },
    { day: 'Sun', minutes: 0, mistakes: 0 },
  ];

  // Mistake types distribution
  const mistakeTypeData = [
    { name: 'Pitch', value: 0, color: '#FF901F' },
    { name: 'Rhythm', value: 0, color: '#FFB366' },
    { name: 'Bow Control', value: 0, color: '#FFC999' },
    { name: 'Appaswaram', value: 0, color: '#FFDFCC' },
    { name: 'Other', value: 0, color: '#F5F5F5' },
  ];

  // Accuracy by lesson type
  const accuracyData = [
    { lesson: 'Varnam', accuracy: 0 },
    { lesson: 'Kriti', accuracy: 0 },
    { lesson: 'Alapana', accuracy: 0 },
    { lesson: 'Thillana', accuracy: 0 },
    { lesson: 'Scales', accuracy: 0 },
  ];

  // Progress over time
  const progressData = [
    { week: 'Week 1', accuracy: 0 },
    { week: 'Week 2', accuracy: 0 },
    { week: 'Week 3', accuracy: 0 },
    { week: 'Week 4', accuracy: 0 },
    { week: 'Week 5', accuracy: 0 },
    { week: 'Week 6', accuracy: 0 },
  ];

  const totalMinutes = practiceData.reduce((sum, day) => sum + day.minutes, 0);
  const totalMistakesFixed = practiceData.reduce((sum, day) => sum + day.mistakes, 0);
  const avgAccuracy = 0;
  const improvementRate = 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <h1 className="text-3xl text-black dark:text-white font-bold">Performance Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track your progress and improvements over time</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                  <Clock className="text-[#FF901F]" size={20} />
                </div>
                <div>
                  <div className="text-2xl text-black dark:text-white">{totalMinutes}m</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                  <CheckCircle className="text-[#FF901F]" size={20} />
                </div>
                <div>
                  <div className="text-2xl text-black dark:text-white">{totalMistakesFixed}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Mistakes Fixed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                  <Target className="text-[#FF901F]" size={20} />
                </div>
                <div>
                  <div className="text-2xl text-black dark:text-white">{avgAccuracy}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                  <TrendingUp className="text-[#FF901F]" size={20} />
                </div>
                <div>
                  <div className="text-2xl text-black dark:text-white">+{improvementRate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practice Time Chart */}
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black dark:text-white">
              <Clock className="text-[#FF901F]" size={20} />
              <span className="font-bold">Practice Time & Mistakes Fixed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={practiceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="#FF901F" 
                  fill="#FFB366" 
                  fillOpacity={0.6}
                  name="Minutes Practiced"
                />
                <Area 
                  type="monotone" 
                  dataKey="mistakes" 
                  stroke="#10b981" 
                  fill="#86efac" 
                  fillOpacity={0.6}
                  name="Mistakes Fixed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Mistake Type Distribution */}
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <AlertCircle className="text-[#FF901F]" size={20} />
                <span className="font-bold">Mistake Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={mistakeTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mistakeTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Accuracy by Lesson Type */}
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Music className="text-[#FF901F]" size={20} />
                <span className="font-bold">Accuracy by Lesson Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="lesson" stroke="#666" />
                  <YAxis stroke="#666" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="accuracy" fill="#FF901F" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Progress Over Time */}
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black dark:text-white">
              <TrendingUp className="text-[#FF901F]" size={20} />
              <span className="font-bold">Progress Over Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#666" />
                <YAxis stroke="#666" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#FF901F" 
                  strokeWidth={3}
                  dot={{ fill: '#FF901F', r: 6 }}
                  name="Overall Accuracy %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Suggestions removed - will show real suggestions based on practice data */}
      </div>
    </div>
  );
}
