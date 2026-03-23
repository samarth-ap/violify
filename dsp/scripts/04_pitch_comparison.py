import os, sys
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
from ioaudio import load_audio, normalize_peak
from pitch import extract_f0

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

TEACHER = os.path.join(REPO_ROOT, "dsp", "data", "raw", "teacher.wav")
STUDENT = os.path.join(REPO_ROOT, "dsp", "data", "raw", "student.wav")
OUT_IMG  = os.path.join(REPO_ROOT, "dsp", "outputs", "figures", "pitch_comparison.png")

def main():
    yt, sr = load_audio(TEACHER)
    ys, _  = load_audio(STUDENT)
    yt, ys = normalize_peak(yt), normalize_peak(ys)

    t_times, t_f0, _ = extract_f0(yt, sr)
    s_times, s_f0, _ = extract_f0(ys, sr)

    plt.figure(figsize=(14, 5))
    plt.plot(t_times, t_f0, label="Teacher", color="blue", alpha=0.7)
    plt.plot(s_times, s_f0, label="Student", color="orange", alpha=0.7)
    plt.xlabel("Time (s)")
    plt.ylabel("Frequency (Hz)")
    plt.title("Teacher vs Student Pitch")
    plt.legend()
    plt.tight_layout()
    plt.savefig(OUT_IMG, dpi=200)
    print(f"Saved: {OUT_IMG}")

if __name__ == "__main__":
    main()