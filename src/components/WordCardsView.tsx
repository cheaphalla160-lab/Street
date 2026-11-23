import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Snail, Play, Square } from 'lucide-react';
import { ASSETS, VOCAB_ITEMS, VocabId } from '../types/game';
import { audioEngine } from '../utils/audioEngine';
import { AnimalAvatarBadge } from './CuteSprites';

const ORDERED_VOCAB: VocabId[] = [
  'sunny_sun',
  'rainy_cloud',
  'street',
  'sidewalk',
  'trail',
];

export const WordCardsView: React.FC<{ onGoToPlay: () => void }> = ({ onGoToPlay }) => {
  const [chantIndex, setChantIndex] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopChant = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setChantIndex(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    return () => stopChant();
  }, []);

  const startClassChant = () => {
    if (chantIndex !== null) {
      stopChant();
      return;
    }

    const step = (idx: number) => {
      if (idx >= ORDERED_VOCAB.length) {
        setChantIndex(null);
        return;
      }
      setChantIndex(idx);
      const vocab = VOCAB_ITEMS[ORDERED_VOCAB[idx]];
      audioEngine.speakEnglish(`${vocab.word}. ${vocab.chantSentence}`, 0.82, () => {
        timerRef.current = window.setTimeout(() => step(idx + 1), 650);
      });
    };

    step(0);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#E7E2D8] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Classroom Word Cards
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Warm up with your students before playing! Click any card to hear standard or slow English pronunciation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={startClassChant}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
              chantIndex !== null
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {chantIndex !== null ? (
              <>
                <Square className="h-4 w-4" />
                Stop Class Chant
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play All 5 Words
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onGoToPlay}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E7E2D8] bg-[#FBF9F5] px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap"
          >
            Back to Play Arena
          </button>
        </div>
      </div>

      {/* 5 Vocabulary Flashcards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ORDERED_VOCAB.map((id, idx) => {
          const item = VOCAB_ITEMS[id];
          const isHighlighted = chantIndex === idx;

          // Determine card visual framing: sky sprites use their 1:1 portraits; path words crop cleanly into the matching zone of the landscape artwork
          const landscapeCropPosition =
            id === 'street'
              ? '14% 75%'
              : id === 'sidewalk'
                ? '41% 75%'
                : '80% 75%';

          return (
            <article
              key={id}
              className={`flex flex-col justify-between overflow-hidden rounded-3xl border bg-white transition-all duration-200 ${
                isHighlighted
                  ? 'border-amber-500 ring-2 ring-amber-400 shadow-md'
                  : 'border-[#E7E2D8] shadow-sm hover:border-amber-300'
              }`}
            >
              {/* Card Artwork */}
              <div className="relative h-52 w-full overflow-hidden bg-[#FBF9F5]">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.word}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={ASSETS.landscape}
                    alt={item.word}
                    referrerPolicy="no-referrer"
                    style={{ objectPosition: landscapeCropPosition }}
                    className="h-full w-full object-cover scale-125"
                  />
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {item.category === 'sky' ? 'Sky Element' : 'Path Zone'} · {item.animalFriend}
                    </span>
                    <AnimalAvatarBadge avatar={item.animalAvatar} size={28} />
                  </div>

                  <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                    {item.word}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    <span className="font-mono text-xs text-slate-500">{item.phonetic}</span>
                    <span className="mx-2 text-slate-300">·</span>
                    <span>{item.chinese}</span>
                  </p>

                  <div className="mt-3 rounded-2xl bg-[#FBF9F5] p-3 text-sm text-slate-700 border border-[#E7E2D8]">
                    <p className="font-medium text-slate-900">&ldquo;{item.chantSentence}&rdquo;</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.chantChinese}</p>
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => audioEngine.speakEnglish(item.word, 0.88)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                    Read Word
                  </button>
                  <button
                    type="button"
                    onClick={() => audioEngine.speakEnglish(item.word, 0.6)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E7E2D8] bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                  >
                    <Snail className="h-3.5 w-3.5 text-sky-600" />
                    Slow
                  </button>
                  <button
                    type="button"
                    onClick={() => audioEngine.speakEnglish(item.chantSentence, 0.85)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E7E2D8] bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                  >
                    Sentence
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
