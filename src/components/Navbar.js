'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMoodTheme, MOODS } from './MoodThemeContext';
import { useAuth } from './AuthContext';
import { 
  Heart, Sparkles, Music, Volume2, VolumeX, Menu, X, 
  User, LogOut, LogIn, Compass, BookOpen, MessageSquare, 
  PlusCircle, ShieldAlert 
} from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const { 
    activeMood, 
    setActiveMood, 
    isPlayingAmbient, 
    toggleAmbientSound, 
    volume, 
    setVolume, 
    themeStyles 
  } = useMoodTheme();
  const { user, logout } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Feed', href: '/', icon: Compass },
    { name: 'Reels Mode', href: '/reels', icon: Sparkles },
    { name: 'Blogs', href: '/blogs', icon: BookOpen },
    { name: 'Write Shayari', href: '/create', icon: PlusCircle },
    { name: 'Chat Room', href: '/chat', icon: MessageSquare },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ name: 'Admin Panel', href: '/admin', icon: ShieldAlert });
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-6 w-6 animate-pulse" style={{ color: themeStyles.primaryColor }} />
              <span className="text-xl font-bold tracking-wider text-white">
                SAYARI<span style={{ color: themeStyles.primaryColor }}>.SOCIAL</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-white ${
                    isActive 
                      ? 'text-white bg-white/10' 
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" style={isActive ? { color: themeStyles.primaryColor } : {}} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Toolbar: Mood Switcher, Ambient Audio, User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Mood Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoodDropdown(!showMoodDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border bg-black/40 text-gray-200 transition-all hover:bg-white/5"
                style={{ borderColor: themeStyles.primaryColor }}
              >
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: themeStyles.primaryColor }} />
                <span>{MOODS[activeMood]?.name || 'Mood'}</span>
              </button>
              
              {showMoodDropdown && (
                <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-white/15 bg-zinc-950 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <p className="px-3 py-1 text-[10px] uppercase font-bold text-gray-500 tracking-wider">Select Page Mood</p>
                    {Object.entries(MOODS).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveMood(key);
                          setShowMoodDropdown(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-white/10 ${
                          activeMood === key ? 'text-white font-bold bg-white/5' : 'text-gray-300'
                        }`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: config.primaryColor }} />
                        {config.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ambient Sound Controls */}
            <div className="relative flex items-center gap-2">
              <button
                onClick={toggleAmbientSound}
                onMouseEnter={() => setShowVolumeSlider(true)}
                className="p-2 rounded-full bg-white/5 text-gray-300 hover:text-white transition-colors border border-white/10"
                title="Toggle Ambient Atmosphere Music"
              >
                {isPlayingAmbient ? (
                  <Volume2 className="h-4 w-4 animate-bounce" style={{ color: themeStyles.primaryColor }} />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </button>
              
              {showVolumeSlider && (
                <div 
                  onMouseLeave={() => setShowVolumeSlider(false)}
                  className="absolute right-0 bottom-[-45px] z-10 flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-full border border-white/15 shadow-xl"
                >
                  <Music className="h-3 w-3 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              )}
            </div>

            {/* User Profile Auth Section */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                >
                  {user.profileImage ? (
                    <div className="h-7 w-7 rounded-full border overflow-hidden" style={{ borderColor: themeStyles.primaryColor }}>
                      <img src={user.profileImage} alt={user.username} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border" style={{ borderColor: themeStyles.primaryColor }}>
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span className="max-w-[80px] truncate">{user.name || user.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-full bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Login
                </Link>
              </div>
            )}

          </div>

          {/* Hamburger Icon for Mobile */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:bg-white/10 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-xl">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Icon className="h-5 w-5" style={{ color: themeStyles.primaryColor }} />
                  {link.name}
                </Link>
              );
            })}
            
            {/* Mobile Mood Switcher */}
            <div className="border-t border-white/10 mt-3 pt-3 px-3">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Select Active Mood</p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(MOODS).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveMood(key);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-left ${
                      activeMood === key ? 'bg-white/10 text-white font-bold' : 'text-gray-400'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.primaryColor }} />
                    {config.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Sound Control */}
            <div className="border-t border-white/10 mt-3 pt-3 px-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">Ambient Music Synth</span>
              <button
                onClick={toggleAmbientSound}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-gray-300 border border-white/10"
              >
                {isPlayingAmbient ? (
                  <>
                    <Volume2 className="h-4 w-4" style={{ color: themeStyles.primaryColor }} />
                    <span className="text-xs" style={{ color: themeStyles.primaryColor }}>On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4" />
                    <span className="text-xs text-gray-500">Off</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Profile & Logout */}
            <div className="border-t border-white/10 mt-3 pt-3 px-3 pb-2">
              {user ? (
                <div className="flex items-center justify-between">
                  <Link
                    href={`/profile/${user.username}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.username} className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <span>{user.name || user.username}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-950/40 text-red-400 border border-red-900/50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-center text-sm font-semibold text-white border border-white/10 hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In / Register
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
