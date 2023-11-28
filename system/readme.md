# Webserver

In dieser Datei werden die enthaltenen Dateien und Ordner, der Installation und Betrieb sowie die Funktionsweise des Webservers beschrieben.


## Ordnerstruktur

### Ordnerstruktur vor dem ersten Start

Wird der Server frisch vom Git Server oder einer anderen Quelle bezogen, dann sind initial nur die folgenden Dateien und Ordner vorhanden:

Pfad | Zweck
-----|------
`server.js` | Mit dieser Einstiegsdatei wird der Server mit dem Befehl `node server.js` gestartet.
`system/` | Im Ordner `system/` sind alle vom Server benötigten Dateien und System enthalten. Die Inhalte dieses Ordners sind nicht zu verändern und werden ausschließlich bei einem Update des Servers aktualisiert.`
`system/config/` | Konfigurationsdateien des Systems.
`system/config/version.json` | Enthält die aktuelle Version des Server Releases.
`system/endpoints/` | Enthält zentrale Endpunkte des Systems.
`system/endpoints/index.server.js` | Koordiniert die Anzeige von `index.html` Dateien in den Ordners `public/`, `private/` und `private/admin/`.
`system/endpoints/login.server.js` | Koordiniert den Login und Logout am System.
`system/endpoints/private.server.js` | Stellt sicher, dass nur angemeldete Benutzer (mit Administratorrechten) auf die Inhalte in `private/` beziehungsweise `private/admin/` zugreifen können.
`system/endpoints/register.server.js` | Koordiniert die Registrierung am System.
`system/library/` | Zentrale Bibliotheken, welchem vom Server, aber auch von Entwicklern, genutzt werden (können).
`system/library/endpoints.js` | Verwaltet die Registrierung und Speicherung (zur Laufzeit) von Endpunkten.
`system/library/http.js` | Bibliothek zur Erweiterung des Fähkigkeiten des HTTP Servers von Node.js.
`system/library/mimetypes.json` | Sammlung aller bekannter Mimetypes, abgeleitet vom Apache Webserver.
`system/library/serve.js` | Hilfsbibliothek (auch für Entwickler) zur bequemen Auslieferung einer Datei inklusive Mimetype.
`system/library/sessions.js` | Bibliothek für das vom Server verwendete Session Management.
`system/library/urlpattern.js` | Polyfill Bibliothek für die `URLPattern` Klasse, welche von Node.js (noch) nicht nativ unterstützt wird.
`system/licences/` | Enthält die Lizenzdateien für manche vom Server verwendeten Ressourcen.
`system/licenses/httpd/` | Enthält Lizenzinformation für die vom Apache Webserver verwendeten Ressourcen.
`system/licenses/httpd/license` | Lizenzdatei Apache License 2.0.
`system/licenses/urlpattern/` | Enthält Lizenzinformation für die mit `URLPattern` verwendeten Ressourcen.
`system/licenses/urlpattern/license` | Lizenzdatei Intel Corporation.
`system/private/` | Standard Dateien und Ordner des Servers, welche verwendet werden, wenn sie nicht vom Entwickler im `private/` Ordner überladen werden.
`system/private/admin/` | Standard Dateien und Ordner des Servers, welche verwendet werden, wenn sie nicht vom Entwickler im `private/admin/` Ordner überladen werden.
`system/private/admin/index.html` | Standard Webseite, welche die Funktion der Startseite für angemeldete Benutzer mit Administrator Rechten beschreibt.
`system/private/index.html` | Standard Webseite, welche die Funktion der Startseite für angemeldete Benutzer beschreibt.
`system/public/` | Standard Dateien und Ordner des Servers, welche verwendet werden, wenn sie nicht vom Entwickler im `public/` Ordner überladen werden.
`system/public/index.html` | Standard Webseite, welche die Funktion der Startseite beschreibt.
`system/public/login.html` | Standard Webseite, welche eine simple Seite für den Login darstellt.
`system/public/register.html` | Standard Webseite, welche eine simple Seite zur Registrierung darstellt.
`system/public/registered.html` | Standard Webseite, welche die Erfolgsnachricht einer Registrierung darstellt.
`system/sessions/` | Enthält die Session JSON-Dateien aller (angemeldeten) Benutzer der Webseiten des Servers.
`system/sessions/.gitignore` | Gitignore Datei, welche verhindert, dass die Session JSON-Dateien von Git getrackt werden.
`system/templates/` | Enthält HTML Dateien, welche die Standard-Antworten des Servers für HTTP Status Codes anpassen.
`system/templates/all.html` | Standard-Antwort für alle HTTP Status Codes, welche der Server zurückgibt.
`system/tools/` | Verzeichnis für Scripte, welche direkt auf der Kommandozeile ausgeführt werden, um bestimmte Aktionen zu erledigen.
`system/tools/create-user.js` | Erstellt einen neuen Benutzer im System.

### Ordnerstruktur nach dem ersten Start

Sobald der Server erstmalig gestartet wurde, werden vom Server eine Reihe von weiteren Dateien und Ordnern erstellt. Die hierdurch neu erstellen Dateien und Ordner können frei bearbeitet werden, sodass ein Entwickler unter Nutzung des Servers eine Webseite beziehungsweise Anwendung erstellen kann.

Pfad | Zweck
-----|------
`config/` | Enthält Konfigurationsdateien, welche das Verhalten des Servers anpassen, sowie eigene Konfigurationsdateien und Daten(banken).
`config/port.json` | Konfigurationsdatei für den vom HTTP Server genutzten Port.
`config/register.json` | Konfigurationsdatei für die Details der Registrierung am System.
`config/session.json` | Konfigurationsdatei für das Session Management.
`endpoints/` | Eigenen Endpunkte für den Server werden hierin abgelegt.
`library/` | Bibliotheken und sonstiger Server-seitiger Code, unter anderem für die Endpunkte, werden hier abgelegt.
`licenses/` | Lizenzen von vom Entwickler verwendeter Ressourcen können hierin abgelegt werden.
`private/` | Hierin abgelegte Dateien und Ordner können nur von angemeldeten Benutzern abgerufen werden.
`private/admin/` | Hierin abgelegte Dateien und Ordner können nur von angemeldeten System Administratoren abgerufen werden.
`public/` | Alle Dateien und Ordner im `public/` Ordner können von jedem abgerufen werden.
`server.js` | Siehe Abschnitt _Ordnerstruktur vor dem ersten Start_.
`system/` | Siehe Abschnitt _Ordnerstruktur vor dem ersten Start_.
`templates/` | Enthält HTML Templates für HTTP Status Codes, um eigene Fehlerseiten zu erstellen.
`users/` | Verzeichnis für die Ordner und Profile der registrierten Benutzer.


## Installation und Betrieb

### Installation

Um den Server zu installieren gibt es zwei Möglichkeiten:

1. Manueller Download (empfohlene Variante):  
   [Im Repository auf dem Git Server](https://git.wifi.messner.top/Backend/Server) auf das _Drei-Punkte-Menü_ rechts neben dem Pfad zum Klonen klicken und die Option _Download as ZIP_ auswählen.  
   Das ZIP Archiv nach dem Download extrahieren und die Inhalte an den gewünschten Ort verschieben.

2. Installation mit Git:  
   `cd Desktop`  
   `git clone https://git.wifi.messner.top/Backend/Server`  
   `rm -rf Server/.git`  
   Mit dem letzten Schritt wird das Repository im Ordner gelöscht, da das Repository das des Server Projektes als Ganzes umfasst. Da ein übliches Projekt allerdings ein eigenes Repository benötigt wird das Original entfernt, sodass das eigene Repository des Entwicklers Vorrang hat.

