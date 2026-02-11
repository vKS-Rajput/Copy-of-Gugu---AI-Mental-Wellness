import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Clock, FileText, Wind, Gamepad2, RotateCcw, Sun, Moon, Star, Cloud } from 'lucide-react';

const MOOD_DATA = [
  { day: 'Mon', score: 3 },
  { day: 'Tue', score: 2 },
  { day: 'Wed', score: 4 },
  { day: 'Thu', score: 3 },
  { day: 'Fri', score: 5 },
  { day: 'Sat', score: 4 },
  { day: 'Sun', score: 4 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Alex</h1>
        <p className="text-gray-400">Here's an overview of your wellness journey this week.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<TrendingUp size={20} />} label="Average Mood" value="Peaceful" color="text-teal-400" />
        <StatCard icon={<Clock size={20} />} label="Mindfulness Mins" value="125 min" color="text-purple-400" />
        <StatCard icon={<Calendar size={20} />} label="Sessions" value="2 Completed" color="text-blue-400" />
        <StatCard icon={<FileText size={20} />} label="Journal Entries" value="5 this week" color="text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mood Chart */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Mood History</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOOD_DATA}>
                    <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <XAxis 
                    dataKey="day" 
                    stroke="#525252" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    />
                    <YAxis 
                    stroke="#525252" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[1, 5]} 
                    ticks={[1, 2, 3, 4, 5]}
                    />
                    <Tooltip 
                    contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#2dd4bf" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    />
                </AreaChart>
                </ResponsiveContainer>
            </div>
            </div>

            {/* Quick Relief Games Section */}
            <div>
                 <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gamepad2 className="text-brand-accent" size={24} />
                    Quick Relief Games
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <BreathingGame />
                     <BubblePopGame />
                     <div className="md:col-span-2">
                        <MemoryGame />
                     </div>
                 </div>
            </div>
        </div>

        {/* Recent Activity / Next Session */}
        <div className="space-y-6">
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Session</h3>
            <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
              <img src="https://picsum.photos/100/100?random=1" alt="Therapist" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="text-white font-medium">Dr. Sarah Chen</p>
                <p className="text-xs text-gray-400">Tomorrow, 10:00 AM</p>
              </div>
            </div>
            <button className="w-full mt-4 bg-brand-accent text-black py-2 rounded-lg text-sm font-semibold hover:bg-teal-300 transition-colors">
              Join Waiting Room
            </button>
          </div>

           <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Quote</h3>
            <blockquote className="text-gray-300 italic text-sm border-l-2 border-brand-purple pl-4">
              "Healing is not linear. Be gentle with yourself as you grow."
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Mini Games Components ---

const BreathingGame: React.FC = () => {
    const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhase(p => {
                if (p === 'Inhale') return 'Hold';
                if (p === 'Hold') return 'Exhale';
                return 'Inhale';
            });
        }, 4000); // Simple 4-4-4 cycle logic simplification for UI
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (phase === 'Inhale') setScale(1.5);
        else if (phase === 'Exhale') setScale(1);
        // Hold stays same
    }, [phase]);

    return (
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
            <div className="absolute top-4 left-4 text-sm text-gray-400 font-medium flex items-center gap-2">
                <Wind size={16} />
                Box Breathing
            </div>
            
            <div 
                className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-purple/20 border-2 border-brand-accent/50 flex items-center justify-center transition-all duration-[4000ms] ease-in-out relative z-10"
                style={{ transform: `scale(${scale})` }}
            >
                <div className="w-full h-full rounded-full bg-brand-accent/10 blur-xl absolute"></div>
                <span className="text-white font-bold text-sm">{phase}</span>
            </div>
            <p className="text-xs text-gray-500 mt-8">Follow the circle's rhythm</p>
        </div>
    );
};

