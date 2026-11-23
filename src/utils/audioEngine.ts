// Cheerful Web Audio API music box / marimba synthesizer + English speech synthesis & recognition

class ClassroomAudioEngine {
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private stepIndex = 0;
  private musicEnabled = false;
  private sfxEnabled = true;
  private volume = 0.35;

  // Cheerful C-major pentatonic children's melody (frequencies in Hz)
  // Inspired by sunny morning storybook marimba loops
  private readonly melodyNotes = [
    523.25, // C5
    659.25, // E5
    783.99, // G5
    659.25, // E5
    880.0,  // A5
    783.99, // G5
    659.25, // E5
    587.33, // D5
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
    659.25, // E5
    587.33, // D5
    523.25, // C5
    0,      // gentle rest
  ];

  private readonly bassNotes = [
    261.63, // C4
    0,
    392.0,  // G4
    0,
    349.23, // F4
    0,
    261.63, // C4
    0,
    293.66, // D4
    0,
    392.0,  // G4
    0,
    261.63, // C4
    0,
    196.0,  // G3
    0,
  ];

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    gainPeak: number,
    type: OscillatorType = 'sine',
    delay = 0
  ) {
    const ctx = this.ensureContext();
    if (!ctx || freq <= 0) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public setVolume(v: number) {
    this.volume = Math.max(0.05, Math.min(1, v));
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  public startMusic() {
    this.ensureContext();
    if (this.musicEnabled) return;
    this.musicEnabled = true;

    const tick = () => {
      if (!this.musicEnabled) return;
      const idx = this.stepIndex % this.melodyNotes.length;
      const melodyFreq = this.melodyNotes[idx];
      const bassFreq = this.bassNotes[idx];

      if (melodyFreq > 0) {
        // Warm marimba-like fundamental + gentle octave shimmer
        this.playTone(melodyFreq, 0.34, 0.055 * this.volume, 'sine');
        this.playTone(melodyFreq * 2, 0.14, 0.012 * this.volume, 'triangle');
      }
      if (bassFreq > 0) {
        this.playTone(bassFreq, 0.45, 0.04 * this.volume, 'triangle');
      }

      this.stepIndex += 1;
    };

    tick();
    this.musicTimer = window.setInterval(tick, 310);
  }

  public stopMusic() {
    this.musicEnabled = false;
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public isMusicPlaying(): boolean {
    return this.musicEnabled;
  }

  public playCatchSun() {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.24, 0.11, 'sine', i * 0.055);
    });
  }

  public playCatchCloud() {
    if (!this.sfxEnabled) return;
    const notes = [659.25, 587.33, 783.99, 880.0];
    notes.forEach((n, i) => {
      this.playTone(n, 0.22, 0.09, 'triangle', i * 0.06);
    });
  }

  public playPathTap() {
    if (!this.sfxEnabled) return;
    this.playTone(440, 0.16, 0.09, 'sine', 0);
    this.playTone(554.37, 0.2, 0.09, 'sine', 0.06);
  }

  public playReadSuccess() {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.28, 0.12, 'sine', i * 0.06);
    });
  }

  public speakEnglish(text: string, rate = 0.86, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = 1.12; // Warm, friendly tone for young learners

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.lang === 'en-US' && /Samantha|Aria|Jenny|Google US English|Natural/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en-US')) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (preferred) {
        utterance.voice = preferred;
      }

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      onEnd?.();
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  public listenForEnglish(
    targetPhrase: string,
    onResult: (matched: boolean, transcript: string) => void,
    onError: (reason: string) => void
  ): () => void {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const RecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!RecognitionCtor) {
      onError('Browser speech recognition unavailable');
      return () => {};
    }

    const recognition = new RecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    let finished = false;
    const stop = () => {
      if (!finished) {
        finished = true;
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }
    };

    recognition.onresult = (event) => {
      if (finished) return;
      finished = true;
      const targetWords = targetPhrase.toLowerCase().split(/\s+/);
      let bestTranscript = '';
      let matched = false;

      for (let i = 0; i < event.results[0].length; i++) {
        const alt = event.results[0][i].transcript.toLowerCase().trim();
        if (i === 0) bestTranscript = alt;
        if (
          alt.includes(targetPhrase.toLowerCase()) ||
          targetWords.some((w) => w.length >= 3 && alt.includes(w))
        ) {
          matched = true;
          bestTranscript = alt;
          break;
        }
      }

      onResult(matched, bestTranscript);
    };

    recognition.onerror = (err) => {
      if (finished) return;
      finished = true;
      onError(err.error || 'mic-error');
    };

    recognition.onend = () => {
      if (!finished) {
        finished = true;
        onError('no-speech');
      }
    };

    try {
      recognition.start();
    } catch {
      onError('start-failed');
    }

    return stop;
  }
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

export const audioEngine = new ClassroomAudioEngine();
