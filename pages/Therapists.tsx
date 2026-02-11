import React from 'react';
import { Star, Video, Calendar, MapPin } from 'lucide-react';
import { Therapist } from '../types';

const MOCK_THERAPISTS: Therapist[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    specialization: 'Anxiety & Depression',
    rating: 4.9,
    reviews: 124,
    image: 'https://picsum.photos/200/200?random=1',
    bio: 'Licensed Clinical Psychologist with 10 years of experience in CBT and Mindfulness-based therapies.',
    price: '$120/session',
    available: true
  },
  {
    id: '2',
    name: 'James Wilson',
    specialization: 'Trauma & PTSD',
    rating: 4.8,
    reviews: 89,
    image: 'https://picsum.photos/200/200?random=2',
    bio: 'Specializing in trauma-informed care and EMDR therapy to help patients process difficult experiences.',
    price: '$110/session',
    available: true
  },
  {
    id: '3',
    name: 'Dr. Emily Carter',
    specialization: 'Relationship Therapy',
    rating: 5.0,
    reviews: 210,
    image: 'https://picsum.photos/200/200?random=3',
    bio: 'Helping couples and individuals navigate relationship challenges through emotionally focused therapy.',
    price: '$150/session',
    available: false
  },
   {
    id: '4',
    name: 'Michael Brown',
    specialization: 'Stress Management',
    rating: 4.7,
    reviews: 56,
    image: 'https://picsum.photos/200/200?random=4',
    bio: 'Focused on helping professionals manage high-stress environments and prevent burnout.',
    price: '$100/session',
    available: true
  }
];

const Therapists: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Connect with Professionals</h2>
        <p className="text-gray-400">Find the right support from our curated list of licensed therapists.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_THERAPISTS.map((therapist) => (
          <div key={therapist.id} className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden hover:border-brand-accent/50 transition-all duration-300 group">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <img src={therapist.image} alt={therapist.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-brand-accent transition-colors">{therapist.name}</h3>
                  <p className="text-brand-accent text-sm font-medium">{therapist.specialization}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-400">{therapist.rating} ({therapist.reviews} reviews)</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                {therapist.bio}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
                 <div className="flex items-center gap-1">
                   <Video size={14} />
                   <span>Video Call</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <MapPin size={14} />
                   <span>Online</span>
                 </div>
                 <div className="font-semibold text-gray-300">{therapist.price}</div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-white/5 text-white py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                  View Profile
                </button>
                <button className="flex-1 bg-brand-accent text-black py-2 rounded-lg text-sm font-medium hover:bg-teal-300 transition-colors flex items-center justify-center gap-2">
                  <Calendar size={14} />
                  Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Therapists;