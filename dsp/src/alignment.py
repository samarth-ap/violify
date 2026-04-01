import numpy as np
import librosa
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean


def compute_cqt_features(y: np.ndarray, sr: int) -> np.ndarray:
    """
    Compute CQT magnitude frames for DTW alignment.
    Returns array of shape (n_frames, n_bins).
    """
    C = np.abs(librosa.cqt(y, sr=sr))
    # Normalize each frame so loudness differences don't affect alignment
    C = librosa.util.normalize(C, axis=0)
    return C.T   # shape: (n_frames, n_bins)


def dtw_align(teacher_features: np.ndarray,
              student_features: np.ndarray):
    """
    Run DTW on CQT features.
    Returns the warping path: list of (teacher_idx, student_idx) pairs.
    """
    distance, path = fastdtw(teacher_features,
                             student_features,
                             dist=euclidean)
    return path, distance


def build_time_map(path, sr: int, hop_length: int = 512):
    """
    Convert DTW path (frame indices) into a time mapping.
    Returns (teacher_times, student_times) arrays in seconds.
    """
    teacher_frames = np.array([p[0] for p in path])
    student_frames = np.array([p[1] for p in path])

    teacher_times = librosa.frames_to_time(teacher_frames,
                                           sr=sr,
                                           hop_length=hop_length)
    student_times = librosa.frames_to_time(student_frames,
                                           sr=sr,
                                           hop_length=hop_length)
    return teacher_times, student_times