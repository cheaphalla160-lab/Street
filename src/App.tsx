import { useEffect, useState } from 'react';
import {
  AnimalAvatarId,
  AppSection,
  GameMode,
  LeaderboardEntry,
} from './types/game';
import { audioEngine } from './utils/audioEngine';
import { PlayArena } from './components/PlayArena';
import { WordCardsView } from './components/WordCardsView';
import { LeaderboardView } from './components/LeaderboardView';
import { TeacherGuideView } from './components/TeacherGuideView';

const STORAGE_KEY = 'sunny_path_english_leaderboard_v1';

const INITIAL_SAMPLE_SCORES: LeaderboardEntry[] = [
  {
    id: 'sample-1',
    studentName: 'Mia (Class 3A)',
    avatar: 'bunny',
    score: 240,
    wordsRead: 8,
    mode: 'free',
    createdAt: 'Sample',
    isSample: true,
  },
  {
    id: 'sample-2',
    studentName: 'Leo (Class 3A)',
    avatar: 'puppy',
    score: 190,
    wordsRead: 6,
    mode: 'timed',
    createdAt: 'Sample',
    isSample: true,
  },
  {
    id: 'sample-3',
    studentName: 'Chloe (Class 3B)',
    avatar: 'duck',
    score: 165,
    wordsRead: 5,
    mode: 'free',
    createdAt: 'Sample',
    isSample: true,
  },
  {
    id: 'sample-4',
    studentName: 'Noah (Class 3B)',
    avatar: 'fox',
    score: 130,
    wordsRead: 4,
    mode: 'timed',
    createdAt: 'Sample',
    isSample: true,
  },
];

export default function App() {
  const [section, setSection] = useState<AppSection>('arena');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [studentName, setStudentName] = useState('Sunny Star');
  const [studentAvatar, setStudentAvatar] = useState<AnimalAvatarId>('puppy');

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LeaderboardEntry[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_SAMPLE_SCORES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
    } catch {
      // ignore storage errors
    }
  }, [leaderboard]);

  useEffect(() => {
    return () => {
      audioEngine.stopMusic();
    };
  }, []);

  const handleToggleMusic = () => {
    if (musicPlaying) {
      audioEngine.stopMusic();
      setMusicPlaying(false);
    } else {
      audioEngine.startMusic();
      setMusicPlaying(true);
    }
  };

  const handleSaveScore = (payload: {
    score: number;
    wordsRead: number;
    mode: GameMode;
  }) => {
    const now = new Date();
    const dateLabel = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const entry: LeaderboardEntry = {
      id: `score-${Date.now()}`,
      studentName,
      avatar: studentAvatar,
      score: payload.score,
      wordsRead: payload.wordsRead,
      mode: payload.mode,
      createdAt: dateLabel,
      isSample: false,
    };

    setLeaderboard((prev) => [entry, ...prev]);
  };

  const handleAddManualEntry = (
    entry: Omit<LeaderboardEntry, 'id' | 'createdAt'>
  ) => {
    const now = new Date();
    const dateLabel = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setLeaderboard((prev) => [
      {
        ...entry,
        id: `manual-${Date.now()}`,
        createdAt: dateLabel,
      },
      ...prev,
    ]);
  };

  const handleResetBoard = () => {
    setLeaderboard([]);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-slate-900">
      {/* Three-Zone Top Bar */}
      <header className="border-b border-[#E7E2D8] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single-line Wordmark */}
          <button
            type="button"
            onClick={() => setSection('arena')}
            className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            Sunny Path English
          </button>

          {/* Zone 2: Clean Typography Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600"
          >
            <button
              type="button"
              onClick={() => setSection('arena')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                section === 'arena'
                  ? 'text-slate-900 underline decoration-amber-500 decoration-2 underline-offset-8'
                  : 'hover:text-slate-900'
              }`}
            >
              Play Arena
            </button>
            <button
              type="button"
              onClick={() => setSection('cards')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                section === 'cards'
                  ? 'text-slate-900 underline decoration-amber-500 decoration-2 underline-offset-8'
                  : 'hover:text-slate-900'
              }`}
            >
              Word Cards
            </button>
            <button
              type="button"
              onClick={() => setSection('leaderboard')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                section === 'leaderboard'
                  ? 'text-slate-900 underline decoration-amber-500 decoration-2 underline-offset-8'
                  : 'hover:text-slate-900'
              }`}
            >
              Leaderboard
            </button>
            <button
              type="button"
              onClick={() => setSection('guide')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                section === 'guide'
                  ? 'text-slate-900 underline decoration-amber-500 decoration-2 underline-offset-8'
                  : 'hover:text-slate-900'
              }`}
            >
              Lesson Guide
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleToggleMusic}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                musicPlaying
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {musicPlaying ? 'Pause Music' : 'Play Music'}
            </button>
          </div>
        </div>

        {/* Mobile Nav Row */}
        <nav
          aria-label="Mobile navigation"
          className="flex md:hidden items-center justify-around border-t border-[#EFECE6] px-4 py-2 text-xs font-semibold text-slate-600"
        >
          {(
            [
              ['arena', 'Play Arena'],
              ['cards', 'Word Cards'],
              ['leaderboard', 'Leaderboard'],
              ['guide', 'Guide'],
            ] as Array<[AppSection, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`px-2 py-1 whitespace-nowrap shrink-0 ${
                section === id ? 'text-amber-700 font-bold' : 'text-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
        {section === 'arena' && (
          <PlayArena
            studentName={studentName}
            studentAvatar={studentAvatar}
            onChangeStudent={(name, avatar) => {
              setStudentName(name);
              setStudentAvatar(avatar);
            }}
            musicPlaying={musicPlaying}
            onToggleMusic={handleToggleMusic}
            onSaveScore={handleSaveScore}
            onGoToLeaderboard={() => setSection('leaderboard')}
          />
        )}

        {section === 'cards' && (
          <WordCardsView onGoToPlay={() => setSection('arena')} />
        )}

        {section === 'leaderboard' && (
          <LeaderboardView
            entries={leaderboard}
            onAddEntry={handleAddManualEntry}
            onResetBoard={handleResetBoard}
            onGoToPlay={() => setSection('arena')}
          />
        )}

        {section === 'guide' && (
          <TeacherGuideView onGoToPlay={() => setSection('arena')} />
        )}
      </main>
    </div>
  );
}
