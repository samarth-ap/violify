import os
import numpy as np
import matplotlib.pyplot as plt

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