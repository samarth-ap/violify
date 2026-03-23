"""
Violify Live Swara Detector — WebSocket Server
Run:  uvicorn swara_server:app --reload --port 8000
      (from the dsp/scripts/ directory)

The React UI connects to ws://localhost:8000/ws and receives
JSON frames describing the current detected swara in real time.
"""

import asyncio
import json

import librosa
import numpy as np
import sounddevice as sd
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# ── CONFIG ──────────────────────────────────────────────────────────────────
SAMPLE_RATE   = 22050
FRAME_SIZE    = 2048
FMIN          = librosa.note_to_hz("G3")   # 196 Hz
FMAX          = librosa.note_to_hz("E6")   # 1319 Hz
RMS_THRESHOLD = 0.01

# Sa = E4
SA_HZ = librosa.note_to_hz("E4")  # 329.63 Hz

# Carnatic swara map: (cents from Sa, name)
SWARAS = [
    (0,    "S"),
    (100,  "R1"),
    (200,  "R2"),
    (300,  "G2"),
    (400,  "G3"),
    (500,  "M1"),
    (600,  "M2"),
    (700,  "P"),
    (800,  "D1"),
    (900,  "D2"),
    (1000, "N2"),
    (1100, "N3"),
    (1200, "S'"),
]

# ── HELPERS ──────────────────────────────────────────────────────────────────
def hz_to_cents(hz: float, reference_hz: float) -> float:
    return 1200 * np.log2(hz / reference_hz)


def nearest_swara(hz: float):
    cents     = hz_to_cents(hz, SA_HZ)
    cents_mod = cents % 1200

    closest   = min(SWARAS, key=lambda s: abs(cents_mod - s[0]))
    cents_off = cents_mod - closest[0]

    octave = int(cents // 1200)
    if octave < 0:
        octave_label = "lower"
    elif octave == 0:
        octave_label = "middle"
    else:
        octave_label = "upper"

    return closest[1], round(float(cents_off), 1), octave_label


# ── FASTAPI APP ───────────────────────────────────────────────────────────────
app = FastAPI(title="Violify Swara Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── WEBSOCKET ENDPOINT ────────────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    event_loop = asyncio.get_event_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def audio_callback(indata, frames, time, status):
        audio = indata[:, 0].astype(np.float32)

        rms = np.sqrt(np.mean(audio ** 2))
        if rms < RMS_THRESHOLD:
            payload = {"type": "silent"}
        else:
            f0, voiced_flag, _ = librosa.pyin(
                audio, fmin=FMIN, fmax=FMAX, sr=SAMPLE_RATE
            )
            voiced_f0 = f0[voiced_flag]

            if len(voiced_f0) == 0:
                payload = {"type": "no_pitch"}
            else:
                median_f0 = float(np.median(voiced_f0))
                swara, cents_off, octave = nearest_swara(median_f0)

                if abs(cents_off) <= 10:
                    intonation = "in_tune"
                elif cents_off > 10:
                    intonation = "sharp"
                else:
                    intonation = "flat"

                payload = {
                    "type":       "swara",
                    "hz":         round(median_f0, 1),
                    "swara":      swara,
                    "cents_off":  cents_off,
                    "intonation": intonation,
                    "octave":     octave,
                }

        asyncio.run_coroutine_threadsafe(queue.put(payload), event_loop)

    stream = sd.InputStream(
        samplerate=SAMPLE_RATE,
        blocksize=FRAME_SIZE,
        channels=1,
        callback=audio_callback,
    )

    try:
        with stream:
            while True:
                payload = await queue.get()
                await websocket.send_text(json.dumps(payload))
    except WebSocketDisconnect:
        pass


# ── ENTRY POINT ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("swara_server:app", host="0.0.0.0", port=8000, reload=False)
