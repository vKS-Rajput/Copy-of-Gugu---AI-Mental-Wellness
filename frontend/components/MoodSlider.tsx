import React, { useState } from 'react';

const MoodSlider = ({ onMoodSelect }) => {
  const [value, setValue] = useState(3);

  const moods = [
    { value: 1, label: 'Down', emoji: '😔', color: 'bg-ocean-200', ring: 'ring-ocean-300' },
    { value: 2, label: 'Okay', emoji: '😐', color: 'bg-sage-200', ring: 'ring-sage-300' },
    { value: 3, label: 'Peaceful', emoji: '😌', color: 'bg-sage-300', ring: 'ring-sage-400' },
    { value: 4, label: 'Happy', emoji: '🙂', color: 'bg-warm-300', ring: 'ring-warm-400' },
    { value: 5, label: 'Wonderful', emoji: '🤩', color: 'bg-clay-200', ring: 'ring-clay-300' },
  ];

  const handleChange = (e) => {
    const newVal = parseInt(e.target.value);
    setValue(newVal);
    onMoodSelect(newVal);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6">
      {/* Mood Emojis */}
      <div className="flex justify-between mb-10 relative">
        {moods.map((mood) => {
          const isActive = mood.value === value;
          return (
            <button
              key={mood.value}
              onClick={() => { setValue(mood.value); onMoodSelect(mood.value); }}
              className={`flex flex-col items-center transition-all duration-400 ${isActive ? 'scale-110 -translate-y-1' : 'opacity-40 scale-95'}`}
              style={{ width: '68px' }}
            >
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-400 ${isActive ? `${mood.color} ring-2 ${mood.ring} shadow-md` : 'bg-transparent'
                  }`}
              >
                <span className="text-3xl" role="img" aria-label={mood.label}>
                  {mood.emoji}
                </span>
              </div>
              <span className={`mt-2 text-xs font-semibold tracking-wide transition-all duration-300 ${isActive ? 'text-sage-600' : 'text-sage-300'
                }`}>
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slider */}
      <div className="relative h-2 w-full">
        <div className="absolute top-0 left-0 w-full h-full rounded-full bg-sage-100"></div>
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-ocean-300 via-sage-400 to-warm-400 transition-all duration-200"
          style={{ width: `${((value - 1) / 4) * 100}%` }}
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
        <div
          className="absolute top-1/2 -mt-3.5 h-7 w-7 rounded-full bg-white border-2 border-sage-400 shadow-md transition-all duration-200 pointer-events-none flex items-center justify-center z-10"
          style={{ left: `calc(${((value - 1) / 4) * 100}% - 14px)` }}
        >
          <div className="w-2 h-2 bg-sage-400 rounded-full"></div>
        </div>
      </div>

      <p className="text-center mt-8 text-sage-400 text-sm font-medium">
        How are you feeling today?
      </p>
    </div>
  );
};

export default MoodSlider;