import { ArrowLeft, TrendingUp, Award, Lightbulb, Share2, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface PerformanceReportScreenProps {
  onNavigate: (screen: string) => void;
}

export default function PerformanceReportScreen({ onNavigate }: PerformanceReportScreenProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-900">{`Score: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };
  const intonationData = [
    { time: '0:30', score: 75 },
    { time: '1:00', score: 82 },
    { time: '1:30', score: 78 },
    { time: '2:00', score: 85 },
    { time: '2:30', score: 88 },
    { time: '3:00', score: 90 },
    { time: '3:30', score: 87 },
  ];

  const skillsData = [
    { skill: 'Pitch', value: 87 },
    { skill: 'Rhythm', value: 92 },
    { skill: 'Bow Control', value: 85 },
    { skill: 'Dynamics', value: 78 },
    { skill: 'Tempo', value: 88 },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-white border-b border-gray-200 px-6 pt-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
            >
              <ArrowLeft size={24} className="text-black" />
            </button>
            <h1 className="lg:flex-1 text-black">Performance Report</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 size={24} className="text-black" />
            </button>
          </div>

          {/* Overall Score */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white border border-gray-200 mb-4">
              <div className="text-center">
                <div className="text-5xl mb-1 text-black">87</div>
                <div className="text-sm text-gray-600">out of 100</div>
              </div>
            </div>
            <h1 className="mb-2 text-black">Excellent Progress!</h1>
            <p className="text-gray-600">Varnam in Kalyani - Session 15</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-3">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 mb-6">
          <Card className="border-gray-200 bg-white shadow-md">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl mb-1 text-black">3:45</div>
              <div className="text-xs text-gray-600">Duration</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white shadow-md">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl mb-1 text-black">20/20</div>
              <div className="text-xs text-gray-600">Repetitions</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white shadow-md">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl mb-1 text-black">+5</div>
              <div className="text-xs text-gray-600">vs Last</div>
            </CardContent>
          </Card>
        </div>
        </div>

        {/* Intonation Over Time */}
        <Card className="mb-6 border-gray-200 bg-white shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <TrendingUp className="text-[#FF901F]" size={20} />
              Intonation Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={intonationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#FF901F" 
                  strokeWidth={3}
                  dot={{ fill: '#FF901F', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-3">
              Your intonation improved steadily throughout the session, showing strong focus and control.
            </p>
          </CardContent>
        </Card>

        {/* Skills Radar */}
        <Card className="mb-6 border-gray-200 bg-white shadow-md lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Award className="text-[#FF901F]" size={20} />
              Skills Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={skillsData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="skill" stroke="#666" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#666" />
                <Radar 
                  name="Score" 
                  dataKey="value" 
                  stroke="#FF901F" 
                  fill="#FF901F" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Generated Tips */}
        <Card className="mb-6 border-gray-200 bg-gradient-to-br from-orange-50 to-white shadow-md lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Lightbulb className="text-[#FF901F]" size={20} />
              AI-Generated Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-[#FF901F] rounded-full p-1 flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Dynamics:</strong> Try varying your bow pressure more gradually to achieve smoother crescendos and decrescendos.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-[#FF901F] rounded-full p-1 flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Rhythm:</strong> Your rhythm accuracy is excellent! Consider challenging yourself with faster tempo variations.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-[#FF901F] rounded-full p-1 flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Bow Control:</strong> Focus on maintaining consistent bow speed, especially during longer notes.
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6 lg:col-span-3 lg:flex lg:gap-3 lg:space-y-0">
          <Button
            onClick={() => onNavigate('home')}
            className="w-full lg:flex-1 bg-[#FF901F] hover:bg-[#E67F0C] text-white py-6 rounded-xl"
          >
            Back to Home
          </Button>
          <Button
            variant="outline"
            className="w-full lg:flex-1 py-6 rounded-xl border-2 border-gray-300 text-black hover:bg-gray-50"
          >
            <Download size={20} className="mr-2" />
            Download Report
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
