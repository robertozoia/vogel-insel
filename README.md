# Die Vogel-Insel

Ein 3D-Lernspiel (Obby + Shooter im Roblox-Stil) für die Biologie-Einheit **„Die Vögel“**: äußerer Körperbau, Skelett, Organe, Schnäbel, Merkmale und Fortpflanzung der Vögel – mit Wortschatztraining auf Deutsch und Hilfen auf Spanisch.

**Spielen:** https://robertozoia.github.io/vogel-insel/

## Inhalt
- 6 Inseln mit je 4 Herausforderungen (Artikel-Obby, Drohnen-Jagd, Beschriften-Raid, Door-Runs, Schnabel-Blaster, Merkmal-Jagd, Brut-Zeitleiste, Code-Terminal) und einem Boss
- 198 Fachbegriffe mit Artikel, Plural und spanischer Übersetzung, Wiederholung mit Karteikasten-System (Leitner)
- **Erklären:** 14 Prozesse (Weg der Nahrung, Atmung, Paarung, Entwicklung im Ei, Nestflüchter/Nesthocker …) als freie Antwort mit Bewertungsraster und Musterlösung – im Erklär-Training bei Professorin Eule, in Phase 3 jedes Bosskampfs und im Prüfungsturm. Stichwort-Hilfen verschwinden, sobald ein Prozess sitzt.
- Satz-Bau aus Wortgeländern (Blatt 6 „Die Entwicklung im Hühnerei“), Zeitleiste der Fortpflanzung, Schreib-Fallen mit typischen Fehlern
- Prüfungsturm: Probetest mit 14 Aufgaben im Format der Arbeitsblätter (86 Punkte)
- Alle deutschen Wörter und Sätze als Audio (native deutsche Stimme, vorab aufgenommen)

## Dateien für den Schreibtisch
- `vocabulario-biologia.md` – Vokabelliste Deutsch/Spanisch (druckbar)
- `loesungen-seiten-10-12.md` – ausgefüllte Arbeitsblätter: Zeitleiste, Entwicklung im Hühnerei, Fortpflanzung (Ei-Beschriftung), Korrekturen

## Entwicklung
- `src/content.js` – alle Lerninhalte · `src/quiz.js` – Fragen, Antwortprüfung, Bewertungsraster
- `src3d/` – 3D-Spiel (three.js r128)
- `tools/voice.js` – nimmt die Audio-Clips mit einer macOS-Stimme auf (`node tools/voice.js "Anna (Premium)"`)
- `./build.sh` – baut `index.html` / `vogel-insel.html`
- `legacy-2d/` – die erste 2D-Version
