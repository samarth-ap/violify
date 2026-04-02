import os
import sys
import numpy as np
import matplotlib.pyplot as plt
import librosa

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
from ioaudio import load_audio, normalize_peak

REPO_ROOT   = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW_DIR     = os.path.join(REPO_ROOT, "dsp", "data", "raw")
FIGURES_DIR = os.path.join(REPO_ROOT, "dsp", "outputs", "figures")

LATE_THRESHOLD_MS  = 80   # ms — student onset this late = timing mistake
EARLY_THRESHOLD_MS = 80

def get_onsets(y, sr):
    onset_frames = librosa.onset.onset_detect(
        y=y,
        sr=sr,
        units="time",
        backtrack=True,
        delta=0.07,
        wait=10,
    )
    return onset_frames

def main():
    if len(sys.argv) != 3:
        print("Usage: python 07_onset_errors.py <teacher_audio> <student_audio>")
        print("Example: python 07_onset_errors.py teacherrec.wav studentrec.wav")
        sys.exit(1)

    teacher_path = sys.argv[1]
    student_path = sys.argv[2]

    if not os.path.isabs(teacher_path):
        teacher_path = os.path.join(RAW_DIR, teacher_path)
    if not os.path.isabs(student_path):
        student_path = os.path.join(RAW_DIR, student_path)

    for p in (teacher_path, student_path):
        if not os.path.exists(p):
            raise FileNotFoundError("Missing: " + p)

    t_stem  = os.path.splitext(os.path.basename(teacher_path))[0]
    s_stem  = os.path.splitext(os.path.basename(student_path))[0]
    out_img = os.path.join(FIGURES_DIR, f"onset_errors_{t_stem}_vs_{s_stem}.png")

    yt, sr = load_audio(teacher_path)
    ys, _  = load_audio(student_path)
    yt, ys = normalize_peak(yt), normalize_peak(ys)

    t_onsets = get_onsets(yt, sr)
    s_onsets = get_onsets(ys, sr)

    print("\n" + "="*55)
    print("  TIMING MISTAKE REPORT")
    print("="*55)

    timing_errors = []
    for i, t_on in enumerate(t_onsets):
        if i >= len(s_onsets):
            break
        s_on = s_onsets[i]
        diff_ms = (s_on - t_on) * 1000

        if abs(diff_ms) > LATE_THRESHOLD_MS:
            direction = "LATE" if diff_ms > 0 else "EARLY"
            timing_errors.append({
                "teacher_onset": round(t_on, 2),
                "student_onset": round(s_on, 2),
                "diff_ms":       round(diff_ms, 1),
                "direction":     direction
            })
            print(
                f"  Note at {t_on:.2f}s  │  "
                f"Student: {direction} by {abs(diff_ms):.0f}ms"
            )

    if not timing_errors:
        print("  No significant timing errors detected.")
    print(f"\n  Total timing mistakes: {len(timing_errors)}")
    print("="*55)

    # ── PLOT ──────────────────────────────────────────────
    fig, ax = plt.subplots(figsize=(14, 4))

    yt_norm = yt / np.max(np.abs(yt))
    t_axis  = np.linspace(0, len(yt) / sr, len(yt))
    ax.plot(t_axis, yt_norm, color="blue", alpha=0.4,
            linewidth=0.5, label="Teacher waveform")

    for t in t_onsets:
        ax.axvline(t, color="blue", alpha=0.6, linewidth=1.2)
    for t in s_onsets:
        ax.axvline(t, color="orange", alpha=0.6,
                   linewidth=1.2, linestyle="--")

    for e in timing_errors:
        ax.axvspan(e["teacher_onset"] - 0.05,
                   e["student_onset"] + 0.05,
                   color="red", alpha=0.15)

    ax.set_title("Onset Detection — blue=teacher, orange=student, red=timing error")
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Amplitude")
    ax.legend()
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    os.makedirs(os.path.dirname(out_img), exist_ok=True)
    plt.savefig(out_img, dpi=200)
    plt.close()
    print(f"\nSaved: {out_img}")

if __name__ == "__main__":
    main()