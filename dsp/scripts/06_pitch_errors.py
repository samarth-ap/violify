import os
import sys
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from ioaudio import load_audio, normalize_peak
from pitch import extract_f0
from alignment import compute_cqt_features, dtw_align, build_time_map

REPO_ROOT   = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW_DIR     = os.path.join(REPO_ROOT, "dsp", "data", "raw")
FIGURES_DIR = os.path.join(REPO_ROOT, "dsp", "outputs", "figures")
CSV_DIR     = os.path.join(REPO_ROOT, "dsp", "outputs", "pitch_csv")

# ── CARNATIC SWARA MAP (Sa = E) ───────────────────────────
SA_HZ = 329.63
SWARAS = [
    (0,    "S"),  (100, "R1"), (200, "R2"),
    (300,  "G2"), (400, "G3"), (500, "M1"),
    (600,  "M2"), (700, "P"),  (800, "D1"),
    (900,  "D2"), (1000,"N2"), (1100,"N3"),
]

def hz_to_swara(hz):
    if hz <= 0 or np.isnan(hz):
        return "?"
    cents = (1200 * np.log2(hz / SA_HZ)) % 1200
    return min(SWARAS, key=lambda s: abs(cents - s[0]))[1]

def hz_to_cents_error(teacher_hz, student_hz):
    if teacher_hz <= 0 or student_hz <= 0:
        return np.nan
    if np.isnan(teacher_hz) or np.isnan(student_hz):
        return np.nan
    return 1200 * np.log2(student_hz / teacher_hz)

# ── THRESHOLDS ────────────────────────────────────────────
CENTS_THRESHOLD  = 30    # cents off = mistake
MIN_DURATION_SEC = 0.1   # must be off for at least 100ms

def detect_pitch_errors(times, teacher_f0, student_f0, sr=22050):
    errors = []
    in_error = False
    error_start = None
    error_cents = []

    for i, t in enumerate(times):
        cents_err = hz_to_cents_error(teacher_f0[i], student_f0[i])

        if np.isnan(cents_err):
            # silence — close any open error
            if in_error:
                duration = times[i] - error_start
                if duration >= MIN_DURATION_SEC:
                    avg_cents = float(np.nanmean(error_cents))
                    errors.append({
                        "start_s":    round(error_start, 2),
                        "end_s":      round(times[i], 2),
                        "duration_s": round(duration, 2),
                        "cents_error":round(avg_cents, 1),
                        "direction":  "sharp" if avg_cents > 0 else "flat",
                        "teacher_swara": hz_to_swara(teacher_f0[i]),
                    })
                in_error = False
                error_cents = []
            continue

        if abs(cents_err) > CENTS_THRESHOLD:
            if not in_error:
                in_error = True
                error_start = t
                error_cents = []
            error_cents.append(cents_err)
        else:
            if in_error:
                duration = t - error_start
                if duration >= MIN_DURATION_SEC:
                    avg_cents = float(np.nanmean(error_cents))
                    errors.append({
                        "start_s":    round(error_start, 2),
                        "end_s":      round(t, 2),
                        "duration_s": round(duration, 2),
                        "cents_error":round(avg_cents, 1),
                        "direction":  "sharp" if avg_cents > 0 else "flat",
                        "teacher_swara": hz_to_swara(teacher_f0[i]),
                    })
                in_error = False
                error_cents = []

    return errors