const BubblePopGame: React.FC = () => {
    // 4x4 Grid
    const [bubbles, setBubbles] = useState<boolean[]>(Array(16).fill(false)); // false = intact, true = popped

    const popBubble = (index: number) => {
        if (bubbles[index]) return; // Already popped
        const newBubbles = [...bubbles];
        newBubbles[index] = true;
        setBubbles(newBubbles);
        // Optional: Play sound here
    };

    const reset = () => {
        setBubbles(Array(16).fill(false));
    };

    const allPopped = bubbles.every(b => b);

    return (
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 flex flex-col items-center min-h-[250px]">
            <div className="w-full flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    Bubble Wrap
                </div>
                <button onClick={reset} className="text-gray-500 hover:text-white transition-colors" title="Reset">
                    <RotateCcw size={16} />
                </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {bubbles.map((popped, i) => (
                    <button
                        key={i}
                        onClick={() => popBubble(i)}
                        className={`w-10 h-10 rounded-full border transition-all duration-200 ${
                            popped 
                            ? 'bg-transparent border-white/10 scale-90 shadow-inner' 
                            : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:scale-110 shadow-lg cursor-pointer active:scale-95'
                        }`}
                    >
                    </button>
                ))}
            </div>
            
            <div className={`mt-4 text-xs font-bold text-brand-accent transition-opacity duration-500 ${allPopped ? 'opacity-100' : 'opacity-0'}`}>
                Satisfying! Reset to pop again.
            </div>
        </div>
    );
};

const MemoryGame: React.FC = () => {
    const icons = [Sun, Moon, Star, Cloud];
    const [cards, setCards] = useState(() => {
        const initialCards = [...icons, ...icons].map((Icon, index) => ({
            id: index,
            icon: Icon,
            isFlipped: false,
            isMatched: false,
            color: ['text-yellow-400', 'text-blue-400', 'text-purple-400', 'text-white'][index % 4]
        }));
        return initialCards.sort(() => Math.random() - 0.5);
    });
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

    const handleCardClick = (index: number) => {
        if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);
        
        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            const [firstIndex, secondIndex] = newFlipped;
            if (newCards[firstIndex].icon === newCards[secondIndex].icon) {
                newCards[firstIndex].isMatched = true;
                newCards[secondIndex].isMatched = true;
                setCards(newCards);
                setFlippedIndices([]);
            } else {
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[firstIndex].isFlipped = false;
                    resetCards[secondIndex].isFlipped = false;
                    setCards(resetCards);
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    };

    const resetGame = () => {
         const initialCards = [...icons, ...icons].map((Icon, index) => ({
            id: index,
            icon: Icon,
            isFlipped: false,
            isMatched: false,
            color: ['text-yellow-400', 'text-blue-400', 'text-purple-400', 'text-white'][index % 4]
        }));
        setCards(initialCards.sort(() => Math.random() - 0.5));
        setFlippedIndices([]);
    };

    const allMatched = cards.every(c => c.isMatched);

    return (
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    <Star size={16} className="text-yellow-400" />
                    Memory Match
                </div>
                <button onClick={resetGame} className="text-gray-500 hover:text-white transition-colors" title="Reset">
                    <RotateCcw size={16} />
                </button>
            </div>

            <div className="grid grid-cols-4 gap-3 w-full max-w-[300px]">
                {cards.map((card, index) => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(index)}
                        className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-300 ${
                            card.isFlipped || card.isMatched
                                ? 'bg-white/10 rotate-y-180'
                                : 'bg-brand-accent/20 hover:bg-brand-accent/30'
                        }`}
                    >
                        {(card.isFlipped || card.isMatched) && (
                            <card.icon size={20} className={card.color} />
                        )}
                    </button>
                ))}
            </div>
             {allMatched && (
                <div className="mt-4 text-xs font-bold text-brand-accent animate-bounce">
                    Well done! You found them all.
                </div>
            )}
        </div>
    );
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl">
    <div className={`flex items-center gap-2 mb-2 ${color}`}>
      {icon}
      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

export default Dashboard;