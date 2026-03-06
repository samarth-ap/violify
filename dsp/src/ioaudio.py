import librosa
import numpy as np

def load_audio(path: str, sr: int = 22050) -> tuple[np.ndarray, int]:
    """Load audio as mono at a fixed sample rate."""
    y, sr = librosa.load(path, sr=sr, mono=True)
    return y, sr

def normalize_peak(y: np.ndarray, eps: float = 1e-9) -> np.ndarray:
    """Peak-normalize audio to [-1, 1]."""
    peak = float(np.max(np.abs(y)))
    return y / (peak + eps)