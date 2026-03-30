import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, AlertTriangle, ShieldCheck, Edit3, X, Save, Loader2, WifiOff, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Peer, { MediaConnection } from 'peerjs';

/**
 * P2P Video Meeting Room using PeerJS (native WebRTC).
 *
 * How it works — like WhatsApp / FaceTime:
 * - Media flows DIRECTLY between browsers (no server relay)
 * - PeerJS cloud handles only the tiny signaling handshake
 * - Instant startup: camera + peer connection in < 2 seconds
 * - Zero load on our backend or database
 *
 * Connection strategy:
 * - Both peers derive their Peer ID from the shared session ID + role
 * - The "guest" (second joiner) calls the "host" (first joiner)
 * - If the host isn't online yet, the guest retries every 3 seconds
 */
const MeetingRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, token } = useAuth();

    // ── Stream refs ──
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerRef = useRef<Peer | null>(null);
    const callRef = useRef<MediaConnection | null>(null);
    const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── State ──
    const [status, setStatus] = useState<'requesting-media' | 'waiting' | 'connecting' | 'connected' | 'error'>('requesting-media');
    const [errorMsg, setErrorMsg] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [participantName, setParticipantName] = useState('');

    // Therapist notes
    const [notes, setNotes] = useState('');
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [notesSaved, setNotesSaved] = useState(false);

    useEffect(() => {
        if (user?.role === 'therapist') setIsNotesOpen(true);
    }, [user]);

    // ─── Deterministic Peer IDs from session + role ────────────────────
    const sanitizedId = (id || 'default').replace(/[^a-zA-Z0-9]/g, '');
    const myRole = user?.role === 'therapist' ? 'therapist' : 'patient';
    const peerRole = myRole === 'therapist' ? 'patient' : 'therapist';
    const myPeerId = `gugu-${sanitizedId}-${myRole}`;
    const remotePeerId = `gugu-${sanitizedId}-${peerRole}`;

    // ─── 1. Initialize camera + peer connection ────────────────────────
    useEffect(() => {
        if (!id || !user) return;

        let destroyed = false;

        const init = async () => {
            // ── Step 1: Get local camera/mic ──
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 640, max: 1280 }, height: { ideal: 480, max: 720 }, facingMode: 'user' },
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                });
                if (destroyed) { stream.getTracks().forEach(t => t.stop()); return; }
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err: any) {
                if (destroyed) return;
                console.error('Camera access failed:', err);
                setStatus('error');
                setErrorMsg(
                    err.name === 'NotAllowedError'
                        ? 'Camera/microphone permission was denied. Please allow access and refresh.'
                        : err.name === 'NotFoundError'
                            ? 'No camera or microphone found on this device.'
                            : 'Failed to access camera/microphone. Please check your device settings.'
                );
                return;
            }

            // ── Step 2: Create PeerJS instance ──
            setStatus('waiting');
            const peer = new Peer(myPeerId, {
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        { urls: 'stun:stun3.l.google.com:19302' },
                    ],
                },
            });
            if (destroyed) { peer.destroy(); return; }
            peerRef.current = peer;

            // Handle incoming call (I'm the "host", the other peer is calling me)
            peer.on('call', (incomingCall) => {
                if (destroyed) return;
                setStatus('connecting');
                incomingCall.answer(localStreamRef.current!);
                callRef.current = incomingCall;

                incomingCall.on('stream', (remoteStream) => {
                    if (destroyed) return;
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                    }
                    setStatus('connected');
                    setParticipantName(peerRole === 'therapist' ? 'Therapist' : 'Patient');
                });

                incomingCall.on('close', () => {
                    if (!destroyed) setStatus('waiting');
                });

                incomingCall.on('error', (err) => {
                    console.error('Call error:', err);
                });
            });

            peer.on('open', () => {
                if (destroyed) return;
                // Try calling the other peer (maybe they're already waiting)
                tryCallRemote(peer);
            });

            peer.on('error', (err: any) => {
                if (destroyed) return;
                // "peer-unavailable" means the other side hasn't joined yet — retry
                if (err.type === 'peer-unavailable') {
                    scheduleRetry(peer);
                } else if (err.type === 'unavailable-id') {
                    // Our peer ID is taken — the user may have a stale tab open
                    setStatus('error');
                    setErrorMsg('Another tab/window is already in this session. Please close it and refresh.');
                } else {
                    console.error('PeerJS error:', err);
                }
            });

            peer.on('disconnected', () => {
                if (!destroyed && peer && !peer.destroyed) {
                    peer.reconnect();
                }
            });
        };

        const tryCallRemote = (peer: Peer) => {
            if (!peer || peer.destroyed || !localStreamRef.current) return;
            setStatus('connecting');
            const outgoing = peer.call(remotePeerId, localStreamRef.current);
            if (!outgoing) { scheduleRetry(peer); return; }

            callRef.current = outgoing;

            outgoing.on('stream', (remoteStream) => {
                if (destroyed) return;
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
                setStatus('connected');
                setParticipantName(peerRole === 'therapist' ? 'Therapist' : 'Patient');
            });

            outgoing.on('close', () => {
                if (!destroyed) setStatus('waiting');
            });

            outgoing.on('error', () => {
                scheduleRetry(peer);
            });

            // If no stream arrives within 5s, the remote probably isn't there yet
            setTimeout(() => {
                if (!destroyed && status !== 'connected' && remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
                    scheduleRetry(peer);
                }
            }, 5000);
        };

        const scheduleRetry = (peer: Peer) => {
            if (destroyed || !peer || peer.destroyed) return;
            setStatus('waiting');
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            retryTimerRef.current = setTimeout(() => {
                if (!destroyed && peer && !peer.destroyed) {
                    tryCallRemote(peer);
                }
            }, 3000);
        };

        init();

        // ── Cleanup ──
        return () => {
            destroyed = true;
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            if (callRef.current) callRef.current.close();
            if (peerRef.current && !peerRef.current.destroyed) peerRef.current.destroy();
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
        };
    }, [id, user]);

    // ─── 2. Control handlers ───────────────────────────────────────────
    const toggleMute = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
        setIsMuted(prev => !prev);
    }, []);

    const toggleVideo = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
        setIsVideoOff(prev => !prev);
    }, []);

    const handleEndCall = useCallback(() => {
        if (callRef.current) callRef.current.close();
        if (peerRef.current && !peerRef.current.destroyed) peerRef.current.destroy();
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
        navigate(user?.role === 'therapist' ? '/therapist-dashboard' : '/dashboard');
    }, [navigate, user]);

    // ─── 3. SOS Handler (patient only) ─────────────────────────────────
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

    // ─── 4. Save Notes Handler (therapist only) ────────────────────────
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

    // ─── Status text helper ────────────────────────────────────────────
    const statusInfo = () => {
        switch (status) {
            case 'requesting-media': return { text: 'Accessing camera...', icon: <Camera size={12} className="animate-pulse" /> };
            case 'waiting': return { text: 'Waiting for participant...', icon: <Loader2 size={12} className="animate-spin" /> };
            case 'connecting': return { text: 'Connecting...', icon: <Loader2 size={12} className="animate-spin" /> };
            case 'connected': return {
                text: `Live · ${participantName} connected`,
                icon: <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
            };
            case 'error': return { text: 'Connection Error', icon: <WifiOff size={12} /> };
        }
    };

    const si = statusInfo();

    // ─── RENDER ─────────────────────────────────────────────────────────
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
                            {si.icon}
                            {si.text}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Video Container ── */}
            <div className="flex-1 relative">
                {/* Error overlay */}
                {status === 'error' && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-sage-900">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                            <WifiOff size={32} className="text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Unable to Connect</h2>
                        <p className="text-sage-400 text-sm max-w-sm text-center mb-6">{errorMsg}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-ocean-500 text-white rounded-2xl font-bold text-sm hover:bg-ocean-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading overlay (before camera) */}
                {status === 'requesting-media' && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-sage-900">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 rounded-full border-4 border-sage-700 border-t-ocean-400 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Camera size={28} className="text-sage-400" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Starting your session</h2>
                        <p className="text-sage-400 text-sm max-w-xs text-center">
                            Requesting camera & microphone access...
                        </p>
                    </div>
                )}

                {/* Remote video (full screen) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ opacity: status === 'connected' ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
                />

                {/* Waiting overlay (camera active, waiting for peer) */}
                {(status === 'waiting' || status === 'connecting') && (
                    <div className="absolute inset-0 z-5 flex flex-col items-center justify-center bg-sage-900/80 backdrop-blur-sm">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-full border-4 border-sage-700 border-t-ocean-400 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Video size={24} className="text-sage-400" />
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-white mb-1">
                            {status === 'connecting' ? 'Connecting...' : 'Waiting for participant'}
                        </h2>
                        <p className="text-sage-400 text-xs max-w-xs text-center">
                            Share this session link with your {myRole === 'therapist' ? 'patient' : 'therapist'} to join.
                            <br />The call will connect automatically.
                        </p>
                    </div>
                )}

                {/* Local video (picture-in-picture) */}
                <div className="absolute bottom-24 right-4 md:bottom-28 md:right-8 w-36 h-28 md:w-48 md:h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-sage-700/50 bg-sage-800 z-30">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover mirror"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                    {isVideoOff && (
                        <div className="absolute inset-0 bg-sage-800 flex items-center justify-center">
                            <VideoOff size={24} className="text-sage-500" />
                        </div>
                    )}
                </div>
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
