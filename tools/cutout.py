import os, sys, json, glob
import numpy as np, onnxruntime
from PIL import Image

SP, REPO = sys.argv[1], sys.argv[2]
OUT = os.path.join(REPO, "img", "menu"); os.makedirs(OUT, exist_ok=True)
sess = onnxruntime.InferenceSession(os.path.join(SP, "u2net.onnx"), providers=["CPUExecutionProvider"])
inp = sess.get_inputs()[0].name
MEAN = np.array([0.485,0.456,0.406], np.float32); STD = np.array([0.229,0.224,0.225], np.float32)

def salient(img):
    x = np.array(img.convert("RGB").resize((320,320), Image.LANCZOS), np.float32)/255.0
    x = ((x-MEAN)/STD).transpose(2,0,1)[None]
    d = sess.run(None, {inp: x})[0][0,0]
    d = (d-d.min())/(d.max()-d.min()+1e-8)
    return Image.fromarray((d*255).astype(np.uint8),"L").resize(img.size, Image.LANCZOS)

rep=[]
files = sorted(glob.glob(os.path.join(SP,"src","*.jpg")))
for i,f in enumerate(files,1):
    pid = os.path.splitext(os.path.basename(f))[0]
    img = Image.open(f).convert("RGB")
    a = np.array(salient(img), np.float32)/255.0
    # Firm up the edge. A soft U2Net matte over a cream card reads as a grey
    # halo instead of a clean cut-out.
    a = np.clip((a-0.35)/0.30, 0, 1)**0.9
    cover = float((a>0.5).mean())
    alpha = Image.fromarray((a*255).astype(np.uint8),"L")
    out = img.convert("RGBA"); out.putalpha(alpha)
    bb = alpha.point(lambda p: 255 if p>12 else 0).getbbox()
    if bb:
        pad = int(max(out.size)*0.02)
        out = out.crop((max(0,bb[0]-pad), max(0,bb[1]-pad),
                        min(out.width,bb[2]+pad), min(out.height,bb[3]+pad)))
    out.thumbnail((460,460), Image.LANCZOS)
    dst = os.path.join(OUT, pid+".png")
    out.save(dst,"PNG",optimize=True)
    kb = os.path.getsize(dst)//1024
    rep.append({"id":pid,"kb":kb,"cover":round(cover,3),"w":out.size[0],"h":out.size[1]})
    print(f"  {i:2}/{len(files)} {pid:15} {out.size[0]}x{out.size[1]} {kb:4}KB cover={cover:.2f}")
json.dump(rep, open(os.path.join(SP,"cut-report.json"),"w"), indent=1)
ok=[r for r in rep if r["kb"]]
print(f"\n{len(ok)} cut  |  {sum(r['kb'] for r in ok)}KB total")
# flag the suspicious ones: almost-everything or almost-nothing selected
bad=[r["id"] for r in rep if r["cover"]>0.72 or r["cover"]<0.06]
print("needs review:", bad if bad else "none")
