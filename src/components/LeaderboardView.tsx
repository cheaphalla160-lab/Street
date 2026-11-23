import React, { useMemo, useState } from 'react';
import { Trophy, Trash2, Plus, Medal } from 'lucide-react';
import {
  ASSETS,
  AnimalAvatarId,
  GameMode,
  LeaderboardEntry,
} from '../types/game';
import { AnimalAvatarBadge } from './CuteSprites';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  onAddEntry: (entry: Omit<LeaderboardEntry, 'id' | 'createdAt'>) => void;
  onResetBoard: () => void;
  onGoToPlay: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  onAddEntry,
  onResetBoard,
  onGoToPlay,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | GameMode>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  // Teacher manual bonus entry state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState<AnimalAvatarId>('puppy');
  const [newScore, setNewScore] = useState('120');
  const [newWords, setNewWords] = useState('5');
  const [newMode, setNewMode] = useState<GameMode>('free');

  const filteredEntries = useMemo(() => {
    const list =
      filterMode === 'all'
        ? entries
        : entries.filter((e) => e.mode === filterMode);
    return [...list].sort((a, b) => b.score - a.score);
  }, [entries, filterMode]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const parsedScore = Math.max(0, parseInt(newScore, 10) || 0);
    const parsedWords = Math.max(0, parseInt(newWords, 10) || 0);
    onAddEntry({
      studentName: trimmed,
      avatar: newAvatar,
      score: parsedScore,
      wordsRead: parsedWords,
      mode: newMode,
      isSample: false,
    });
    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Spotlight Split */}
      <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-3xl border border-[#E7E2D8] bg-white shadow-sm lg:grid-cols-12">
        <div className="flex flex-col justify-between p-6 lg:col-span-7 lg:p-8">
          <div>
            <div className="text-xs font-semibold tracking-wide text-amber-700">
              Classroom Scoreboard · 班级荣誉榜
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              Sunny Path Leaderboard
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Celebrate every student who catches sky words and reads aloud clearly! Switch student names in the Play Arena to record each classmate&apos;s turn.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onGoToPlay}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 whitespace-nowrap"
            >
              <Trophy className="h-4 w-4" />
              Play &amp; Earn Points
            </button>

            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E7E2D8] bg-[#FBF9F5] px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Add Teacher Bonus
            </button>
          </div>
        </div>

        <div className="relative h-56 bg-[#FBF9F5] lg:col-span-5 lg:h-full">
          <img
            src={ASSETS.animalBuddies}
            alt="Puppy, bunny, and duckling cheering on the sunny path"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Optional Manual Teacher Entry Form */}
      {showAddForm && (
        <form
          onSubmit={handleManualSubmit}
          className="flex flex-wrap items-end gap-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-5"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Student Name
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Emma (3A)"
              className="mt-1 w-44 rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Animal Buddy
            </label>
            <select
              value={newAvatar}
              onChange={(e) => setNewAvatar(e.target.value as AnimalAvatarId)}
              className="mt-1 rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
            >
              <option value="puppy">Puppy</option>
              <option value="bunny">Bunny</option>
              <option value="duck">Duckling</option>
              <option value="fox">Fox</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Score
            </label>
            <input
              type="number"
              min={0}
              max={9999}
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              className="mt-1 w-24 rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Words Read
            </label>
            <input
              type="number"
              min={0}
              max={999}
              value={newWords}
              onChange={(e) => setNewWords(e.target.value)}
              className="mt-1 w-24 rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Mode
            </label>
            <select
              value={newMode}
              onChange={(e) => setNewMode(e.target.value as GameMode)}
              className="mt-1 rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
            >
              <option value="free">Free Catch &amp; Read</option>
              <option value="timed">60s Challenge</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
            >
              Save Entry
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-[#E7E2D8] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter & Clear Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-xl bg-[#F3EFE6] p-1">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Scores
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('free')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              filterMode === 'free'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Free Catch &amp; Read
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('timed')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              filterMode === 'timed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            60s Challenge
          </button>
        </div>

        <div>
          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2D8] bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-700 whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Class Board
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-rose-700">Clear all scores?</span>
              <button
                type="button"
                onClick={() => {
                  onResetBoard();
                  setConfirmClear(false);
                }}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Confirm Clear
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-lg border border-[#E7E2D8] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabular Leaderboard */}
      <div className="overflow-hidden rounded-3xl border border-[#E7E2D8] bg-white shadow-sm">
        {filteredEntries.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-display text-lg font-semibold text-slate-800">
              No scores recorded in this mode yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Play a round in the Play Arena and click &ldquo;Save Score&rdquo; to place your first student on the board.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E7E2D8] bg-[#FBF9F5] text-xs font-semibold text-slate-500">
                  <th className="py-3.5 pl-6 pr-3">Rank</th>
                  <th className="px-3 py-3.5">Student</th>
                  <th className="px-3 py-3.5">Game Mode</th>
                  <th className="px-3 py-3.5 text-right">Words Read</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6] text-sm">
                {filteredEntries.map((entry, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-[#FBF9F5]"
                    >
                      <td className="py-3.5 pl-6 pr-3 font-mono font-semibold text-slate-700 tabular-nums">
                        {rank <= 3 ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Medal
                              className={`h-4 w-4 ${
                                rank === 1
                                  ? 'text-amber-500'
                                  : rank === 2
                                    ? 'text-slate-400'
                                    : 'text-amber-700'
                              }`}
                            />
                            #{rank}
                          </span>
                        ) : (
                          `#${rank}`
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-3">
                          <AnimalAvatarBadge avatar={entry.avatar} size={32} />
                          <div>
                            <div className="font-semibold text-slate-900">
                              {entry.studentName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {entry.createdAt}
                              {entry.isSample ? ' · Demo' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">
                        {entry.mode === 'free' ? 'Free Catch & Read' : '60s Challenge'}
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono font-medium text-sky-700 tabular-nums">
                        {entry.wordsRead}
                      </td>
                      <td className="py-3.5 pl-3 pr-6 text-right font-mono text-base font-bold text-amber-700 tabular-nums">
                        {entry.score} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
