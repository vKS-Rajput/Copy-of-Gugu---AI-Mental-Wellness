import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoodSlider from '../components/MoodSlider';
import { ArrowRight, ShieldCheck, HeartHandshake, BrainCircuit, Activity, Star, Quote, Sparkles, Smile } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [currentMood, setCurrentMood] = useState(3);

  const handleMoodChange = (val) => {
    setCurrentMood(val);
  };

  const handleStartJourney = () => {
    navigate('/chat', { state: { initialMood: currentMood } });
  };

  // Dynamic styles based on mood
  const getMoodStyles = (mood) => {
    switch (mood) {
      case 1: // Down
        return {
          glow: 'bg-indigo-500/20',
          border: 'border-indigo-500/30',
          textGradient: 'from-indigo-200 via-white to-indigo-200',
          accent: 'text-indigo-400'
        };
      case 2: // Content
        return {
          glow: 'bg-teal-500/20',
          border: 'border-teal-500/30',
          textGradient: 'from-teal-200 via-white to-teal-200',
          accent: 'text-teal-400'
        };
      case 3: // Peaceful
        return {
          glow: 'bg-emerald-500/20',
          border: 'border-emerald-500/30',
          textGradient: 'from-emerald-200 via-white to-emerald-200',
          accent: 'text-emerald-400'
        };
      case 4: // Happy
        return {
          glow: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          textGradient: 'from-yellow-200 via-white to-yellow-200',
          accent: 'text-yellow-400'
        };
      case 5: // Excited
        return {
          glow: 'bg-orange-500/20',
          border: 'border-orange-500/30',
          textGradient: 'from-orange-200 via-white to-orange-200',
          accent: 'text-orange-400'
        };
      default:
        return {
          glow: 'bg-teal-500/20',
          border: 'border-teal-500/30',
          textGradient: 'from-teal-200 via-white to-purple-200',
          accent: 'text-brand-accent'
        };
    }
  };

  const styles = getMoodStyles(currentMood);

  return (
    <div className="relative overflow-hidden bg-[#050505] min-h-screen">
      
      {/* Dynamic Background Waves */}
      <div className="absolute top-0 left-0 w-full h-[100vh] overflow-hidden pointer-events-none z-0">
        {/* Center point for waves */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
            {/* Concentric Circles - Smaller & Waving */}
            {[0, 1, 2, 3].map((i) => (
                <div 
                    key={i}
                    className={`absolute rounded-full border transition-colors duration-700 ease-out ${styles.border} opacity-0`}
                    style={{
                        width: '300px', // Smaller starting size
                        height: '300px',
                        animation: `wave 4s infinite linear`,
                        animationDelay: `${i * 1.2}s`
                    }}
                ></div>
            ))}
             {/* Central Glow */}
             <div className={`absolute w-[400px] h-[400px] rounded-full blur-[80px] transition-colors duration-700 ${styles.glow}`}></div>
        </div>
      </div>

      {/* Hero Content */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 min-h-[90vh]">
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-10 backdrop-blur-sm shadow-xl">
            <Sparkles size={14} className={styles.accent} />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Guide U, Guide Us</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-white leading-tight">
            Find Peace <br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${styles.textGradient} transition-all duration-700`}>
              of Mind
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-20 max-w-2xl mx-auto leading-relaxed font-light">
            Experience a new way of emotional support. Our AI companion is here to listen, understand, and guide you through life's journey.
          </p>
          
          {/* Interactive Mood Section */}
          <div className="mb-16 w-full max-w-3xl mx-auto">
             <div className="text-sm text-gray-400 mb-12 font-medium tracking-wide">Whatever you're feeling, we're here to listen</div>
             <MoodSlider onMoodSelect={handleMoodChange} />
          </div>

          <button 
            onClick={handleStartJourney}
            className={`group relative inline-flex items-center gap-3 px-10 py-4 ${styles.glow.replace('/20', '')} bg-opacity-100 text-white rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] border border-white/10`}
            style={{ backgroundColor: styles.accent.replace('text-', 'bg-').replace('-400', '-500') }}
          >
            <span className="text-black">Begin Your Journey</span>
            <ArrowRight size={20} className="text-black group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 bg-[#0a0a0a] py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How Gugu Helps You</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Experience a new kind of emotional support, powered by empathetic AI and professional care.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<HeartHandshake size={28} />}
              title="24/7 Support"
              description="Always here to listen and support you, any time of day or night. No appointments needed."
            />
            <FeatureCard 
              icon={<BrainCircuit size={28} />}
              title="Smart Insights"
              description="Personalized guidance powered by emotional intelligence and behavioral patterns."
            />
             <FeatureCard 
              icon={<ShieldCheck size={28} />}
              title="Private & Secure"
              description="Your conversations are always confidential, encrypted, and completely safe."
            />
             <FeatureCard 
              icon={<Activity size={28} />}
              title="Evidence-Based"
              description="Therapeutic techniques backed by clinical research including CBT & DBT principles."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative z-10 py-32 px-4 bg-[#050505] border-t border-white/5 overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-brand-accent/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-accent text-xs font-bold uppercase tracking-wider mb-6">
                    About Gugu
                 </div>
                 <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                    Guide U, <br/>
                    <span className="text-brand-accent">Guide Us.</span>
                 </h2>
                 <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                     <p>
                        Gugu was born from a simple yet profound realization: everyone deserves access to compassionate, judgment-free support, whenever they need it.
                     </p>
                     <p>
                        We believe in a future where technology amplifies human empathy rather than replacing it. Our platform combines advanced emotionally intelligent AI with a network of dedicated professionals to provide a holistic wellness ecosystem.
                     </p>
                     <p className="text-white font-medium">
                        Whether you need a listening ear at 3 AM or a structured therapy plan, Gugu walks beside you every step of the way.
                     </p>
                 </div>
                 <div className="mt-10 flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold text-white">10k+</span>
                        <span className="text-sm text-gray-500">Daily Conversations</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold text-white">500+</span>
                        <span className="text-sm text-gray-500">Licensed Therapists</span>
                    </div>
                 </div>
            </div>
            <div className="relative">
                <div className="aspect-square rounded-full border border-white/10 bg-gradient-to-tr from-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-accent/10 blur-3xl rounded-full"></div>
                    <Activity size={120} className="text-white/20 relative z-10" />
                    
                    {/* Floating Cards */}
                    <div className="absolute top-1/4 right-10 bg-[#151515] p-4 rounded-xl border border-white/10 shadow-2xl animate-pulse-slow">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Smile size={16} className="text-green-400" />
                            </div>
                            <div>
                                <div className="h-2 w-20 bg-white/20 rounded mb-1"></div>
                                <div className="h-2 w-12 bg-white/10 rounded"></div>
                            </div>
                        </div>
                    </div>

                     <div className="absolute bottom-1/4 left-10 bg-[#151515] p-4 rounded-xl border border-white/10 shadow-2xl animate-pulse-slow" style={{ animationDelay: '2s' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <ShieldCheck size={16} className="text-blue-400" />
                            </div>
                             <div className="text-xs text-gray-300 font-medium">Safe Space</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Reviews / Community Section */}
      <section className="relative z-10 bg-[#0a0a0a] py-32 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Voices of our Community</h2>
                    <p className="text-gray-400 max-w-xl">Join thousands of others who have found clarity and peace with Gugu.</p>
                </div>
                <button className="text-brand-accent font-semibold hover:text-white transition-colors flex items-center gap-2">
                    Read all stories <ArrowRight size={16} />
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

             <div className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-teal-900/20 to-purple-900/20 border border-white/10 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Ready to find your balance?</h3>
                    <button 
                        onClick={handleStartJourney}
                        className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
                    >
                        Start talking to Gugu
                    </button>
                </div>
             </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 rounded-3xl bg-[#121212] border border-white/5 hover:border-brand-accent/30 hover:bg-white/[0.03] transition-all duration-300 group hover:-translate-y-1">
    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-brand-accent mb-6 group-hover:scale-110 transition-transform group-hover:bg-brand-accent/10">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

const ReviewCard = ({ text, author, role, rating }) => (
    <div className="p-8 rounded-3xl bg-[#121212] border border-white/5 flex flex-col h-full relative">
        <Quote size={40} className="text-white/5 absolute top-6 right-6" />
        <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
            ))}
        </div>
        <p className="text-gray-300 mb-8 leading-relaxed flex-1">"{text}"</p>
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-sm">
                {author.charAt(0)}
            </div>
            <div>
                <div className="text-white font-semibold text-sm">{author}</div>
                <div className="text-gray-500 text-xs">{role}</div>
            </div>
        </div>
    </div>
);

export default Home;