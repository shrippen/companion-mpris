# Code-Audit companion-mpris, 14.11.2026, Stand b71f7ce

## Urteil
Das Repo ist klein und gut wartbar. Nur eine Datei spricht mit dem Systemdienst D-Bus, über den Linux-Mediaplayer gesteuert werden; die übrigen Dateien beschreiben die Tasten, Statusanzeigen und Variablen in Companion und benutzen nur diese eine Datei. Die Strukturprüfung findet keinen Verstoß, und die Bestandsliste ist leer. Die Schwächen sind klein: Dieselbe Auswahl des Players steht mehrfach im Code, feste Wörter wie „auto“ und „Playing“ sind über viele Dateien verstreut, die Demo hängt an inneren Namen des echten Codes, und es gibt keinen einzigen Test. Das ist das erste Audit, einen Vergleich gibt es daher nicht.

## Kennzahlen
| | letztes Audit | jetzt |
|---|---|---|
| Quelldateien | – | 13 eigene (die Strukturprüfung meldet 14, weil sie ihr eigenes Werkzeug mitzählt; dazu zwei `.cjs`-Dateien, davon eine erzeugte Kopie der Demodaten) |
| Einträge in der Bestandsliste | – | 0 |
| größte Datei (Zeilen) | – | 200 (das mitgezählte Werkzeug der Strukturprüfung hat 246) |
| längste Funktion (Zeilen) | – | 42 |

## Funde

### 1. Die Auswahl „welcher Player“ ist an zwei Stellen gebaut, und die Suche nach dem aktiven Player an drei.
Das Auswahlfeld für den Player (die Liste, aus der man pro Taste einen Player oder „Auto“ wählt) ist in den Aktionen und in der Statusanzeige Zeichen für Zeichen gleich geschrieben, obwohl es für die Einträge dieser Liste schon eine gemeinsame Datei gibt. Ebenso steht der Weg „gewünschten Player auflösen, dann seine Daten holen, sonst Stopped“ in der Statusanzeige und bei den Variablen jeweils selbst geschrieben. Der Befehlsweg des Player-Bausteins löst den Player ein drittes Mal auf, dort mit einem Fehler statt „Stopped“, und die Demo kopiert diesen Weg. Wer die Beschriftung, den Standardwert oder die Regel „kein Player gefunden“ ändert, muss alle Stellen finden; vergisst er eine, verhalten sich Taste und Anzeige verschieden. Vorschlag: das Feld neben die vorhandene Liste in die gemeinsame Datei legen und dem Player-Baustein eine Funktion „aktiver Player“ geben, die alle diese Stellen benutzen. Aufwand klein, Risiko mittel (keine Tests). Beleg: `src/actions.js:4`, `src/feedbacks.js:5`, `src/choices.js:2`, `src/feedbacks.js:38`, `src/variables.js:13`, `src/mpris.js:164`, `demo/fakeMpris.js:46`.

### 2. Feste Wörter wie „auto“ und die drei Wiedergabezustände stehen lose in sieben Dateien.
Der Wert „auto“ (Player automatisch wählen) steht acht Mal im Code, die Zustände „Playing“, „Paused“ und „Stopped“ an über einem Dutzend Stellen, jeweils als bloßer Text. Ein Tippfehler an einer Stelle fällt nicht auf: Bei einem Zustand bleibt die Taste dann still grau. Bei „auto“ fällt er nur deshalb nicht auf, weil jeder unbekannte Wert wie „auto“ behandelt wird. Wer „auto“ umbenennen oder einen Zustand ergänzen will, muss jede Stelle von Hand suchen. Vorschlag: beide Wertgruppen einmal als benannte Konstanten im Player-Baustein festlegen und überall diese verwenden. Aufwand klein, Risiko klein. Beleg: `src/mpris.js:111`, `src/mpris.js:148`, `src/mpris.js:153`, `src/choices.js:3`, `src/actions.js:8`, `src/feedbacks.js:29`, `src/feedbacks.js:40`, `src/variables.js:19`, `src/presets.js:49`.

### 3. Ein neuer Wiedergabebefehl muss an vier Stellen eingetragen werden, zwei davon sind reine Weiterleitungen.
Für jeden Befehl (Play, Pause, Next …) gibt es im Player-Baustein eine eigene kleine Funktion, die nur den Namen des Befehls weiterreicht; die Aktionen rufen diese Funktion wiederum über ihren Namen als Text auf. Ein neuer Befehl, etwa „Zufallswiedergabe“, braucht so eine neue Weiterleitung, einen Eintrag bei den Aktionen, einen Fall in der Demo und eine Vorlage-Taste. Vorschlag: die Aktionen nennen direkt den Befehlsnamen des Players und rufen die eine vorhandene Befehlsfunktion; die sechs Weiterleitungen entfallen. Aufwand klein, Risiko mittel (keine Tests). Beleg: `src/mpris.js:180`, `src/actions.js:13`, `src/actions.js:26`, `demo/fakeMpris.js:51`, `src/presets.js:57`.

