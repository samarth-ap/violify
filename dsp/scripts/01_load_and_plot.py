import os
import sys

# Allow imports from dsp/src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from ioaudio import load_audio, normalize_peak
from viz import plot_waveform

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TEACHER_AUDIO = os.path.join(REPO_ROOT, "dsp", "data", "raw", "teacher.m4a")
OUT_IMG = os.path.join(REPO_ROOT, "dsp", "outputs", "figures", "waveform_teacher.png")

def main():
    if not os.path.exists(TEACHER_AUDIO):
        raise FileNotFoundError(f"Missing: {TEACHER_AUDIO}\nPut an audio file at dsp/data/raw/teacher.m4a")

    y, sr = load_audio(TEACHER_AUDIO, sr=22050)
    y = normalize_peak(y)

    plot_waveform(y, sr, OUT_IMG, title="Teacher Waveform")
    print(f"Saved: {OUT_IMG}")

if __name__ == "__main__":
    main()