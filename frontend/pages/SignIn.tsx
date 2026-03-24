import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft, Mail, Lock, User, Stethoscope, HeartPulse, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'therapist'>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const url = isLogin ? 'http://localhost:3001/api/auth/login' : 'http://localhost:3001/api/auth/register';

    // In login mode, we don't need name or role from form.
    const payload = isLogin
      ? { email, password }
      : { name, email, password, role };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);

      if (data.user.role === 'therapist') {
        navigate('/therapist-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-warm-50 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sage-100/50 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-warm-200/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-sage-400 hover:text-sage-600 mb-6 transition-colors text-sm font-medium">
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Link>

        <div className="bg-white border border-sage-100 rounded-3xl p-8 md:p-10 shadow-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-sage-500 flex items-center justify-center shadow-sm">
                <Leaf size={24} className="text-white" />
              </div>
            </div>
            <h1 className="font-serif text-2xl text-sage-800 mb-2">{isLogin ? 'Welcome back to Gugu' : 'Join Gugu Wellness'}</h1>
            <p className="text-sage-400 text-sm">{isLogin ? 'Sign in to continue your journey' : 'Create an account to start your journey'}</p>
          </div>

          {error && (
            <div className="mb-6 bg-clay-50 border border-clay-200 text-clay-600 text-sm p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Role Selector (Only for Registration) */}
          {!isLogin && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-sage-500 mb-3 ml-1 uppercase tracking-wider">I am joining as a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${role === 'patient'
                    ? 'border-sage-400 bg-sage-50 shadow-sm'
                    : 'border-sage-100 bg-white hover:border-sage-200'
                    }`}
                >
                  <HeartPulse size={22} className={role === 'patient' ? 'text-sage-500' : 'text-sage-300'} />
                  <span className={`text-sm font-semibold ${role === 'patient' ? 'text-sage-700' : 'text-sage-400'}`}>
                    Patient
                  </span>
                  <span className="text-[10px] text-sage-300">Seeking support</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('therapist')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${role === 'therapist'
                    ? 'border-ocean-400 bg-ocean-50 shadow-sm'
                    : 'border-sage-100 bg-white hover:border-sage-200'
                    }`}
                >
                  <Stethoscope size={22} className={role === 'therapist' ? 'text-ocean-500' : 'text-sage-300'} />
                  <span className={`text-sm font-semibold ${role === 'therapist' ? 'text-ocean-600' : 'text-sage-400'}`}>
                    Therapist
                  </span>
                  <span className="text-[10px] text-sage-300">Provide care</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-sage-500 mb-1.5 ml-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" />
                  <input
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'therapist' ? 'Dr. Sarah Chen' : 'Alex Johnson'}
                    className="w-full bg-sage-50 border border-sage-100 rounded-xl py-3 pl-11 pr-4 text-sage-800 text-sm font-medium focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-200 transition-all placeholder:text-sage-300 font-sans"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-sage-500 mb-1.5 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full bg-sage-50 border border-sage-100 rounded-xl py-3 pl-11 pr-4 text-sage-800 text-sm font-medium focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-200 transition-all placeholder:text-sage-300 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sage-500 mb-1.5 ml-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-sage-50 border border-sage-100 rounded-xl py-3 pl-11 pr-4 text-sage-800 text-sm font-medium focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-200 transition-all placeholder:text-sage-300 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-sm mt-4 flex items-center justify-center gap-2 ${(!isLogin && role === 'therapist')
                ? 'bg-ocean-500 text-white hover:bg-ocean-600 disabled:bg-ocean-300'
                : 'bg-sage-600 text-white hover:bg-sage-700 disabled:bg-sage-300'
                }`}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLogin ? 'Sign In' : `Create Account as ${role === 'therapist' ? 'Therapist' : 'Patient'}`}
            </button>
          </form>

          <p className="text-center mt-8 text-xs font-medium text-sage-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sage-600 hover:text-sage-800 font-bold underline decoration-2 underline-offset-2"
            >
              {isLogin ? "Create one" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;