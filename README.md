## SitePark Markup Language (SPML) for Visual Studio Code

SPML language support for Visual Studio Code


**WORK IN PROGRESS**

## How to test/debug

#### Language Server installieren

Der Language Server ist zur Zeit noch nicht in der Extension verpackt und muss manuell installiert werden.

Die benötigten Repos findet man im Moment hier:<br>
https://github.com/DrWursterich/lspml<br>
https://github.com/DrWursterich/tree-sitter-spml

- Mario nach Zugang fragen und klonen. 
- ins `lspml`-Repo navigieren
- in der `Cargo.toml` den Pfad zum lokalen `tree-sitter-spml`-Repo anpassen
- mit `cargo build` bauen (ggfs vorher cargo installieren)

Dannach sollte in `./target/debug` die ausführbare binary `lspml` liegen

#### Extension testen

- Dieses Repo klonen und in VSCode öffnen
- in `extension.js` Dateipfad `PATH_TO_LSPML_BINARY` anpassen, sodass dieser auf die binary zeigt
- bei geöffneter `extension.js` Debug-Menü mit <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd> öffnen und "Run and Debug" auswählen

Es sollte sich nun ein weiteres VSCode-Fenster öffnen, in dem die Extension läuft. spml-Dateien sollten nun mit der Sprache 
SPML assoziiert sein.<br>
Falls nicht: beliebige spml-Datei öffnen -> Command Palette -> "Change Language Mode" -> "Configure File Association for '.spml'" -> SitePark Markup Language.

Innerhalb von spml-Dateien sollte der Language Server dann laufen. Tipp: Mit <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd> Entwicklerkonsole öffnen.






