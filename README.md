# Mein Projekt

Mein Haushalt - Haushaltsmanager.

Mein Haushalt ist eine Anwendung, die ihre Benutzer auf eine übersichtliche und benutzerfreundliche Art und Weise bei alltäglichen Erledigungen in kommunikativer und organisatorischer Hinsicht unterstützt. 
Die App bietet nützliche Funktionen wie zun Beispiel einen Kalender in dem Events gespeichert werden können, die Möglichkeit Einkaufslisten zu erstellen sowie das Anlegen von To-Dos.
Des Weiteren können individuelle Gruppen erstellt werden um Einkaufslisten mit Einträgen und To-Dos zu Teilen und somit immer up-to-Date mit seinen Gruppenmitgliedern zu bleiben. 
Die Anwendung unterstützt ein Feature, dass eine Echtzeit aktualisierung von Inhalten gewährleistet. Somit werden die geteilten Inhalte unverzüglich auch bei Gruppenmitgliedern verfügbar.  

## Anforderungen 

- Die aktuelle Version von Node.js ist erforderlich um den Webserver starten zu können.

## Auslieferung

- Die Notwendigen Verzeichnisse werden beim Serverstart automatisch erstellt.
- config: 
  - Datei "checkDir.server.js", welche die Ordner überprüft und sicherstellt, dass das Verzeichnis groups im Dateisystem existiert.
  - Das Verzeichnis "groups" in welchem sich die gespeicherten Daten sowie die Profile von erstellten Gruppen befinden.
  - Datei "port.json" welche den Server Port festlegt auf welchen der Server bei anfragen hören soll.
  - "register.json" um fest zu legen ob man die Regsitrierungsoption des Servers aktivieren will.
  - "sessions.json" welche die Dauer und die änderbaren Einstellungen für sessions festlegt.
- docs:
  - Alles rund ums Thema Projektmanagement zur Anwendung.
- endpoints:
  - Alle Wichtigen Serverseitigen Endpunkte um die jeweiligen Anfragen zu bearbeiten.
  - calendar.server.js: 
      '/api/v1/savedEvents' : Abrufen gespeicherter Events um sie im Kalender zu Rendern.
      '/api/v1/calendarEvents/:id' : Erstellung und Speicherung neuer Events am Server.
      '/api/v1/calendarEvents' : Zwischenspeicherung des ausgewählten Tages um Events zu erstellen. 
  - notes.server.js: 
      - '/api/v1/notes' : Übergibt gespeicherte To-Dos zum Rendern an den Client.
      - '/api/v1/notes/:id' : Bearbeitet eingehende neue To-Dos und speichert diese, Sorgt für korrektes Löschen bei 'DELETE' requests. 
  - shopping.server.js: 
      - '/api/v1/shoppingLists' : Übergibt gespeicherte Einkaufslisten zum Rendern an den Client.
      - '/api/v1/shoppingLists/:id' : Bearbeitet eingehende neue Einkaufslisten und speichert diese, Sorgt für korrektes Löschen bei 'DELETE' requests.
  - shoppingList.server.js: 
      - '/api/v1/shoppinglist/:id' : Überprüft welche Einkaufsliste ausgewählt wurde um die Richtigen Einträge und Daten zurück zu geben.
      - '/api/v1/shoppinglist' : Übergibt gespeicherte Listeneinträge zum Rendern an den Client, je nach ausgewählter Liste.
      - '/api/v1/shoppingList/:id': Bearbeitet eingehende neue Einträge in den Listen und speichert diese, Sorgt für korrektes Löschen bei 'DELETE' requests.
  - createGroup.server.js:
      '/api/v1/createGroup' : Sorgt für die Erstellung von Gruppen und deren Speicherung im Dateisystem.
  - groups.server.js:
      '/api/v1/checkGroup' : Überprüft ob der User sich bereits in einer Gruppe befindet, wird für die Gruppenfunktionen benötigt.
      '/api/v1/leaveGroup' : Bearbeitet das Verlassen von Gruppen eines users und räumt im Dateisystem auf wenn die Gruppe leer ist.
  - joinGroup.server.js:
       '/api/v1/joinGroup' : Bearbeitet das Beitreten und überprüft ob Gruppenname sowie Passwort korrekt sind. 
  - groupNotes.server.js:
    - '/api/v1/groupNotes' : Übergibt gespeicherte Gruppen To-Dos der user in der Gruppe zum Rendern an den Client. 
    - '/api/v1/groupNotes/:id' : Bearbeitet eingehende neue Gruppen To-Dos und speichert diese, Sorgt für korrektes Löschen bei 'DELETE' requests. 
  - shopping.server.js: 
    - '/api/v1/groupShoppingLists' : Übergibt gespeicherte Gruppen Einkaufslisten der Gruppe des users zum Rendern an den Client.
    - '/api/v1/groupShoppingLists/:id' : Bearbeitet eingehende neue Einkaufslisten und speichert diese, Sorgt für korrektes Löschen bei 'DELETE' requests.
  - groupShoList.server.js: 
    - '/api/v1/groupShoppinglist/:id' : Übergibt gespeicherte Listeneinträge zum Rendern an den Client, je nach ausgewählter Liste.
    - '/api/v1/groupShoppinglist' : Übergibt die geclickte Liste und deren Einträge an der Client zum Rendern der Daten.
    - '/api/v1/groupShoppingList/:id' : Bearbeitet eingehende neue Einträge in den Listen und speichert diese, Sorgt für korrektes Löschen bei 'DELETE' requests.
  - imgCache.js:
    - Die Endpunkte bearbeiten jeweils die Anfragen von private oder public Seiten um den Hintergrund im cache zu speichern und somit unnötig häufiges Laden zu vermeiden.
  - live.server.js: 
    - Endpunkt der die liveClients für die Server Send Event Messages im liveClients Array speichert um eine Auslieferung der Nachrichten zu gewährleisten. Haltet die Verbindung zu den Usern offen. 
