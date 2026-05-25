'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const MoodThemeContext = createContext();

export const MOODS = {
  love: {
    name: 'Love & Romance',
    gradient: 'from-pink-900 via-rose-950 to-purple-950',
    primaryColor: '#f43f5e',
    textColor: 'text-rose-200',
    borderColor: 'border-rose-800/50',
    accentColor: 'bg-rose-500',
    bgCard: 'bg-rose-950/40 backdrop-blur-md',
    particleType: 'roses',
    fontClass: 'font-serif italic',
    tagline: 'Drown in the sweet ocean of love...',
  },
  sad: {
    name: 'Melancholy & Pain',
    gradient: 'from-slate-950 via-slate-900 to-zinc-950',
    primaryColor: '#64748b',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-800/50',
    accentColor: 'bg-slate-600',
    bgCard: 'bg-slate-950/50 backdrop-blur-md',
    particleType: 'rain',
    fontClass: 'font-sans font-light tracking-wide',
    tagline: 'When words represent silent tears...',
  },
  angry: {
    name: 'Anger & Attitude',
    gradient: 'from-red-950 via-stone-950 to-neutral-950',
    primaryColor: '#ef4444',
    textColor: 'text-red-400',
    borderColor: 'border-red-900/50',
    accentColor: 'bg-red-600',
    bgCard: 'bg-neutral-950/60 backdrop-blur-md',
    particleType: 'fire',
    fontClass: 'font-sans font-black uppercase tracking-wider',
    tagline: 'Let the fire inside burn brighter than the flame outside.',
  },
  happy: {
    name: 'Joy & Confetti',
    gradient: 'from-amber-950 via-amber-900 to-orange-950',
    primaryColor: '#f59e0b',
    textColor: 'text-amber-200',
    borderColor: 'border-amber-700/50',
    accentColor: 'bg-amber-500',
    bgCard: 'bg-amber-900/30 backdrop-blur-md',
    particleType: 'balloons',
    fontClass: 'font-sans font-semibold tracking-normal',
    tagline: 'Smile, sparkle, and shine!',
  },
  alone: {
    name: 'Alone & Cosmic',
    gradient: 'from-blue-950 via-indigo-950 to-black',
    primaryColor: '#3b82f6',
    textColor: 'text-blue-200',
    borderColor: 'border-blue-900/50',
    accentColor: 'bg-blue-600',
    bgCard: 'bg-black/60 backdrop-blur-md',
    particleType: 'stars',
    fontClass: 'font-mono tracking-tight',
    tagline: 'Lost in the beautiful void of stars...',
  },
  motivation: {
    name: 'Power & Grit',
    gradient: 'from-violet-950 via-indigo-950 to-stone-900',
    primaryColor: '#8b5cf6',
    textColor: 'text-violet-200',
    borderColor: 'border-violet-800/50',
    accentColor: 'bg-violet-600',
    bgCard: 'bg-violet-950/30 backdrop-blur-md',
    particleType: 'sparks',
    fontClass: 'font-sans font-bold italic tracking-tight',
    tagline: 'Rise, fight, conquer.',
  },
  friendship: {
    name: 'Friendship & Bond',
    gradient: 'from-teal-950 via-cyan-950 to-zinc-900',
    primaryColor: '#0d9488',
    textColor: 'text-teal-200',
    borderColor: 'border-teal-800/50',
    accentColor: 'bg-teal-500',
    bgCard: 'bg-teal-950/30 backdrop-blur-md',
    particleType: 'bubbles',
    fontClass: 'font-sans font-medium tracking-normal',
    tagline: 'Together through thick and thin.',
  }
};

