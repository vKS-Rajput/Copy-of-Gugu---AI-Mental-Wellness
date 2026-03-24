import React, { useState, useEffect } from 'react';
import {
    AlertTriangle, Clock, CheckCircle2, User, FileText,
    Phone, Video, MessageCircle, ChevronDown, ChevronUp,
    Shield, Activity, Stethoscope, RefreshCw, Users, ShieldCheck,
    Inbox, CalendarPlus, X, Brain
} from 'lucide-react';
import { PatientSummary } from '../types';
import { useAuth } from '../contexts/AuthContext';

const TherapistDashboard: React.FC = () => {
    const { token, user } = useAuth();
    const [summaries, setSummaries] = useState<PatientSummary[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
    const [referralRequests, setReferralRequests] = useState<any[]>([]);
    const [schedulingId, setSchedulingId] = useState<number | null>(null);
    const [schedDate, setSchedDate] = useState('');
    const [schedTime, setSchedTime] = useState('');

    const loadSummaries = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/summaries', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSummaries(data);
            }
        } catch (e) {
            console.error("Failed to load summaries", e);
        }
    };

    const loadReferrals = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/therapy-requests/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setReferralRequests(await res.json());
            }
        } catch (e) {
            console.error("Failed to load referrals", e);
        }
    };

    useEffect(() => {
        loadSummaries();
        loadReferrals();
        const interval = setInterval(() => { loadSummaries(); loadReferrals(); }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await fetch(`https://gugu-backend.revastra.workers.dev/api/therapy-requests/${id}/approve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSchedulingId(id);
        } catch (e) { console.error(e); }
    };

    const handleReject = async (id: number) => {
        try {
            await fetch(`https://gugu-backend.revastra.workers.dev/api/therapy-requests/${id}/reject`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ note: 'Not available at this time' })
            });
            loadReferrals();
        } catch (e) { console.error(e); }
    };

    const handleSchedule = async () => {
        if (!schedulingId || !schedDate || !schedTime) return;
        try {
            await fetch(`https://gugu-backend.revastra.workers.dev/api/therapy-requests/${schedulingId}/schedule`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ date: schedDate, time: schedTime })
            });
            setSchedulingId(null);
            setSchedDate('');
            setSchedTime('');
            loadReferrals();
        } catch (e) { console.error(e); }
    };

    const handleStatusChange = async (id: string, status: PatientSummary['status']) => {
        try {
            const res = await fetch(`https://gugu-backend.revastra.workers.dev/api/summaries/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                loadSummaries();
            }
        } catch (e) {
            console.error("Failed to change status", e);
        }
    };

    const filteredSummaries = filter === 'all' ? summaries : summaries.filter(s => s.status === filter);

    const pendingCount = summaries.filter(s => s.status === 'pending').length;
    const inProgressCount = summaries.filter(s => s.status === 'in-progress').length;
    const resolvedCount = summaries.filter(s => s.status === 'resolved').length;

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-clay-600 bg-clay-50 border-clay-200';
            case 'high': return 'text-warm-600 bg-warm-50 border-warm-200';
            case 'moderate': return 'text-ocean-600 bg-ocean-50 border-ocean-200';
            default: return 'text-sage-500 bg-sage-50 border-sage-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-warm-600 bg-warm-50 border-warm-200';
            case 'in-progress': return 'text-ocean-600 bg-ocean-50 border-ocean-200';
            case 'resolved': return 'text-sage-600 bg-sage-50 border-sage-200';
            default: return 'text-gray-500 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock size={12} />;
            case 'in-progress': return <Activity size={12} />;
            case 'resolved': return <CheckCircle2 size={12} />;
            default: return <Clock size={12} />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-8 border-b border-sage-100">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-ocean-50 border border-ocean-100 flex items-center justify-center shadow-sm">
                            <Stethoscope size={24} className="text-ocean-500" />
                        </div>
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-sage-800 mb-1">Therapist Dashboard</h1>
                            <p className="text-sage-400 text-sm font-medium">Welcome, {user?.name}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={loadSummaries}
                    className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-white border border-sage-200 rounded-xl text-sm font-bold text-sage-600 hover:bg-sage-50 hover:text-sage-800 transition-colors shadow-sm"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* New Referral Requests Section */}
            {referralRequests.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-warm-50 border border-warm-100 flex items-center justify-center">
                            <Inbox size={18} className="text-warm-500" />
                        </div>
                        <h2 className="text-xl font-bold text-sage-800">New Referral Requests</h2>
                        <span className="px-2.5 py-0.5 bg-warm-500 text-white text-xs font-bold rounded-full animate-pulse">{referralRequests.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {referralRequests.map(req => (
                            <div key={req.id} className="bg-white border border-warm-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-warm-50 border border-warm-100 flex items-center justify-center text-warm-600 font-bold text-lg">
                                            {req.patient_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sage-800">{req.patient_name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 bg-ocean-50 text-ocean-600 text-[10px] font-bold rounded-md border border-ocean-100 uppercase">{req.domain}</span>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase ${req.severity === 'critical' ? 'bg-clay-50 text-clay-600 border-clay-100' :
                                                    req.severity === 'high' ? 'bg-warm-50 text-warm-600 border-warm-100' :
                                                        'bg-sage-50 text-sage-600 border-sage-100'
                                                    }`}>{req.severity}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Brain size={18} className="text-sage-300" />
                                </div>
                                <div className="bg-sage-50/50 rounded-xl p-3 mb-4 border border-sage-100">
                                    <p className="text-sage-600 text-sm leading-relaxed line-clamp-4">{req.ai_summary}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => handleApprove(req.id)} className="flex-1 py-2.5 bg-sage-500 text-white font-bold text-sm rounded-xl hover:bg-sage-600 transition-colors shadow-sm flex items-center justify-center gap-2">
                                        <CheckCircle2 size={16} /> Accept
                                    </button>
                                    <button onClick={() => handleReject(req.id)} className="flex-1 py-2.5 bg-white border border-sage-200 text-sage-500 font-bold text-sm rounded-xl hover:bg-sage-50 transition-colors flex items-center justify-center gap-2">
                                        <X size={16} /> Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Scheduling Modal */}
            {schedulingId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md border border-sage-100 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <CalendarPlus size={24} className="text-ocean-500" />
                            <h3 className="text-xl font-bold text-sage-800">Schedule Session</h3>
                        </div>
                        <p className="text-sage-400 text-sm mb-6">Pick a date and time for the first session with this patient.</p>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Date</label>
                                <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} className="w-full border border-sage-200 rounded-xl p-3 focus:ring-1 focus:ring-sage-400 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Time</label>
                                <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)} className="w-full border border-sage-200 rounded-xl p-3 focus:ring-1 focus:ring-sage-400 outline-none" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setSchedulingId(null)} className="flex-1 py-2.5 bg-white border border-sage-200 text-sage-500 font-bold rounded-xl hover:bg-sage-50">Cancel</button>
                            <button onClick={handleSchedule} className="flex-1 py-2.5 bg-sage-500 text-white font-bold rounded-xl hover:bg-sage-600 shadow-sm">Confirm & Schedule</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard
                    icon={<Users size={20} />}
                    label="Total Cases"
                    value={summaries.length.toString()}
                    color="text-sage-600"
                    bgColor="bg-sage-50"
                    borderColor="border-sage-100"
                />
                <StatCard
                    icon={<AlertTriangle size={20} />}
                    label="Pending Review"
                    value={pendingCount.toString()}
                    color="text-clay-600"
                    bgColor="bg-clay-50"
                    borderColor="border-clay-100"
                    pulse={pendingCount > 0}
                />
                <StatCard
                    icon={<Activity size={20} />}
                    label="In Progress"
                    value={inProgressCount.toString()}
                    color="text-ocean-600"
                    bgColor="bg-ocean-50"
                    borderColor="border-ocean-100"
                />
                <StatCard
                    icon={<CheckCircle2 size={20} />}
                    label="Resolved"
                    value={resolvedCount.toString()}
                    color="text-sage-600"
                    bgColor="bg-sage-50"
                    borderColor="border-sage-100"
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {(['all', 'pending', 'in-progress', 'resolved'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border shadow-sm ${filter === f
                            ? 'bg-ocean-500 text-white border-ocean-600 shadow-md transform -translate-y-[1px]'
                            : 'bg-white text-sage-500 border-sage-200 hover:bg-sage-50 hover:text-sage-700'
                            }`}
                    >
                        {f === 'all' ? 'All Cases' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Cases List */}
            {filteredSummaries.length === 0 ? (
                <div className="text-center py-24 bg-white border border-sage-100 rounded-3xl shadow-sm">
                    <ShieldCheck size={48} className="text-sage-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-sage-700 mb-2">No cases found</h3>
                    <p className="text-sage-400 text-sm max-w-sm mx-auto">
                        {filter === 'all'
                            ? 'When the AI detects a patient in crisis, their clinical summary will appear here for your review.'
                            : `No ${filter} cases at the moment. You're all caught up!`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSummaries.map((summary) => (
                        <div
                            key={summary.id}
                            className="bg-white border border-sage-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-ocean-200 transition-all duration-300 shadow-sm"
                        >
                            {/* Summary Header */}
                            <div
                                className="p-6 cursor-pointer"
                                onClick={() => setExpandedId(expandedId === summary.id ? null : summary.id)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-5 flex-1">
                                        <div className="w-14 h-14 rounded-2xl bg-sage-100 text-sage-600 border border-sage-200 flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                                            {summary.patientName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                <h3 className="text-sage-800 font-bold text-lg">{summary.patientName}</h3>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getSeverityColor(summary.severity)}`}>
                                                    {summary.severity} Severity
                                                </span>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(summary.status)}`}>
                                                    {getStatusIcon(summary.status)}
                                                    {summary.status}
                                                </span>
                                            </div>
                                            <p className="text-sage-500 text-sm font-medium">{summary.patientEmail}</p>
                                            <p className="text-sage-400 text-xs mt-1.5 font-medium flex items-center gap-1.5">
                                                <Clock size={12} />
                                                {new Date(summary.timestamp).toLocaleString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sage-300 bg-sage-50 p-2 rounded-xl border border-sage-100 hover:text-sage-600 hover:bg-sage-100 transition-colors">
                                        {expandedId === summary.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === summary.id && (
                                <div className="border-t border-sage-100 p-6 md:p-8 space-y-8 bg-sage-50/30">
                                    {/* Clinical Summary */}
                                    <div>
                                        <h4 className="text-xs font-bold text-ocean-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <FileText size={16} />
                                            AI Clinical Summary
                                        </h4>
                                        <div className="bg-white rounded-xl p-6 border border-sage-100 shadow-sm">
                                            <p className="text-sage-700 text-sm leading-relaxed whitespace-pre-wrap">{summary.summary}</p>
                                        </div>
                                    </div>

                                    {/* Conversation Snippet */}
                                    <div>
                                        <h4 className="text-xs font-bold text-sage-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <MessageCircle size={16} />
                                            Conversation Excerpt
                                        </h4>
                                        <div className="bg-sage-900 rounded-xl p-6 border border-sage-800 shadow-inner overflow-x-auto">
                                            <pre className="text-sage-100 text-sm font-mono leading-relaxed whitespace-pre-wrap font-medium">{summary.conversationSnippet}</pre>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-3 pt-4 border-t border-sage-100">
                                        {summary.status === 'pending' && (
                                            <button
                                                onClick={() => handleStatusChange(summary.id, 'in-progress')}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-50 text-ocean-600 border border-ocean-200 rounded-xl text-sm font-bold hover:bg-ocean-100 hover:text-ocean-700 transition-all shadow-sm hover:shadow-md"
                                            >
                                                <Activity size={18} />
                                                Take Case
                                            </button>
                                        )}
                                        {summary.status !== 'resolved' && (
                                            <button
                                                onClick={() => handleStatusChange(summary.id, 'resolved')}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-sage-50 text-sage-600 border border-sage-200 rounded-xl text-sm font-bold hover:bg-sage-100 hover:text-sage-700 transition-all shadow-sm hover:shadow-md"
                                            >
                                                <CheckCircle2 size={18} />
                                                Mark Resolved
                                            </button>
                                        )}
                                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-sage-800 border border-sage-200 rounded-xl text-sm font-bold hover:bg-sage-50 transition-all shadow-sm">
                                            <Video size={18} className="text-sage-500" />
                                            Video Call
                                        </button>
                                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-sage-800 border border-sage-200 rounded-xl text-sm font-bold hover:bg-sage-50 transition-all shadow-sm">
                                            <Phone size={18} className="text-sage-500" />
                                            Phone Call
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string; bgColor: string; borderColor: string; pulse?: boolean }> = ({ icon, label, value, color, bgColor, borderColor, pulse }) => (
    <div className={`bg-white border ${borderColor} p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
        {pulse && (
            <div className="absolute top-0 left-0 w-full h-1 bg-clay-400 animate-pulse"></div>
        )}
        <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${bgColor} border ${borderColor} flex items-center justify-center`}>
                <div className={color}>{icon}</div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-sage-400">{label}</span>
        </div>
        <div className="text-3xl font-bold text-sage-800">{value}</div>
    </div>
);

export default TherapistDashboard;