Um den Server zu betreiben muss [Node.js](https://nodejs.org/en/) auf dem Host System installiert sein.

Wird ein Update des Servers veröffentlicht, dann müssen `system/` und `server.js` gelöscht und anschließend die Inhalte des Updates wie beschrieben heruntergeladen und am Zielordner neu platziert werden.

### Betrieb

Um den Server zu starten muss in der Kommandozeile in das Verzeichnis des Servers navigiert werden (dies ist der Ordner, in welchem sich die Datei `server.js` befindet.) 

Mit dem Befehl `node server.js` kann der Server gestartet werden. Wie oben beschrieben werden dabei beim ersten Start zusätzliche Dateien und Ordner im Verzeichnis des Servers erstellt.

Für die laufende Entwicklung empfiehlt es sich, den Server mit `node --watch server.js` zu starten, da der Server hierbei automatisch bei der Anpassung einer vom Server direkt verwendeten (sprich mit `require` eingebundene) Datei neugestartet wird.  
Beachte: Wird ein komplett neuer Endpunkt hinzugefügt, dann muss der Server manuell gestoppt und neu gestartet werden (Strg + c gefolgt von `node --watch server.js`). Selbiges gilt auch, wenn eine vom Server verwendete JSON Datei, beispielsweise eine Konfigurationsdatei in `config/`) angepasst, wird.


