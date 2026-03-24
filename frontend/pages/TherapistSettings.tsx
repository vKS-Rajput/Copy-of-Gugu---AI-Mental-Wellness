import React, { useState, useEffect } from 'react';
import { Settings, User, CreditCard, Bell, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TherapistSettings: React.FC = () => {
    const { user, token } = useAuth();

    const [hourlyRate, setHourlyRate] = useState('150');
    const [bio, setBio] = useState('');
    const [specialties, setSpecialties] = useState('');
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifySms, setNotifySms] = useState(false);
    const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_API_URL + '/api/therapist/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setHourlyRate(data.hourly_rate?.toString() || '150');
                    setBio(data.bio || '');
                    setSpecialties(data.specialties || '');
                    setNotifyEmail(Boolean(data.notify_email));
                    setNotifySms(Boolean(data.notify_sms));
                }
            } catch (e) {
                console.error('Failed to fetch profile', e);
            }
        };
        fetchProfile();
    }, [token]);

    const handleSave = async () => {
        setSavedStatus('saving');
        try {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/therapist/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    hourly_rate: parseInt(hourlyRate) || 150,
                    bio,
                    specialties,
                    notify_email: notifyEmail,
                    notify_sms: notifySms
                })
            });

            if (res.ok) {
                setSavedStatus('saved');
                setTimeout(() => setSavedStatus('idle'), 3000);
            } else {
                setSavedStatus('error');
            }
        } catch (e) {
            console.error('Save error', e);
            setSavedStatus('error');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-sage-800 mb-2">Profile & Settings</h1>
                    <p className="text-sage-400 font-medium">Manage your professional presence and preferences.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={savedStatus === 'saving'}
                    className="flex items-center gap-2 bg-sage-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-sage-600 transition-colors disabled:opacity-50"
                >
                    {savedStatus === 'saving' ? <span className="animate-pulse">Saving...</span> : <><Save size={18} /> Save Changes</>}
                </button>
            </div>

            {savedStatus === 'saved' && (
                <div className="mb-6 p-4 bg-sage-50 border border-sage-200 text-sage-600 rounded-xl flex items-center gap-3 animate-in fade-in">
                    <AlertCircle size={20} className="text-sage-500" />
                    <span className="font-bold">Settings saved securely to your profile!</span>
                </div>
            )}

            <div className="space-y-6">
                {/* Personal Info Module */}
                <div className="bg-white rounded-3xl border border-sage-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-sage-50 text-sage-500 rounded-xl flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-sage-800">Account Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Full Name</label>
                            <input type="text" value={user?.name || ''} disabled className="w-full bg-sage-50 border border-sage-100 rounded-xl p-3 text-sage-600 cursor-not-allowed font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Email Address</label>
                            <input type="email" value={user?.email || ''} disabled className="w-full bg-sage-50 border border-sage-100 rounded-xl p-3 text-sage-600 cursor-not-allowed font-medium" />
                        </div>
                    </div>
                </div>

                {/* Professional Setup Module */}
                <div className="bg-white rounded-3xl border border-sage-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-ocean-50 text-ocean-500 rounded-xl flex items-center justify-center">
                            <CreditCard size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-sage-800">Professional Setup</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Hourly Consultation Rate ($)</label>
                            <div className="relative w-48">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400 font-bold">$</span>
                                <input
                                    type="number"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(e.target.value)}
                                    className="w-full border border-sage-200 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-ocean-200 outline-none font-bold text-sage-700"
                                />
                            </div>
                            <p className="text-xs text-sage-400 mt-2">This is the base rate shown to patients when they view your profile.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Specialties & Tags</label>
                            <input
                                type="text"
                                value={specialties}
                                onChange={(e) => setSpecialties(e.target.value)}
                                placeholder="e.g. CBT, Trauma, Anxiety, Couples Therapy"
                                className="w-full border border-sage-200 rounded-xl p-3 focus:ring-2 focus:ring-ocean-200 outline-none text-sage-700"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Professional Biography</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Introduce yourself to potential patients. Share your approach to therapy..."
                                className="w-full h-32 border border-sage-200 rounded-xl p-4 focus:ring-2 focus:ring-ocean-200 outline-none text-sage-700 resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Notifications Module */}
                <div className="bg-white rounded-3xl border border-sage-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-warm-50 text-warm-500 rounded-xl flex items-center justify-center">
                            <Bell size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-sage-800">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 border border-sage-100 rounded-xl cursor-pointer hover:bg-sage-50 transition-colors">
                            <div>
                                <span className="block font-bold text-sage-800">Email Notifications</span>
                                <span className="block text-sm text-sage-400">Receive an email when an appointment is booked.</span>
                            </div>
                            <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="w-5 h-5 text-sage-500 rounded focus:ring-sage-500 border-sage-300" />
                        </label>

                        <label className="flex items-center justify-between p-4 border border-sage-100 rounded-xl cursor-pointer hover:bg-sage-50 transition-colors">
                            <div>
                                <span className="block font-bold text-sage-800">SMS Notifications</span>
                                <span className="block text-sm text-sage-400">Receive text messages for crisis escalations.</span>
                            </div>
                            <input type="checkbox" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} className="w-5 h-5 text-sage-500 rounded focus:ring-sage-500 border-sage-300" />
                        </label>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TherapistSettings;
