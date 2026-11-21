# Transcreve um WAV com o Gemini e devolve o texto com tempos (para conferir a locução).
import json, sys, subprocess, base64
path = sys.argv[1]
b64 = base64.b64encode(open(path, "rb").read()).decode()
body = {"contents": [{"parts": [{"inline_data": {"mime_type": "audio/wav", "data": b64}},
  {"text": "Transcreva exatamente o que é falado neste áudio, em português, com o tempo (segundos) de início de cada frase. Formato: [s.s] frase"}]}]}
r = subprocess.run(["curl", "-s", "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent", "-H", "x-goog-api-key: dummy",
  "-H", "Content-Type: application/json", "--data-binary", "@-"], input=json.dumps(body), capture_output=True, text=True)
d = json.loads(r.stdout)
print(d["candidates"][0]["content"]["parts"][0]["text"] if "candidates" in d else d)
