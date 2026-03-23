import numpy as np
import sounddevice as sd
import librosa

# ── CONFIG ──────────────────────────────────────────────
SAMPLE_RATE   = 22050
FRAME_SIZE    = 2048
FMIN          = librosa.note_to_hz("G3")   # 196 Hz
FMAX          = librosa.note_to_hz("E6")   # 1319 Hz
RMS_THRESHOLD = 0.01

# ── SA = E4 ──────────────────────────────────────────────
SA_HZ = librosa.note_to_hz("E4")  # 329.63 Hz

# ── CARNATIC SWARA MAP ───────────────────────────────────
# (cents from Sa, swara name)
# Based on your mapping:
# E=S, F=R1, F#=R2, G=G2, G#=G3, A=M1, A#=M2, B=P, C=D1, C#=D2, D=N2, D#=N3
SWARAS = [
    (0,    "S"),    # E  - Shadjam
    (100,  "R1"),   # F  - Shuddha Rishabham
    (200,  "R2"),   # F# - Chatusruti Rishabham
    (300,  "G2"),   # G  - Sadharana Gandharam
    (400,  "G3"),   # G# - Antara Gandharam
    (500,  "M1"),   # A  - Shuddha Madhyamam
    (600,  "M2"),   # A# - Prati Madhyamam
    (700,  "P"),    # B  - Panchamam
    (800,  "D1"),   # C  - Shuddha Dhaivatam
    (900,  "D2"),   # C# - Chatusruti Dhaivatam
    (1000, "N2"),   # D  - Kaisiki Nishadam
    (1100, "N3"),   # D# - Kakali Nishadam
    (1200, "S'"),   # E  - Upper Shadjam
]

# ── HELPERS ──────────────────────────────────────────────
def hz_to_cents(hz, reference_hz):
    """Convert Hz to cents relative to reference frequency."""
    return 1200 * np.log2(hz / reference_hz)

def nearest_swara(hz):
    """Return the closest Carnatic swara and how many cents off."""
    cents      = hz_to_cents(hz, SA_HZ)
    cents_mod  = cents % 1200    # fold into one octave

    closest      = min(SWARAS, key=lambda s: abs(cents_mod - s[0]))
    cents_off    = cents_mod - closest[0]

    # Figure out which octave we're in (for display)
    octave = int(cents // 1200)
    if octave < 0:
        octave_label = f" (lower octave)"
    elif octave == 0:
        octave_label = ""
    else:
        octave_label = f" (upper octave)"

    return closest[1], cents_off, octave_label

# ── AUDIO CALLBACK ───────────────────────────────────────
def audio_callback(indata, frames, time, status):
    audio = indata[:, 0].astype(np.float32)

    # Skip silence
    rms = np.sqrt(np.mean(audio ** 2))
    if rms < RMS_THRESHOLD:
        print("   ---  (silent)                    ", end="\r")
        return

    # Pitch detection
    f0, voiced_flag, voiced_prob = librosa.pyin(
        audio,
        fmin=FMIN,
        fmax=FMAX,
        sr=SAMPLE_RATE
    )

    # Use median of voiced frames
    voiced_f0 = f0[voiced_flag]
    if len(voiced_f0) == 0:
        print("   ---  (no pitch detected)          ", end="\r")
        return

    median_f0 = float(np.median(voiced_f0))

    # Get swara
    swara, cents_off, octave_label = nearest_swara(median_f0)

    # Intonation indicator
    if abs(cents_off) <= 10:
        intonation = "✓ in tune"
    elif cents_off > 10:
        intonation = f"↑ sharp"
    else:
        intonation = f"↓ flat"

    # Print
    print(
        f"  {median_f0:6.1f} Hz  │  {swara:<4} "
        f"│  {cents_off:+5.1f} cents  │  {intonation}{octave_label}        ",
        end="\r"
    )

# ── MAIN ─────────────────────────────────────────────────
if __name__ == "__main__":
    print("╔══════════════════════════════════════════════╗")
    print("║   🎻  Violify Live Swara Detector            ║")
    print("║   Sa = E  │  Carnatic notation               ║")
    print("╚══════════════════════════════════════════════╝")
    print()
    print("  Hz         │  Swara │  Cents   │  Intonation")
    print("  ──────────────────────────────────────────────")

    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        blocksize=FRAME_SIZE,
        channels=1,
        callback=audio_callback
    ):
        input("\nPress ENTER to stop.\n")
