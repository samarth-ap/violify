import os, sys
import pandas as pd
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from ioaudio import load_audio, normalize_peak
from pitch import extract_f0
from viz import plot_pitch

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW_DIR = os.path.join(REPO_ROOT, "dsp", "data", "raw")
FIGURES_DIR = os.path.join(REPO_ROOT, "dsp", "outputs", "figures")
CSV_DIR = os.path.join(REPO_ROOT, "dsp", "outputs", "pitch_csv")

def main():
    if len(sys.argv) > 1:
        audio_path = sys.argv[1]
        if not os.path.isabs(audio_path):
            audio_path = os.path.join(RAW_DIR, audio_path)
    else:
        audio_path = os.path.join(RAW_DIR, "teacher.m4a")

    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Missing: {audio_path}")

    stem = os.path.splitext(os.path.basename(audio_path))[0]
    out_img = os.path.join(FIGURES_DIR, f"pitch_{stem}.png")
    out_csv = os.path.join(CSV_DIR, f"{stem}_pitch.csv")

    y, sr = load_audio(audio_path)
    y = normalize_peak(y)
    times, f0, voiced_prob = extract_f0(y, sr)

    plot_pitch(times, f0, out_img, title=f"{stem} Pitch Curve")
    print(f"Saved plot: {out_img}")

    df = pd.DataFrame({"time_s": times, "f0_hz": f0, "voiced_prob": voiced_prob})
    os.makedirs(os.path.dirname(out_csv), exist_ok=True)
    df.to_csv(out_csv, index=False)
    print(f"Saved CSV: {out_csv}")

if __name__ == "__main__":
    main()
