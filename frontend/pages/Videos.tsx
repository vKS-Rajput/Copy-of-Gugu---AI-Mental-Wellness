import React, { useState } from 'react';
import { Play, BookOpen, Star, Book as BookIcon, Video as VideoIcon } from 'lucide-react';
import { VideoResource, BookResource } from '../types';

const MOCK_VIDEOS: VideoResource[] = [
  { id: '1', title: '5-Minute Morning Meditation', category: 'Meditation', duration: '5:00', thumbnail: 'https://picsum.photos/400/225?random=10', author: 'Gugu Wellness' },
  { id: '2', title: 'Understanding Anxiety Triggers', category: 'Anxiety', duration: '12:30', thumbnail: 'https://picsum.photos/400/225?random=11', author: 'Dr. Smith' },
  { id: '3', title: 'Deep Sleep Music', category: 'Sleep', duration: '60:00', thumbnail: 'https://picsum.photos/400/225?random=12', author: 'Sleep Sound' },
  { id: '4', title: 'Building Resilience', category: 'Motivation', duration: '15:45', thumbnail: 'https://picsum.photos/400/225?random=13', author: 'Ted Talk' },
  { id: '5', title: 'Breathing Exercises for Stress', category: 'Anxiety', duration: '8:20', thumbnail: 'https://picsum.photos/400/225?random=14', author: 'Calm Mind' },
  { id: '6', title: 'Guided Imagery for Peace', category: 'Meditation', duration: '20:00', thumbnail: 'https://picsum.photos/400/225?random=15', author: 'Visual Heal' },
];

const MOCK_BOOKS: BookResource[] = [
  {
    id: '1',
    title: 'The Body Keeps the Score',
    author: 'Bessel van der Kolk',
    category: 'Trauma',
    rating: 4.9,
    cover: 'https://picsum.photos/200/300?random=20',
    description: 'Brain, Mind, and Body in the Healing of Trauma.'
  },
  {
    id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self-Help',
    rating: 4.8,
    cover: 'https://picsum.photos/200/300?random=21',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.'
  },
  {
    id: '3',
    title: 'Maybe You Should Talk to Someone',
    author: 'Lori Gottlieb',
    category: 'Psychology',
    rating: 4.7,
    cover: 'https://picsum.photos/200/300?random=22',
    description: 'A Therapist, Her Therapist, and Our Lives Revealed.'
  },
  {
    id: '4',
    title: 'Breath: The New Science of a Lost Art',
    author: 'James Nestor',
    category: 'Health',
    rating: 4.6,
    cover: 'https://picsum.photos/200/300?random=23',
    description: 'No matter what you eat, how much you exercise, if you are not breathing correctly, nothing matters.'
  }
];

const CATEGORIES = ['All', 'Meditation', 'Anxiety', 'Sleep', 'Motivation'];

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Videos: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'videos' | 'books'>('videos');
  const [activeCategory, setActiveCategory] = useState('All');

  React.useEffect(() => {
    if (user) {
      if (user.role === 'therapist') navigate('/therapist-dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const filteredVideos = activeCategory === 'All'
    ? MOCK_VIDEOS
    : MOCK_VIDEOS.filter(v => v.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-sage-800 mb-2">Wellness Library</h2>
          <p className="text-sage-400">Curated resources to support your journey.</p>
        </div>

        <div className="flex bg-white border border-sage-100 p-1 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'videos' ? 'bg-sage-500 text-white shadow-sm' : 'text-sage-400 hover:text-sage-600'}`}
          >
            <VideoIcon size={18} />
            Videos
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'books' ? 'bg-sage-500 text-white shadow-sm' : 'text-sage-400 hover:text-sage-600'}`}
          >
            <BookIcon size={18} />
            Books
          </button>
        </div>
      </div>

      {activeTab === 'videos' && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide mb-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${activeCategory === cat
                  ? 'bg-sage-100 text-sage-700 border-sage-200'
                  : 'bg-white text-sage-400 border-sage-100 hover:border-sage-300 hover:text-sage-600 shadow-sm'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.id} className="group cursor-pointer">
                <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video shadow-sm border border-sage-100">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-sage-900/20 group-hover:bg-sage-900/10 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-white/20">
                      <Play size={24} className="text-white fill-white ml-1" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[11px] font-mono font-medium text-white shadow-sm">
                    {video.duration}
                  </span>
                </div>
                <h3 className="font-semibold text-sage-800 text-lg group-hover:text-sage-600 transition-colors line-clamp-1 mb-1">{video.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-sage-400">{video.author}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sage-600 bg-sage-100 border border-sage-200 px-2 py-1 rounded-md">{video.category}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'books' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {MOCK_BOOKS.map((book) => (
            <div key={book.id} className="bg-white border border-sage-100 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md hover:border-sage-300 transition-all duration-300 group shadow-sm">
              <div className="w-full sm:w-32 h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border border-sage-100">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold text-sage-500 mb-2 uppercase tracking-wider bg-sage-50 px-2 py-1 rounded-md w-fit border border-sage-100">{book.category}</span>
                <h3 className="text-xl font-bold text-sage-800 mb-1 group-hover:text-sage-600 transition-colors">{book.title}</h3>
                <p className="text-sm font-medium text-sage-400 mb-3">by {book.author}</p>
                <div className="flex items-center gap-1.5 mb-4">
                  <Star size={16} className="text-warm-400 fill-warm-400" />
                  <span className="text-sm text-sage-600 font-bold">{book.rating}</span>
                </div>
                <p className="text-sm text-sage-500 mb-6 line-clamp-2 leading-relaxed">{book.description}</p>
                <button className="flex items-center justify-center gap-2 text-sm font-bold text-sage-700 bg-sage-50 border border-sage-200 px-5 py-2.5 rounded-xl hover:bg-sage-100 hover:text-sage-800 transition-colors w-fit shadow-sm">
                  <BookOpen size={16} />
                  Read Summary
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Videos;