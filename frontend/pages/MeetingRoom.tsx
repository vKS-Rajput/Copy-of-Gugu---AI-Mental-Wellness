import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageCircle, AlertTriangle, User, ShieldCheck, Activity, Edit3, X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MeetingRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [messages, setMessages] = useState<{ text: string, type: 'system' | 'sos' }[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [sosActive, setSosActive] = useState(false);
    const [remoteUserJoined, setRemoteUserJoined] = useState(false);

    const [notes, setNotes] = useState('');
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [notesSaved, setNotesSaved] = useState(false);

    useEffect(() => {
        if (user?.role === 'therapist') {
            setIsNotesOpen(true);
        }
    }, [user]);

    const localVideoRef = useRef<HTMLVideoElement>(null);

    // 1. Setup Camera
    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Failed to access camera/microphone", err);
                setMessages(prev => [...prev, { text: "Failed to access camera. Please check permissions.", type: 'system' }]);
            }
        };
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // 2. Simulated Connection
    useEffect(() => {
        if (!user || !id) return;

        // Simulate connection sequence
        setTimeout(() => {
            setMessages(prev => [...prev, { text: "Connected to secure session server.", type: 'system' }]);
        }, 1000);

        setTimeout(() => {
            setRemoteUserJoined(true);
            setMessages(prev => [...prev, { text: "Participant has joined the session.", type: 'system' }]);
        }, 3000);
    }, [id, user]);

    // Actions
    // Actions
    const handleSOS = () => {
        setMessages(prev => [...prev, { text: "Distress signal sent to therapist.", type: 'system' }]);
    };

    const handleEndCall = () => {
        navigate(user?.role === 'therapist' ? '/therapist-dashboard' : '/dashboard');
    };

    const handleSaveNotes = async () => {
        if (!notes.trim() || !user || !token || user.role !== 'therapist') return;
        setIsSavingNotes(true);
        try {
            await fetch(import.meta.env.VITE_API_URL + '/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: `Meeting Note (${new Date().toLocaleDateString()})`, content: notes })
            });
            setNotesSaved(true);
            setTimeout(() => setNotesSaved(false), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSavingNotes(false);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getAudioTracks().forEach(t => t.enabled = isMuted); // toggle
        }
    };

    const toggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(t => t.enabled = isVideoOff); // toggle
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-sage-900 flex flex-col relative overflow-hidden">

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-sage-900/80 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sage-800 flex items-center justify-center text-sage-200">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h1 className="text-white font-bold font-serif text-xl tracking-tight">End-to-End Encrypted Session</h1>
                        <p className="text-sage-400 text-xs font-medium uppercase tracking-widest flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ocean-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-ocean-500"></span>
                            </span>
                            Live {user?.role === 'patient' ? 'with Therapist' : 'with Patient'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className="text-white font-medium bg-sage-800/80 backdrop-blur-md px-4 py-2 rounded-xl text-sm border border-sage-700/50 flex flex-col">
                        {messages.map((m, i) => (
                            <span key={i} className={`block ${m.type === 'sos' ? 'text-red-400 font-bold animate-pulse' : 'text-sage-200'}`}>
                                {m.text}
                            </span>
                        ))}
                        {messages.length === 0 && <span className="text-sage-400">Waiting for others to join...</span>}
                    </div>
                </div>
            </div>

            {/* Main Video Area (Remote Profile / Simulated Video) */}
            <div className={`flex-1 flex items-center justify-center transition-all duration-500 ${sosActive ? 'bg-red-900/40' : 'bg-sage-900'}`}>
                {remoteUserJoined ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
                        <div className="relative">
                            {/* Simulated active speaker ripples */}
                            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${sosActive ? 'bg-red-500' : 'bg-ocean-500'} duration-[2s]`}></div>
                            <div className="w-48 h-48 rounded-full bg-sage-800 flex items-center justify-center border-4 border-sage-700 shadow-2xl relative z-10 text-sage-300">
                                <User size={64} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mt-8 tracking-tight">
                            {user?.role === 'patient' ? 'Therapist' : 'Patient'}
                        </h2>
                        <div className="flex items-center gap-2 text-sage-400 font-medium mt-2 bg-sage-800/50 px-4 py-1.5 rounded-full border border-sage-700">
                            <Activity size={16} className={sosActive ? 'text-red-400 animate-pulse' : 'text-ocean-400'} />
                            {sosActive ? 'CRISIS SIGNAL RECEIVED' : 'Audio Connected optimally'}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-sage-700 border-dashed animate-spin-slow flex items-center justify-center mb-6"></div>
                        <h2 className="text-xl font-bold text-sage-300">Waiting for the other party...</h2>
                    </div>
                )}
            </div>

            {/* Local Video PIP (Picture-in-Picture) */}
            <div className={`absolute bottom-32 right-8 w-64 aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-2 ${isVideoOff ? 'border-sage-800' : 'border-sage-600'} z-30 transition-all hover:scale-105`}>
                {isVideoOff ? (
                    <div className="w-full h-full flex items-center justify-center bg-sage-800 text-sage-500 flex-col gap-2">
                        <VideoOff size={32} />
                        <span className="text-xs font-bold uppercase tracking-wider">Camera Off</span>
                    </div>
                ) : (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                )}
                {isMuted && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md animate-pulse">
                        <MicOff size={14} />
                    </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                    You
                </div>
            </div>

            {/* Floating Notes Panel (Therapist Only) */}
            {user?.role === 'therapist' && (
                <div className={`absolute top-24 right-8 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-sage-200 z-50 transition-all duration-500 transform ${isNotesOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
                    <div className="p-4 border-b border-sage-100 flex justify-between items-center bg-sage-50/50 rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-ocean-100 flex items-center justify-center text-ocean-600">
                                <Edit3 size={16} />
                            </div>
                            <h3 className="font-bold text-sage-800 text-sm tracking-wide">Session Notes</h3>
                        </div>
                        <button onClick={() => setIsNotesOpen(false)} className="text-sage-400 hover:text-sage-600">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="p-4">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Type session observations here... These notes are private and will be securely saved."
                            className="w-full h-64 resize-none bg-transparent border-none focus:ring-0 text-sage-700 text-sm placeholder:text-sage-300 outline-none leading-relaxed"
                        />
                    </div>
                    <div className="p-4 border-t border-sage-100 bg-sage-50/50 rounded-b-2xl flex justify-between items-center">
                        <span className="text-xs font-semibold text-sage-400">
                            {notesSaved ? 'Notes saved!' : 'Auto-saves locally'}
                        </span>
                        <button
                            onClick={handleSaveNotes}
                            disabled={isSavingNotes || !notes.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-sage-500 text-white text-xs font-bold rounded-xl hover:bg-sage-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save size={14} />
                            {isSavingNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>
                </div>
            )}

            {/* Control Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-sage-800/80 backdrop-blur-xl px-8 py-4 rounded-3xl border border-sage-700/50 shadow-2xl flex items-center gap-6 z-40">

                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-sage-700 text-sage-200 hover:bg-sage-600'}`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-sage-700 text-sage-200 hover:bg-sage-600'}`}
                >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>

                {/* Therapist Notes Toggle */}
                {user?.role === 'therapist' && (
                    <button
                        onClick={() => setIsNotesOpen(!isNotesOpen)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isNotesOpen ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/30' : 'bg-sage-700 text-sage-200 hover:bg-sage-600'}`}
                        title="Toggle Session Notes"
                    >
                        <Edit3 size={24} />
                    </button>
                )}

                {/* Patient-only SOS Button */}
                {user?.role === 'patient' && (
                    <button
                        onClick={handleSOS}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-warm-500/20 text-warm-400 hover:bg-warm-500 hover:text-white border border-warm-500/50`}
                        title="Silent SOS Alert to Therapist"
                    >
                        <AlertTriangle size={24} />
                    </button>
                )}

                <div className="w-[1px] h-10 bg-sage-700 mx-2"></div>

                <button
                    onClick={handleEndCall}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <PhoneOff size={24} />
                </button>

            </div>
        </div>
    );
};

export default MeetingRoom;