- library: 
  - "SSE.js" um die Server Send Event Mitteilungen zu verarbeiten und an online user zu senden. 
- private:
  - Alle Wichtigen Kernfunktionen sowie deren html, css und js Dateien die sie zum laufen benötigen.
  - Dateien im private Verzeichnis sind nur für registrierte und angemeldete user mit gültiger session zugänglich. 
  - Die Verzeichnisse der Funktionen gliedern sich in: 
    - calendar: alle Dateien der Kalender Funktionen, 
    - notes: alle Dateien zum Erstellen und speichern von To-Dos, 
    - shopping: alle Dateien zum Erstellen und speichern von Einkaufslisten, sowie der Listeneinträge, 
    - groups: alle Dateien zum Erstellen, beitreten und verlassen von Gruppen,
    - groupNotes: alle Dateien zum Erstellen und speichern sowie dem Teilen von To-Dos innerhalb der eigenen Gruppe,  
    - groupShopping: alle Dateien zum Erstellen und speichern sowie dem Teilen von Einkaufslisten sowie den Listeneinträgen  innerhalb der eigenen Gruppe,   
    - impressum: Impressum und Datenschutzerklärung für angemeldete User im Private Verzeichnis,
- public: 
  - Beinhaltet allgemein zugängliche Dateien und Verzeichnisse;
  - Gliedert sich in:
    - Impressum: Impressum sowie Datenschutz Inhalte der Anwendung, für alle zugänglich;
    - logout: Beinhaltet die Dateien die den Logout behandeln;
    - register: Dateien die die registrierungsdaten an den Server senden und die Registrierung behandeln;
    - alert.js, alert.html, alert.css: behandeln die Mitteilungen die ein User innerhalb der Anwendung erhält;
    - login: bearbeitet den Login und sendet die Daten an den Server zur Überprüfung;
    - mobileMenu, common.css, startpage: beinhalten die Standard CSS settings und die dazu gehörigen mnobilen Menüs sowie die Startseite der Anwendung;
- system:
  - Alle Systemrelevanten Dateien, die im Backend mit dem Server arbeiten und Endpunkte, Login, Register, Logout und sonstige Abhängigkeiten behandeln;
- users:
  - wird erstellt bei Registrierung und beinhaltet die Userdaten die gespeichert werden während der session;
- server.js:
  - Die hauptdatei des Node.js Webservers, diese muss zum starten der Anwendung ausgeführt werden. 

## Installation
Führen Sie folgende Schritte aus um das Programm ausliefern zu können. 

- Anforderungen damit Programme laufen zur Überprüfung
- Datenbank
- Testdaten

## Entwicklung
clonen, einrichten der Entwicklungsumgebung

- Nutze Visual Studio Code und installiere die vorgeschlagenen Erweiterungen. 
