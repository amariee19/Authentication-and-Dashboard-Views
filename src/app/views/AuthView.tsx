import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Shield, User } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore'; // Import these
import { db } from '../lib/firebase'; // Ensure your DB import is correc

export default function AuthView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // 1. Authenticate with Firebase
    // const userCredential = await signIn(email, password, role);

    
const { userCredential, profile } = await signIn(email, password, role);
  
  console.log("Logged in as:", profile.role);
    {console.log(userCredential)};
    const uid = userCredential.user.uid;

    // 2. Fetch the user's document from Firestore to get their REAL role
    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (!userDoc.exists()) {
      throw new Error("User profile not found. Please contact support.");
    }

  


    const userData = userDoc.data();
    
    // 3. Compare the role stored in the database with the selected toggle
    if (userData.role !== role) {
      throw new Error(`This account is registered as a ${userData.role}, not a ${role}.`);
    }

    // 4. Only if roles match, we navigate
    navigate(role === 'patient' ? '/patient' : '/caregiver');
    toast.success('Successfully signed in');
    
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setIsLoading(false);
  }
};

  const handleDemoLogin = () => {
    // Set demo mode flags in sessionStorage
    sessionStorage.setItem('demoMode', 'true');
    sessionStorage.setItem('demoRole', role);
    
    // Navigate directly to the selected role view
    navigate(role === 'patient' ? '/patient' : '/caregiver');
    toast.success(`Logged in as ${role} (Demo Mode)`);
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Brand/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1695048441386-0d6c4043d8c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwdGVjaG5vbG9neSUyMGlsbHVzdHJhdGlvbnxlbnwxfHx8fDE3NzIzOTgyMjR8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Healthcare monitoring"
            className="w-full h-auto rounded-lg shadow-2xl mb-8"
          />
          <h1 className="text-4xl mb-4">SafeWatch Care</h1>
          <p className="text-xl text-blue-100">
            Advanced AI-powered monitoring for peace of mind and safety
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-3 p-2 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                role === 'patient'
                  ? 'bg-white shadow-md text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-lg">I am a Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('caregiver')}
              className={`flex-1 py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                role === 'caregiver'
                  ? 'bg-white shadow-md text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-6 h-6" />
              <span className="text-lg">I am a Caregiver</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="h-14 text-lg"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-14 text-lg"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Forgot Password?
            </button>
          </div>

          {/* Demo Credentials Notice */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-3">
              <strong>Demo Mode:</strong> This is a demonstration with Firebase integration. 
              Configure your Firebase credentials in /src/app/lib/firebase.ts to enable authentication.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
            >
              Continue in Demo Mode as {role === 'patient' ? 'Patient' : 'Caregiver'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}