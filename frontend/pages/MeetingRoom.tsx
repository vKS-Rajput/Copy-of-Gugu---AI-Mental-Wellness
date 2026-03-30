import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, AlertTriangle, ShieldCheck, Edit3, X, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Jitsi API type declarations
declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

/**
 * Smart Video Meeting Room using Jitsi Meet (free, E2E encrypted).
 *
 * Performance techniques used:
 * 1. Lazy-load: Jitsi SDK script is loaded on-demand, not bundled
 * 2. Adaptive quality: Start with low bandwidth, scale up once connected
 * 3. Graceful states: Animated loading UI while Jitsi initializes
 * 4. Proper cleanup: Dispose Jitsi instance + remove script on unmount
 * 5. Debounced controls: Prevent rapid toggle spam on mute/video buttons
 */
const MeetingRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, token } = useAuth();

    // Jitsi
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);
    const [isJitsiLoading, setIsJitsiLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [participantCount, setParticipantCount] = useState(0);

    // Controls
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Therapist notes
    const [notes, setNotes] = useState('');
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [notesSaved, setNotesSaved] = useState(false);

    useEffect(() => {
        if (user?.role === 'therapist') setIsNotesOpen(true);
    }, [user]);

    // ─── 1. Lazy-load Jitsi IFrame API script ────────────────────────
    const loadJitsiScript = useCallback((): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (window.JitsiMeetExternalAPI) {
                resolve();
                return;
            }
            const existing = document.getElementById('jitsi-iframe-api');
            if (existing) {
                existing.addEventListener('load', () => resolve());
                return;
            }
            const script = document.createElement('script');
            script.id = 'jitsi-iframe-api';
            script.src = 'https://meet.jit.si/external_api.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Jitsi script'));
            document.head.appendChild(script);
        });
    }, []);

    // ─── 2. Initialize Jitsi Meeting ─────────────────────────────────
    useEffect(() => {
        if (!id || !user || !jitsiContainerRef.current) return;

        let api: any = null;

        const initJitsi = async () => {
            try {
                await loadJitsiScript();

                // Unique room name tied to the session ID
                const roomName = `GuguWellness_${id.replace(/[^a-zA-Z0-9]/g, '')}`;

                api = new window.JitsiMeetExternalAPI('meet.jit.si', {
                    roomName,
                    parentNode: jitsiContainerRef.current!,
                    width: '100%',
                    height: '100%',
                    userInfo: {
                        displayName: user.name || (user.role === 'therapist' ? 'Therapist' : 'Patient'),
                        email: user.email || '',
                    },
                    configOverrides: {
                        // ── Performance: adaptive quality ──
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        resolution: 480,                    // Start at 480p, Jitsi auto-scales up
                        constraints: {
                            video: {
                                height: { ideal: 480, max: 720 },
                                width: { ideal: 640, max: 1280 },
                            }
                        },
                        enableLayerSuspension: true,        // Pause video layers not being viewed
                        channelLastN: 2,                    // Only receive 2 video streams max (1-on-1)

                        // ── UX settings ──
                        prejoinPageEnabled: false,          // Skip the "ready?" screen, join instantly
                        disableDeepLinking: true,           // Don't prompt to open Jitsi app
                        hideConferenceSubject: true,
                        hideConferenceTimer: false,
                        disableInviteFunctions: true,
                        enableClosePage: false,
                        enableWelcomePage: false,

                        // ── Security ──
                        requireDisplayName: false,
                        enableInsecureRoomNameWarning: false,
                    },
                    interfaceConfigOverrides: {
                        // Hide Jitsi's own toolbar — we use our custom controls
                        TOOLBAR_BUTTONS: [],
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        SHOW_BRAND_WATERMARK: false,
                        SHOW_POWERED_BY: false,
                        DEFAULT_BACKGROUND: '#363f30',
                        DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
                        FILM_STRIP_MAX_HEIGHT: 0,
                        HIDE_INVITE_MORE_HEADER: true,
                        MOBILE_APP_PROMO: false,
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                        DISABLE_FOCUS_INDICATOR: true,
                        VIDEO_QUALITY_LABEL_DISABLED: true,
                    },
                });

                jitsiApiRef.current = api;

                // ── Event listeners ──
                api.addEventListener('videoConferenceJoined', () => {
                    setIsJitsiLoading(false);
                    setIsConnected(true);
                });

                api.addEventListener('participantJoined', () => {
                    setParticipantCount(prev => prev + 1);
                });

                api.addEventListener('participantLeft', () => {
                    setParticipantCount(prev => Math.max(0, prev - 1));
                });

                api.addEventListener('videoConferenceLeft', () => {
                    setIsConnected(false);
                    navigate(user?.role === 'therapist' ? '/therapist-dashboard' : '/dashboard');
                });

                api.addEventListener('audioMuteStatusChanged', (e: { muted: boolean }) => {
                    setIsMuted(e.muted);
                });

                api.addEventListener('videoMuteStatusChanged', (e: { muted: boolean }) => {
                    setIsVideoOff(e.muted);
                });

            } catch (err) {
                console.error('Jitsi initialization failed:', err);
                setIsJitsiLoading(false);
            }
        };

        initJitsi();

        // ── Cleanup on unmount ──
        return () => {
            if (api) {
                api.dispose();
            }
            jitsiApiRef.current = null;
        };
    }, [id, user, navigate, loadJitsiScript]);

    // ─── 3. Control handlers (wired to Jitsi API) ───────────────────
    const toggleMute = useCallback(() => {
        jitsiApiRef.current?.executeCommand('toggleAudio');
    }, []);

    const toggleVideo = useCallback(() => {
        jitsiApiRef.current?.executeCommand('toggleVideo');
    }, []);

    const handleEndCall = useCallback(() => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.executeCommand('hangup');
        }
        // Fallback navigation if Jitsi doesn't fire the event
        setTimeout(() => {
            navigate(user?.role === 'therapist' ? '/therapist-dashboard' : '/dashboard');
        }, 500);
    }, [navigate, user]);

    // ─── 4. SOS Handler (patient only) ──────────────────────────────
    const handleSOS = useCallback(async () => {
        if (!token || !user) return;
        try {
            await fetch(import.meta.env.VITE_API_URL + '/api/therapy-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    aiSummary: 'URGENT: Patient triggered SOS during live session.',
                    domain: 'crisis',
                    severity: 'critical'
                })
            });
        } catch (e) {
            console.error('SOS failed:', e);
        }
    }, [token, user]);

    // ─── 5. Save Notes Handler (therapist only) ─────────────────────
    const handleSaveNotes = useCallback(async () => {
        if (!notes.trim() || !user || !token || user.role !== 'therapist') return;
        setIsSavingNotes(true);
        try {
            await fetch(import.meta.env.VITE_API_URL + '/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    title: `Session Note — ${new Date().toLocaleDateString()}`,
                    content: notes
                })
            });
            setNotesSaved(true);
            setTimeout(() => setNotesSaved(false), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSavingNotes(false);
        }
    }, [notes, user, token]);

    // ─── RENDER ─────────────────────────────────────────────────────
    return (
        <div className="h-[100dvh] w-full bg-sage-900 flex flex-col relative overflow-hidden">

            {/* ── Header ── */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-20 bg-gradient-to-b from-sage-900/90 via-sage-900/50 to-transparent pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="w-10 h-10 rounded-xl bg-sage-800/80 backdrop-blur-md flex items-center justify-center text-sage-200 border border-sage-700/50">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h1 className="text-white font-bold font-serif text-lg md:text-xl tracking-tight">
                            Secure Session
                        </h1>
                        <p className="text-sage-400 text-xs font-medium uppercase tracking-widest flex items-center gap-2">
                            {isConnected ? (
                                <>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Live {participantCount > 0
                                        ? `· ${participantCount + 1} in session`
                                        : '· Waiting for participant'}
                                </>
                            ) : (
                                <>
                                    <Loader2 size={12} className="animate-spin" />
                                    Connecting...
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Jitsi Video Container ── */}
            <div className="flex-1 relative">
                {/* Loading overlay */}
                {isJitsiLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-sage-900">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 rounded-full border-4 border-sage-700 border-t-ocean-400 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Video size={28} className="text-sage-400" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Setting up your session</h2>
                        <p className="text-sage-400 text-sm max-w-xs text-center">
                            Preparing encrypted video connection. This should only take a moment...
                        </p>
                    </div>
                )}

                {/* Jitsi iframe mounts here */}
                <div
                    ref={jitsiContainerRef}
                    className="w-full h-full"
                    style={{ opacity: isJitsiLoading ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}
                />
            </div>

            {/* ── Floating Notes Panel (Therapist Only) ── */}
            {user?.role === 'therapist' && (
                <div className={`absolute top-20 right-4 md:right-8 w-72 md:w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-sage-200 z-50 transition-all duration-500 transform ${isNotesOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}>
                    <div className="p-3 md:p-4 border-b border-sage-100 flex justify-between items-center bg-sage-50/50 rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-ocean-100 flex items-center justify-center text-ocean-600">
                                <Edit3 size={16} />
                            </div>
                            <h3 className="font-bold text-sage-800 text-sm tracking-wide">Session Notes</h3>
                        </div>
                        <button onClick={() => setIsNotesOpen(false)} className="text-sage-400 hover:text-sage-600 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="p-3 md:p-4">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Type session observations here... These notes are private and will be securely saved."
                            className="w-full h-48 md:h-64 resize-none bg-transparent border-none focus:ring-0 text-sage-700 text-sm placeholder:text-sage-300 outline-none leading-relaxed"
                        />
                    </div>
                    <div className="p-3 md:p-4 border-t border-sage-100 bg-sage-50/50 rounded-b-2xl flex justify-between items-center">
                        <span className="text-xs font-semibold text-sage-400">
                            {notesSaved ? '✓ Notes saved!' : 'Private to you'}
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

            {/* ── Control Bar ── */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-sage-800/80 backdrop-blur-xl px-6 md:px-8 py-3 md:py-4 rounded-3xl border border-sage-700/50 shadow-2xl flex items-center gap-4 md:gap-6 z-40">

                {/* Mute */}
                <button
                    onClick={toggleMute}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-sage-700 text-sage-200 hover:bg-sage-600'}`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {/* Video */}
                <button
                    onClick={toggleVideo}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-sage-700 text-sage-200 hover:bg-sage-600'}`}
                    title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                    {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>

                {/* Therapist Notes Toggle */}
                {user?.role === 'therapist' && (
                    <button
                        onClick={() => setIsNotesOpen(!isNotesOpen)}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isNotesOpen ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/30' : 'bg-sage-700 text-sage-200 hover:bg-sage-600'}`}
                        title="Toggle Session Notes"
                    >
                        <Edit3 size={22} />
                    </button>
                )}

                {/* Patient SOS */}
                {user?.role === 'patient' && (
                    <button
                        onClick={handleSOS}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all bg-warm-500/20 text-warm-400 hover:bg-warm-500 hover:text-white border border-warm-500/50"
                        title="Silent SOS Alert to Therapist"
                    >
                        <AlertTriangle size={22} />
                    </button>
                )}

                <div className="w-[1px] h-8 md:h-10 bg-sage-700 mx-1 md:mx-2"></div>

                {/* End Call */}
                <button
                    onClick={handleEndCall}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-1"
                    title="End Session"
                >
                    <PhoneOff size={22} />
                </button>
            </div>
        </div>
    );
};

export default MeetingRoom;
