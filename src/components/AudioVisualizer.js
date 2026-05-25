'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useMoodTheme } from './MoodThemeContext';

export const AudioVisualizer = ({ isPlaying }) => {
  const { themeStyles } = useMoodTheme();
  const [barHeights, setBarHeights] = useState([30, 20, 45, 60, 25, 50, 35, 40, 55, 30, 20, 40]);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) {
      // Reset heights slowly to flat
      setBarHeights([4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
      return;
    }

    const updateHeights = () => {
      setBarHeights(prev =>
        prev.map(() => Math.floor(Math.random() * 55) + 12)
      );
      animationRef.current = setTimeout(updateHeights, 100);
    };

    updateHeights();

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-[200px] px-4 py-2 bg-black/35 rounded-full border border-white/5 backdrop-blur-sm">
      {barHeights.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all duration-100 ease-in-out"
          style={{
            height: `${height}%`,
            backgroundColor: themeStyles.primaryColor,
            boxShadow: `0 0 10px ${themeStyles.primaryColor}`,
          }}
        />
      ))}
    </div>
  );
};
export default AudioVisualizer;
