import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AudioWaveform, ArrowLeft, Mail, Lock, Github, Chrome } from 'lucide-react';

const SignIn: React.FC = () => {
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for demo purposes
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-white mb-8 transition-colors text-sm font-medium">
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Link>

        <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-accent border border-white/10">
                 <AudioWaveform size={28} />
               </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in to continue your wellness journey</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="hello@example.com"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
               <label className="flex items-center gap-2 cursor-pointer hover:text-gray-300">
                 <input type="checkbox" className="rounded bg-white/10 border-white/10 text-brand-accent focus:ring-0" />
                 Remember me
               </label>
               <a href="#" className="hover:text-brand-accent transition-colors">Forgot Password?</a>
            </div>

            <button type="submit" className="w-full bg-brand-accent text-black font-bold py-3.5 rounded-xl hover:bg-teal-300 transition-colors shadow-lg shadow-teal-500/10 mt-2">
              Sign In
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121212] px-4 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-white">
              <Chrome size={18} />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-white">
              <Github size={18} />
              GitHub
            </button>
          </div>

          <p className="text-center mt-8 text-xs text-gray-500">
            Don't have an account? <Link to="/signin" className="text-brand-accent hover:text-teal-300 font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;