# Funktionsweise

Beim vorliegenden Webserver handelt es sich um einen mit Node.js geschriebenen Webserver, welcher alle Dateien des Ordners `public/` automatisch ausliefert, wenn diese im Browser direkt adressiert werden. Hierbei wird von der Auslieferung statischer Dateien gesprochen.

Da dieses statische Verhalten nicht in allen Fällen ausreichend ist, weil hiermit beispielsweise keine APIs realisiert werden können, gibt es zusätzlich die Möglichkeit dynamische Endpunkte zu Erstellen. Diese werden im Ordner `endpoints/` gespeichert, üblicherweise mit der Dateiendung `*.server.js`, und bestehen aus einer Script Datei, welche vom Server beim Start eingelesen und für die Registrierung von Endpunkte verwendet wird.

In einem dynamischen Endpunkt kann der Pfad einer URL nach dem [`URLPattern` Schema](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern/URLPattern) zusammen mit einer Callback Funktion angegeben werden. Ruft ein Benutzer eine Seite auf, welche den angegebenen Pfad enthält, dann wird die Callback Funktion vom Server aufgerufen und der Entwickler kann die Anfrage nach eigenen belieben anpassen.

Ein Endpunkt wird mit der global verfügbaren Methode `endpoints.add(pattern, callback)` registriert. Das `pattern` muss hierbei mit einem `/` Slash Zeichen beginnen. Der Callback Methode werden folgende Parameter übergeben:

* `request`: Instanz der `IncomingMessage` Klasse der HTTP Anfrage des Benutzers.
* `response` Instanz der `ServerResponse` Klasse der Antwort auf die HTTP Anfrage des Benutzers.
* `session`: Objekt mit den in der Session des Benutzers (gilt für jeden Benutzer, auch nicht angemeldete) gespeicherten Informationen.
* `match`: Objekt mit den Details zur URL der Anfrage (siehe [`URLPattern.exec`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern/exec)).

Das `request` Objekt des Aufrufs der Callback Methode wurde um die Attribute `request`, `response`, `session` und `match` erweitert, sodass Destructuring zum Zugriff auf die einzelnen Informationen ermöglicht wird.

### Beispiele für Endpunkte

Der nachfolgende Endpunkt registriert sich für Aufrufe der Pfade `/` und `/index.html` und gibt dabei stets die Zeichenkette `Hallo Welt` als Antwort auf die Anfrage zurück. Wird jedoch eine andere HTTP Methode als GET verwendet, so wird die Anfrage mit einer entsprechenden Fehlermeldung beantwortet.

```javascript
// index.server.js
endpoints.add('/{index.html}?', (request, response) => {
  if (request.method !== 'GET') {
    response.statusCode = 405;
    response.end('405 Method Not Allowed');
    return;
  }

  response.end('Hallo Welt);
});
```

Moderne Endpunkte können auch Destructuring verwenden, um gezielt einzelne Informationen zu erhalten. Gibt die Callback Methode eine Zahl zurück, so wird diese direkt als Status Code zurückgegeben.  
Im nachfolgenden Endpunkt werden alle diese Faktoren berücksichtigt, um einen Endpunkt für einen Dateiupload für `.txt` Dateien (der Dateiname muss aus 4-16 Zeichen bestehen) mit einer maximalen Dateigröße von 1KB zu realisieren. Die Callback Funktion wird dabei für auftretende Fehler stets mit dem passenden HTTP Status Code voreilig mit `return` beendet.

