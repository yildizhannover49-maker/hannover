# YILDIZ – Haus des Fleisches & Grills · Hannover

Statische Website (Metzgerei & Grill-Restaurant, Kurt-Schumacher-Straße 33, 30159 Hannover).

## Struktur
- `index.html` — komplette Seite (React von lokalen Assets, kein CDN nötig)
- `assets/` — Logo, Schriften (woff2), App-Skripte (`app.js`, `main.js`, `react.js`, `react-dom.js`)

## Lokal ansehen
```bash
npx serve .
# oder
python -m http.server 8000
```

## Deployment
Statisches Hosting (Vercel). Kein Build-Schritt nötig — `index.html` liegt im Root.

## Offene Punkte (Content)
- Bild-Platzhalter mit echten Fotos füllen (Hero, Gericht-Fotos, Fleischtheke, Google-Maps-Bereich)
- Optional: Logo/Favicon optimieren (aktuell ~1.2 MB PNG)
- Später: Supabase-Anbindung (Kontakt/Reservierung)
