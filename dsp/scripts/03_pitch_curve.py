import os, sys
import pandas as pd
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from ioaudio import load_audio, normalize_peak
from pitch import extract_f0
from viz import plot_pitch

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TEACHER_WAV = os.path.join(REPO_ROOT, "dsp", "data", "raw", "teacher.m4a")
OUT_IMG = os.path.join(REPO_ROOT, "dsp", "outputs", "figures", "pitch_teacher.png")
OUT_CSV = os.path.join(REPO_ROOT, "dsp", "outputs", "pitch_csv", "teacher_pitch.csv")

def main():
    y, sr = load_audio(TEACHER_WAV)
    y = normalize_peak(y)
    times, f0, voiced_prob = extract_f0(y, sr)

    plot_pitch(times, f0, OUT_IMG, title="Teacher Pitch Curve")
    print(f"Saved plot: {OUT_IMG}")

    df = pd.DataFrame({"time_s": times, "f0_hz": f0, "voiced_prob": voiced_prob})
    os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
    df.to_csv(OUT_CSV, index=False)
    print(f"Saved CSV: {OUT_CSV}")

if __name__ == "__main__":
    main()