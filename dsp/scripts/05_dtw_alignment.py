import os
import sys
import numpy as np
import matplotlib.pyplot as plt

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from ioaudio import load_audio, normalize_peak
from pitch import extract_f0
from alignment import compute_cqt_features, dtw_align, build_time_map

REPO_ROOT   = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW_DIR     = os.path.join(REPO_ROOT, "dsp", "data", "raw")
FIGURES_DIR = os.path.join(REPO_ROOT, "dsp", "outputs", "figures")

def main():
    if len(sys.argv) != 3:
        print("Usage: python 05_dtw_alignment.py <teacher_audio> <student_audio>")
        print("Example: python 05_dtw_alignment.py teacherrec.wav studentrec.wav")
        sys.exit(1)

    teacher_path = sys.argv[1]
    student_path = sys.argv[2]

    if not os.path.isabs(teacher_path):
        teacher_path = os.path.join(RAW_DIR, teacher_path)
    if not os.path.isabs(student_path):
        student_path = os.path.join(RAW_DIR, student_path)

    for p in (teacher_path, student_path):
        if not os.path.exists(p):
            raise FileNotFoundError("Missing: " + p)

    t_stem = os.path.splitext(os.path.basename(teacher_path))[0]
    s_stem = os.path.splitext(os.path.basename(student_path))[0]
    out_img = os.path.join(FIGURES_DIR, f"dtw_aligned_{t_stem}_vs_{s_stem}.png")

    print("Loading audio...")
    yt, sr = load_audio(teacher_path)
    ys, _  = load_audio(student_path)
    yt = normalize_peak(yt)
    ys = normalize_peak(ys)

    # ── STEP 1: Extract pitch curves ─────────────────────
    print("Extracting pitch curves...")
    t_times, t_f0, _ = extract_f0(yt, sr)
    s_times, s_f0, _ = extract_f0(ys, sr)

    # ── STEP 2: Compute CQT features for DTW ─────────────
    print("Computing CQT features...")
    t_features = compute_cqt_features(yt, sr)
    s_features = compute_cqt_features(ys, sr)

    # ── STEP 3: Run DTW ───────────────────────────────────
    print("Running DTW alignment (this may take a moment)...")
    path, distance = dtw_align(t_features, s_features)
    print(f"DTW distance: {distance:.2f}")

    # ── STEP 4: Build time mapping ────────────────────────
    teacher_aligned_times, student_aligned_times = build_time_map(path, sr)

    # ── STEP 5: Interpolate student pitch onto teacher timeline ──
    # For each teacher time point, find what the student was playing
    student_f0_aligned = np.interp(
        teacher_aligned_times,   # x points we want
        s_times,                 # known x points
        np.nan_to_num(s_f0)      # known y values (replace NaN with 0)
    )
    teacher_f0_aligned = np.interp(
        teacher_aligned_times,
        t_times,
        np.nan_to_num(t_f0)
    )

    # ── STEP 6: Compute timing ratio from warping path ───
    # Slope of path = student_frames / teacher_frames in each window
    # slope = 1.0 → perfect sync, >1 → student slower, <1 → student faster
    teacher_frames_path = np.array([p[0] for p in path])
    student_frames_path = np.array([p[1] for p in path])

    HOP_LENGTH = 512
    WINDOW     = 80   # frames (~1.9s) — smoothing window for phrase-level timing

    slope_times  = []
    timing_ratio = []
    for i in range(len(path) - WINDOW):
        dt = teacher_frames_path[i + WINDOW] - teacher_frames_path[i]
        ds = student_frames_path[i + WINDOW] - student_frames_path[i]
        if dt > 0:
            slope_times.append(teacher_frames_path[i] * HOP_LENGTH / sr)
            timing_ratio.append(ds / dt)

    slope_times  = np.array(slope_times)
    timing_ratio = np.array(timing_ratio)

    # Print phrase-level timing summary
    print("\n--- Timing Analysis ---")
    print(f"{'Time (s)':<12} {'Ratio':<8} {'Assessment'}")
    step = max(1, len(slope_times) // 10)
    for i in range(0, len(slope_times), step):
        r = timing_ratio[i]
        if   r > 1.15: assessment = "student TOO SLOW"
        elif r < 0.85: assessment = "student TOO FAST"
        else:          assessment = "on time"
        print(f"{slope_times[i]:<12.2f} {r:<8.2f} {assessment}")

    # ── STEP 7: Plot ──────────────────────────────────────
    fig, axes = plt.subplots(3, 1, figsize=(14, 13))

    # Panel 1 — Before alignment
    axes[0].plot(t_times, t_f0,   color="blue",   alpha=0.8,
                 label=t_stem, linewidth=1.2)
    axes[0].plot(s_times, s_f0,   color="orange", alpha=0.8,
                 label=s_stem, linewidth=1.2)
    axes[0].set_title(f"BEFORE DTW Alignment - {t_stem} vs {s_stem} (same clock time)")
    axes[0].set_ylabel("Frequency (Hz)")
    axes[0].set_ylim(100, 1100)
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # Panel 2 — After alignment (pitch)
    axes[1].plot(teacher_aligned_times, teacher_f0_aligned,
                 color="blue",   alpha=0.8, label=t_stem, linewidth=1.2)
    axes[1].plot(teacher_aligned_times, student_f0_aligned,
                 color="orange", alpha=0.8, label=f"{s_stem} (aligned)",
                 linewidth=1.2)
    axes[1].set_title("AFTER DTW Alignment - Pitch (same musical moment)")
    axes[1].set_ylabel("Frequency (Hz)")
    axes[1].set_ylim(100, 1100)
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    # Panel 3 — Timing ratio
    axes[2].axhline(1.0, color="green", linewidth=1.5, linestyle="--", label="perfect sync")
    axes[2].axhspan(0.85, 1.15, alpha=0.1, color="green", label="on-time zone (+-15%)")
    axes[2].plot(slope_times, timing_ratio, color="purple", linewidth=1.5,
                 label="timing ratio")
    axes[2].fill_between(slope_times, 1.0, timing_ratio,
                         where=(timing_ratio > 1.15), color="red",   alpha=0.3,
                         label="student too slow")
    axes[2].fill_between(slope_times, 1.0, timing_ratio,
                         where=(timing_ratio < 0.85), color="blue",  alpha=0.3,
                         label="student too fast")
    axes[2].set_title("Timing Ratio (student frames / teacher frames) — 1.0 = perfect sync")
    axes[2].set_ylabel("Ratio")
    axes[2].set_xlabel("Teacher Time (s)")
    axes[2].set_ylim(0.3, 2.0)
    axes[2].legend(fontsize=8)
    axes[2].grid(True, alpha=0.3)

    plt.tight_layout()
    os.makedirs(os.path.dirname(out_img), exist_ok=True)
    plt.savefig(out_img, dpi=200)
    plt.close()
    print(f"\nSaved: {out_img}")

if __name__ == "__main__":
    main()