```javascript
// upload.server.js
const fs = require('node:fs/promises');

endpoints.add('/upload/:filename([a-z]{4,16}\.txt)', async ({ request, method, match }) => {
  if (method !== 'POST') return 405;  // Method Not Allowed
  if (isNaN(parseInt(request.headers['content-length']))) return 411;  // Length Required
  if (parseInt(request.headers['content-length']) > 1_024) return 413;  // Payload Too Large

  const file = [];
  try {
    for await (const chunk of request) file.push(chunk);
  } catch {
    return 400;  // Bad Request
  }

  try {
    await fs.writeFile('uploads/' + match.pathname.groups.filename, Buffer.concat(file));
  } catch(error) {
    return 500;  // Internal Server Error
  }

  return 204;  // No Content
});
```

### Sessions

Der Server verfügt über automatisches Session Management. Dabei wird für jeden Benutzer, welcher die Seite besucht, automatisch eine Session erstellt. Diese ist über Endpunkte mit dem `session` Objekt abrufbar. Im Objekt sind unter anderem folgende Schlüssel enthalten:

* `id`: Session ID des Benutzers.
* `validUntil`: UNIX Zeitstempel zu welchem die Session abläuft und automatisch gelöscht wird.
* `profile`: Enthält ein Objekt mit dem Profil des Benutzers, wenn er sich am System angemeldet hat.
* `save()`: Mit dieser Methode können Änderungen der Session gespeichert werden.
* `destroy()`: Mit dieser Methode kann die Session sofort beendet und gelöscht werden.

Um etwas in der Session zu speichern muss die Information dem Objekt nur zugewiesen werden:

```javascript
session.warenkorb = ['Pommes', 'Mojonaise', 'Chilipulver'];
session.save();
```

Inhalte der Session sind in allen Endpunkte verfügbar. In einem anderem Endpunkt kann also beispielsweise mit `console.log(session.warenkorb)` wieder auf den zuvor gespeicherten Inhalt zugegriffen werden.

Die `save()` Methode muss nur dann verwendet werden, wenn Änderungen an der Session auch nach dem Neustart des Servers erhalten bleiben sollen. Änderungen an der Session ohne Aufruf dieser Methode bleiben zur Laufzeit dennoch erhalten. Der Aufruf der Methode muss deswegen manuell erfolgen, sodass mehrere Änderungen direkt hintereinander nicht jedes Mal das aktualisierte Session Objekt speichern, sondern dies erst am Ende einmalig erfolgen kann.

Eine Session bleibt standardmäßig für eine Stunde aktiv, bevor sie automatisch gelöscht wird. Dieses Verhalten kann jedoch über die Konfigurationsdatei `config/sessions.json` mit dem Schlüssel `duration` (Ablaufzeit einer Session in Millisekunden) angepasst werden.

Weitere konfigurierbare Schlüssel sind:

* `extendAfter`: Anzahl der Millisekunden, nach welcher ein neuerlicher Aufruf der Webseite den Ablaufzeitstempel aktualisiert (standardmäßig ist dies eine Minute).
* `logging`: Gibt als Boolean an, ob Ereignisse wie _Login_ oder _Logout_ geloggt werden sollen (standardmäßig ist dies deaktiviert).


### Login und Registrierung

In Kombination mit Sessions ist es möglich, sich am Server als registrierter Benutzer anzumelden. Wenn es in der Konfigurationsdatei `config/register.json` mit dem Schlüssel `enabled` mit einem Boolean aktiviert ist, dann können sich neue Benutzer am System registrieren (standardmäßig ist dies aktiviert).  
Abhängig vom Einsatzzweck des Servers ist es gewünscht die Registrierung zu deaktivieren.

Registrierte Benutzer werden im Verzeichnis `users/` gespeichert. Hierin erhält jeder Benutzer einen eigenen Ordner, welcher unter anderem die Datei `profile.json`, das Benutzerprofil, enthält.

Ein Profil sieht beispielsweise wie folgt aus:

