import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { PiggyBank, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { coinFrame, COIN_AUDIO_DURATION, COIN_IMPACTS } from "@/lib/coin-timeline";

const COIN_AUDIO_URL = "/coin-sound.mp3";

export type PiggyCelebrationHandle = { prepare: () => void; play: (message?: string) => void };

export function PiggyCelebration({ ref }: { ref: Ref<PiggyCelebrationHandle> }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const context = useRef<AudioContext | null>(null);
  const buffer = useRef<Promise<AudioBuffer | null> | null>(null);
  const source = useRef<AudioBufferSourceNode | null>(null);
  const frame = useRef(0);
  const generation = useRef(0);
  const coins = useRef<(HTMLSpanElement | null)[]>([]);
  const piggy = useRef<SVGSVGElement | null>(null);

  function dismiss() {
    generation.current += 1;
    cancelAnimationFrame(frame.current);
    source.current?.stop();
    source.current = null;
    setVisible(false);
  }

  function prepare() {
    if (!context.current) {
      context.current = new AudioContext();
      const audioContext = context.current;
      buffer.current = fetch(COIN_AUDIO_URL)
        .then((response) => { if (!response.ok) throw new Error("Audio unavailable"); return response.arrayBuffer(); })
        .then((data) => audioContext.decodeAudioData(data))
        .catch(() => null);
    }
    void context.current.resume().catch(() => {});
  }

  async function play(customMessage?: string) {
    dismiss();
    setMessage(customMessage ?? null);
    const currentGeneration = generation.current;
    prepare();
    const decoded = await buffer.current;
    if (generation.current !== currentGeneration) return;
    const audioContext = context.current;
    const hasSound = Boolean(decoded && audioContext?.state === "running");
    const startedAt = hasSound && audioContext ? audioContext.currentTime : performance.now() / 1000;
    const duration = decoded?.duration ?? COIN_AUDIO_DURATION;
    if (hasSound && decoded && audioContext) {
      const sound = audioContext.createBufferSource();
      sound.buffer = decoded;
      sound.connect(audioContext.destination);
      source.current = sound;
      sound.start(startedAt);
    }
    setVisible(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function tick() {
      if (generation.current !== currentGeneration) return;
      const elapsed = (hasSound && audioContext ? audioContext.currentTime : performance.now() / 1000) - startedAt;
      if (elapsed >= duration + 0.2) { dismiss(); return; }
      const state = coinFrame(elapsed);
      coins.current.forEach((element, index) => {
        const coin = state.coins[index];
        if (!element || !coin) return;
        element.style.opacity = reduced ? "1" : coin.visible ? "1" : "0";
        const offset = (index - 1) * 38;
        element.style.transform = reduced ? `translate(${offset}px, 30px)` : `translate(${offset * (1 - coin.progress)}px, ${coin.progress * 109}px) rotate(${coin.progress * 360}deg) scale(${1 - coin.progress * 0.45})`;
      });
      if (piggy.current) piggy.current.style.transform = `translateX(-50%) scale(${reduced ? 1 : 1 + state.bounce * 0.08})`;
      frame.current = requestAnimationFrame(tick);
    }
    frame.current = requestAnimationFrame(tick);
  }

  useImperativeHandle(ref, () => ({ prepare, play: (message?: string) => { void play(message); } }));
  useEffect(() => () => {
    generation.current += 1;
    cancelAnimationFrame(frame.current);
    source.current?.stop();
    void context.current?.close();
  }, []);

  if (!visible) return null;
  return (
    <div className="piggy-celebration fixed inset-0 z-50 grid place-items-center bg-foreground/25 px-4" role="status" aria-live="polite">
      <div className="relative flex w-full max-w-xs flex-col items-center rounded-md border border-border bg-card px-6 pb-7 pt-12 text-center shadow-xl">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={dismiss} aria-label="Cerrar animación" title="Cerrar"><X /></Button>
        <div className="piggy-scene relative mb-4 h-32 w-44" aria-hidden="true">
          {COIN_IMPACTS.map((impact, index) => <span key={impact} ref={(element) => { coins.current[index] = element; }} className="falling-coin">€</span>)}
          <PiggyBank ref={piggy} className="piggy-bank absolute bottom-0 left-1/2 size-28 -translate-x-1/2 text-primary" strokeWidth={1.7} />
        </div>
        <p className="font-display text-2xl font-bold break-words">{message ?? "¡A la hucha!"}</p>
        <p className="mt-1 text-sm text-muted-foreground">{message ? "El dinero ya está en la hucha." : "La multa se ha guardado correctamente."}</p>
      </div>
    </div>
  );
}