import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Volume2,
  Music,
  Mic,
  MicOff,
  CheckCircle2,
  RotateCcw,
  Trophy,
  Play,
  Sparkles,
  User,
  Clock,
  Snail,
} from 'lucide-react';
import {
  ASSETS,
  AnimalAvatarId,
  CatchFeedback,
  GameMode,
  PATH_LANES,
  PathLane,
  SkyKind,
  SkyToken,
  VOCAB_ITEMS,
  VocabId,
  getLaneFromX,
} from '../types/game';
import { audioEngine } from '../utils/audioEngine';
import {
  AnimalAvatarBadge,
  CuteRainyCloudSprite,
  CuteSunnySunSprite,
} from './CuteSprites';

interface PlayArenaProps {
  studentName: string;
  studentAvatar: AnimalAvatarId;
  onChangeStudent: (name: string, avatar: AnimalAvatarId) => void;
  musicPlaying: boolean;
  onToggleMusic: () => void;
  onSaveScore: (payload: {
    score: number;
    wordsRead: number;
    mode: GameMode;
  }) => void;
  onGoToLeaderboard: () => void;
}

interface SpotlightState {
  primaryVocabId: VocabId;
  landedLane?: PathLane;
  readAwarded: boolean;
  phraseToSpeak: string;
}

type DriftSpeedPreset = 'slow' | 'normal' | 'fast';

const SPEED_MULTIPLIERS: Record<DriftSpeedPreset, number> = {
  slow: 0.45,
  normal: 1,
  fast: 2.1,
};

const AVATAR_OPTIONS: Array<{ id: AnimalAvatarId; label: string }> = [
  { id: 'puppy', label: 'Puppy' },
  { id: 'bunny', label: 'Bunny' },
  { id: 'duck', label: 'Duckling' },
  { id: 'fox', label: 'Fox' },
];

