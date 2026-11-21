# Gera um trecho de locução com o Gemini TTS (WAV 24 kHz mono).
# uso: tts.py <voz> <saida.wav> "<texto>" ["<estilo>"]
import json, sys, subprocess, base64
voz, out, texto = sys.argv[1], sys.argv[2], sys.argv[3]
estilo = sys.argv[4] if len(sys.argv) > 4 else ""
body = {"contents": [{"parts": [{"text": (estilo + " " if estilo else "") + texto}]}],
        "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voz}}}}}
r = subprocess.run(["curl", "-s", "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent",
  "-H", "x-goog-api-key: dummy", "-H", "Content-Type: application/json", "--data-binary", "@-"], input=json.dumps(body), capture_output=True, text=True)
d = json.loads(r.stdout)
if "error" in d: sys.exit("erro: " + d["error"].get("message", ""))
open(out, "wb").write(base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]))
