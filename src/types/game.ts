export type VocabId = 'sunny_sun' | 'rainy_cloud' | 'street' | 'sidewalk' | 'trail';

export type SkyKind = 'sunny_sun' | 'rainy_cloud';

export type PathLane = 'street' | 'sidewalk' | 'trail';

export type AnimalAvatarId = 'puppy' | 'bunny' | 'duck' | 'fox';

export type GameMode = 'free' | 'timed';

export type AppSection = 'arena' | 'cards' | 'leaderboard' | 'guide';

export interface VocabItem {
  id: VocabId;
  word: string;
  phonetic: string;
  chinese: string;
  chantSentence: string;
  chantChinese: string;
  category: 'sky' | 'path';
  animalFriend: string;
  animalAvatar: AnimalAvatarId;
  accentHex: string;
  imageUrl?: string;
}

export interface SkyToken {
  uid: string;
  kind: SkyKind;
  xPct: number; // 8 to 92
  yPct: number; // 10 to 46 while floating, drops to ~64-72 on land
  lane: PathLane;
  driftSpeed: number; // % per second horizontal gentle drift
  driftDir: 1 | -1;
  bobOffset: number;
  state: 'floating' | 'caught';
  caughtAt?: number;
}

export interface CatchFeedback {
  id: string;
  xPct: number;
  yPct: number;
  kind: SkyKind;
  lane: PathLane;
  points: number;
}

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  avatar: AnimalAvatarId;
  score: number;
  wordsRead: number;
  mode: GameMode;
  createdAt: string;
  isSample?: boolean;
}

export const ASSETS = {
  landscape: '/src/assets/images/storybook_paths_landscape_1795429179129.jpg',
  sunnySun: '/src/assets/images/vocab_sunny_sun_1795429177438.jpg',
  rainyCloud: '/src/assets/images/vocab_rainy_cloud_1795429177706.jpg',
  animalBuddies: '/src/assets/images/animal_buddies_cheer_1795429178176.jpg',
} as const;

export const VOCAB_ITEMS: Record<VocabId, VocabItem> = {
  sunny_sun: {
    id: 'sunny_sun',
    word: 'sunny sun',
    phonetic: '/ˈsʌni sʌn/',
    chinese: '灿烂的太阳 · 晴朗太阳',
    chantSentence: 'Sunny sun shines bright above the street!',
    chantChinese: '灿烂的太阳高高照在街道上！',
    category: 'sky',
    animalFriend: 'Yellow Duckling',
    animalAvatar: 'duck',
    accentHex: '#D97706',
    imageUrl: ASSETS.sunnySun,
  },
  rainy_cloud: {
    id: 'rainy_cloud',
    word: 'rainy cloud',
    phonetic: '/ˈreɪni klaʊd/',
    chinese: '下雨的云朵 · 雨云',
    chantSentence: 'Rainy cloud drops gentle rain on the trail!',
    chantChinese: '下雨的云朵把小雨点洒在小路上！',
    category: 'sky',
    animalFriend: 'Brown Bunny',
    animalAvatar: 'bunny',
    accentHex: '#0284C7',
    imageUrl: ASSETS.rainyCloud,
  },
  street: {
    id: 'street',
    word: 'street',
    phonetic: '/striːt/',
    chinese: '街道 · 马路',
    chantSentence: 'Look left and right before crossing the street.',
    chantChinese: '过马路前要向左看、向右看。',
    category: 'path',
    animalFriend: 'Yellow Duckling',
    animalAvatar: 'duck',
    accentHex: '#475569',
  },
  sidewalk: {
    id: 'sidewalk',
    word: 'sidewalk',
    phonetic: '/ˈsaɪdwɔːk/',
    chinese: '人行道',
    chantSentence: 'Puppy and friends walk safely on the sidewalk.',
    chantChinese: '小狗和朋友们安全地走在人行道上。',
    category: 'path',
    animalFriend: 'Golden Puppy',
    animalAvatar: 'puppy',
    accentHex: '#B45309',
  },
  trail: {
    id: 'trail',
    word: 'trail',
    phonetic: '/treɪl/',
    chinese: '林间小路 · 小径',
    chantSentence: 'Little Bunny hops along the sunny woodland trail.',
    chantChinese: '小兔子沿着阳光照耀的林间小径蹦蹦跳跳。',
    category: 'path',
    animalFriend: 'Brown Bunny',
    animalAvatar: 'bunny',
    accentHex: '#15803D',
  },
};

export const PATH_LANES: Array<{
  id: PathLane;
  label: string;
  chinese: string;
  startPct: number;
  endPct: number;
  centerPct: number;
  animalName: string;
  avatar: AnimalAvatarId;
  badgeBg: string;
  badgeText: string;
  borderHex: string;
}> = [
  {
    id: 'street',
    label: 'street',
    chinese: '街道',
    startPct: 0,
    endPct: 32,
    centerPct: 16,
    animalName: 'Duckling',
    avatar: 'duck',
    badgeBg: 'bg-slate-800',
    badgeText: 'text-white',
    borderHex: '#334155',
  },
  {
    id: 'sidewalk',
    label: 'sidewalk',
    chinese: '人行道',
    startPct: 32,
    endPct: 51,
    centerPct: 41.5,
    animalName: 'Puppy',
    avatar: 'puppy',
    badgeBg: 'bg-amber-700',
    badgeText: 'text-white',
    borderHex: '#B45309',
  },
  {
    id: 'trail',
    label: 'trail',
    chinese: '林间小路',
    startPct: 51,
    endPct: 100,
    centerPct: 75.5,
    animalName: 'Bunny',
    avatar: 'bunny',
    badgeBg: 'bg-emerald-700',
    badgeText: 'text-white',
    borderHex: '#15803D',
  },
];

export function getLaneFromX(xPct: number): PathLane {
  if (xPct < 32) return 'street';
  if (xPct < 51) return 'sidewalk';
  return 'trail';
}
