import os
import sys

# Allow imports from dsp/src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from ioaudio import load_audio, normalize_peak
from viz import plot_waveform

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW_DIR = os.path.join(REPO_ROOT, "dsp", "data", "raw")
FIGURES_DIR = os.path.join(REPO_ROOT, "dsp", "outputs", "figures")

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
    out_img = os.path.join(FIGURES_DIR, f"waveform_{stem}.png")

    y, sr = load_audio(audio_path, sr=22050)
    y = normalize_peak(y)

    plot_waveform(y, sr, out_img, title=f"{stem} Waveform")
    print(f"Saved: {out_img}")

if __name__ == "__main__":
    main()
