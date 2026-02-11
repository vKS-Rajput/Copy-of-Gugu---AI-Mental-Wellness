import React, { useState } from 'react';

const MoodSlider = ({ onMoodSelect }) => {
  const [value, setValue] = useState(3);

  // Updated to use real emojis instead of icons
  const moods = [
    { value: 1, label: 'Down', emoji: '😔', glow: 'shadow-indigo-500/50' },
    { value: 2, label: 'Content', emoji: '😐', glow: 'shadow-blue-400/50' },
    { value: 3, label: 'Peaceful', emoji: '😌', glow: 'shadow-teal-400/50' },
    { value: 4, label: 'Happy', emoji: '🙂', glow: 'shadow-yellow-400/50' },
    { value: 5, label: 'Excited', emoji: '🤩', glow: 'shadow-orange-400/50' },
  ];

  const handleChange = (e) => {
    const newVal = parseInt(e.target.value);
    setValue(newVal);
    onMoodSelect(newVal);
  };

  const getGradient = () => {
      // Golden/Yellow gradient
      return "linear-gradient(to right, #fef08a 0%, #fde047 50%, #fbbf24 100%)";
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Icons display */}
      <div className="flex justify-between mb-8 relative">
        {moods.map((mood) => {
          const isActive = mood.value === value;
          return (
            <div 
              key={mood.value} 
              className={`flex flex-col items-center transition-all duration-500 ${isActive ? 'scale-125 -translate-y-2' : 'opacity-40 scale-100'}`}
              style={{ width: '60px' }}
            >
              <div 
                className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-500 ${isActive ? `bg-white/10 ${mood.glow} drop-shadow-xl backdrop-blur-md border border-white/10` : ''}`}
              >
                  <span className="text-3xl filter drop-shadow-lg" role="img" aria-label={mood.label}>
                    {mood.emoji}
                  </span>
              </div>
              <span className={`mt-3 text-xs font-medium tracking-wide transition-colors duration-300 ${isActive ? 'text-yellow-100' : 'text-transparent'}`}>
                {mood.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Custom Range Slider */}
      <div className="relative h-2 w-full mt-6">
        {/* Track Background */}
        <div className="absolute top-0 left-0 w-full h-full rounded-full bg-white/10 backdrop-blur-sm"></div>
        
        {/* Active Track (Gradient) */}
        <div 
            className="absolute top-0 left-0 h-full rounded-full opacity-90 transition-all duration-150 ease-out"
            style={{ 
                width: `${((value - 1) / 4) * 100}%`,
                background: getGradient(),
                boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)' 
            }}
        ></div>

        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={handleChange}
          className="absolute top-[-10px] left-0 w-full h-8 opacity-0 cursor-pointer z-20"
        />

        {/* Thumb */}
        <div 
          className="absolute top-1/2 -mt-4 h-8 w-8 rounded-full border-[3px] border-[#050505] bg-yellow-400 shadow-[0_0_20px_rgba(253,224,71,0.6)] transition-all duration-150 pointer-events-none flex items-center justify-center z-10"
          style={{ left: `calc(${((value - 1) / 4) * 100}% - 16px)` }}
        >
          <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
        </div>
      </div>
      
      <p className="text-center mt-12 text-gray-500 text-sm font-medium tracking-wide opacity-60">
        Slide to express how you're feeling today
      </p>
    </div>
  );
};

export default MoodSlider;