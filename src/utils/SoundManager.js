// Sound effects using the Web Audio API
class SoundManager {
    constructor () {
        this.sounds = {};
        this.audioContext = null;
        this.enabled = true;
        this.initialized = false;
    }

    initialize () {
        if (this.initialized) return;

        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();

            // Create sounds
            this.createSound('diceRoll', this.generateDiceRollSound());
            this.createSound('cardDraw', this.generateCardDrawSound());
            this.createSound('victory', this.generateVictorySound());
            this.createSound('turnEnd', this.generateTurnEndSound());
            this.createSound('button', this.generateButtonSound());

            this.initialized = true;
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
        }
    }

    setEnabled (enabled) {
        this.enabled = enabled;
    }

    createSound (name, bufferPromise) {
        bufferPromise.then(buffer => {
            this.sounds[name] = buffer;
        }).catch(err => {
            console.error(`Failed to create sound: ${name}`, err);
        });
    }

    play (name) {
        if (!this.enabled || !this.initialized || !this.sounds[name]) return;

        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[name];
            source.connect(this.audioContext.destination);
            source.start(0);
        } catch (e) {
            console.error(`Failed to play sound: ${name}`, e);
        }
    }

    // Generate a dice rolling sound using oscillators
    generateDiceRollSound () {
        return new Promise((resolve, reject) => {
            try {
                const duration = 0.8;
                const sampleRate = this.audioContext.sampleRate;
                const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
                const data = buffer.getChannelData(0);

                for (let i = 0; i < buffer.length; i++) {
                    // Decrease noise level over time (dice settling)
                    const factor = 1 - i / buffer.length;
                    // Randomize the sound for dice clatter
                    data[i] = (Math.random() * 2 - 1) * factor * factor;
                }

                resolve(buffer);
            } catch (e) {
                reject(e);
            }
        });
    }

    // Generate a card drawing/flipping sound
    generateCardDrawSound () {
        return new Promise((resolve, reject) => {
            try {
                const duration = 0.6;
                const sampleRate = this.audioContext.sampleRate;
                const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
                const data = buffer.getChannelData(0);

                // Create a card flipping sound - a short "swoosh" followed by a tap
                for (let i = 0; i < buffer.length; i++) {
                    const time = i / sampleRate;

                    if (time < 0.3) {
                        // First part: swoosh sound
                        const frequency = 500 + 2000 * (time / 0.3);
                        data[i] = Math.sin(time * frequency) * (time / 0.3) * 0.2;
                    } else if (time < 0.35) {
                        // Silence gap
                        data[i] = 0;
                    } else {
                        // Second part: tap sound when card lands
                        const tapFactor = Math.exp(-(time - 0.35) * 40);
                        data[i] = (Math.random() * 2 - 1) * tapFactor * 0.5;
                    }
                }

                resolve(buffer);
            } catch (e) {
                reject(e);
            }
        });
    }

    // Generate a victory fanfare sound
    generateVictorySound () {
        return new Promise((resolve, reject) => {
            try {
                const duration = 2.0;
                const sampleRate = this.audioContext.sampleRate;
                const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
                const data = buffer.getChannelData(0);

                // Create a victory fanfare with ascending notes
                const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

                for (let i = 0; i < buffer.length; i++) {
                    const time = i / sampleRate;
                    let sample = 0;

                    // Play each note in sequence
                    for (let j = 0; j < notes.length; j++) {
                        const noteStart = j * 0.25;
                        const noteEnd = noteStart + 0.4;

                        if (time >= noteStart && time < noteEnd) {
                            const noteProgress = (time - noteStart) / (noteEnd - noteStart);
                            const amplitude = Math.sin(noteProgress * Math.PI);
                            sample += Math.sin(2 * Math.PI * notes[j] * time) * amplitude * 0.2;
                        }
                    }

                    // Add some chord at the end
                    if (time > 1.0) {
                        const fadeOut = Math.max(0, 1 - (time - 1.0) / 1.0);
                        sample += (
                            Math.sin(2 * Math.PI * 261.63 * time) +
                            Math.sin(2 * Math.PI * 329.63 * time) +
                            Math.sin(2 * Math.PI * 392.00 * time)
                        ) * fadeOut * 0.1;
                    }

                    data[i] = sample;
                }

                resolve(buffer);
            } catch (e) {
                reject(e);
            }
        });
    }

    // Generate a turn end sound
    generateTurnEndSound () {
        return new Promise((resolve, reject) => {
            try {
                const duration = 0.5;
                const sampleRate = this.audioContext.sampleRate;
                const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
                const data = buffer.getChannelData(0);

                // Create a "bloop" sound for turn end
                for (let i = 0; i < buffer.length; i++) {
                    const time = i / sampleRate;
                    const frequency = 300 + 200 * Math.exp(-time * 10);
                    const amplitude = Math.exp(-time * 8);

                    data[i] = Math.sin(2 * Math.PI * frequency * time) * amplitude * 0.5;
                }

                resolve(buffer);
            } catch (e) {
                reject(e);
            }
        });
    }

    // Generate a button click sound
    generateButtonSound () {
        return new Promise((resolve, reject) => {
            try {
                const duration = 0.15;
                const sampleRate = this.audioContext.sampleRate;
                const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
                const data = buffer.getChannelData(0);

                // Create a short click sound
                for (let i = 0; i < buffer.length; i++) {
                    const time = i / sampleRate;
                    const frequency = 800;
                    const amplitude = Math.exp(-time * 30);

                    data[i] = Math.sin(2 * Math.PI * frequency * time) * amplitude * 0.3;
                }

                resolve(buffer);
            } catch (e) {
                reject(e);
            }
        });
    }
}

// Create and export a singleton instance
const soundManager = new SoundManager();
export default soundManager;