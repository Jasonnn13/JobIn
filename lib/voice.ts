"use client";

import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export type VAStatus = "idle" | "listening" | "thinking" | "speaking" | "error";

// Azure tokens live 10 minutes; refresh a minute early.
const TOKEN_TTL_MS = 9 * 60 * 1000;
let cachedToken: { token: string; region: string; expiresAt: number } | null = null;

export async function createSpeechConfig() {
  if (!cachedToken || Date.now() > cachedToken.expiresAt) {
    // Same-origin request: the session cookie authenticates it.
    const res = await fetch("/api/speech/token");
    if (!res.ok) return null;
    const { token, region } = await res.json();
    cachedToken = { token, region, expiresAt: Date.now() + TOKEN_TTL_MS };
  }
  const cfg = SpeechSDK.SpeechConfig.fromAuthorizationToken(cachedToken.token, cachedToken.region);
  cfg.speechRecognitionLanguage = "en-US";
  cfg.speechSynthesisLanguage = "en-US";
  cfg.speechSynthesisVoiceName = "en-US-JennyNeural";
  return cfg;
}

export async function recognizeOnce(speechConfig: SpeechSDK.SpeechConfig): Promise<string | null> {
  return new Promise((resolve) => {
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    recognizer.recognizeOnceAsync((result) => {
      try {
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          resolve(result.text?.trim() || "");
        } else {
          resolve(null);
        }
      } finally {
        recognizer.close();
      }
    });
  });
}

export async function speak(speechConfig: SpeechSDK.SpeechConfig, text: string): Promise<void> {
  return new Promise((resolve) => {
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
    synthesizer.speakTextAsync(
      text,
      () => {
        synthesizer.close();
        resolve();
      },
      () => {
        synthesizer.close();
        resolve();
      }
    );
  });
}