def main():
    if len(sys.argv) != 3:
        print("Usage: python 06_pitch_errors.py <teacher_audio> <student_audio>")
        print("Example: python 06_pitch_errors.py teacherrec.wav studentrec.wav")
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

    t_stem  = os.path.splitext(os.path.basename(teacher_path))[0]
    s_stem  = os.path.splitext(os.path.basename(student_path))[0]
    out_img = os.path.join(FIGURES_DIR, f"pitch_errors_{t_stem}_vs_{s_stem}.png")
    out_csv = os.path.join(CSV_DIR, f"pitch_errors_{t_stem}_vs_{s_stem}.csv")

    print("Loading audio...")
    yt, sr = load_audio(teacher_path)
    ys, _  = load_audio(student_path)
    yt, ys = normalize_peak(yt), normalize_peak(ys)

    print("Extracting pitch...")
    t_times, t_f0, _ = extract_f0(yt, sr)
    s_times, s_f0, _ = extract_f0(ys, sr)

    print("Running DTW...")
    t_feat = compute_cqt_features(yt, sr)
    s_feat = compute_cqt_features(ys, sr)
    path, _ = dtw_align(t_feat, s_feat)
    aligned_t, aligned_s = build_time_map(path, sr)

    # Interpolate onto aligned timeline
    t_f0_aligned = np.interp(aligned_t, t_times, np.nan_to_num(t_f0))
    s_f0_aligned = np.interp(aligned_t, s_times, np.nan_to_num(s_f0))

    # Zero out very low values (silence)
    t_f0_aligned[t_f0_aligned < 100] = np.nan
    s_f0_aligned[s_f0_aligned < 100] = np.nan

    print("Detecting pitch errors...")
    errors = detect_pitch_errors(aligned_t, t_f0_aligned, s_f0_aligned, sr)

    # ── PRINT REPORT ─────────────────────────────────────
    print("\n" + "="*55)
    print("  PITCH MISTAKE REPORT")
    print("="*55)
    if not errors:
        print("  No significant pitch errors detected.")
    for e in errors:
        arrow = "↑" if e["direction"] == "sharp" else "↓"
        print(
            f"  {e['start_s']:5.1f}s – {e['end_s']:5.1f}s  │  "
            f"{arrow} {e['direction'].upper():5}  │  "
            f"{e['cents_error']:+.0f} cents  │  "
            f"swara: {e['teacher_swara']}"
        )
    print(f"\n  Total mistakes: {len(errors)}")
    print("="*55)

    # ── SAVE CSV ──────────────────────────────────────────
    df = pd.DataFrame(errors)
    os.makedirs(os.path.dirname(out_csv), exist_ok=True)
    df.to_csv(out_csv, index=False)
    print(f"\nSaved CSV: {out_csv}")

    # ── PLOT ──────────────────────────────────────────────
    cents_curve = np.array([
        hz_to_cents_error(t_f0_aligned[i], s_f0_aligned[i])
        for i in range(len(aligned_t))
    ])

    fig, axes = plt.subplots(2, 1, figsize=(14, 8))

    # Panel 1 — aligned pitch curves
    axes[0].plot(aligned_t, t_f0_aligned, color="blue",
                 label="Teacher", linewidth=1.2, alpha=0.8)
    axes[0].plot(aligned_t, s_f0_aligned, color="orange",
                 label="Student", linewidth=1.2, alpha=0.8)

    # Shade mistake regions
    for e in errors:
        axes[0].axvspan(e["start_s"], e["end_s"],
                        color="red", alpha=0.15)
    axes[0].set_title("Aligned Pitch — red zones = pitch mistakes")
    axes[0].set_ylabel("Frequency (Hz)")
    axes[0].set_ylim(100, 1100)
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # Panel 2 — cents error curve
    axes[1].axhline(0, color="black", linewidth=0.8)
    axes[1].axhline( CENTS_THRESHOLD, color="red",
                     linestyle="--", linewidth=0.8, label=f"+{CENTS_THRESHOLD}¢ threshold")
    axes[1].axhline(-CENTS_THRESHOLD, color="blue",
                     linestyle="--", linewidth=0.8, label=f"-{CENTS_THRESHOLD}¢ threshold")
    axes[1].fill_between(aligned_t, cents_curve, 0,
                         where=cents_curve >  CENTS_THRESHOLD,
                         color="red",  alpha=0.3, label="Sharp")
    axes[1].fill_between(aligned_t, cents_curve, 0,
                         where=cents_curve < -CENTS_THRESHOLD,
                         color="blue", alpha=0.3, label="Flat")
    axes[1].plot(aligned_t, cents_curve, color="gray",
                 linewidth=0.8, alpha=0.7)
    axes[1].set_title("Pitch Error in Cents (student − teacher)")
    axes[1].set_ylabel("Cents")
    axes[1].set_xlabel("Time (s)")
    axes[1].set_ylim(-200, 200)
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    plt.tight_layout()
    os.makedirs(os.path.dirname(out_img), exist_ok=True)
    plt.savefig(out_img, dpi=200)
    plt.close()
    print(f"Saved plot: {out_img}")

if __name__ == "__main__":
    main()