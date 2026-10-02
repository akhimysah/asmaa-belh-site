#!/usr/bin/env python3
"""Contrôle qualité du site — lancé à chaque publication (GitHub Actions) ou à la main :
    python3 tools/check.py
Vérifie : liens internes, ancres, images, textes alternatifs, titres et descriptions,
versions WebP, absence de ressources externes (Google Fonts, images Amazon), JSON-LD valide."""
import glob, json, os, re, sys
from html.parser import HTMLParser

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PAGES = sorted(glob.glob("*.html"))
ERR, WARN = [], []

class P(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids = set(); self.refs = []; self.imgs = []; self.h1 = 0
        self.title = False; self.desc = False; self.sources = []
    def handle_starttag(self, tag, a):
        a = dict(a)
        if "id" in a: self.ids.add(a["id"])
        for k in ("href", "src", "poster"):
            if k in a and a[k]: self.refs.append((tag, k, a[k]))
        if tag == "source" and "srcset" in a: self.sources.append(a["srcset"].split()[0])
        if tag == "img": self.imgs.append(a)
        if tag == "h1": self.h1 += 1
        if tag == "title": self.title = True
        if tag == "meta" and a.get("name") == "description" and a.get("content"): self.desc = True

parsed = {}
for f in PAGES:
    p = P(); p.feed(open(f, encoding="utf-8").read()); parsed[f] = p
js = open("assets/js/main.js", encoding="utf-8").read()
js_refs = re.findall(r'(?:href|src|srcset)="([^"$]+)"', js)

def local(path):
    return not re.match(r"^(https?:|mailto:|tel:|data:|#|/asmaa-belh-site/)", path)

for f, p in parsed.items():
    if not p.title: ERR.append(f"{f} : pas de <title>")
    if not p.desc and f not in ("404.html",): WARN.append(f"{f} : pas de meta description")
    if p.h1 != 1 and f not in ("directions.html",): WARN.append(f"{f} : {p.h1} titre(s) h1")
    for tag, k, ref in p.refs:
        if "fonts.googleapis" in ref or "media-amazon" in ref:
            ERR.append(f"{f} : ressource externe interdite {ref}")
        if not local(ref): continue
        path, _, frag = ref.partition("#"); path = path.split("?")[0]
        if path and not os.path.exists(path): ERR.append(f"{f} : fichier introuvable {ref}")
        target = path or f
        if frag and target.endswith(".html") and target in parsed and frag not in parsed[target].ids and frag != "contenu":
            ERR.append(f"{f} : ancre introuvable {ref}")
    for src in p.sources:
        if local(src) and not os.path.exists(src.split("?")[0]): ERR.append(f"{f} : WebP introuvable {src}")
    for img in p.imgs:
        if "alt" not in img: ERR.append(f"{f} : image sans texte alternatif {img.get('src')}")
    for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>', open(f, encoding="utf-8").read(), re.S):
        try: json.loads(m)
        except Exception as e: ERR.append(f"{f} : JSON-LD invalide ({e})")

for ref in js_refs:
    path = ref.split("#")[0].split("?")[0]
    if local(ref) and path and not os.path.exists(path): ERR.append(f"main.js : fichier introuvable {ref}")

for jpg in glob.glob("assets/img/**/*.jpg", recursive=True):
    if not jpg.endswith("og-image.jpg") and not os.path.exists(jpg[:-4] + ".webp"):
        WARN.append(f"version WebP manquante pour {jpg}")

print(f"{len(PAGES)} pages contrôlées")
for w in WARN: print("  attention :", w)
for e in ERR: print("  ERREUR    :", e)
print("OK" if not ERR else f"{len(ERR)} erreur(s)")
sys.exit(1 if ERR else 0)
