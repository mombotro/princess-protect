// js/audio.js - Procedural Web Audio Sound & Music Synthesizer
// Zero external audio files required!

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.isMuted = false;
        this.musicPlaying = false;
        this.musicInterval = null;
        this.currentStep = 0;
        this.tempo = 128; // Galloping combat tempo
        this.lastHoofTime = 0;
        this.hoofStep = 0;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
    }

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // --- SOUND EFFECTS ---

    // Realistic galloping horse hooves with alternating footfalls
    playHoofbeat(speed = 1.0) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        if (now - this.lastHoofTime < 0.12 / Math.max(0.5, speed)) return;
        this.lastHoofTime = now;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Alternating pitch for 4-beat gallop feel
        const pitches = [110, 140, 120, 160];
        const baseFreq = pitches[this.hoofStep % pitches.length];
        this.hoofStep++;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.3 * Math.min(1.2, speed), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        // Add dirt/snow clop click
        const noise = this.ctx.createBufferSource();
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.04, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.4;
        }
        noise.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(700, now);
        noiseFilter.Q.value = 3;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.1);
        noise.stop(now + 0.05);
    }

    // Horse whinny when charging or jumping
    playHorseWhinny() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        mod.type = 'sine';
        mod.frequency.setValueAtTime(22, now); // vibrato

        modGain.gain.setValueAtTime(40, now);
        mod.connect(modGain);
        modGain.connect(osc.frequency);

        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.55);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.value = 4;

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        mod.start(now);
        osc.start(now);
        mod.stop(now + 0.65);
        osc.stop(now + 0.65);
    }

    // Lance swoosh
    playLanceSweep() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const noise = this.ctx.createBufferSource();
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.25, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 0.1);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);
        filter.Q.value = 5;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + 0.26);
    }

    // Heavy Knock-down collision punch + armor clang
    playImpact(force = 1.0) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Sub bass thump
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.2);

        gain.gain.setValueAtTime(Math.min(0.8, 0.4 * force), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.23);

        // Metallic bronze armor clang
        const clang = this.ctx.createOscillator();
        const clangGain = this.ctx.createGain();
        clang.type = 'triangle';
        clang.frequency.setValueAtTime(680, now);
        clang.frequency.exponentialRampToValueAtTime(320, now + 0.18);

        clangGain.gain.setValueAtTime(Math.min(0.5, 0.3 * force), now);
        clangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        clang.connect(clangGain);
        clangGain.connect(this.sfxGain);
        clang.start(now);
        clang.stop(now + 0.26);

        // Cartoon spring boing & comical yell!
        this.playCartoonBoing();
        this.playGreekYell();
    }

    // Playful cartoon spring "BOING!"
    playCartoonBoing() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Pitch sweeps rapidly up and vibrates like a spring!
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);
        osc.frequency.linearRampToValueAtTime(500, now + 0.25);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Greek funny comical yell ("WHEEEE!") when launched flying
    playGreekYell() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        // Fun high-pitch cartoon "Wheeee!"
        const startPitch = 380 + Math.random() * 160;
        osc.frequency.setValueAtTime(startPitch, now);
        osc.frequency.exponentialRampToValueAtTime(startPitch * 1.8, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(startPitch * 0.7, now + 0.45);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(900 + Math.random() * 300, now);
        filter.Q.value = 5.0;

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.48);
    }

    // Thunder Stomp shockwave
    playStomp() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.5);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        // Distortion / rumble
        const noise = this.ctx.createBufferSource();
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.4, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        noise.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(200, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.55);
        noise.stop(now + 0.46);
    }

    // Princess cheering or Russian bell celebration
    playPrincessCheer() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        chords.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.setValueAtTime(0.2, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.65);
        });
    }

    // Princess alert / damage sound
    playPrincessHurt() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.36);
    }

    // Ruble / rune pickup
    playCoin() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.32);
    }

    // --- PROCEDURAL EPIC SLAVIC BATTLE MUSIC ---
    startMusic() {
        if (this.musicPlaying) return;
        this.resume();
        this.musicPlaying = true;
        this.currentStep = 0;

        // D Minor Harmonic Scale notes
        // D, E, F, G, A, Bb, C#
        const D2 = 73.42, A2 = 110.00, D3 = 146.83, F3 = 174.61, G3 = 196.00, A3 = 220.00, Bb3 = 233.08, Csharp4 = 277.18, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00;

        const bassPattern = [
            D2, D2, A2, D2, F3, D2, A2, D2,
            D2, D2, Bb3, A2, G3, F3, E4, D3
        ];

        const melodyPattern = [
            D4, null, D4, E4, F4, null, E4, D4,
            Csharp4, null, E4, null, D4, null, null, null,
            F4, null, G4, F4, E4, null, D4, E4,
            F4, E4, D4, Csharp4, D4, null, null, null
        ];

        const stepTime = (60 / this.tempo) / 2; // 16th notes

        this.musicInterval = setInterval(() => {
            if (!this.ctx || this.isMuted || !this.musicPlaying) return;
            const now = this.ctx.currentTime;
            const step16 = this.currentStep % 16;
            const step32 = this.currentStep % 32;

            // 1. War Drums (Kick & Tom)
            if (step16 % 4 === 0 || step16 === 6 || step16 === 10 || step16 === 14) {
                const drumOsc = this.ctx.createOscillator();
                const drumGain = this.ctx.createGain();
                drumOsc.type = 'sine';
                drumOsc.frequency.setValueAtTime(step16 % 8 === 0 ? 95 : 120, now);
                drumOsc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

                drumGain.gain.setValueAtTime(0.25, now);
                drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

                drumOsc.connect(drumGain);
                drumGain.connect(this.musicGain);
                drumOsc.start(now);
                drumOsc.stop(now + 0.15);
            }

            // 2. Balalaika / Lute Arpeggio (Plucked String)
            const bassNote = bassPattern[step16];
            if (bassNote) {
                const luteOsc = this.ctx.createOscillator();
                const luteGain = this.ctx.createGain();
                const luteFilter = this.ctx.createBiquadFilter();

                luteOsc.type = 'sawtooth';
                luteOsc.frequency.setValueAtTime(bassNote, now);

                luteFilter.type = 'lowpass';
                luteFilter.frequency.setValueAtTime(800, now);
                luteFilter.frequency.exponentialRampToValueAtTime(200, now + 0.16);

                luteGain.gain.setValueAtTime(0.18, now);
                luteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

                luteOsc.connect(luteFilter);
                luteFilter.connect(luteGain);
                luteGain.connect(this.musicGain);

                luteOsc.start(now);
                luteOsc.stop(now + 0.19);
            }

            // 3. Heroic Bogatyr Horn Lead
            const melNote = melodyPattern[step32];
            if (melNote) {
                const hornOsc = this.ctx.createOscillator();
                const hornGain = this.ctx.createGain();
                const hornFilter = this.ctx.createBiquadFilter();

                hornOsc.type = 'sawtooth';
                hornOsc.frequency.setValueAtTime(melNote, now);

                hornFilter.type = 'lowpass';
                hornFilter.frequency.setValueAtTime(1400, now);
                hornFilter.Q.value = 3;

                hornGain.gain.setValueAtTime(0.001, now);
                hornGain.gain.linearRampToValueAtTime(0.12, now + 0.05);
                hornGain.gain.exponentialRampToValueAtTime(0.001, now + stepTime * 1.8);

                hornOsc.connect(hornFilter);
                hornFilter.connect(hornGain);
                hornGain.connect(this.musicGain);

                hornOsc.start(now);
                hornOsc.stop(now + stepTime * 1.9);
            }

            this.currentStep++;
        }, stepTime * 1000);
    }

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        this.musicPlaying = false;
    }
}

// Global Sound Instance
window.Sound = new SoundEngine();
