import librosa
import numpy as np

def extract_f0(y: np.ndarray, sr: int, fmin: float = 196.0, fmax: float = 1319.0):
    """Extract pitch using pyin. Returns (times, f0_hz, voiced_prob)."""
    f0, voiced_flag, voiced_prob = librosa.pyin(y, fmin=fmin, fmax=fmax, sr=sr)
    times = librosa.times_like(f0, sr=sr)
    return times, f0, voiced_prob