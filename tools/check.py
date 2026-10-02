#!/usr/bin/env python3
"""Contrôle qualité du site — lancé à chaque publication (GitHub Actions) ou à la main :
    python3 tools/check.py
Vérifie : liens internes, ancres, images, textes alternatifs, titres et descriptions,
versions WebP, absence de ressources externes (Google Fonts, images Amazon), JSON-LD valide.
Avec --externes : vérifie aussi que les liens vers d'autres sites répondent (vidéos Dropbox,
fiches Amazon…). Un lien disparu (404/410) est une erreur ; un refus temporaire, un avertissement."""
import glob, json, os, re, sys, urllib.request, urllib.error
from html.parser import HTMLParser

EXTERNES = "--externes" in sys.argv

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

# --- Liens externes (option --externes) ------------------------------------
def verifier_externe(url):
    """Renvoie (code, motif). Vérifie le contenu réel pour Dropbox et Amazon, qui répondent 200
    même quand le fichier ou le produit n'existe plus."""
    ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
    try:
        if "dropbox.com" in url:
            req = urllib.request.Request(url, headers={"User-Agent": ua, "Range": "bytes=0-0"})
            with urllib.request.urlopen(req, timeout=25) as r:
                total = (r.headers.get("Content-Range") or "").rpartition("/")[2]
                if r.status == 206 and total.isdigit() and int(total) > 1_000_000:
                    return r.status, f"vidéo de {int(total) // 1_000_000} Mo"
                return 404, "le fichier n'est plus partagé (page Dropbox à la place de la vidéo)"
        if "amazon." in url:
            req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept-Language": "fr-FR,fr"})
            with urllib.request.urlopen(req, timeout=25) as r:
                page = r.read(2_500_000).decode("utf-8", "ignore")
            if 'id="productTitle"' in page: return r.status, "fiche produit présente"
            if "captcha" in page.lower(): return 503, "Amazon demande une vérification anti-robot"
            return 404, "fiche produit introuvable"
        for methode in ("HEAD", "GET"):
            req = urllib.request.Request(url, method=methode, headers={"User-Agent": ua, "Range": "bytes=0-0"})
            try:
                with urllib.request.urlopen(req, timeout=25) as r:
                    return r.status, ""
            except urllib.error.HTTPError as e:
                if methode == "HEAD" and e.code in (403, 405, 429, 503): continue
                return e.code, ""
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:
        return f"injoignable ({e.__class__.__name__})", ""
    return "injoignable", ""

if EXTERNES:
    ignores = ("akhimysah.github.io", "schema.org", "cnil.fr", "www.sitemaps.org")
    urls = {}
    for f in PAGES:
        for m in re.findall(r'(?:href|src)="(https?://[^"]+)"', open(f, encoding="utf-8").read()):
            u = m.replace("&amp;", "&")
            if not any(i in u for i in ignores): urls.setdefault(u, set()).add(f)
    print(f"\n{len(urls)} liens externes vérifiés")
    for u, pages in sorted(urls.items()):
        code, motif = verifier_externe(u)
        court = re.sub(r"\?.*", "", u)[:80] + (f" — {motif}" if motif else "")
        if isinstance(code, int) and code < 400: print(f"  ok {code}  {court}")
        elif code in (404, 410): ERR.append(f"lien externe disparu ({code}) : {court} — dans {', '.join(sorted(pages))}")
        else: WARN.append(f"lien externe à surveiller ({code}) : {court}")

print(f"{len(PAGES)} pages contrôlées")
for w in WARN: print("  attention :", w)
for e in ERR: print("  ERREUR    :", e)
print("OK" if not ERR else f"{len(ERR)} erreur(s)")
sys.exit(1 if ERR else 0)
