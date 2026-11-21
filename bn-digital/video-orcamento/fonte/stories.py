# Junta trechos de um vídeo numa versão curta para Stories (máx. 60 s), com fusão suave entre os trechos.
# uso: stories.py <entrada.mp4> <saida.mp4> "inicio:fim:congela,inicio:fim:congela,..."
# "congela" (s) segura o 1º quadro já revelado da cena enquanto o som começa um pouco antes,
# para a fusão não pegar a transição original nem cortar a 1ª sílaba da voz.
import subprocess, sys
src, out, spec = sys.argv[1], sys.argv[2], sys.argv[3]
segs = [tuple(float(x) for x in s.split(":")) for s in spec.split(",")]
X = 0.3  # duração da fusão
fc, vs, as_ = [], [], []
for i, (a, b, f) in enumerate(segs):
    pad = f",tpad=start_duration={f}:start_mode=clone" if f > 0 else ""
    fc.append(f"[0:v]trim=start={a + f}:end={b},setpts=PTS-STARTPTS{pad},fps=30,format=yuv420p[v{i}]")
    fc.append(f"[0:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS[a{i}]")
v, a_, dur = "v0", "a0", segs[0][1] - segs[0][0]
for i in range(1, len(segs)):
    d = segs[i][1] - segs[i][0]
    fc.append(f"[{v}][v{i}]xfade=transition=fade:duration={X}:offset={dur - X:.3f}[vx{i}]")
    fc.append(f"[{a_}][a{i}]acrossfade=d={X}[ax{i}]")
    v, a_, dur = f"vx{i}", f"ax{i}", dur + d - X
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-filter_complex", ";".join(fc), "-map", f"[{v}]", "-map", f"[{a_}]",
                "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out], check=True)
print(f"{out}: {dur:.1f} s" + ("  (ATENÇÃO: passa de 60 s)" if dur > 60 else ""))
