# Die Vogel-Insel

Ein 3D-Lernspiel (Obby + Shooter im Roblox-Stil) für die Biologie-Einheit **„Die Vögel“**: äußerer Körperbau, Skelett, Organe, Schnäbel und Merkmale der Vögel – mit Wortschatztraining auf Deutsch und Hilfen auf Spanisch.

**Spielen:** https://robertozoia.github.io/vogel-insel/

## Inhalt
- 5 Inseln mit je 4 Herausforderungen (Artikel-Obby, Drohnen-Jagd, Beschriften-Raid, Door-Runs, Schnabel-Blaster, Merkmal-Jagd, Code-Terminal) und einem Boss
- 157 Fachbegriffe mit Artikel, Plural und spanischer Übersetzung, Wiederholung mit Karteikasten-System (Leitner)
- Prüfungsturm: Probetest im Format der Arbeitsblätter
- Alle deutschen Wörter und Sätze als Audio (native deutsche Stimme, vorab aufgenommen)

## Entwicklung
- `src/content.js` – alle Lerninhalte · `src/quiz.js` – Fragen und Antwortprüfung
- `src3d/` – 3D-Spiel (three.js r128)
- `tools/voice.js` – nimmt die Audio-Clips mit einer macOS-Stimme auf (`node tools/voice.js "Anna (Premium)"`)
- `./build.sh` – baut `index.html` / `vogel-insel.html`
- `legacy-2d/` – die erste 2D-Version
