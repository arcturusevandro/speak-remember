import { useCallback, useEffect, useRef, useState } from "react";

import { TARGET_SAMPLE_RATE, downsample, encodeWav, mergeChunks } from "@/lib/voice/wav";

export type RecorderState = "idle" | "requesting" | "recording" | "denied" | "unsupported";

interface RecorderApi {
  state: RecorderState;
  level: number;
  seconds: number;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  cancel: () => void;
}

/**
 * Captura o microfone via Web Audio e devolve um WAV completo (16 kHz mono),
 * formato aceito de forma consistente por qualquer navegador.
 */
export function useRecorder(): RecorderApi {
  const [state, setState] = useState<RecorderState>("idle");
  const [level, setLevel] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const teardown = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (contextRef.current && contextRef.current.state !== "closed") {
      void contextRef.current.close();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    timerRef.current = null;
    setLevel(0);
  }, []);

  useEffect(() => () => teardown(), [teardown]);

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }
    setState("requesting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState("denied");
      return;
    }

    const AudioCtor: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new AudioCtor();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);

    chunksRef.current = [];
    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      chunksRef.current.push(new Float32Array(input));
      let peak = 0;
      for (let i = 0; i < input.length; i += 32) peak = Math.max(peak, Math.abs(input[i]!));
      setLevel(peak);
    };

    source.connect(processor);
    processor.connect(context.destination);

    streamRef.current = stream;
    contextRef.current = context;
    sourceRef.current = source;
    processorRef.current = processor;

    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    setState("recording");
  }, []);

  const stop = useCallback(async (): Promise<Blob | null> => {
    if (state !== "recording") return null;
    const sampleRate = contextRef.current?.sampleRate ?? 44_100;
    const chunks = chunksRef.current;
    teardown();
    setState("idle");
    chunksRef.current = [];
    if (chunks.length === 0) return null;
    const merged = mergeChunks(chunks);
    const resampled = downsample(merged, sampleRate, TARGET_SAMPLE_RATE);
    return encodeWav(resampled, TARGET_SAMPLE_RATE);
  }, [state, teardown]);

  const cancel = useCallback(() => {
    chunksRef.current = [];
    teardown();
    setState("idle");
  }, [teardown]);

  return { state, level, seconds, start, stop, cancel };
}
