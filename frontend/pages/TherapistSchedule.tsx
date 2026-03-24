import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Video, Plus, X, AlignLeft, Check, Search, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TherapistSchedule: React.FC = () => {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [patientName, setPatientName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [type, setType] = useState('Standard Consultation');

    const fetchAppointments = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAppointments(await res.json());
            }
        } catch (e) { console.error('Error fetching appointments', e); }
    };

    useEffect(() => {
        fetchAppointments();
    }, [token]);

    const handleCreate = async () => {
        if (!patientName || !date || !time) return;
        try {
            const endpoint = editId ? `https://gugu-backend.revastra.workers.dev/api/appointments/${editId}` : import.meta.env.VITE_API_URL + '/api/appointments';
            const method = editId ? 'PATCH' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ patient_name: patientName, date, time, type })
            });

            if (res.ok) {
                resetForm();
                fetchAppointments();
            }
        } catch (e) { console.error('Error saving appointment', e); }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            await fetch(`https://gugu-backend.revastra.workers.dev/api/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAppointments();
        } catch (e) { console.error('Error deleting appointment', e); }
    };

    const handleEditClick = (app: any) => {
        setEditId(app.id);
        setPatientName(app.patient_name);
        setDate(app.date);
        setTime(app.time);
        setType(app.type);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditId(null);
        setPatientName('');
        setDate('');
        setTime('');
        setType('Standard Consultation');
    };

    return (
        <div className="p-8 max-w-6xl mx-auto w-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-sage-800 mb-2">My Schedule</h1>
                    <p className="text-sage-400 font-medium">View your upcoming sessions and manage your availability.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-sage-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-sage-600 transition-colors">
                        <Plus size={18} />
                        Add Time Block
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white rounded-3xl border border-warm-200 shadow-sm p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-sage-800">{editId ? 'Edit Session' : 'Schedule New Session'}</h3>
                        <button onClick={resetForm} className="text-sage-400 hover:text-sage-600"><X size={20} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Patient Name</label>
                            <input value={patientName} onChange={e => setPatientName(e.target.value)} type="text" className="w-full border border-sage-200 rounded-xl p-3 focus:ring-1 focus:ring-sage-400 outline-none" placeholder="e.g. John Doe" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Session Type</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-sage-200 rounded-xl p-3 focus:ring-1 focus:ring-sage-400 outline-none text-sage-600">
                                <option>Standard Consultation</option>
                                <option>Intake Evaluation</option>
                                <option>Crisis Follow-up</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Date</label>
                            <input value={date} onChange={e => setDate(e.target.value)} type="date" className="w-full border border-sage-200 rounded-xl p-3 focus:ring-1 focus:ring-sage-400 outline-none text-sage-600" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Time</label>
                            <input value={time} onChange={e => setTime(e.target.value)} type="time" className="w-full border border-sage-200 rounded-xl p-3 focus:ring-1 focus:ring-sage-400 outline-none text-sage-600" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={resetForm} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-sage-500 hover:bg-sage-50">Cancel</button>
                        <button onClick={handleCreate} className="px-6 py-2.5 bg-sage-500 text-white rounded-xl text-sm font-bold hover:bg-sage-600 shadow-sm">{editId ? 'Update Appointment' : 'Save Appointment'}</button>
                    </div>
                </div>
            )}

            {appointments.length === 0 ? (
                <div className="bg-white rounded-3xl border border-sage-100 shadow-sm overflow-hidden">
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-warm-50 rounded-2xl flex items-center justify-center mb-4 border border-warm-100 shadow-inner">
                            <CalendarIcon size={28} className="text-warm-400" />
                        </div>
                        <h3 className="text-xl font-bold text-sage-700 mb-2">Your Calendar is Clear</h3>
                        <p className="text-sage-400 max-w-sm mb-6">You have no upcoming sessions scheduled. Enjoy the peace or open up more availability slots.</p>
                        {!isAdding && (
                            <button onClick={() => setIsAdding(true)} className="px-6 py-2.5 bg-warm-50 text-warm-600 font-semibold rounded-xl border border-warm-200 hover:bg-warm-100 transition-colors">
                                Book Session
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-sage-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-sage-50/50 border-b border-sage-100 text-xs font-bold text-sage-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Patient</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Session Type</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sage-100">
                                {appointments.map(app => (
                                    <tr key={app.id} className="hover:bg-sage-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 font-bold text-sm">
                                                    {app.patient_name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-sage-800">{app.patient_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sage-600 font-medium text-sm">
                                                <CalendarDays size={14} className="text-sage-400" /> {new Date(app.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sage-600 font-medium text-sm">
                                                <Clock size={14} className="text-sage-400" /> {app.time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-md bg-warm-50 text-warm-600 font-semibold text-xs border border-warm-100">
                                                {app.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex gap-3 justify-end items-center h-full">
                                            <Link
                                                to={`/session/${app.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage-500 text-white font-bold text-xs rounded-lg hover:bg-sage-600 transition-colors shadow-sm uppercase tracking-wider"
                                            >
                                                <Video size={14} /> Join
                                            </Link>
                                            <button onClick={() => handleEditClick(app)} className="h-8 px-3 flex items-center bg-ocean-50 text-ocean-600 border border-ocean-100 font-bold text-xs rounded-lg hover:bg-ocean-100 transition-colors uppercase tracking-wider">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(app.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-clay-500 hover:bg-clay-50 border border-transparent hover:border-clay-100 transition-colors">
                                                <X size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapistSchedule;
