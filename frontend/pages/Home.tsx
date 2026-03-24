import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MoodSlider from '../components/MoodSlider';
import { ArrowRight, ShieldCheck, HeartHandshake, BrainCircuit, Activity, Star, Quote, Leaf, Sparkles, MessageCircle, Wind } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState(3);
  const [breathScale, setBreathScale] = useState(1);
  const [breathText, setBreathText] = useState('Inhale');

  useEffect(() => {
    if (user) {
      if (user.role === 'therapist') navigate('/therapist-dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (currentMood <= 2) {
      const interval = setInterval(() => {
        setBreathText(p => {
          if (p === 'Inhale') return 'Hold';
          if (p === 'Hold') return 'Exhale';
          return 'Inhale';
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [currentMood]);

  useEffect(() => {
    if (breathText === 'Inhale') setBreathScale(1.5);
    else if (breathText === 'Exhale') setBreathScale(1);
  }, [breathText]);

  const handleMoodChange = (val) => {
    setCurrentMood(val);
  };

  const handleStartJourney = () => {
    if (!user) {
      navigate('/signin');
    } else {
      navigate('/chat', { state: { initialMood: currentMood } });
    }
  };

  const getBgClass = () => {
    switch (currentMood) {
      case 1: return 'bg-ocean-50/80';
      case 2: return 'bg-sage-50/80';
      case 3: return 'bg-warm-50';
      case 4: return 'bg-warm-100/40';
      case 5: return 'bg-clay-50/40';
      default: return 'bg-warm-50';
    }
  };

  return (
    <div className={`relative overflow-hidden min-h-[100dvh] transition-colors duration-1000 ${getBgClass()}`}>
      {/* Subtle Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-[90vh] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-sage-200/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 left-[5%] w-56 h-56 bg-warm-200/50 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 right-[30%] w-40 h-40 bg-ocean-100/40 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-28 pb-20 min-h-[88vh]">
        <div className="text-center px-4 max-w-4xl mx-auto">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sage-200 bg-white/60 backdrop-blur-sm mb-8 shadow-sm">
            <Leaf size={14} className="text-sage-500" />
            <span className="text-xs font-semibold text-sage-500 uppercase tracking-wider">Guide U, Guide Us</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-sage-800 mb-6 leading-[1.1]">
            Find Your <br />
            <span className="text-sage-500">Peace of Mind</span>
          </h1>

          <p className="text-lg md:text-xl text-sage-400 mb-16 max-w-2xl mx-auto leading-relaxed font-light">
            A compassionate AI companion that listens like a friend, cares like family, and connects you with professional support when you need it most.
          </p>

          {/* Mood Section */}
          <div className="mb-10 w-full max-w-xl mx-auto">
            <MoodSlider onMoodSelect={handleMoodChange} />
          </div>

          {currentMood <= 2 && (
            <div className="mb-14 w-full max-w-md mx-auto bg-white/80 backdrop-blur-md border border-ocean-100 rounded-3xl p-8 shadow-sm flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-ocean-600 font-serif text-xl mb-2">We hear you.</div>
              <p className="text-ocean-500/80 text-sm mb-8 font-medium">Take a slow, deep breath with this circle before we begin.</p>

              <div className="h-32 mb-4 flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-full bg-ocean-100 border-2 border-ocean-300 flex items-center justify-center transition-all duration-[4000ms] ease-in-out relative z-10 shadow-inner"
                  style={{ transform: `scale(${breathScale})` }}
                >
                  <div className="w-full h-full rounded-full bg-ocean-200 blur-xl absolute opacity-50"></div>
                  <span className="text-ocean-700 font-bold text-xs relative z-20 uppercase tracking-widest">{breathText}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleStartJourney}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-sage-500 text-white rounded-2xl font-semibold text-lg transition-all hover:bg-sage-600 hover:shadow-lg hover:shadow-sage-500/20 active:scale-[0.98]"
          >
            Begin Your Journey
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 bg-white py-24 px-4 border-t border-sage-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl text-sage-800 mb-4">How Gugu Helps You</h2>
            <p className="text-sage-400 text-lg max-w-xl mx-auto">Compassionate AI support meets professional care — a holistic approach to your emotional wellbeing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<HeartHandshake size={26} />}
              title="24/7 Support"
              description="Always here to listen and support you, any time of day or night."
              color="bg-clay-50 text-clay-500"
            />
            <FeatureCard
              icon={<BrainCircuit size={26} />}
              title="Smart Insights"
              description="Personalized guidance powered by emotional intelligence."
              color="bg-ocean-50 text-ocean-500"
            />
            <FeatureCard
              icon={<ShieldCheck size={26} />}
              title="Private & Secure"
              description="Your conversations are always confidential and completely safe."
              color="bg-sage-50 text-sage-500"
            />
            <FeatureCard
              icon={<Activity size={26} />}
              title="Evidence-Based"
              description="Therapeutic techniques backed by CBT & DBT principles."
              color="bg-warm-100 text-warm-500"
            />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="relative z-10 py-24 px-4 bg-sage-50 border-t border-sage-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-sage-200 text-sage-500 text-xs font-bold uppercase tracking-wider mb-6">
              About Gugu
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-sage-800 mb-8 leading-tight">
              Guide U, <br />
              <span className="text-sage-500">Guide Us.</span>
            </h2>
            <div className="space-y-5 text-sage-500 text-base leading-relaxed">
              <p>
                Gugu was born from a simple yet profound realization: everyone deserves access to compassionate, judgment-free support, whenever they need it.
              </p>
              <p>
                Our platform combines advanced emotionally intelligent AI with a network of dedicated professionals to provide a holistic wellness ecosystem.
              </p>
              <p className="text-sage-700 font-medium">
                Whether you need a listening ear at 3 AM or a structured therapy plan, Gugu walks beside you every step of the way.
              </p>
            </div>
            <div className="mt-10 flex gap-10">
              <div className="flex flex-col">
                <span className="font-serif text-3xl text-sage-700">10k+</span>
                <span className="text-sm text-sage-400">Daily Conversations</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-3xl text-sage-700">500+</span>
                <span className="text-sm text-sage-400">Licensed Therapists</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-80 h-80 rounded-3xl bg-white border border-sage-200 shadow-sm flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sage-100/50 to-ocean-100/30"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 rounded-2xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={36} className="text-sage-500" />
                </div>
                <p className="text-sage-600 font-medium text-sm">Always listening.</p>
                <p className="text-sage-400 text-xs mt-1">Always caring.</p>
              </div>
              {/* Floating cards */}
              <div className="absolute top-6 right-6 bg-white p-3 rounded-xl border border-sage-100 shadow-sm animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sage-100 flex items-center justify-center">
                    <ShieldCheck size={12} className="text-sage-500" />
                  </div>
                  <span className="text-xs text-sage-500 font-medium">Safe Space</span>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 bg-white p-3 rounded-xl border border-sage-100 shadow-sm animate-float-delayed">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-clay-100 flex items-center justify-center">
                    <Sparkles size={12} className="text-clay-400" />
                  </div>
                  <span className="text-xs text-sage-500 font-medium">AI Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="relative z-10 bg-white py-24 px-4 border-t border-sage-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <h2 className="font-serif text-3xl md:text-5xl text-sage-800 mb-3">Voices of our Community</h2>
              <p className="text-sage-400 max-w-xl">Join thousands who have found clarity and peace with Gugu.</p>
            </div>
            <button className="text-sage-500 font-semibold hover:text-sage-700 transition-colors flex items-center gap-2 text-sm">
              Read all stories <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReviewCard
              text="I was skeptical about AI therapy, but Gugu feels genuinely empathetic. It's helped me navigate my anxiety in ways I didn't think possible."
              author="Sarah J."
              role="Member for 6 months"
              rating={5}
            />
            <ReviewCard
              text="Having support available 24/7 is a game changer. The panic attack guidance exercises literally saved me last week."
              author="Michael T."
              role="Member for 2 months"
              rating={5}
            />
            <ReviewCard
              text="I love that I can track my mood and then easily share my history with my therapist. It connects all the dots."
              author="Emily R."
              role="Member for 1 year"
              rating={4}
            />
          </div>

          {/* CTA */}
          <div className="mt-20 p-10 md:p-14 rounded-3xl bg-sage-50 border border-sage-200 text-center">
            <h3 className="font-serif text-2xl md:text-3xl text-sage-800 mb-6">Ready to find your balance?</h3>
            <button
              onClick={handleStartJourney}
              className="px-8 py-3 bg-sage-500 text-white rounded-2xl font-semibold hover:bg-sage-600 transition-colors shadow-sm"
            >
              Start talking to Gugu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }) => (
  <div className="p-7 rounded-2xl bg-white border border-sage-100 hover:border-sage-200 hover:shadow-md transition-all duration-300 group">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-sage-800 mb-2">{title}</h3>
    <p className="text-sage-400 text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

const ReviewCard = ({ text, author, role, rating }) => (
  <div className="p-7 rounded-2xl bg-sage-50 border border-sage-100 flex flex-col h-full relative">
    <Quote size={32} className="text-sage-200 absolute top-6 right-6" />
    <div className="flex gap-0.5 mb-5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={`${i < rating ? 'text-warm-400 fill-warm-400' : 'text-sage-200'}`} />
      ))}
    </div>
    <p className="text-sage-600 mb-6 leading-relaxed text-sm flex-1">"{text}"</p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-sage-200 flex items-center justify-center text-sage-600 font-bold text-sm">
        {author.charAt(0)}
      </div>
      <div>
        <div className="text-sage-700 font-semibold text-sm">{author}</div>
        <div className="text-sage-400 text-xs">{role}</div>
      </div>
    </div>
  </div>
);

export default Home;