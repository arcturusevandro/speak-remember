import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  audioBase64: z.string().min(1000, "Gravação vazia."),
  mimeType: z.string().default("audio/wav"),
});

export interface TranscriptionResult {
  text: string;
}

/**
 * Transcrição de voz. O áudio é enviado do navegador em WAV (16 kHz mono)
 * e transcrito no servidor — a chave nunca chega ao cliente.
 */
export const transcribeAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }): Promise<TranscriptionResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      throw new Error("A transcrição de voz ainda não está configurada neste ambiente.");
    }

    const bytes = Uint8Array.from(atob(data.audioBase64), (char) => char.charCodeAt(0));
    if (bytes.byteLength > 20 * 1024 * 1024) {
      throw new Error("Gravação muito longa. Grave um trecho menor.");
    }

    const form = new FormData();
    form.append("model", "openai/gpt-4o-mini-transcribe");
    form.append("file", new Blob([bytes], { type: "audio/wav" }), "gravacao.wav");
    form.append("language", "pt");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      if (response.status === 429) {
        throw new Error("Muitas transcrições seguidas. Aguarde alguns segundos e tente de novo.");
      }
      if (response.status === 402) {
        throw new Error("Os créditos de IA do espaço de trabalho acabaram.");
      }
      throw new Error(`Não consegui transcrever o áudio (${response.status}). ${detail.slice(0, 200)}`);
    }

    const payload = (await response.json()) as { text?: string };
    const text = (payload.text ?? "").trim();
    if (!text) throw new Error("Não entendi o áudio. Tente falar um pouco mais alto.");
    return { text };
  });
