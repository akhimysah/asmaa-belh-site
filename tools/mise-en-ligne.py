#!/usr/bin/env python3
"""Passage du site de « brouillon » à « en ligne ».

Simulation (ne modifie rien, affiche ce qui serait fait) :
    python3 tools/mise-en-ligne.py

Avec un nom de domaine définitif :
    python3 tools/mise-en-ligne.py --domaine https://www.asmaabelh.com

Application réelle :
    python3 tools/mise-en-ligne.py --domaine https://www.asmaabelh.com --confirmer

Ce que fait le script :
  1. SITE.brouillon = false dans main.js (plus de bandeau ni de repères « À fournir »)
  2. retire la balise noindex des pages publiques (a-fournir.html et 404.html restent masquées)
  3. robots.txt autorise l'indexation et pointe vers le plan du site
  4. génère sitemap.xml
  5. si --domaine : remplace l'adresse GitHub Pages dans les liens canoniques, Open Graph
     et données structurées, et écrit le fichier CNAME pour GitHub Pages
  6. signale les zones « À fournir » encore présentes (à traiter avant le lancement)
"""
import argparse, datetime, glob, os, re, sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
ACTUEL = "https://akhimysah.github.io/asmaa-belh-site/"
CACHEES = {"a-fournir.html", "404.html"}

ap = argparse.ArgumentParser(description="Passer le site en production")
ap.add_argument("--domaine", help="adresse définitive, ex. https://www.asmaabelh.com")
ap.add_argument("--confirmer", action="store_true", help="appliquer réellement les changements")
args = ap.parse_args()

base = (args.domaine.rstrip("/") + "/") if args.domaine else ACTUEL
if not re.match(r"^https://[a-z0-9.-]+\.[a-z]{2,}(/[\w./-]*)?/$", base):
    sys.exit(f"Adresse invalide : {base} (attendu : https://domaine.tld)")

ecritures = {}
def ecrire(chemin, contenu):
    ancien = open(chemin, encoding="utf-8").read() if os.path.exists(chemin) else None
    if ancien != contenu: ecritures[chemin] = contenu

pages = sorted(glob.glob("*.html"))
publiques = [p for p in pages if p not in CACHEES]

# 1. main.js
js = open("assets/js/main.js", encoding="utf-8").read()
ecrire("assets/js/main.js", js.replace("const SITE = { brouillon: true };", "const SITE = { brouillon: false };"))

# 2 + 5. pages
restants = {}
for p in pages:
    s = open(p, encoding="utf-8").read()
    if p not in CACHEES:
        s = re.sub(r'\n?\s*<meta name="robots" content="noindex, nofollow">', "", s)
    if base != ACTUEL:
        s = s.replace(ACTUEL, base)
        if p == "404.html":
            s = s.replace('<base href="/asmaa-belh-site/">', '<base href="/">')
    ecrire(p, s)
    if p not in CACHEES:
        n = len(re.findall(r'class="(?:ph|img-ph)[ "]', s))
        if n: restants[p] = n

# 3. robots.txt
ecrire("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /a-fournir.html\n\nSitemap: {base}sitemap.xml\n")

# 4. sitemap.xml
jour = datetime.date.today().isoformat()
urls = "\n".join(
    f"  <url><loc>{base}{'' if p == 'index.html' else p}</loc><lastmod>{jour}</lastmod>"
    f"<priority>{'1.0' if p == 'index.html' else '0.7'}</priority></url>"
    for p in publiques)
ecrire("sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n')

# 5. CNAME
if base != ACTUEL and not base.endswith(".github.io/"):
    ecrire("CNAME", re.sub(r"^https://|/$", "", base) + "\n")

# Rapport
print(("APPLICATION" if args.confirmer else "SIMULATION") + f" — adresse du site : {base}")
for c in sorted(ecritures): print(f"  modifié : {c}")
if not ecritures: print("  rien à changer (déjà en production ?)")
if restants:
    total = sum(restants.values())
    print(f"\n  ATTENTION : {total} zones « À fournir » restent sur {len(restants)} pages :")
    for p, n in restants.items(): print(f"    {p:28s} {n}")
    print("  Elles seront masquées en ligne, mais le contenu manquera. Voir a-fournir.html.")
if args.confirmer:
    for c, contenu in ecritures.items(): open(c, "w", encoding="utf-8").write(contenu)
    print("\nFait. Vérifier avec : python3 tools/check.py  puis publier (git add, commit, push).")
    if base != ACTUEL:
        print("Penser à déclarer le domaine chez le registrar (enregistrement CNAME vers akhimysah.github.io)")
        print("et dans GitHub : Settings > Pages > Custom domain.")
else:
    print("\nAucun fichier modifié. Ajouter --confirmer pour appliquer.")
