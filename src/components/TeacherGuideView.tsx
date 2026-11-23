import React from 'react';
import { Volume2, Play } from 'lucide-react';
import { VOCAB_ITEMS, VocabId } from '../types/game';
import { audioEngine } from '../utils/audioEngine';

export const TeacherGuideView: React.FC<{ onGoToPlay: () => void }> = ({ onGoToPlay }) => {
  const steps = [
    {
      num: '01. Warm-Up with Word Cards (5 mins)',
      desc: 'Open Word Cards on the classroom smartboard. Click "Play All 5 Words" so students hear sunny sun, rainy cloud, street, sidewalk, and trail in rhythm before catching them.',
    },
    {
      num: '02. Free Catch & Read Aloud (10 mins)',
      desc: 'Invite students up in turns (or on tablets). Have them tap a floating sunny sun or rainy cloud to drop it onto the street, sidewalk, or trail, repeat after the voice using Slow Read, and press "I Read It! (+20 pts)".',
    },
    {
      num: '03. 60s Challenge & Leaderboard (5 mins)',
      desc: 'Switch to 60s Score Challenge! Update the student name in the toolbar before each turn, save their score, and celebrate the top readers on the Sunny Path Leaderboard.',
    },
  ];

  const tips: Array<{ id: VocabId; note: string }> = [
    {
      id: 'sunny_sun',
      note: 'Emphasize the short /ʌ/ vowel in both "sunny" and "sun" — smile wide and open the mouth gently.',
    },
    {
      id: 'rainy_cloud',
      note: 'Practice the /kl/ blend in "cloud" and ending /d/. Kids can wiggle fingers downward like raindrops!',
    },
    {
      id: 'street',
      note: 'Notice the three-consonant cluster /str/. Break it down slowly: "s-t-reet" using the Slow Read button.',
    },
    {
      id: 'sidewalk',
      note: 'Teach as a fun compound word: "side" + "walk" — the safe path beside the street where Puppy walks.',
    },
    {
      id: 'trail',
      note: 'Watch the /tr/ onset and long /eɪ/ vowel so "trail" sounds distinct from "tree".',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#E7E2D8] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Teacher Lesson Plan &amp; Pronunciation Guide
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ready-to-teach 20-minute interactive classroom flow for primary school English learners.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToPlay}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 whitespace-nowrap shrink-0"
        >
          <Play className="h-4 w-4" />
          Launch Play Arena
        </button>
      </div>

      {/* 3-Step Classroom Flow */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.num}
            className="rounded-3xl border border-[#E7E2D8] bg-white p-6 shadow-sm"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">
              {step.num}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Phonics & Classroom TPR Tips */}
      <div className="rounded-3xl border border-[#E7E2D8] bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Pronunciation &amp; Gesture Tips
        </h2>
        <div className="mt-4 divide-y divide-[#EFECE6]">
          {tips.map(({ id, note }) => {
            const vocab = VOCAB_ITEMS[id];
            return (
              <div
                key={id}
                className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-display text-lg font-bold text-slate-900">
                      {vocab.word}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {vocab.phonetic}
                    </span>
                    <span className="text-xs text-slate-500">
                      · {vocab.chinese}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{note}</p>
                </div>

                <button
                  type="button"
                  onClick={() => audioEngine.speakEnglish(vocab.word, 0.72)}
                  className="inline-flex items-center gap-2 self-start rounded-xl border border-[#E7E2D8] bg-[#FBF9F5] px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-amber-50 whitespace-nowrap shrink-0 sm:self-center"
                >
                  <Volume2 className="h-3.5 w-3.5 text-amber-600" />
                  Hear Slow
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
