import os
import sys
import numpy as np
import matplotlib.pyplot as plt

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from ioaudio import load_audio, normalize_peak
from pitch import extract_f0

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW_DIR = os.path.join(REPO_ROOT, "dsp", "data", "raw")
FIGURES_DIR = os.path.join(REPO_ROOT, "dsp", "outputs", "figures")

def main():
    if len(sys.argv) != 3:
        print("Usage: python 04_pitch_comparison.py <teacher_audio> <student_audio>")
        print("Example: python 04_pitch_comparison.py teacherrec.wav studentrec.wav")
        sys.exit(1)

    teacher_path = sys.argv[1]
    student_path = sys.argv[2]

    if not os.path.isabs(teacher_path):
        teacher_path = os.path.join(RAW_DIR, teacher_path)
    if not os.path.isabs(student_path):
        student_path = os.path.join(RAW_DIR, student_path)

    for p in (teacher_path, student_path):
        if not os.path.exists(p):
            raise FileNotFoundError(f"Missing: {p}")

    t_stem = os.path.splitext(os.path.basename(teacher_path))[0]
    s_stem = os.path.splitext(os.path.basename(student_path))[0]
    out_img = os.path.join(FIGURES_DIR, f"pitch_comparison_{t_stem}_vs_{s_stem}.png")

    yt, sr = load_audio(teacher_path)
    ys, _  = load_audio(student_path)

    yt = normalize_peak(yt)
    ys = normalize_peak(ys)

    t_times, t_f0, t_voiced = extract_f0(yt, sr)
    s_times, s_f0, s_voiced = extract_f0(ys, sr)

    fig, axes = plt.subplots(3, 1, figsize=(14, 10))

    axes[0].plot(t_times, t_f0, color="blue", linewidth=1.2)
    axes[0].set_title(f"{t_stem} Pitch Curve")
    axes[0].set_ylabel("Frequency (Hz)")
    axes[0].set_ylim(100, 1100)
    axes[0].grid(True, alpha=0.3)

    axes[1].plot(s_times, s_f0, color="orange", linewidth=1.2)
    axes[1].set_title(f"{s_stem} Pitch Curve")
    axes[1].set_ylabel("Frequency (Hz)")
    axes[1].set_ylim(100, 1100)
    axes[1].grid(True, alpha=0.3)

    axes[2].plot(t_times, t_f0, color="blue",   linewidth=1.2, label=t_stem, alpha=0.8)
    axes[2].plot(s_times, s_f0, color="orange", linewidth=1.2, label=s_stem, alpha=0.8)
    axes[2].set_title(f"{t_stem} vs {s_stem} (Overlaid) - look for gaps between lines")
    axes[2].set_ylabel("Frequency (Hz)")
    axes[2].set_xlabel("Time (s)")
    axes[2].set_ylim(100, 1100)
    axes[2].legend()
    axes[2].grid(True, alpha=0.3)

    plt.tight_layout()
    os.makedirs(os.path.dirname(out_img), exist_ok=True)
    plt.savefig(out_img, dpi=200)
    plt.close()
    print(f"Saved: {out_img}")

if __name__ == "__main__":
    main()
