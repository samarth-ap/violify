import { useState, useEffect, useRef } from 'react';
import { Music2, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

// ── Types ────────────────────────────────────────────────────────────────────
type Intonation = 'in_tune' | 'sharp' | 'flat';

interface SwaraFrame {
  type: 'swara';
  hz: number;
  swara: string;
  cents_off: number;
  intonation: Intonation;
  octave: string;
}

interface SilentFrame  { type: 'silent' }
interface NoPitchFrame { type: 'no_pitch' }

type Frame = SwaraFrame | SilentFrame | NoPitchFrame;

const WS_URL = 'ws://localhost:8000/ws';

// ── Component ────────────────────────────────────────────────────────────────
export default function SwaraDetector() {
  const [connected, setConnected]   = useState(false);
  const [frame, setFrame]           = useState<Frame | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    setError(null);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen    = () => setConnected(true);
    ws.onmessage = (e) => setFrame(JSON.parse(e.data) as Frame);
    ws.onerror   = () => setError('Could not connect — is the Python server running?');
    ws.onclose   = () => { setConnected(false); wsRef.current = null; };
  };

  const disconnect = () => wsRef.current?.close();

  // Clean up on unmount
  useEffect(() => () => wsRef.current?.close(), []);

  // ── Derived display values ────────────────────────────────────────────────
  const isSwara    = frame?.type === 'swara';
  const swaraFrame = isSwara ? (frame as SwaraFrame) : null;

  const intonationMeta: Record<Intonation, { label: string; color: string; bar: string }> = {
    in_tune: { label: '✓ In Tune', color: 'text-green-500',  bar: 'bg-green-500'  },
    sharp:   { label: '↑ Sharp',   color: 'text-red-400',    bar: 'bg-red-400'    },
    flat:    { label: '↓ Flat',    color: 'text-blue-400',   bar: 'bg-blue-400'   },
  };

  const meta = swaraFrame ? intonationMeta[swaraFrame.intonation] : null;

  // Map −50..+50 cents → 0..100 % for the gauge needle
  const gaugePercent = swaraFrame
    ? Math.min(100, Math.max(0, ((swaraFrame.cents_off + 50) / 100) * 100))
    : 50;

  const statusLine = !frame
    ? null
    : frame.type === 'silent'
    ? 'Silent'
    : frame.type === 'no_pitch'
    ? 'No pitch detected'
    : `${swaraFrame!.hz} Hz · ${swaraFrame!.octave} octave`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-black">
            <Music2 className="text-[#FF901F]" size={20} />
            <span className="font-bold">Live Swara Detector</span>
          </CardTitle>
          <Button
            size="sm"
            onClick={connected ? disconnect : connect}
            className={
              connected
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#FF901F] hover:bg-[#E67F0C] text-white'
            }
          >
            {connected ? (
              <><WifiOff size={14} className="mr-1" />Disconnect</>
            ) : (
              <><Wifi size={14} className="mr-1" />Connect</>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Error state */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Idle state */}
        {!connected && !error && (
          <p className="text-gray-400 text-sm text-center">
            Run <code className="text-xs bg-gray-100 px-1 rounded">uvicorn swara_server:app</code>, then click Connect.
          </p>
        )}

        {/* Live state */}
        {connected && (
          <div className="space-y-4">
            {/* Large swara name */}
            <div className="text-center">
              <div className="text-7xl font-bold text-[#FF901F] tracking-wide leading-none">
                {isSwara ? swaraFrame!.swara : '—'}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                {statusLine ?? '\u00a0'}
              </div>
            </div>

            {/* Cents gauge — only when a pitch is detected */}
            {isSwara && meta && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400 px-1">
                  <span>Flat</span>
                  <span>In Tune</span>
                  <span>Sharp</span>
                </div>

                {/* Track */}
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  {/* Centre line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300" />
                  {/* Needle */}
                  <div
                    className={`absolute top-1 bottom-1 w-2 rounded-full transition-all duration-150 ${meta.bar}`}
                    style={{ left: `calc(${gaugePercent}% - 4px)` }}
                  />
                </div>

                <div className="text-center text-sm">
                  <span className={`font-bold ${meta.color}`}>{meta.label}</span>
                  <span className="text-gray-400 ml-2">
                    ({swaraFrame!.cents_off > 0 ? '+' : ''}{swaraFrame!.cents_off} cents)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
