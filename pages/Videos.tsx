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

const Videos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'videos' | 'books'>('videos');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredVideos = activeCategory === 'All' 
    ? MOCK_VIDEOS 
    : MOCK_VIDEOS.filter(v => v.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Wellness Library</h2>
          <p className="text-gray-400">Curated resources to support your journey.</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'videos' ? 'bg-brand-accent text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                <VideoIcon size={18} />
                Videos
            </button>
            <button 
                onClick={() => setActiveTab('books')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'books' ? 'bg-brand-accent text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
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
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat 
                    ? 'bg-brand-accent text-black' 
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                >
                {cat}
                </button>
            ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
                <div key={video.id} className="group cursor-pointer">
                <div className="relative rounded-xl overflow-hidden mb-3 aspect-video">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play size={20} className="text-white fill-white ml-1" />
                    </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-[10px] font-mono text-white">
                    {video.duration}
                    </span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-brand-accent transition-colors line-clamp-1">{video.title}</h3>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{video.author}</span>
                    <span className="text-xs text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded">{video.category}</span>
                </div>
                </div>
            ))}
            </div>
        </>
      )}

      {activeTab === 'books' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {MOCK_BOOKS.map((book) => (
                  <div key={book.id} className="bg-[#121212] border border-white/5 rounded-2xl p-6 flex gap-6 hover:border-brand-accent/30 transition-all group">
                      <div className="w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl">
                          <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex flex-col justify-center">
                          <span className="text-xs font-semibold text-brand-accent mb-2 uppercase tracking-wider">{book.category}</span>
                          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-accent transition-colors">{book.title}</h3>
                          <p className="text-sm text-gray-400 mb-3">by {book.author}</p>
                          <div className="flex items-center gap-1 mb-4">
                                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-sm text-gray-300 font-medium">{book.rating}</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{book.description}</p>
                          <button className="flex items-center gap-2 text-sm font-semibold text-white bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors w-fit">
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