function createRandomToken(forceKind?: SkyKind): SkyToken {
  const kind: SkyKind = forceKind ?? (Math.random() < 0.5 ? 'sunny_sun' : 'rainy_cloud');
  const xPct = 10 + Math.random() * 80;
  const yPct = 10 + Math.random() * 30;
  return {
    uid: `tok-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    xPct,
    yPct,
    lane: getLaneFromX(xPct),
    driftSpeed: 2.2 + Math.random() * 2.4,
    driftDir: Math.random() < 0.5 ? 1 : -1,
    bobOffset: Math.random() * 4,
    state: 'floating',
  };
}

export const PlayArena: React.FC<PlayArenaProps> = ({
  studentName,
  studentAvatar,
  onChangeStudent,
  musicPlaying,
  onToggleMusic,
  onSaveScore,
  onGoToLeaderboard,
}) => {
  const [mode, setMode] = useState<GameMode>('free');
  const [speedPreset, setSpeedPreset] = useState<DriftSpeedPreset>('normal');
  const speedMultiplierRef = useRef<number>(SPEED_MULTIPLIERS.normal);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [tokens, setTokens] = useState<SkyToken[]>(() => [
    createRandomToken('sunny_sun'),
    createRandomToken('rainy_cloud'),
    createRandomToken('sunny_sun'),
    createRandomToken('rainy_cloud'),
    createRandomToken('sunny_sun'),
    createRandomToken('rainy_cloud'),
  ]);
  const [feedbacks, setFeedbacks] = useState<CatchFeedback[]>([]);
  const [score, setScore] = useState(0);
  const [wordsRead, setWordsRead] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wordCounts, setWordCounts] = useState<Record<VocabId, number>>({
    sunny_sun: 0,
    rainy_cloud: 0,
    street: 0,
    sidewalk: 0,
    trail: 0,
  });

  // Timed challenge state
  const [timeLeft, setTimeLeft] = useState(60);
  const [timedRunning, setTimedRunning] = useState(false);
  const [timedFinished, setTimedFinished] = useState(false);

  // Active Read-Along Spotlight
  const [spotlight, setSpotlight] = useState<SpotlightState>({
    primaryVocabId: 'sunny_sun',
    landedLane: 'sidewalk',
    readAwarded: false,
    phraseToSpeak: 'Sunny sun! On the sidewalk!',
  });

  // Active lane celebration highlight
  const [cheeringLane, setCheeringLane] = useState<PathLane | null>(null);

  // Student name editor toggle
  const [editingPlayer, setEditingPlayer] = useState(false);
  const [draftName, setDraftName] = useState(studentName);
  const [draftAvatar, setDraftAvatar] = useState<AnimalAvatarId>(studentAvatar);

  // Mic speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [micMessage, setMicMessage] = useState<string | null>(null);
  const stopListenRef = useRef<(() => void) | null>(null);

  // Score saved confirmation banner
  const [savedNotice, setSavedNotice] = useState(false);

  const stageTimerRef = useRef<number | null>(null);

  useEffect(() => {
    speedMultiplierRef.current = SPEED_MULTIPLIERS[speedPreset];
  }, [speedPreset]);

  // Gentle sky drift loop
  useEffect(() => {
    let lastTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;
      const mult = speedMultiplierRef.current;

      setTokens((prev) =>
        prev.map((tok) => {
          if (tok.state !== 'floating') return tok;
          let nextX = tok.xPct + tok.driftSpeed * mult * tok.driftDir * dt;
          let nextDir = tok.driftDir;
          if (nextX > 90) {
            nextX = 90;
            nextDir = -1;
          } else if (nextX < 10) {
            nextX = 10;
            nextDir = 1;
          }
          return {
            ...tok,
            xPct: nextX,
            driftDir: nextDir,
            lane: getLaneFromX(nextX),
          };
        })
      );

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Cleanup old caught tokens so sky stays fresh
  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      setTokens((prev) => {
        const active = prev.filter(
          (t) => t.state === 'floating' || (t.caughtAt && now - t.caughtAt < 1800)
        );
        const floatingCount = active.filter((t) => t.state === 'floating').length;
        if (floatingCount < 6) {
          const needed = 6 - floatingCount;
          const additions: SkyToken[] = [];
          for (let i = 0; i < needed; i++) {
            additions.push(createRandomToken(i % 2 === 0 ? 'sunny_sun' : 'rainy_cloud'));
          }
          return [...active, ...additions];
        }
        return active;
      });
    }, 850);

    return () => window.clearInterval(interval);
  }, []);

  // Timed challenge countdown
  useEffect(() => {
    if (mode !== 'timed' || !timedRunning) return;
    if (timeLeft <= 0) {
      setTimedRunning(false);
      setTimedFinished(true);
      audioEngine.playReadSuccess();
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [mode, timedRunning, timeLeft]);

  useEffect(() => {
    return () => {
      stopListenRef.current?.();
      if (stageTimerRef.current) window.clearTimeout(stageTimerRef.current);
    };
  }, []);

  const triggerLaneCheer = useCallback((lane: PathLane) => {
    setCheeringLane(lane);
    if (stageTimerRef.current) window.clearTimeout(stageTimerRef.current);
    stageTimerRef.current = window.setTimeout(() => {
      setCheeringLane(null);
    }, 1300);
  }, []);

  const handleCatchToken = (token: SkyToken) => {
    if (token.state === 'caught') return;
    if (mode === 'timed' && timedFinished) return;
    if (mode === 'timed' && !timedRunning) {
      setTimedRunning(true);
    }

    const lane = getLaneFromX(token.xPct);
    const landedY = 66 + Math.random() * 10;

    setTokens((prev) =>
      prev.map((t) =>
        t.uid === token.uid
          ? {
              ...t,
              state: 'caught',
              yPct: landedY,
              lane,
              caughtAt: Date.now(),
            }
          : t
      )
    );

    const fbId = `fb-${Date.now()}-${Math.random()}`;
    setFeedbacks((prev) => [
      ...prev,
      { id: fbId, xPct: token.xPct, yPct: landedY - 8, kind: token.kind, lane, points: 10 },
    ]);
    window.setTimeout(() => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== fbId));
    }, 950);

    setScore((s) => s + 10);
    setStreak((st) => st + 1);
    setWordCounts((prev) => ({
      ...prev,
      [token.kind]: prev[token.kind] + 1,
    }));
    triggerLaneCheer(lane);

    if (token.kind === 'sunny_sun') {
      audioEngine.playCatchSun();
    } else {
      audioEngine.playCatchCloud();
    }

    const skyWord = VOCAB_ITEMS[token.kind].word;
    const laneWord = VOCAB_ITEMS[lane].word;
    const phrase = `${skyWord}! On the ${laneWord}!`;

    setMicMessage(null);
    setSpotlight({
      primaryVocabId: token.kind,
      landedLane: lane,
      readAwarded: false,
      phraseToSpeak: phrase,
    });

    if (autoSpeak) {
      audioEngine.speakEnglish(phrase, 0.86);
    }
  };

  const handleTapPath = (lane: PathLane) => {
    audioEngine.playPathTap();
    triggerLaneCheer(lane);
    const vocab = VOCAB_ITEMS[lane];
    setScore((s) => s + 5);
    setWordCounts((prev) => ({
      ...prev,
      [lane]: prev[lane] + 1,
    }));
    setMicMessage(null);
    setSpotlight({
      primaryVocabId: lane,
      landedLane: lane,
      readAwarded: false,
      phraseToSpeak: vocab.word,
    });

    if (autoSpeak) {
      audioEngine.speakEnglish(vocab.word, 0.82);
    }
  };

  const handleConfirmReadAloud = (bonus = 20) => {
    if (spotlight.readAwarded) {
      audioEngine.speakEnglish(VOCAB_ITEMS[spotlight.primaryVocabId].word, 0.85);
      return;
    }
    audioEngine.playReadSuccess();
    setScore((s) => s + bonus);
    setWordsRead((w) => w + 1);
    setSpotlight((prev) => ({ ...prev, readAwarded: true }));
  };

  const handleVoiceCheck = () => {
    if (isListening) {
      stopListenRef.current?.();
      setIsListening(false);
      return;
    }

    const targetWord = VOCAB_ITEMS[spotlight.primaryVocabId].word;
    setIsListening(true);
    setMicMessage(`Listening... Say "${targetWord}"!`);

    stopListenRef.current = audioEngine.listenForEnglish(
      targetWord,
      (matched, transcript) => {
        setIsListening(false);
        if (matched) {
          setMicMessage(`Great job! Heard "${transcript}" (+30 pts)`);
          handleConfirmReadAloud(30);
        } else {
          setMicMessage(`Heard "${transcript || '...'}" — Let's try "${targetWord}" again!`);
          audioEngine.speakEnglish(targetWord, 0.72);
        }
      },
      () => {
        setIsListening(false);
        setMicMessage('No mic detected — tap "I Read It Aloud" after reading together!');
      }
    );
  };

  const handleStartTimedChallenge = () => {
    setMode('timed');
    setScore(0);
    setWordsRead(0);
    setStreak(0);
    setTimeLeft(60);
    setTimedFinished(false);
    setTimedRunning(true);
    setSavedNotice(false);
    audioEngine.playPathTap();
  };

  const handleResetSession = () => {
    setScore(0);
    setWordsRead(0);
    setStreak(0);
    setTimeLeft(60);
    setTimedFinished(false);
    setTimedRunning(mode === 'timed');
    setSavedNotice(false);
    setTokens([
      createRandomToken('sunny_sun'),
      createRandomToken('rainy_cloud'),
      createRandomToken('sunny_sun'),
      createRandomToken('rainy_cloud'),
      createRandomToken('sunny_sun'),
      createRandomToken('rainy_cloud'),
    ]);
  };

  const handleSaveCurrentScore = () => {
    if (score <= 0) return;
    onSaveScore({
      score,
      wordsRead,
      mode,
    });
    audioEngine.playReadSuccess();
    setSavedNotice(true);
  };

  const currentVocab = VOCAB_ITEMS[spotlight.primaryVocabId];
  const landedLaneObj = spotlight.landedLane
    ? PATH_LANES.find((l) => l.id === spotlight.landedLane)
    : undefined;
  const micSupported = audioEngine.isSpeechRecognitionSupported();

  return (
    <div className="space-y-4">
      {/* Workspace Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E7E2D8] bg-white px-5 py-3.5 shadow-sm">
        {/* Left: Student Profile & Mode Switch */}
        <div className="flex flex-wrap items-center gap-4">
          {!editingPlayer ? (
            <button
              type="button"
              onClick={() => {
                setDraftName(studentName);
                setDraftAvatar(studentAvatar);
                setEditingPlayer(true);
              }}
              className="flex items-center gap-2.5 rounded-xl border border-[#E7E2D8] bg-[#FBF9F5] px-3 py-1.5 text-left transition-colors hover:border-amber-400 focus-visible:outline-2 focus-visible:outline-amber-600"
              title="Switch student name or avatar"
            >
              <AnimalAvatarBadge avatar={studentAvatar} size={30} />
              <div className="leading-tight">
                <div className="text-[11px] font-medium text-slate-500">Current Student</div>
                <div className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                  {studentName}
                </div>
              </div>
              <User className="h-3.5 w-3.5 text-slate-400" />
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onChangeStudent(draftName.trim() || 'Sunny Learner', draftAvatar);
                setEditingPlayer(false);
              }}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-300 bg-amber-50/70 px-3 py-1.5"
            >
              <div className="flex items-center gap-1">
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDraftAvatar(opt.id)}
                    className={`rounded-full p-0.5 transition-transform ${
                      draftAvatar === opt.id
                        ? 'ring-2 ring-amber-600 scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    aria-label={opt.label}
                  >
                    <AnimalAvatarBadge avatar={opt.id} size={26} />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                maxLength={18}
                placeholder="Student name"
                className="w-32 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-900 focus:border-amber-600 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 whitespace-nowrap"
              >
                Confirm
              </button>
            </form>
          )}

          {/* Segmented Mode Control */}
          <div className="flex items-center gap-1 rounded-xl bg-[#F3EFE6] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('free');
                setTimedRunning(false);
                setTimedFinished(false);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                mode === 'free'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Free Catch & Read
            </button>
            <button
              type="button"
              onClick={handleStartTimedChallenge}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                mode === 'timed'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              60s Score Challenge
            </button>
          </div>

          {/* Speed Selection Control */}
          <div
            className="flex items-center gap-1 rounded-xl bg-[#F3EFE6] p-1"
            role="group"
            aria-label="Sky speed selection"
          >
            <span className="px-2 text-[11px] font-semibold text-slate-500 whitespace-nowrap">
              Speed
            </span>
            {(
              [
                ['slow', 'Slow'],
                ['normal', 'Normal'],
                ['fast', 'Fast'],
              ] as Array<[DriftSpeedPreset, string]>
            ).map(([preset, label]) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSpeedPreset(preset)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  speedPreset === preset
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Center/Right: Live Tabular Metrics + Audio & Save Actions */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-4 text-sm text-slate-700">
            <div>
              <span className="text-xs text-slate-500">Score </span>
              <span className="font-mono text-base font-semibold text-amber-700 tabular-nums">
                {score}
              </span>
            </div>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <div>
              <span className="text-xs text-slate-500">Read </span>
              <span className="font-mono text-base font-semibold text-sky-700 tabular-nums">
                {wordsRead}
              </span>
            </div>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <div>
              <span className="text-xs text-slate-500">Catches </span>
              <span className="font-mono text-base font-semibold text-emerald-700 tabular-nums">
                {streak}
              </span>
            </div>
            {mode === 'timed' && (
              <>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-rose-600" />
                  <span
                    className={`font-mono text-base font-semibold tabular-nums ${
                      timeLeft <= 10 ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {timeLeft}s
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleMusic}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                musicPlaying
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-[#E7E2D8] bg-[#FBF9F5] text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Music className="h-3.5 w-3.5" />
              {musicPlaying ? 'Music On' : 'Music Off'}
            </button>

            <button
              type="button"
              onClick={() => setAutoSpeak((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                autoSpeak
                  ? 'border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100'
                  : 'border-[#E7E2D8] bg-[#FBF9F5] text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              {autoSpeak ? 'Voice Auto' : 'Voice Manual'}
            </button>

            <button
              type="button"
              onClick={handleSaveCurrentScore}
              disabled={score === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              Save Score
            </button>

            <button
              type="button"
              onClick={handleResetSession}
              aria-label="Reset round"
              title="Reset round"
              className="inline-flex items-center justify-center rounded-xl border border-[#E7E2D8] bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
          <span>
            Saved <strong>{studentName}</strong>&apos;s score of{' '}
            <strong className="font-mono tabular-nums">{score}</strong> pts to the Class Leaderboard.
          </span>
          <button
            type="button"
            onClick={onGoToLeaderboard}
            className="text-xs font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-950 whitespace-nowrap"
          >
            View Leaderboard
          </button>
        </div>
      )}

      {/* Main Interactive Storybook Stage */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E7E2D8] bg-sky-100 shadow-sm">
        <div className="relative h-[460px] w-full sm:h-[520px] lg:h-[550px] select-none">
          {/* Storybook Background Artwork */}
          <img
            src={ASSETS.landscape}
            alt="Sunny neighborhood with street, sidewalk, and woodland trail"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center"
          />

          {/* Soft sky contrast wash at top so floating tokens stay crisp */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-sky-50/75 via-sky-50/30 to-transparent"
          />

          {/* Gentle Guide Instruction Strip in Upper Sky */}
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-4">
            <div className="rounded-xl bg-white/90 px-4 py-1.5 text-center text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
              Tap any <strong className="text-amber-700">sunny sun</strong> or{' '}
              <strong className="text-sky-700">rainy cloud</strong> to catch it onto the{' '}
              <strong>street</strong>, <strong>sidewalk</strong>, or <strong>trail</strong> — then read aloud!
            </div>
          </div>

          {/* Clickable Path Lanes at Bottom Half (aligned with artwork) */}
          <div className="absolute inset-x-0 bottom-0 flex h-[54%]">
            {PATH_LANES.map((lane) => {
              const isCheering = cheeringLane === lane.id;
              const widthPct = lane.endPct - lane.startPct;
              return (
                <button
                  key={lane.id}
                  type="button"
                  onClick={() => handleTapPath(lane.id)}
                  style={{ width: `${widthPct}%` }}
                  className={`group relative flex h-full flex-col items-center justify-end pb-4 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 ${
                    isCheering
                      ? 'bg-amber-200/25'
                      : 'hover:bg-white/15'
                  }`}
                  aria-label={`Practice ${lane.label} path`}
                >
                  {/* Subtle lane divider */}
                  {lane.id !== 'street' && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 top-8 bottom-4 w-px border-l border-dashed border-white/60"
                    />
                  )}

                  {/* Animal buddy + Storybook Path Signpost */}
                  <div
                    className={`flex items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-3.5 py-2 shadow-md transition-transform duration-200 ${
                      isCheering ? 'scale-110 -translate-y-1.5' : 'group-hover:scale-105'
                    }`}
                  >
                    <AnimalAvatarBadge avatar={lane.avatar} size={32} />
                    <div className="text-left leading-tight">
                      <div className="font-display text-base font-bold text-slate-900">
                        {lane.label}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500">
                        {lane.chinese} · Tap to hear
                      </div>
                    </div>
                    <Volume2 className="h-4 w-4 text-slate-500 group-hover:text-amber-600" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Floating & Caught Sunny Sun / Rainy Cloud Sprites */}
          {tokens.map((token) => {
            const isCaught = token.state === 'caught';
            return (
              <button
                key={token.uid}
                type="button"
                onClick={() => handleCatchToken(token)}
                disabled={isCaught}
                style={{
                  left: `${token.xPct}%`,
                  top: `${token.yPct}%`,
                  transform: 'translate(-50%, -50%)',
                  transition: isCaught
                    ? 'top 380ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease 1100ms'
                    : 'none',
                }}
                aria-label={
                  token.kind === 'sunny_sun'
                    ? `Catch sunny sun over ${token.lane}`
                    : `Catch rainy cloud over ${token.lane}`
                }
                className={`absolute z-20 flex flex-col items-center justify-center rounded-full p-1 focus-visible:outline-2 focus-visible:outline-amber-600 ${
                  isCaught
                    ? 'pointer-events-none opacity-95 animate-land-pop'
                    : 'cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150'
                }`}
              >
                <div
                  className={isCaught ? '' : 'animate-float-bob'}
                  style={
                    isCaught
                      ? undefined
                      : { animationDelay: `-${token.bobOffset}s` }
                  }
                >
                  {token.kind === 'sunny_sun' ? (
                    <CuteSunnySunSprite size={92} className="drop-shadow-md" />
                  ) : (
                    <CuteRainyCloudSprite size={98} className="drop-shadow-md" />
                  )}
                </div>

                <span
                  className={`mt-0.5 rounded-lg px-2 py-0.5 text-xs font-bold shadow-sm whitespace-nowrap ${
                    token.kind === 'sunny_sun'
                      ? 'bg-amber-100/95 text-amber-950 border border-amber-300'
                      : 'bg-sky-100/95 text-sky-950 border border-sky-300'
                  }`}
                >
                  {token.kind === 'sunny_sun' ? 'sunny sun' : 'rainy cloud'}
                </span>
              </button>
            );
          })}

          {/* Catch Sparkle Popups */}
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              style={{
                left: `${fb.xPct}%`,
                top: `${fb.yPct}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="pointer-events-none absolute z-30 flex flex-col items-center animate-sparkle-burst"
            >
              <span className="font-display text-xl font-extrabold text-amber-600 drop-shadow-sm">
                +{fb.points}
              </span>
            </div>
          ))}

          {/* Timed Round Summary Overlay */}
          {mode === 'timed' && timedFinished && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-3xl border border-[#E7E2D8] bg-white p-6 text-center shadow-xl">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Trophy className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  Time&apos;s Up, {studentName}!
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  You practiced <strong className="font-mono tabular-nums">{wordsRead}</strong> words aloud and caught{' '}
                  <strong className="font-mono tabular-nums">{streak}</strong> sky friends.
                </p>

                <div className="my-5 rounded-2xl bg-[#FBF9F5] p-4 border border-[#E7E2D8]">
                  <div className="text-xs font-medium text-slate-500">Final Challenge Score</div>
                  <div className="mt-1 font-mono text-4xl font-bold text-amber-700 tabular-nums">
                    {score}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  {!savedNotice ? (
                    <button
                      type="button"
                      onClick={handleSaveCurrentScore}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
                    >
                      <Trophy className="h-4 w-4 text-amber-400" />
                      Save to Leaderboard
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onGoToLeaderboard}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 whitespace-nowrap"
                    >
                      View Leaderboard
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStartTimedChallenge}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E7E2D8] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                  >
                    <Play className="h-4 w-4" />
                    Play Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Read-Along Spotlight Dock (Listen & Repeat Together) */}
      <div className="rounded-3xl border border-[#E7E2D8] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Caught Word Card */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E7E2D8] bg-[#FBF9F5]">
              {currentVocab.imageUrl ? (
                <img
                  src={currentVocab.imageUrl}
                  alt={currentVocab.word}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <AnimalAvatarBadge avatar={currentVocab.animalAvatar} size={56} />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {currentVocab.word}
                </h2>
                {landedLaneObj && currentVocab.category === 'sky' && (
                  <span className="text-sm font-medium text-slate-600">
                    on the{' '}
                    <button
                      type="button"
                      onClick={() => handleTapPath(landedLaneObj.id)}
                      className="font-display font-bold text-emerald-700 underline decoration-emerald-300 decoration-2 underline-offset-4 hover:text-emerald-900"
                    >
                      {landedLaneObj.label}
                    </button>
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="font-mono text-xs text-slate-600">{currentVocab.phonetic}</span>
                <span aria-hidden="true">·</span>
                <span>{currentVocab.chinese}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-700">{currentVocab.chantSentence}</span>
              </div>

              {micMessage && (
                <p className="mt-1.5 text-xs font-medium text-sky-700">{micMessage}</p>
              )}
            </div>
          </div>

          {/* Right: Classroom Repeat-After-Me Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => audioEngine.speakEnglish(spotlight.phraseToSpeak, 0.88)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E7E2D8] bg-[#FBF9F5] px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-amber-50 hover:border-amber-300 whitespace-nowrap"
            >
              <Volume2 className="h-4 w-4 text-amber-600" />
              Listen
            </button>

            <button
              type="button"
              onClick={() => audioEngine.speakEnglish(currentVocab.word, 0.62)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E7E2D8] bg-[#FBF9F5] px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-sky-50 hover:border-sky-300 whitespace-nowrap"
            >
              <Snail className="h-4 w-4 text-sky-600" />
              Slow Read
            </button>

            {micSupported && (
              <button
                type="button"
                onClick={handleVoiceCheck}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                  isListening
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : 'border-[#E7E2D8] bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 text-rose-600" />
                    Stop Mic
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 text-emerald-700" />
                    Speak Check
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleConfirmReadAloud(20)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                spotlight.readAwarded
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {spotlight.readAwarded ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Read Aloud Complete
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  I Read It! (+20 pts)
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5 Target Words Progress Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E7E2D8] pt-3.5">
          <span className="text-xs font-medium text-slate-500">
            Quick Tap Any Target Word to Hear &amp; Practice:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(VOCAB_ITEMS) as VocabId[]).map((id) => {
              const item = VOCAB_ITEMS[id];
              const count = wordCounts[id];
              const isActive = spotlight.primaryVocabId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    audioEngine.speakEnglish(item.word, 0.84);
                    setMicMessage(null);
                    setSpotlight({
                      primaryVocabId: id,
                      landedLane: item.category === 'path' ? (id as PathLane) : undefined,
                      readAwarded: false,
                      phraseToSpeak: item.word,
                    });
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-amber-500 bg-amber-50 text-amber-950'
                      : 'border-[#E7E2D8] bg-[#FBF9F5] text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.word}</span>
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                    ×{count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
