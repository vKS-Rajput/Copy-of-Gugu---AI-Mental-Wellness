import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Clock, FileText, Wind, Gamepad2, RotateCcw, Sun, Moon, Star, Cloud, CheckCircle2, Hourglass, CalendarCheck, PhoneCall, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
    const { token, user } = useAuth();
    const [dashboardData, setDashboardData] = useState<{ stats: any, moodHistory: any } | null>(null);
    const [upcomingSession, setUpcomingSession] = useState<any | null>(null);
    const [therapyRequests, setTherapyRequests] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_API_URL + '/api/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setDashboardData(data);
                }

                const sessionRes = await fetch(import.meta.env.VITE_API_URL + '/api/appointments/patient', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (sessionRes.ok) {
                    const sessions = await sessionRes.json();
                    if (sessions.length > 0) {
                        setUpcomingSession(sessions[0]);
                    }
                }

                const reqRes = await fetch(import.meta.env.VITE_API_URL + '/api/therapy-requests/my', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (reqRes.ok) {
                    setTherapyRequests(await reqRes.json());
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchDashboard();
    }, [token]);

    if (!dashboardData) {
        return <div className="min-h-[100dvh] flex items-center justify-center bg-warm-50 text-sage-500 font-medium">Loading dashboard...</div>;
    }

    const { stats, moodHistory } = dashboardData;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-sage-800 mb-2">Welcome back, {user?.name.split(' ')[0]}</h1>
                    <p className="text-sage-400">Here's an overview of your wellness journey this week.</p>
                </div>
            </div>

            {/* Emergency SOS Banner */}
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none opacity-50"></div>

                <div className="flex items-start gap-5 relative z-10 mb-6 md:mb-0">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-red-100 flex items-center justify-center shadow-sm shrink-0">
                        <AlertTriangle className="text-red-500 animate-pulse" size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-red-700 tracking-tight mb-1">Emergency & Crisis Support</h2>
                        <p className="text-red-600/80 text-sm font-medium mb-3">If you are in immediate danger or experiencing a crisis, support is available 24/7.</p>

                        <div className="flex flex-wrap gap-3">
                            <a href="tel:988" className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-red-100 hover:bg-red-50 transition-colors">
                                <PhoneCall size={16} /> 988 Suicide & Crisis Lifeline
                            </a>
                            <a href="sms:741741" className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-red-100 hover:bg-red-50 transition-colors">
                                Text HOME to 741741
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={<TrendingUp size={20} />} label="Average Mood" value={stats.averageMood} color="text-ocean-500" bgColor="bg-ocean-50" />
                <StatCard icon={<Clock size={20} />} label="Mindfulness Mins" value={`${stats.mindfulnessMins} min`} color="text-sage-500" bgColor="bg-sage-50" />
                <StatCard icon={<Calendar size={20} />} label="Sessions" value={`${stats.sessionsCompleted} Completed`} color="text-warm-500" bgColor="bg-warm-50" />
                <StatCard icon={<FileText size={20} />} label="Journal Entries" value={`${stats.journalEntries} this week`} color="text-clay-500" bgColor="bg-clay-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mood Chart */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-sage-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-sage-800 mb-6">Mood History</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={moodHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#96a583" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#96a583" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="day"
                                        stroke="#96a583"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#96a583"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[1, 5]}
                                        ticks={[1, 2, 3, 4, 5]}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e8ebe3', borderRadius: '12px', color: '#363f30', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#7a8c67"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Relief Games Section */}
                    <div>
                        <h3 className="text-xl font-bold text-sage-800 mb-4 flex items-center gap-2">
                            <Gamepad2 className="text-sage-500" size={24} />
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
                    <div className="bg-white border border-sage-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-sage-800 mb-4">Upcoming Session</h3>

                        {upcomingSession ? (
                            <>
                                <div className="bg-sage-50 rounded-xl p-4 flex items-center gap-4 border border-sage-100 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-sage-200 border-2 border-white flex items-center justify-center text-sage-600 font-bold text-xl shadow-sm">
                                        {upcomingSession.therapist_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sage-800 font-semibold">{upcomingSession.therapist_name}</p>
                                        <p className="text-xs text-sage-500 font-bold">{new Date(upcomingSession.date).toLocaleDateString()} at {upcomingSession.time}</p>
                                    </div>
                                </div>
                                <Link
                                    to={`/session/${upcomingSession.id}`}
                                    className="w-full bg-sage-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-sage-600 transition-colors shadow-sm text-center block"
                                >
                                    Join Waiting Room
                                </Link>
                            </>
                        ) : (
                            <div className="text-center py-6 px-4 bg-sage-50/50 rounded-2xl border border-sage-200 border-dashed">
                                <Calendar className="w-8 h-8 text-sage-300 mx-auto mb-2" />
                                <h4 className="font-bold text-sage-600 text-sm mb-1">No sessions booked</h4>
                                <p className="text-xs text-sage-400 mb-4">Schedule a time to speak with a professional.</p>
                                <a href="/therapists" className="px-4 py-2 bg-white border border-sage-200 text-sage-600 rounded-lg text-xs font-bold hover:bg-sage-50 shadow-sm block">Find a Therapist</a>
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-sage-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-sage-800 mb-4">Daily Quote</h3>
                        <blockquote className="text-sage-600 italic text-sm border-l-4 border-ocean-300 pl-4 bg-ocean-50/50 py-2 pr-2 rounded-r-lg">
                            "Healing is not linear. Be gentle with yourself as you grow."
                        </blockquote>
                    </div>
                </div>

                {/* Therapy Request Status Tracker */}
                {therapyRequests.length > 0 && (
                    <div className="lg:col-span-3 mt-8">
                        <h3 className="text-xl font-bold text-sage-800 mb-4 flex items-center gap-2">
                            <Hourglass className="text-ocean-500" size={22} />
                            My Therapy Requests
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {therapyRequests.map(req => (
                                <div key={req.id} className="bg-white border border-sage-100 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${req.status === 'pending' ? 'bg-warm-50 text-warm-600 border-warm-100' :
                                            req.status === 'approved' ? 'bg-ocean-50 text-ocean-600 border-ocean-100' :
                                                req.status === 'scheduled' ? 'bg-sage-50 text-sage-600 border-sage-100' :
                                                    req.status === 'rejected' ? 'bg-clay-50 text-clay-500 border-clay-100' :
                                                        'bg-sage-50 text-sage-500 border-sage-100'
                                            }`}>{req.status}</span>
                                        <span className="px-2 py-0.5 bg-ocean-50 text-ocean-600 text-[10px] font-bold rounded-md border border-ocean-100 uppercase">{req.domain}</span>
                                    </div>

                                    {/* Progress Steps */}
                                    <div className="flex items-center gap-1 mb-4">
                                        <div className={`h-1.5 flex-1 rounded-full ${req.status !== 'rejected' ? 'bg-sage-500' : 'bg-clay-300'}`}></div>
                                        <div className={`h-1.5 flex-1 rounded-full ${['approved', 'scheduled', 'completed'].includes(req.status) ? 'bg-sage-500' : 'bg-sage-200'}`}></div>
                                        <div className={`h-1.5 flex-1 rounded-full ${['scheduled', 'completed'].includes(req.status) ? 'bg-sage-500' : 'bg-sage-200'}`}></div>
                                    </div>

                                    {req.therapist_name && (
                                        <p className="text-sm text-sage-700 font-semibold mb-1">Therapist: {req.therapist_name}</p>
                                    )}
                                    {req.scheduled_date && (
                                        <div className="flex items-center gap-2 text-sm text-ocean-600 font-medium bg-ocean-50/50 px-3 py-2 rounded-lg border border-ocean-100">
                                            <CalendarCheck size={14} />
                                            {new Date(req.scheduled_date).toLocaleDateString()} at {req.scheduled_time}
                                        </div>
                                    )}
                                    {req.status === 'pending' && (
                                        <p className="text-xs text-sage-400 mt-2">Waiting for a therapist to review...</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
        <div className="bg-white border border-sage-100 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden shadow-sm">
            <div className="absolute top-4 left-4 text-sm text-ocean-500 font-semibold flex items-center gap-2">
                <Wind size={16} />
                Box Breathing
            </div>

            <div
                className="w-24 h-24 rounded-full bg-ocean-100 border-2 border-ocean-300 flex items-center justify-center transition-all duration-[4000ms] ease-in-out relative z-10 shadow-inner"
                style={{ transform: `scale(${scale})` }}
            >
                <div className="w-full h-full rounded-full bg-ocean-200 blur-xl absolute opacity-50"></div>
                <span className="text-ocean-700 font-bold text-sm relative z-20">{phase}</span>
            </div>
            <p className="text-xs text-sage-400 mt-8 font-medium">Follow the circle's rhythm</p>
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
    };

    const reset = () => {
        setBubbles(Array(16).fill(false));
    };

    const allPopped = bubbles.every(b => b);

    return (
        <div className="bg-white border border-sage-100 rounded-2xl p-6 flex flex-col items-center min-h-[250px] shadow-sm">
            <div className="w-full flex justify-between items-center mb-4">
                <div className="text-sm text-clay-500 font-semibold flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-clay-400"></div>
                    Bubble Wrap
                </div>
                <button onClick={reset} className="text-sage-300 hover:text-sage-500 transition-colors bg-sage-50 p-1.5 rounded-lg" title="Reset">
                    <RotateCcw size={14} />
                </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {bubbles.map((popped, i) => (
                    <button
                        key={i}
                        onClick={() => popBubble(i)}
                        className={`w-10 h-10 rounded-full border transition-all duration-200 ${popped
                            ? 'bg-transparent border-sage-200 scale-90 shadow-inner opacity-40'
                            : 'bg-gradient-to-br from-white to-sage-50 border-sage-200 hover:scale-110 shadow-sm cursor-pointer active:scale-95'
                            }`}
                    >
                    </button>
                ))}
            </div>

            <div className={`mt-4 text-xs font-bold text-clay-500 transition-opacity duration-500 ${allPopped ? 'opacity-100' : 'opacity-0'}`}>
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
            color: ['text-warm-500', 'text-ocean-500', 'text-clay-500', 'text-sage-500'][index % 4]
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
            color: ['text-warm-500', 'text-ocean-500', 'text-clay-500', 'text-sage-500'][index % 4]
        }));
        setCards(initialCards.sort(() => Math.random() - 0.5));
        setFlippedIndices([]);
    };

    const allMatched = cards.every(c => c.isMatched);

    return (
        <div className="bg-white border border-sage-100 rounded-2xl p-6 flex flex-col items-center shadow-sm">
            <div className="w-full flex justify-between items-center mb-6">
                <div className="text-sm text-warm-500 font-semibold flex items-center gap-2">
                    <Star size={18} className="text-warm-400 fill-warm-200" />
                    Memory Match
                </div>
                <button onClick={resetGame} className="text-sage-300 hover:text-sage-500 transition-colors bg-sage-50 p-1.5 rounded-lg" title="Reset">
                    <RotateCcw size={14} />
                </button>
            </div>

            <div className="grid grid-cols-4 gap-3 w-full max-w-[300px]">
                {cards.map((card, index) => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(index)}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-300 border ${card.isFlipped || card.isMatched
                            ? 'bg-white border-sage-200 shadow-sm rotate-y-180'
                            : 'bg-sage-50 border-sage-100 hover:bg-sage-100 hover:border-sage-300'
                            }`}
                    >
                        {(card.isFlipped || card.isMatched) && (
                            <card.icon size={24} className={card.color} />
                        )}
                    </button>
                ))}
            </div>
            {allMatched && (
                <div className="mt-6 text-sm font-bold text-warm-500 animate-bounce">
                    Well done! You found them all.
                </div>
            )}
        </div>
    );
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string, bgColor: string }> = ({ icon, label, value, color, bgColor }) => (
    <div className="bg-white border border-sage-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className={`flex items-center gap-3 mb-3`}>
            <div className={`w-10 h-10 rounded-xl ${bgColor} ${color} flex items-center justify-center`}>
                {icon}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-sage-400">{label}</span>
        </div>
        <div className="text-2xl font-bold text-sage-800">{value}</div>
    </div>
);

export default Dashboard;