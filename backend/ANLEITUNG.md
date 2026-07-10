# Anmeldung-Backend einrichten

Diese Anleitung richtet das Backend für das Anmeldung-Formular ein: Jede
Anmeldung löst automatisch eine E-Mail an Alessia aus und wird gleichzeitig
als Zeile in einem Google Sheet gespeichert. Alessia sieht dort jederzeit,
welche Kinder aktiv sind.

Am besten unter **Alessias eigenem Google-Konto** durchführen (nicht dein
privates), damit sie später selbst Zugriff auf die Tabelle hat.

## 1. Google Sheet erstellen

1. Auf [sheets.google.com](https://sheets.google.com) ein neues, leeres
   Sheet erstellen.
2. Benennen z. B. "Spielgruppe Rägiräupli – Anmeldungen".
3. Nichts weiter eintragen – die Spaltenüberschriften und die
   "Status"-Dropdown-Liste werden beim ersten eingehenden Formular
   automatisch erstellt.

## 2. Apps Script einfügen

1. Im Sheet: **Erweiterungen → Apps Script**.
2. Den kompletten Inhalt von [`Code.gs`](./Code.gs) aus diesem Ordner
   kopieren und den Standard-Code im Editor (`function myFunction() {}`)
   damit ersetzen.
3. Oben auf das Disketten-Symbol klicken, um zu speichern (Projektname
   z. B. "Anmeldung Backend").

## 3. Als Web App bereitstellen

1. Oben rechts auf **Bereitstellen → Neue Bereitstellung** klicken.
2. Bei "Typ auswählen" das Zahnrad anklicken und **Web App** wählen.
3. Einstellungen:
   - **Ausführen als:** Ich (dein/Alessias Konto)
   - **Zugriff:** Jeder ("Anyone")
4. **Bereitstellen** klicken.
5. Google fragt nach Berechtigungen (Zugriff auf Sheet + E-Mail-Versand) –
   bestätigen. Bei der Warnung "Diese App wurde nicht verifiziert" auf
   **Erweitert → Zu [Projektname] wechseln (unsicher)** klicken – das ist
   normal bei eigenen, nicht veröffentlichten Skripten.
6. Die angezeigte **Web-App-URL** kopieren (endet auf `/exec`).

## 4. URL im Code eintragen

1. In `script.js` (im Hauptordner der Website) die Zeile suchen:
   ```js
   var ANMELDUNG_ENDPOINT = 'PASTE_YOUR_DEPLOYED_WEB_APP_URL_HERE';
   ```
2. `PASTE_YOUR_DEPLOYED_WEB_APP_URL_HERE` durch die kopierte URL ersetzen.
3. Änderung committen und pushen, damit sie live auf der Website landet.

## Wie sieht der Ablauf danach aus?

1. Jemand füllt das Anmeldung-Formular aus und klickt auf "Anfrage senden".
2. Alessia erhält eine E-Mail mit allen Angaben (Kind, Adresse, Kontakt,
   gewünschte Tage usw.).
3. Gleichzeitig entsteht automatisch eine neue Zeile im Sheet mit
   Status **"Anfrage"**.
4. Alessia entscheidet ausserhalb des Systems, wie bisher (z. B. Rückruf,
   Infoabend).
5. Sobald das Kind angemeldet ist, ändert sie in der Sheet-Zeile einfach
   die Status-Zelle von "Anfrage" auf **"Aktiv"** (Dropdown-Auswahl).
   Abgelehnte Anfragen können auf "Abgelehnt" gesetzt werden.

Kein Login, kein Zusatzsystem – nur E-Mail wie gewohnt plus eine
Tabelle mit dem aktuellen Überblick.

## Falls sich der Code später ändert

Wird `Code.gs` in diesem Ordner künftig angepasst, muss der neue Inhalt
erneut in den Apps-Script-Editor kopiert und über **Bereitstellen →
Bereitstellungen verwalten → Bearbeiten (Stift-Symbol) → Bereitstellen**
aktualisiert werden. Die Web-App-URL bleibt dabei gleich.
