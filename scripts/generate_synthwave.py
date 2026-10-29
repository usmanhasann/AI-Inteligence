import math
import struct
import wave
import os

def create_synthwave_track(filename="brag-output/composition/assets/music/synthwave.wav", duration=30.0, sample_rate=44100):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    num_samples = int(sample_rate * duration)
    bpm = 124.0
    beat_dur = 60.0 / bpm  # ~0.48387 s
    sixteenth_dur = beat_dur / 4.0  # ~0.12097 s

    # Scale helper (D minor scale frequencies)
    # D1=36.71, F1=43.65, G1=49.00, A1=55.00, C2=65.41
    # D3=146.83, F3=174.61, A3=220.00, C4=261.63
    # D4=293.66, F4=349.23, A4=440.00, C5=523.25, D5=587.33
    bass_freqs = [36.71, 36.71, 43.65, 43.65, 49.00, 49.00, 55.00, 36.71]
    arp_freqs = [293.66, 349.23, 440.00, 523.25, 587.33, 523.25, 440.00, 349.23]

    # Pre-generate stereo PCM samples
    left_samples = [0.0] * num_samples
    right_samples = [0.0] * num_samples

    for i in range(num_samples):
        t = i / float(sample_rate)

        # Beat indices
        beat_idx = int(t / beat_dur)
        sixteenth_idx = int(t / sixteenth_dur)

        # Local time in current beat/sixteenth
        t_beat = t % beat_dur
        t_sixteenth = t % sixteenth_dur

        # --- 1. Kick Drum (Punchy 808-style downbeat kick) ---
        kick = 0.0
        # Kick on every beat
        if t_beat < 0.25:
            # Pitch drop from 160Hz to 45Hz
            kick_freq = 45.0 + 115.0 * math.exp(-t_beat * 35.0)
            kick_phase = 2.0 * math.pi * (45.0 * t_beat + (115.0 / 35.0) * (1.0 - math.exp(-t_beat * 35.0)))
            kick_env = math.exp(-t_beat * 12.0)
            kick = math.sin(kick_phase) * kick_env * 0.7

        # --- 2. Snare / Clap (Beats 2 and 4) ---
        snare = 0.0
        if beat_idx % 2 == 1: # Beats 1, 3 (0-indexed 2nd and 4th)
            if t_beat < 0.2:
                # Noise + tonal body at 180Hz
                noise = (math.sin(i * 12.9898) * 43758.5453) % 1.0 * 2.0 - 1.0
                tone = math.sin(2.0 * math.pi * 180.0 * t_beat) * math.exp(-t_beat * 25.0)
                snare_env = math.exp(-t_beat * 18.0)
                snare = (noise * 0.6 + tone * 0.4) * snare_env * 0.5

        # --- 3. Synthwave Sawtooth Bassline (Offbeat 16th pumping bass) ---
        bass = 0.0
        if t_sixteenth < 0.1:
            bass_note_idx = (sixteenth_idx // 2) % len(bass_freqs)
            bfreq = bass_freqs[bass_note_idx]
            # Sawtooth wave synthesized via harmonics
            saw = 0.0
            for h in range(1, 8):
                saw += (1.0 / h) * math.sin(2.0 * math.pi * bfreq * h * t)
            bass_env = math.exp(-t_sixteenth * 15.0)
            # Sidechain ducking on downbeats
            duck = 0.2 if (sixteenth_idx % 4 == 0) else 1.0
            bass = saw * bass_env * duck * 0.35

        # --- 4. Cyberpunk Arpeggio Lead (16th notes) ---
        arp = 0.0
        if t_sixteenth < 0.11:
            arp_note_idx = sixteenth_idx % len(arp_freqs)
            afreq = arp_freqs[arp_note_idx]
            # Bright synth lead
            lead = math.sin(2.0 * math.pi * afreq * t) + 0.3 * math.sin(2.0 * math.pi * afreq * 2.0 * t)
            arp_env = math.exp(-t_sixteenth * 20.0)
            arp = lead * arp_env * 0.25

        # --- 5. Atmospheric Synth Pad (Warm chords) ---
        # Chords progress every 8 beats (~3.87s)
        chord_prog = [
            [146.83, 220.00, 349.23], # Dm
            [174.61, 261.63, 349.23], # F
            [130.81, 196.00, 261.63], # C
            [196.00, 293.66, 349.23], # Gm
        ]
        chord_idx = (int(t / (beat_dur * 8))) % len(chord_prog)
        current_chord = chord_prog[chord_idx]
        pad = 0.0
        for pf in current_chord:
            pad += math.sin(2.0 * math.pi * pf * t) + 0.5 * math.sin(2.0 * math.pi * pf * 1.003 * t)
        pad = (pad / len(current_chord)) * 0.18

        # --- 6. Sub-bass impacts on scene transitions (0.0s, 4.0s, 10.0s, 18.0s, 25.0s) ---
        impact = 0.0
        for impact_t in [0.0, 4.0, 10.0, 18.0, 25.0]:
            dt = t - impact_t
            if 0 <= dt < 1.5:
                sub_freq = 80.0 * math.exp(-dt * 3.0) + 35.0
                impact += math.sin(2.0 * math.pi * sub_freq * dt) * math.exp(-dt * 2.5) * 0.4

        # Master Mix
        left = kick + snare + bass + arp + pad * 0.8 + impact
        right = kick + snare + bass + arp * 0.9 + pad * 1.2 + impact

        # Global Fade in / Fade out
        fade_in = min(1.0, t / 0.3)
        fade_out = min(1.0, (duration - t) / 0.5)
        gain = fade_in * fade_out

        left_samples[i] = max(-0.95, min(0.95, left * gain))
        right_samples[i] = max(-0.95, min(0.95, right * gain))

    # Write to WAV
    with wave.open(filename, 'wb') as wav_file:
        wav_file.setnchannels(2) # Stereo
        wav_file.setsampwidth(2) # 16-bit PCM
        wav_file.setframerate(sample_rate)

        frames = bytearray()
        for l, r in zip(left_samples, right_samples):
            l_int = int(l * 32767)
            r_int = int(r * 32767)
            frames.extend(struct.pack('<hh', l_int, r_int))

        wav_file.writeframes(frames)
    print(f"Generated synthwave track: {filename} ({duration}s, 124 BPM)")

if __name__ == "__main__":
    create_synthwave_track()