```json
{
  "id": "939cb96a-d273-48b6-909b-22768f1a8a52",
  "username": "dmm",
  "password": "5755f5af96d319249ae5818bfcd27e907241402e79bbe9bd3e0dee11e481b024",
  "groups": [],
  "name": {
    "first": "Daniel",
    "last": "Messner"
  }
}
```

Der obige Benutzer verfügt über keinerlei Besonderheiten. Soll ein Benutzer für das System als Administrator markiert werden, dann muss in den Array `groups` der Wert `admin` hinzugefügt werden.

Generell können die Gruppen in Kombination mit den Sessions dazu verwendet werden, um einem Benutzer Zugang zu bestimmten Bereichen des Systems zu gewähren, wie der folgende Endpunkt aufzeigt:

```javascript
endpoints.add('/top-secret-page.html', ({ session, response }) => {
  if (!session.profile?.groups.includes('secret-club')) return 403;
  response.end('Willkommen auf der streng geheimen Seite für Benutzer mit der Gruppe secret-club');
});
```


### Passwort zurücksetzen

Wenn es in der Konfigurationsdatei `config/sessions.json` explizit konfiguriert ist, was der Standardeinstellung entspricht, dann kann ein Benutzer sein Passwort via E-Mail zurücksetzen. Hierzu wird dem Benutzer eine E-Mail mit einem 8-stelligen Code gesendet, welcher innerhalb von 30 Minuten (konfigurierbar) zusammen mit einem neuen Passwort in ein Formular eingegeben werden muss.

Um dieses Feature zu aktivieren ist es notwendig, dass für den Benutzer eine E-Mail Adresse hinterlegt ist. Dies ist die Standardeinstellung des Schlüssels `includeMail` in der Konfigurationsdatei `config/register.json` und wird in der Standardseite zur Registrierung am System berücksichtigt.

Zusätzlich müssen zur Aktivierung dieses Features in den beiden genannten Konfigurationsdateien gültige E-Mail Zugangsdaten in der Konfigurationsdatei `config/mail.json` konfiguriert sein (TLS basierter Mail Exchange Server mit dem _Login_ basierten Authentifikationssystem). Diese Konfigurationsdatei sieht beispielsweise wie folgt aus:

```json
{
  "debug": false,
  "server": {
    "host": "mail.gmx.net",
    "port": 465
  },
  "name": "Your Name",
  "mail": "your-gmx-mail-address@gmx.net",
  "password": "your-gmx-password"
}
```


### Seiten überladen

Im Auslieferungszustand verfügt der Server über rudimentäre Standardseiten, welche eine grundsätzliche Funktionalität für die Startseiten (in `public/`, `private/` und `private/admin/`), den Login sowie die Registrierung ermöglichen. Diese Standardseiten sind in den Ordnern `system/public/`, `system/private/` und `system/private/admin/`.

Jede der in den genannten Systemordner enthaltenen Dateien wird standardmäßig vom Server angezeigt, aber nur, wenn die entsprechende Datei nicht in den vom Entwickler verwalteten Ordnern `public/`, `private/` und `private/admin/` ebenfalls enthalten sind.

Ist Beispielsweise die Datei `public/index.html` vorhanden, so wird diese Datei anzeigt. Ist jedoch beispielsweise die Datei `public/login.html` nicht vorhanden, so wird stattdessen die Standardseite `system/public/login.html` angezeigt.


### Status Code Seiten

Ein ähnliches Verhalten gilt für die Templates für HTTP Status Code Seiten. Im Ordner `system/templates/` ist die Datei `all.html` enthalten, welche standardmäßig für Antworten auf eine Anfrage verwendet wird, deren Inhalt der Antwort leer ist (beispielsweise weil der Endpunkt einen Status Code mit `return 404` zurückgibt).

Im Ordner `templates/` kann das System Template überschrieben werden. Dabei gibt es folgende Möglichkeiten:

* `all.html`: Wird für alle HTTP Status Codes verwendet.
* `5xx.html`: Wird für alle HTTP Status Codes zwischen 500 und 599 verwendet.
* `502.html`: Wird für den Status Code 404 verwendet.

Hierbei können also alle Status Codes individuell (beispielsweise `400.html`, `404.html`, `502.html`) erfasst werden als auch die üblichen Gruppen (beispielsweise `4xx.html`, und `5xx.html`).
