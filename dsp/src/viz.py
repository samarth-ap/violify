import os
import numpy as np
import matplotlib.pyplot as plt
import librosa
import librosa.display

def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)

def plot_waveform(y: np.ndarray, sr: int, out_path: str, title: str = "Waveform") -> None:
    ensure_dir(os.path.dirname(out_path))
    t = np.arange(len(y)) / sr

    plt.figure()
    plt.plot(t, y)
    plt.xlabel("Time (s)")
    plt.ylabel("Amplitude")
    plt.title(title)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()

def plot_pitch(times: np.ndarray, f0: np.ndarray, out_path: str, title: str = "Pitch Curve") -> None:
    ensure_dir(os.path.dirname(out_path))
    plt.figure(figsize=(12, 4))
    plt.plot(times, f0)
    plt.xlabel("Time (s)")
    plt.ylabel("Frequency (Hz)")
    plt.title(title)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()

def plot_spectrogram(y: np.ndarray, sr: int, out_path: str, title: str = "Spectrogram") -> None:
    ensure_dir(os.path.dirname(out_path))
    S = librosa.stft(y)
    S_db = librosa.amplitude_to_db(np.abs(S), ref=np.max)

    plt.figure(figsize=(12, 4))
    librosa.display.specshow(S_db, sr=sr, x_axis="time", y_axis="log")
    plt.colorbar(format="%+2.0f dB")
    plt.title(title)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()

def plot_cqt(y: np.ndarray, sr: int, out_path: str, title: str = "CQT") -> None:
    import librosa
    import librosa.display
    ensure_dir(os.path.dirname(out_path))
    C = np.abs(librosa.cqt(y, sr=sr))
    C_db = librosa.amplitude_to_db(C, ref=np.max)

    plt.figure(figsize=(12, 4))
    librosa.display.specshow(C_db, sr=sr, x_axis="time", y_axis="cqt_hz")
    plt.colorbar(format="%+2.0f dB")
    plt.title(title)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()