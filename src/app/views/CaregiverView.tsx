import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  AlertCircle, 
  Video, 
  Phone, 
  Activity, 
  Clock,
  User,
  ShieldAlert,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Patient {
  id: string;
  name: string;
  status: 'safe' | 'paused' | 'alert';
  lastCheckin: string;
}

interface HealthLog {
  id: string;
  patientId: string;
  type: 'fall' | 'wellness' | 'diet' | 'activity';
  message: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

export default function CaregiverView() {
  const { userProfile, signOut } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<string | null>('patient-1');
  const [activeAlert, setActiveAlert] = useState<Patient | null>(null);

  // Check if in demo mode
  const isDemoMode = sessionStorage.getItem('demoMode') === 'true';

  const handleSignOut = () => {
    if (isDemoMode) {
      sessionStorage.removeItem('demoMode');
      sessionStorage.removeItem('demoRole');
      window.location.href = '/auth';
    } else {
      signOut();
    }
  };

  // Mock data - in production, this would come from Firebase Realtime Database
  const patients: Patient[] = [
    { id: 'patient-1', name: 'Margaret Thompson', status: 'safe', lastCheckin: '2 min ago' },
    { id: 'patient-2', name: 'Robert Chen', status: 'paused', lastCheckin: '15 min ago' },
    { id: 'patient-3', name: 'Elizabeth Davis', status: 'alert', lastCheckin: 'Just now' }
  ];

  const healthLogs: HealthLog[] = [
    {
      id: '1',
      patientId: 'patient-1',
      type: 'wellness',
      message: 'Heart rate within normal range (72 bpm)',
      timestamp: '2:30 PM',
      severity: 'low'
    },
    {
      id: '2',
      patientId: 'patient-1',
      type: 'diet',
      message: 'AI detected low water intake today. Recommended hydration.',
      timestamp: '1:15 PM',
      severity: 'medium'
    },
    {
      id: '3',
      patientId: 'patient-1',
      type: 'activity',
      message: 'Completed daily walking goal (3,500 steps)',
      timestamp: '11:20 AM',
      severity: 'low'
    },
    {
      id: '4',
      patientId: 'patient-3',
      type: 'fall',
      message: 'Potential fall detected in living room',
      timestamp: '10:05 AM',
      severity: 'high'
    }
  ];

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'safe':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'alert':
        return 'bg-red-500';
    }
  };

  const getStatusBgColor = (status: Patient['status']) => {
    switch (status) {
      case 'safe':
        return 'bg-green-50 border-green-200';
      case 'paused':
        return 'bg-yellow-50 border-yellow-200';
      case 'alert':
        return 'bg-red-50 border-red-200';
    }
  };

  const handleViewLiveFeed = () => {
    toast.info('Opening live feed... (Demo mode)');
    setActiveAlert(null);
  };

  const handleCallEmergency = () => {
    toast.success('Calling emergency services... (Demo mode)');
    setActiveAlert(null);
  };

  const simulateAlert = () => {
    const alertPatient = patients.find(p => p.id === 'patient-3');
    setActiveAlert(alertPatient || null);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar - Patient List */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl mb-1">Caregiver Dashboard</h1>
          <p className="text-gray-600">Welcome, {userProfile?.name || 'Caregiver'}</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {patients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedPatient === patient.id
                    ? 'border-blue-500 bg-blue-50'
                    : `border-gray-200 hover:border-gray-300 ${getStatusBgColor(patient.status)}`
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(patient.status)}`} />
                  <span className="font-medium">{patient.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{patient.lastCheckin}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t space-y-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={simulateAlert}
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            Simulate Alert
          </Button>
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Patient Header */}
        <div className="bg-white border-b p-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl">
                  {patients.find(p => p.id === selectedPatient)?.name || 'Select a patient'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      patients.find(p => p.id === selectedPatient)?.status || 'safe'
                    )}`} 
                  />
                  <span className="text-gray-600 capitalize">
                    {patients.find(p => p.id === selectedPatient)?.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="insights" className="px-6">
                  <Activity className="w-4 h-4 mr-2" />
                  AI Health Insights
                </TabsTrigger>
                <TabsTrigger value="history" className="px-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  Wellness History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-6 border">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      <span className="text-gray-600">Heart Rate</span>
                    </div>
                    <p className="text-3xl">72 bpm</p>
                    <p className="text-sm text-green-600 mt-1">Normal</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-600">Activity</span>
                    </div>
                    <p className="text-3xl">3.5k</p>
                    <p className="text-sm text-blue-600 mt-1">Steps today</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-gray-600">Hydration</span>
                    </div>
                    <p className="text-3xl">4/8</p>
                    <p className="text-sm text-yellow-600 mt-1">Cups today</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg mb-2">AI Wellness Summary</h3>
                  <p className="text-gray-700">
                    Patient is showing healthy vital signs. Activity levels are good, 
                    but hydration intake is below recommended daily amount. Consider 
                    reminder to drink water. Sleep quality has improved 15% this week.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="bg-white rounded-xl border">
                  <div className="overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 text-gray-600">Time</th>
                          <th className="text-left p-4 text-gray-600">Type</th>
                          <th className="text-left p-4 text-gray-600">Event</th>
                          <th className="text-left p-4 text-gray-600">Severity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {healthLogs
                          .filter(log => log.patientId === selectedPatient)
                          .map((log) => (
                            <tr key={log.id} className="border-b hover:bg-gray-50">
                              <td className="p-4 text-gray-600">{log.timestamp}</td>
                              <td className="p-4">
                                <span className="capitalize px-3 py-1 bg-gray-100 rounded-full text-sm">
                                  {log.type}
                                </span>
                              </td>
                              <td className="p-4">{log.message}</td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm ${
                                    log.severity === 'high'
                                      ? 'bg-red-100 text-red-700'
                                      : log.severity === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {log.severity}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Active Alert Modal */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setActiveAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border-4 border-red-500"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl text-red-600">Active Alert</h2>
                  <p className="text-gray-600">Immediate attention required</p>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl p-6 mb-6 border border-red-200">
                <p className="text-lg mb-2">
                  <strong>Patient:</strong> {activeAlert.name}
                </p>
                <p className="text-lg mb-2">
                  <strong>Event:</strong> Potential fall detected
                </p>
                <p className="text-lg">
                  <strong>Time:</strong> {activeAlert.lastCheckin}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="h-16 text-lg bg-blue-600 hover:bg-blue-700"
                  onClick={handleViewLiveFeed}
                >
                  <Video className="w-6 h-6 mr-2" />
                  View Live Feed
                </Button>
                <Button
                  size="lg"
                  className="h-16 text-lg bg-red-600 hover:bg-red-700"
                  onClick={handleCallEmergency}
                >
                  <Phone className="w-6 h-6 mr-2" />
                  Call Emergency
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setActiveAlert(null)}
              >
                Dismiss Alert
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}