export const MoodThemeProvider = ({ children }) => {
  const [activeMood, setActiveMood] = useState('love');
  const [isPlayingAmbient, setIsPlayingAmbient] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const gainNodeRef = useRef(null);
  const synthIntervalRef = useRef(null);

  // Stop current sound synth
  const stopSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    oscillatorsRef.current = [];
  };

  // Start sound synthesizer based on mood
  const startSynth = () => {
    stopSynth();
    if (!isPlayingAmbient || typeof window === 'undefined') return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    const playChord = (freqs, waveType = 'sine', decay = 3) => {
      const now = ctx.currentTime;
      const oscs = freqs.map(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + decay);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        return osc;
      });
      oscillatorsRef.current = [...oscillatorsRef.current, ...oscs];
      setTimeout(() => {
        oscs.forEach(osc => {
          try { osc.disconnect(); } catch(e) {}
        });
      }, decay * 1000);
    };

    // Play loop depending on mood
    if (activeMood === 'love') {
      // Warm Major 7th/9th pads (Fmaj9 -> Cmaj9)
      const playLoveProgressions = () => {
        const chords = [
          [174.61, 220.00, 261.63, 329.63, 349.23], // Fmaj9
          [261.63, 329.63, 392.00, 493.88, 523.25]  // Cmaj9
        ];
        let step = 0;
        playChord(chords[0], 'sine', 6);
        synthIntervalRef.current = setInterval(() => {
          step = (step + 1) % chords.length;
          playChord(chords[step], 'sine', 6);
        }, 5000);
      };
      playLoveProgressions();
    } else if (activeMood === 'sad') {
      // Low Minor drone (Am -> Dm)
      const playSadDrone = () => {
        const chords = [
          [110.00, 164.81, 220.00, 261.63], // Am
          [146.83, 220.00, 293.66, 349.23]  // Dm
        ];
        let step = 0;
        playChord(chords[0], 'triangle', 7);
        synthIntervalRef.current = setInterval(() => {
          step = (step + 1) % chords.length;
          playChord(chords[step], 'triangle', 7);
        }, 6000);
      };
      playSadDrone();
    } else if (activeMood === 'angry') {
      // Low saw wave tension rumble
      const playAngryGrowl = () => {
        const chords = [
          [55.00, 82.41, 110.00, 116.54], // Low dissonant interval
          [58.27, 87.31, 116.54, 123.47]
        ];
        let step = 0;
        playChord(chords[0], 'sawtooth', 4);
        synthIntervalRef.current = setInterval(() => {
          step = (step + 1) % chords.length;
          playChord(chords[step], 'sawtooth', 4);
        }, 3500);
      };
      playAngryGrowl();
    } else if (activeMood === 'happy') {
      // High bright arpeggio
      const playHappyArp = () => {
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C Major notes
        let index = 0;
        const tick = () => {
          playChord([notes[index]], 'sine', 1);
          index = (index + 1) % notes.length;
        };
        tick();
        synthIntervalRef.current = setInterval(tick, 400);
      };
      playHappyArp();
    } else if (activeMood === 'alone') {
      // Deep space ambient echo notes
      const playAloneSynth = () => {
        const notes = [196.00, 293.66, 440.00, 587.33, 880.00]; // Open space fifths
        const tick = () => {
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          playChord([randomNote], 'sine', 8);
        };
        tick();
        synthIntervalRef.current = setInterval(tick, 3000);
      };
      playAloneSynth();
    } else if (activeMood === 'motivation') {
      // Ascending heroic chords (Em -> G -> C -> D)
      const playMotivationChords = () => {
        const chords = [
          [164.81, 246.94, 329.63], // Em
          [196.00, 293.66, 392.00], // G
          [261.63, 329.63, 523.25], // C
          [293.66, 440.00, 587.33]  // D
        ];
        let step = 0;
        playChord(chords[0], 'triangle', 5);
        synthIntervalRef.current = setInterval(() => {
          step = (step + 1) % chords.length;
          playChord(chords[step], 'triangle', 5);
        }, 4000);
      };
      playMotivationChords();
    } else if (activeMood === 'friendship') {
      // Warm plucky keys (Fmaj7 -> G6)
      const playFriendshipChords = () => {
        const chords = [
          [174.61, 261.63, 329.63, 349.23], // Fmaj7
          [196.00, 293.66, 392.00, 440.00]  // G6
        ];
        let step = 0;
        playChord(chords[0], 'sine', 6);
        synthIntervalRef.current = setInterval(() => {
          step = (step + 1) % chords.length;
          playChord(chords[step], 'sine', 6);
        }, 5000);
      };
      playFriendshipChords();
    }
  };

  useEffect(() => {
    if (isPlayingAmbient) {
      startSynth();
    } else {
      stopSynth();
    }
    return () => stopSynth();
  }, [activeMood, isPlayingAmbient]);

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume * 0.15, audioContextRef.current.currentTime);
    }
  }, [volume]);

  // Handle browser audio context auto-resume
  const toggleAmbientSound = () => {
    setIsPlayingAmbient(!isPlayingAmbient);
  };

  const triggerConfetti = async () => {
    const confetti = (await import('canvas-confetti')).default;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: [MOODS[activeMood].primaryColor, '#ffffff', '#ffd700']
    });
  };

  const currentTheme = MOODS[activeMood] || MOODS.love;

  return (
    <MoodThemeContext.Provider
      value={{
        activeMood,
        setActiveMood,
        isPlayingAmbient,
        setIsPlayingAmbient,
        toggleAmbientSound,
        volume,
        setVolume,
        themeStyles: currentTheme,
        triggerConfetti,
      }}
    >
      {children}
    </MoodThemeContext.Provider>
  );
};

export const useMoodTheme = () => {
  const context = useContext(MoodThemeContext);
  if (!context) {
    throw new Error('useMoodTheme must be used within a MoodThemeProvider');
  }
  return context;
};