### 4. Die Versionsnummer wird an drei Stellen von Hand gepflegt, eine davon wird beim Bauen ohnehin überschrieben.
Die Release-Schritte verlangen, die Version in drei Dateien zu erhöhen, darunter in der Beschreibungsdatei für Companion (Manifest). Das Bauwerkzeug von Companion schreibt beim Packen die Version und die Schnittstellenversion aus der Paketbeschreibung in das Manifest; die Werte dort wirken also nur, wenn das Modul direkt aus dem Quellordner läuft. Die Prüfung im Release-Ablauf vergleicht nur die Paketbeschreibung mit dem Tag. Jeder Release kostet so einen Schritt, der vergessen werden kann, ohne dass es auffällt. Vorschlag: im Manifest einen festen Platzhalter stehen lassen und den Schritt aus der Release-Anleitung streichen. Aufwand klein, Risiko klein. Beleg: `companion/manifest.json:8`, `companion/manifest.json:17`, `package.json:3`, `RELEASE.md:5`, `.github/workflows/release.yml:36`.

### 5. Derselbe Fehler wird einmal protokolliert und einmal still verschluckt.
Schlägt das regelmäßige Abfragen der Player fehl, landet das im Protokoll. Schlägt dieselbe Abfrage kurz nach einem Tastendruck fehl, verschwindet der Fehler ohne Spur. Auch wenn ein Player seinen Zustand oder Titel nicht liefern kann, wird das ohne Eintrag übergangen; fehlt der Zustand, gilt der Player als gestoppt. Wer einen Player untersucht, der falsch angezeigt wird, findet im Protokoll keinen Hinweis. Vorschlag: alle Lesefehler einheitlich auf der Stufe „debug“ (der ausführlichsten Stufe, die nur zur Fehlersuche eingeschaltet wird) protokollieren, wie es die regelmäßige Abfrage schon tut. Aufwand klein, Risiko klein. Beleg: `src/mpris.js:27`, `src/mpris.js:176`, `src/mpris.js:115`, `src/mpris.js:123`.

### 6. Die Demo ersetzt Funktionen des echten Player-Bausteins, indem sie alle ihre Funktionen über dessen gleichnamige kopiert.
Die Demo (nur für Screenshots, ohne echte Player) kopiert beim Start jede ihrer Funktionen über die gleichnamige Funktion des echten Bausteins. Sie hängt dadurch an dessen inneren Funktionsnamen, etwa dem für das Auffrischen der Player-Liste. Benennt jemand eine davon im echten Code um, ersetzt die Demo sie nicht mehr: Sie versucht dann still, echtes D-Bus zu benutzen, oder stürzt ab. Das zeigt sich erst bei der nächsten Aufnahme von Hand, also meist mitten in einem Release. Vorschlag: die Demo ersetzt eine fest benannte Liste von Funktionen, prüft beim Start, dass jede davon im echten Baustein noch existiert, und bricht sonst mit einer Meldung ab. Aufwand klein, Risiko mittel (keine Tests, die Demo wird nur von Hand gestartet). Beleg: `demo/patch.js:5`, `demo/patch.js:10`, `demo/fakeMpris.js:11`, `src/mpris.js:61`.

### 7. Es gibt keinen einzigen Test.
Der Testbefehl gibt nur „no tests“ aus. Ungeprüft sind damit gerade die Teile, die ohne laufende Player prüfbar wären: welcher Player bei „Auto“ gewählt wird, wie Titelangaben ausgepackt werden und welche Werte die Variablen bekommen. Jeder Umbau aus den Funden 1 bis 3 und 6 ändert genau diese Stellen, ohne dass etwas meldet, wenn sich das Verhalten verschiebt. Vorschlag: vor dem ersten Umbau einige Tests mit dem in Node eingebauten Testwerkzeug für diese drei Funktionen anlegen, gegen eine Player-Liste im Speicher, ohne D-Bus. Aufwand klein bis mittel, Risiko klein. Beleg: `package.json:9`, `src/mpris.js:147`, `src/mpris.js:130`, `src/variables.js:12`.

### 8. Es gibt keine `ARCHITECTURE.md`.
Die Regeln des Repos verlangen eine Datei, die sagt, aus welchen Bausteinen das Repo besteht, wer wen benutzen darf und wohin Neues gehört; ohne sie hat der Review eines PR keinen Maßstab dafür. Der Code hält eine klare Ordnung ein (nur der Player-Baustein spricht mit D-Bus, der Einstieg benutzt die Definitionen, die Definitionen nur den Player-Baustein), sie steht aber nur als Dateiliste in der README. Vorschlag: die Hauptsitzung legt die Datei an (Skill `architektur`), mit dieser Ordnung und der Demo als eigenem Baustein, der den echten Code nur von außen ersetzt. Aufwand klein, Risiko keines. Beleg: `README.md:96`, `src/mpris.js:1`, `src/index.js:2`.

## Seit dem letzten Audit
Erstes Audit.
