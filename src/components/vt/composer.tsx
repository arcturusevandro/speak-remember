import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Mic, Square } from "lucide-react";
import { toast } from "sonner";

import { ConfirmationCard } from "@/components/vt/confirmation-card";
import { parseReminder, type ParsedReminder } from "@/lib/nlp/parse-reminder";
import type { ReminderDraft } from "@/lib/reminders/types";
import { useRecorder } from "@/lib/voice/use-recorder";
import { blobToBase64 } from "@/lib/voice/wav";
import { transcribeAudio } from "@/lib/voice/transcribe.functions";

interface Props {
  saving: boolean;
  onConfirm: (draft: ReminderDraft) => Promise<void> | void;
}

type Phase = "idle" | "transcribing";

export function Composer({ saving, onConfirm }: Props) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedReminder | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);

  const recorder = useRecorder();
  const transcribe = useServerFn(transcribeAudio);

  function interpret(value: string) {
    const clean = value.trim();
    if (!clean) {
      toast.error("Escreva ou fale o que você não quer esquecer.");
      return;
    }
    setParsed(parseReminder(clean));
  }

  async function toggleRecording() {
    if (recorder.state === "recording") {
      const blob = await recorder.stop();
      if (!blob || blob.size < 4000) {
        toast.error("A gravação ficou vazia. Tente novamente falando mais perto do microfone.");
        return;
      }
      setPhase("transcribing");
      try {
        const audioBase64 = await blobToBase64(blob);
        const result = await transcribe({ data: { audioBase64, mimeType: "audio/wav" } });
        setTranscript(result.text);
        setText(result.text);
        setParsed(parseReminder(result.text));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não consegui transcrever o áudio.");
      } finally {
        setPhase("idle");
      }
      return;
    }
    setTranscript(null);
    await recorder.start();
  }

  async function handleConfirm(draft: ReminderDraft) {
    await onConfirm(draft);
    setParsed(null);
    setText("");
    setTranscript(null);
  }

  const recording = recorder.state === "recording";
  const busy = phase === "transcribing" || recorder.state === "requesting";

  return (
    <section>
      <div className="mt-7 animate-vt-rise rounded-3xl border border-border bg-surface p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="min-w-0 flex-1">
            <label htmlFor="vt-input" className="sr-only">
              O que você não quer esquecer?
            </label>
            <textarea
              id="vt-input"
              rows={4}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) interpret(text);
              }}
              placeholder="Ex.: Me lembra amanhã às 10h de ligar para o Carlos."
              className="w-full resize-none rounded-2xl border border-border-strong bg-background/70 p-4 text-[15px] text-foreground outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => interpret(text)}
                disabled={saving}
                className="h-10 cursor-pointer rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Criar lembrete
              </button>
              <span className="font-mono text-[11px] text-muted">ou fale</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 rounded-2xl border border-primary/15 bg-primary-soft/60 p-5 lg:w-60 lg:flex-col">
            <div className="relative">
              {recording ? (
                <span className="absolute inset-0 animate-vt-pulse rounded-full bg-primary" />
              ) : null}
              <button
                onClick={toggleRecording}
                disabled={busy}
                aria-label={recording ? "Parar gravação" : "Falar"}
                aria-pressed={recording}
                className="relative grid size-20 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60"
              >
                {phase === "transcribing" ? (
                  <Loader2 className="size-7 animate-spin" />
                ) : recording ? (
                  <Square className="size-6 fill-current" />
                ) : (
                  <Mic className="size-7" />
                )}
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {phase === "transcribing"
                  ? "Transcrevendo…"
                  : recording
                    ? "Gravando…"
                    : recorder.state === "requesting"
                      ? "Permitindo…"
                      : "Falar"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted">
                {recording
                  ? `${String(Math.floor(recorder.seconds / 60)).padStart(2, "0")}:${String(recorder.seconds % 60).padStart(2, "0")} · toque para parar`
                  : "toque para gravar"}
              </p>
            </div>
          </div>
        </div>

        {recording ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3">
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-destructive" />
            <div className="flex h-6 flex-1 items-center gap-[3px]" aria-hidden>
              {Array.from({ length: 28 }).map((_, index) => (
                <span
                  key={index}
                  className="w-[3px] rounded-full bg-primary/70"
                  style={{
                    height: `${Math.max(4, Math.min(24, recorder.level * 90 * (0.5 + Math.abs(Math.sin(index * 1.7)))))}px`,
                  }}
                />
              ))}
            </div>
            <button
              onClick={recorder.cancel}
              className="cursor-pointer font-mono text-[11px] text-muted transition-colors hover:text-foreground"
            >
              cancelar
            </button>
          </div>
        ) : null}

        {recorder.state === "denied" ? (
          <p className="mt-4 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-foreground">
            O microfone foi bloqueado. Libere o acesso nas permissões do navegador ou digite seu
            lembrete no campo acima.
          </p>
        ) : null}

        {recorder.state === "unsupported" ? (
          <p className="mt-4 rounded-2xl border border-border-strong bg-background/70 px-4 py-3 text-sm text-muted">
            Este navegador não permite gravação de áudio. Você ainda pode digitar seu lembrete.
          </p>
        ) : null}

        {transcript ? (
          <div className="mt-4 rounded-2xl border border-border bg-background/70 px-4 py-3">
            <p className="vt-label">Você disse</p>
            <p className="mt-1 text-sm text-foreground">“{transcript}”</p>
          </div>
        ) : null}
      </div>

      {parsed ? (
        <ConfirmationCard
          parsed={parsed}
          saving={saving}
          onConfirm={handleConfirm}
          onDismiss={() => setParsed(null)}
        />
      ) : null}
    </section>
  );
}
