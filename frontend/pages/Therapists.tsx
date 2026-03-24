import React, { useState, useEffect } from 'react';
import { Search, Star, Video, MapPin, X, CalendarDays, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Therapists: React.FC = () => {
  const { token, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [viewTherapist, setViewTherapist] = useState<any | null>(null);
  const [bookTherapist, setBookTherapist] = useState<any | null>(null);
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookStatus, setBookStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');

  const specialties = ['All', 'Anxiety', 'Depression', 'Trauma', 'Relationship', 'Stress'];

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/therapists', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setTherapists(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTherapists();
  }, [token]);

  const handleBookAppointment = async () => {
    if (!bookDate || !bookTime) return;
    setBookStatus('booking');
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          therapist_id: bookTherapist.id,
          date: bookDate,
          time: bookTime,
          type: 'Standard Consultation (Patient Requested)'
        })
      });

      if (res.ok) {
        setBookStatus('success');
        setTimeout(() => {
          setBookStatus('idle');
          setBookTherapist(null);
          setBookDate('');
          setBookTime('');
        }, 2000);
      } else {
        setBookStatus('error');
      }
    } catch (e) {
      console.error(e);
      setBookStatus('error');
    }
  };

  const filteredTherapists = therapists.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialties.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' ||
      t.specialties.toLowerCase().includes(selectedSpecialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full relative">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="font-serif text-4xl font-bold text-sage-800 mb-4 tracking-tight">Connect with Professionals</h1>
        <p className="text-sage-500 font-medium text-lg">Find the right support from our curated list of licensed therapists.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-sage-200 rounded-2xl focus:ring-2 focus:ring-sage-300 outline-none text-sage-700 shadow-sm font-medium"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {specialties.map(specialty => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-bold text-sm transition-all duration-300 border ${selectedSpecialty === specialty
                  ? 'bg-sage-600 text-white border-sage-600 shadow-md transform scale-105'
                  : 'bg-white text-sage-500 border-sage-200 hover:bg-sage-50 hover:border-sage-300'
                }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin w-8 h-8 border-4 border-sage-200 border-t-sage-600 rounded-full"></div>
        </div>
      ) : filteredTherapists.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-sage-100 shadow-sm">
          <div className="w-16 h-16 bg-sage-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sage-100">
            <Search className="text-sage-400" size={28} />
          </div>
          <h2 className="text-xl font-bold text-sage-700 mb-2">No therapists found</h2>
          <p className="text-sage-400 font-medium">Try adjusting your search terms or specialty filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTherapists.map(therapist => (
            <div key={therapist.id} className="bg-white rounded-3xl p-6 border border-sage-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-sage-100 border-2 border-white shadow-sm flex items-center justify-center text-sage-600 font-bold text-2xl flex-shrink-0">
                  {therapist.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-sage-800 tracking-tight group-hover:text-sage-600 transition-colors">{therapist.name}</h3>
                  <p className="text-xs font-bold text-ocean-500 uppercase tracking-wider mb-1 line-clamp-1">{therapist.specialties}</p>
                  <div className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                    <Star size={14} className="fill-current" />
                    <span>5.0</span>
                    <span className="text-sage-300 font-medium text-xs ml-1">(New)</span>
                  </div>
                </div>
              </div>

              <p className="text-sage-500 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                {therapist.bio}
              </p>

              <div className="flex items-center justify-between py-3 mb-6 border-y border-sage-50 bg-sage-50/30 -mx-6 px-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sage-500">
                  <Video size={14} className="text-ocean-400" /> Video Call
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-sage-500">
                  <MapPin size={14} className="text-clay-400" /> Online
                </div>
                <div className="font-bold text-sm text-sage-800">${therapist.hourly_rate}<span className="text-[10px] text-sage-400 font-medium">/session</span></div>
              </div>

              <div className="flex gap-3 mt-auto">
                <button onClick={() => setViewTherapist(therapist)} className="flex-1 py-3 border border-sage-200 text-sage-600 font-bold rounded-xl text-sm hover:bg-sage-50 hover:border-sage-300 transition-colors">
                  View Profile
                </button>
                <button onClick={() => setBookTherapist(therapist)} className="flex-1 py-3 bg-sage-500 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-sage-600 hover:shadow-md transition-all">
                  Book
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {viewTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-sage-100 flex items-center justify-center text-sage-600 font-bold text-2xl">
                    {viewTherapist.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-sage-800">{viewTherapist.name}</h2>
                    <div className="flex items-center gap-1 text-sm font-bold text-yellow-500 mt-1">
                      <Star size={14} className="fill-current" /> 5.0 Rating
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewTherapist(null)} className="text-sage-400 hover:text-sage-600 bg-sage-50 rounded-full p-2"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-sage-50/50 rounded-2xl border border-sage-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sage-600 font-bold text-sm"><ShieldCheck size={18} className="text-ocean-500" /> Verified Licensed Therapist</div>
                  <div className="font-bold text-lg text-sage-800">${viewTherapist.hourly_rate}<span className="text-xs text-sage-400">/hr</span></div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">About the Therapist</h4>
                  <p className="text-sage-600 leading-relaxed text-sm whitespace-pre-wrap">{viewTherapist.bio}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-sage-400 uppercase tracking-wider mb-2">Specialties & Approaches</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewTherapist.specialties.split(',').map((s: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white border border-sage-200 text-sage-600 rounded-lg text-xs font-bold">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-sage-100">
                <button
                  onClick={() => { setBookTherapist(viewTherapist); setViewTherapist(null); }}
                  className="w-full py-3.5 bg-sage-500 text-white font-bold rounded-xl shadow-sm hover:bg-sage-600 transition-colors"
                >
                  Book a Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOK THERAPIST MODAL */}
      {bookTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6 border-b border-sage-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-sage-800">Book Session</h2>
                <button onClick={() => setBookTherapist(null)} className="text-sage-400 hover:text-sage-600"><X size={20} /></button>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 font-bold">
                  {bookTherapist.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sage-800 text-sm">Consultation with {bookTherapist.name}</h3>
                  <p className="text-xs font-bold text-ocean-500 uppercase tracking-wider">${bookTherapist.hourly_rate} / session</p>
                </div>
              </div>

              {bookStatus === 'success' ? (
                <div className="py-12 text-center animate-in zoom-in">
                  <div className="w-16 h-16 bg-ocean-50 rounded-full flex items-center justify-center mx-auto mb-4 text-ocean-500">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-sage-800 mb-2">Request Sent!</h3>
                  <p className="text-sm text-sage-500 font-medium">Your booking request has been forwarded to the therapist.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CalendarDays size={14} /> Select Date</label>
                    <input
                      type="date"
                      value={bookDate} onChange={(e) => setBookDate(e.target.value)}
                      className="w-full border border-sage-200 rounded-xl p-3 focus:ring-1 focus:ring-sage-400 outline-none text-sage-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sage-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock size={14} /> Select Time</label>
                    <input
                      type="time"
                      value={bookTime} onChange={(e) => setBookTime(e.target.value)}
                      className="w-full border border-sage-200 rounded-xl p-3 focus:ring-1 focus:ring-sage-400 outline-none text-sage-600 font-medium"
                    />
                  </div>

                  {bookStatus === 'error' && <p className="text-red-500 text-sm font-bold text-center">Failed to send request. Please try again.</p>}

                  <div className="mt-8 pt-6 border-t border-sage-100 flex gap-3">
                    <button onClick={() => setBookTherapist(null)} className="flex-1 py-3 text-sage-500 font-bold rounded-xl hover:bg-sage-50">Cancel</button>
                    <button
                      onClick={handleBookAppointment}
                      disabled={bookStatus === 'booking'}
                      className="flex-1 py-3 bg-sage-500 text-white font-bold rounded-xl shadow-sm hover:bg-sage-600 transition-colors disabled:opacity-50"
                    >
                      {bookStatus === 'booking' ? 'Booking...' : 'Confirm Request'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Therapists;