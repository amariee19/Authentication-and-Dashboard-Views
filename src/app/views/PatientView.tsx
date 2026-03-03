import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { MessageCircle, Shield, AlertCircle, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function PatientView() {
  const { userProfile, signOut } = useAuth();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [isPrivacyPaused, setIsPrivacyPaused] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sosHoldProgress, setSosHoldProgress] = useState(0);
  const [isHoldingSos, setIsHoldingSos] = useState(false);

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHoldingSos) {
      interval = setInterval(() => {
        setSosHoldProgress((prev) => {
          if (prev >= 100) {
            triggerSOS();
            return 0;
          }
          return prev + 5;
        });
      }, 50);
    } else {
      setSosHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHoldingSos]);

  const triggerSOS = () => {
    setIsHoldingSos(false);
    toast.error('Emergency SOS Activated! Notifying caregivers...', {
      duration: 5000
    });
    // In production, this would trigger Firebase real-time alert to caregivers
  };

  const handlePrivacyToggle = (checked: boolean) => {
    setIsPrivacyPaused(checked);
    setIsMonitoring(!checked);
    if (checked) {
      toast.info('Privacy mode enabled. Monitoring paused.');
    } else {
      toast.success('Monitoring resumed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <header className="max-w-2xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl text-gray-800">SafeWatch</h1>
          <p className="text-gray-600">Welcome, {userProfile?.name || 'Patient'}</p>
        </div>
        <Button variant="outline" onClick={() => handleSignOut()}>
          Sign Out
        </Button>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Status Indicator */}
        <div className="bg-white rounded-3xl shadow-lg p-12 flex flex-col items-center justify-center">
          <motion.div
            animate={
              isMonitoring
                ? {
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: isMonitoring ? Infinity : 0,
              ease: 'easeInOut'
            }}
            className={`w-48 h-48 rounded-full flex items-center justify-center mb-6 ${
              isMonitoring
                ? 'bg-green-100 border-8 border-green-400'
                : 'bg-gray-100 border-8 border-gray-300'
            }`}
          >
            <Activity
              className={`w-24 h-24 ${
                isMonitoring ? 'text-green-600' : 'text-gray-400'
              }`}
            />
          </motion.div>

          <h2 className="text-3xl mb-2">
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </h2>
          <p className="text-gray-600 text-lg">
            {isMonitoring
              ? 'Your safety is being monitored'
              : 'Privacy mode is enabled'}
          </p>
        </div>

        {/* Privacy Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl">Privacy Pause</h3>
                <p className="text-gray-600">Hardware-level camera override</p>
              </div>
            </div>
            <Switch
              checked={isPrivacyPaused}
              onCheckedChange={handlePrivacyToggle}
              className="scale-150"
            />
          </div>
        </div>

        {/* AI Wellness Assistant */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg p-2"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl">AI Wellness Assistant</h3>
                <p className="text-gray-600">Chat about your health and diet</p>
              </div>
            </div>
            <div className="text-gray-400">
              {showChat ? '−' : '+'}
            </div>
          </button>

          {showChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t"
            >
              <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-900">
                    Hello! I'm your AI wellness assistant. How can I help you today?
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 ml-8">
                  <p className="text-sm text-gray-900">
                    This is a demo. In production, this would connect to an AI chatbot for wellness guidance.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Emergency SOS */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <AlertCircle className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-2xl text-white mb-2">Emergency SOS</h3>
            <p className="text-red-100">Press and hold to call for help</p>
          </div>

          <button
            onMouseDown={() => setIsHoldingSos(true)}
            onMouseUp={() => setIsHoldingSos(false)}
            onMouseLeave={() => setIsHoldingSos(false)}
            onTouchStart={() => setIsHoldingSos(true)}
            onTouchEnd={() => setIsHoldingSos(false)}
            className="w-full h-20 bg-white hover:bg-red-50 text-red-700 rounded-xl transition-all transform active:scale-95 relative overflow-hidden"
          >
            <div
              className="absolute left-0 top-0 h-full bg-red-200 transition-all"
              style={{ width: `${sosHoldProgress}%` }}
            />
            <span className="relative z-10 text-xl">
              {isHoldingSos ? 'Hold to Confirm...' : 'Press & Hold for Emergency'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}