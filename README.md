# RITO API Kickstarter

Kleine Hilfestellung zur Erstellung einer auf RITO GAMES basierenden League of Legends API Statistikseite

## 1. Des brauchste

Node.js 12 + NPM auf dem Rechner

## 2. Quickie

1. Repo klonen:

   ```bash
   git clone https://github.com/kubism-dev/rito-pls.git mein-projekt
   ```

2. Riot API Key in .env einfügen. Dazu eine .env Datei erstellen. Inhalt von unten einfügen

   ```text
    RIOT_KEY='KEY HIER EINFÜGEN'
   ```

5. npm install, damit alles installiert wird.

   ```bash
   npm install
   ```

6. Run webpack

   Der Befehl `dev` startet einen Dev-Server und achtet auf Codeänderungen in JS- und SCSS-Dateien. Hot Reloading ist aktiviert, so dass
   dass jede Änderung in Ihrem Browser sichtbar wird, während Sie tippen.

   ```bash
   npm run dev
   ```

   Für den produktiven Einsatz führen Sie den Befehl `build` aus und alles, was Sie brauchen, wird in das Verzeichnis `public` gepackt.
   Verzeichnis gepackt. Sie können den Inhalt ohne weitere Änderungen zu jedem Hosting-Anbieter hochladen.

   ```bash
   npm run build
   ```

## 3. Happy Experimenting

   Auf gehts!
