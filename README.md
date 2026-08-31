# Bandi Radar MI — MVP

MVP operativo per Meridionale Impianti per individuare e prioritizzare bandi di ricerca, innovazione, digitalizzazione ed energia.

## Stato
- produzione Vercel: https://bandi-radar-mi.vercel.app
- branch: `bandi-radar-mvp`
- stack MVP: HTML/CSS/JavaScript, zero dipendenze runtime

## Funzioni
- ranking 0–100 su territorio, settori, keyword e intensità di contributo
- ricerca e filtri
- dettaglio opportunità
- preferiti persistenti via localStorage
- inserimento manuale e valutazione immediata
- dataset iniziale con fonti regionali, nazionali ed europee

## Iterazione successiva
1. Neon Postgres per bandi, aziende, fonti e storico.
2. Ingestion schedulata da fonti ufficiali.
3. Parser/deduplica e normalizzazione.
4. Analisi LLM dei requisiti ed eleggibilità.
5. Auth, multi-tenant e alert.

> I dati di esempio servono a validare il prodotto; per uso istruttorio ogni requisito va verificato sulla fonte ufficiale.
