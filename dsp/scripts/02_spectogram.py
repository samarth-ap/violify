import os, sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from ioaudio import load_audio, normalize_peak
from viz import plot_spectrogram

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TEACHER_WAV = os.path.join(REPO_ROOT, "dsp", "data", "raw", "teacher.m4a")
OUT_IMG = os.path.join(REPO_ROOT, "dsp", "outputs", "figures", "spectrogram_teacher.png")

def main():
    y, sr = load_audio(TEACHER_WAV)
    y = normalize_peak(y)
    plot_spectrogram(y, sr, OUT_IMG, title="Teacher Spectrogram")
    print(f"Saved: {OUT_IMG}")

if __name__ == "__main__":
    main()
