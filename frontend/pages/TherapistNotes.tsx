import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, X, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TherapistNotes: React.FC = () => {
    const { token } = useAuth();
    const [notes, setNotes] = useState<any[]>([]);
    const [isComposing, setIsComposing] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const fetchNotes = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/notes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotes(await res.json());
            }
        } catch (e) { console.error('Error fetching notes', e); }
    };

    useEffect(() => {
        fetchNotes();
    }, [token]);

    const handleSaveNote = async () => {
        if (!title || !content) return;
        try {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, content })
            });
            if (res.ok) {
                setIsComposing(false);
                setTitle('');
                setContent('');
                fetchNotes();
            }
        } catch (e) { console.error('Error saving note', e); }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`https://gugu-backend.revastra.workers.dev/api/notes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchNotes();
            }
        } catch (e) { console.error('Error deleting note', e); }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto w-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-sage-800 mb-2">Session Notes</h1>
                    <p className="text-sage-400 font-medium">Private repository for your clinical notes and observations.</p>
                </div>
                {!isComposing && (
                    <button onClick={() => setIsComposing(true)} className="flex items-center gap-2 bg-ocean-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-ocean-600 transition-colors">
                        <Plus size={18} />
                        New Note
                    </button>
                )}
            </div>

            {isComposing && (
                <div className="bg-white rounded-3xl border border-ocean-200 shadow-sm p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-sage-800">Draft New Note</h3>
                        <button onClick={() => setIsComposing(false)} className="text-sage-400 hover:text-sage-600"><X size={20} /></button>
                    </div>
                    <input
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note Title (e.g., Session #4 with John Doe)"
                        className="w-full text-lg font-semibold text-sage-800 border-b border-sage-100 pb-2 mb-4 focus:outline-none focus:border-ocean-300 bg-transparent placeholder-sage-300"
                    />
                    <textarea
                        value={content} onChange={(e) => setContent(e.target.value)}
                        placeholder="Clinical observations, key takeaways, and action items..."
                        className="w-full h-32 text-sage-600 border border-sage-100 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-ocean-100 bg-sage-50/50 resize-none placeholder-sage-300"
                    ></textarea>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsComposing(false)} className="px-5 py-2 rounded-xl text-sm font-semibold text-sage-500 hover:bg-sage-50">Cancel</button>
                        <button onClick={handleSaveNote} className="px-6 py-2 bg-ocean-500 text-white rounded-xl text-sm font-bold hover:bg-ocean-600 shadow-sm">Save to Vault</button>
                    </div>
                </div>
            )}

            {notes.length === 0 ? (
                <div className="bg-white rounded-3xl border border-sage-100 shadow-sm overflow-hidden">
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-ocean-50 rounded-2xl flex items-center justify-center mb-4 border border-ocean-100 shadow-inner">
                            <ClipboardList size={28} className="text-ocean-400" />
                        </div>
                        <h3 className="text-xl font-bold text-sage-700 mb-2">No Notes Found</h3>
                        <p className="text-sage-400 max-w-sm mb-6">Create your first private clinical note to track progress and observations across your patients.</p>
                        {!isComposing && (
                            <button onClick={() => setIsComposing(true)} className="px-6 py-2.5 bg-ocean-50 text-ocean-600 font-semibold rounded-xl border border-ocean-200 hover:bg-ocean-100 transition-colors">
                                Start Writing
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {notes.map(note => (
                        <div key={note.id} className="bg-white rounded-2xl border border-sage-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow relative group">
                            <button onClick={() => handleDelete(note.id)} className="absolute top-4 right-4 text-sage-300 hover:text-clay-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={16} />
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-ocean-50 flex items-center justify-center border border-ocean-100 text-ocean-500"><List size={14} /></div>
                                <div>
                                    <h4 className="font-bold text-sage-800 pr-6">{note.title}</h4>
                                    <p className="text-[10px] uppercase font-bold text-sage-400 tracking-wider text-ocean-400">{new Date(note.timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <p className="text-sage-600 text-sm flex-1 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TherapistNotes;
