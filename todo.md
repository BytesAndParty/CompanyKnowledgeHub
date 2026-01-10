# Company Knowledge Hub - Obsidian Plugin

> *"Embrace the chaos. Let your notes be messy. Trust the links."*
> — Inspired by [Steph Ango](https://stephango.com/vault)

## Ziel

Ein Obsidian Plugin für Teams, das einen gemeinsamen Knowledge Hub ermöglicht. Jeder arbeitet in seinem persönlichen Vault, aber markierte Notizen landen in einem gemeinsamen PUBLIC Ordner, der via Git synchronisiert wird.

## Vault-Philosophie (aus Analyse)

| Prinzip | Bedeutung |
|---------|-----------|
| **Flache Struktur** | Alle Notizen in `Notes/`, keine Ordner-Hierarchie |
| **Links > Ordner** | Navigation via Quick Switcher (Cmd+O) + Backlinks |
| **Frontmatter ist König** | Categories, Topics, People machen Notizen auffindbar |
| **Bases als Views** | `.base` Dateien = dynamische, gefilterte Listen |
| **Embrace the Chaos** | Schreib einfach, Struktur entsteht durch Links |

## Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  Persönlicher Vault                                             │
│  ┌─────────────┐                                                │
│  │   Notes/    │  ← Alle persönlichen Notizen                   │
│  │   Daily/    │                                                │
│  │   ...       │                                                │
│  └─────────────┘                                                │
│         │                                                       │
│         │  Plugin Command: "Publish to Knowledge Hub"           │
│         │  (mit Confirmation Modal)                             │
│         ▼                                                       │
│  ┌─────────────┐                                                │
│  │   PUBLIC/   │  ← Git-synchronisiert                          │
│  │   └─ Attachments/  ← Bilder/Dateien                          │
│  └─────────────┘                                                │
│         │                                                       │
└─────────┼───────────────────────────────────────────────────────┘
          │
          │  Obsidian Git Extension
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Repository (Zentral)                                    │
│  ┌─────────────┐                                                │
│  │    main     │  ← Approved Knowledge                          │
│  └─────────────┘                                                │
│         ▲                                                       │
│         │  Pull Request + Review                                │
│         │                                                       │
│  ┌─────────────┐                                                │
│  │  feature/*  │  ← Neue/geänderte Notizen                      │
│  └─────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Entscheidungen

| Thema | Entscheidung | Begründung |
|-------|--------------|------------|
| Copy vs. Move | **Verschieben** | Keine Duplikate, Links werden von Obsidian automatisch aktualisiert |
| Git-Integration | **Nein** | Obsidian Git Extension übernimmt |
| Link-Handling | **Ignorieren** | Obsidian updated Links automatisch |
| Unpublish-Ziel | **Notes/** | Flache Struktur, kein Ursprungsort nötig |
| Build Tool | **Bun** | Schnell, modern |
| Attachments | **PUBLIC/Attachments/** | Eigener Unterordner für Bilder |

## Frontmatter Requirements

### Minimum für Publish (Pflicht)

```yaml
---
isPublished: true       # Trigger für Plugin (boolean)
categories:             # Mindestens eine Category
  - "[[Meetings]]"
---
```

### Automatisch gesetzt beim Publish

```yaml
---
isPublished: true
categories:
  - "[[Meetings]]"
publishDate: 2026-01-10  # ← Wird automatisch gesetzt
---
```

### Empfohlen (Nice to have)

```yaml
---
isPublished: true
categories:
  - "[[Meetings]]"
publishDate: 2026-01-10
author:                  # Wer hat's geschrieben?
  - "[[Robert Stickler]]"
topics:                  # Worum geht's?
  - "[[Knowledge Management]]"
---
```

## Commands

| Command | Beschreibung | Scope |
|---------|--------------|-------|
| `Publish to Knowledge Hub` | Zeigt Modal mit allen publishbaren Dateien, verschiebt nach Bestätigung | Vault-weit |
| `Unpublish current file` | Verschiebt Datei aus PUBLIC → Notes/, entfernt `isPublished` + `publishDate` | Aktuelle Datei |

## Confirmation Modal (Publish)

```
┌─────────────────────────────────────────────────────────────────┐
│  Publish to Knowledge Hub                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Ready to publish (3 files)                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [x] Meeting with Client X.md                             │   │
│  │ [x] Product Roadmap 2026.md                              │   │
│  │ [x] API Documentation.md                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Missing required frontmatter (2 files)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Quick Note.md - Missing: categories                      │   │
│  │ Ideas.md - Missing: categories                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                              [Cancel]  [Publish 3 files]        │
└─────────────────────────────────────────────────────────────────┘
```

## Projektstruktur

```
CompanyKnowledgeHub/
├── plugin/                    # Das Obsidian Plugin
│   ├── manifest.json          # Plugin-Metadaten für Obsidian
│   ├── main.ts                # Hauptlogik
│   ├── main.js                # Compiled output
│   ├── styles.css             # Modal Styling (TODO)
│   ├── package.json           # Dependencies (Bun)
│   ├── tsconfig.json          # TypeScript Config
│   └── esbuild.config.mjs     # Build-Konfiguration
├── Obsidian-Full-Vault/       # Beispiel-Vault (nur zur Veranschaulichung)
└── todo.md                    # Diese Datei
```

---

## Code-Analyse

### Qualitätsbewertung: 8/10

**Stärken:**
- Saubere Struktur mit klaren Sektionen (Types, Plugin, Modal, Settings)
- TypeScript mit strikten Typen
- Obsidian API korrekt verwendet (`metadataCache`, `fileManager`, `processFrontMatter`)
- Settings werden persistiert
- Gute Trennung von Concerns (Modal, Plugin, Settings als separate Klassen)
- checkCallback für kontextabhängigen Unpublish-Command

**Schwächen:**
- ~~`TFolder` ist importiert aber nicht verwendet~~ FIXED
- Keine CSS-Styles für das Modal (`styles.css` fehlt)
- ~~Notice-Text sagt "isPublished: yes" statt "isPublished: true"~~ FIXED
- ~~Attachment-Handling fehlt komplett~~ FIXED
- Kein Error-Handling für Edge Cases (z.B. Datei existiert bereits in PUBLIC)
- Keine Logging-Strategie (nur console.log)

**Code Smells:**
- `publishButton!` non-null assertion könnte vermieden werden
- Hardcoded Strings sollten Konstanten sein

---

## Implementierungs-Status

### Phase 1: Setup [DONE]

- [x] Projekt-Setup mit Bun initialisieren
- [x] Obsidian Plugin Grundstruktur erstellen (manifest.json, main.ts)
- [x] TypeScript/ESBuild Konfiguration für Bun einrichten

### Phase 2: Core Features [DONE]

- [x] Frontmatter-Parser implementieren
  - [x] `isPublished: true` erkennen
  - [x] `categories` validieren (muss vorhanden sein)
- [x] Publish-Command registrieren
- [x] Confirmation Modal implementieren
  - [x] Liste der publishbaren Dateien
  - [x] Liste der Dateien mit fehlender Frontmatter
  - [x] Checkboxen zum An/Abwählen
- [x] Datei-Verschiebe-Logik (Notes/ → PUBLIC/)
- [x] `publishDate` automatisch setzen beim Verschieben

### Phase 3: Unpublish [DONE]

- [x] Unpublish-Command registrieren (nur für aktuelle Datei)
- [x] Datei zurück nach Notes/ verschieben
- [x] `isPublished` und `publishDate` aus Frontmatter entfernen

### Phase 4: Attachments [DONE]

- [x] Eingebettete Attachments erkennen (`![[bild.png]]`, `![[doc.pdf]]`)
- [x] `PUBLIC/Attachments/` Ordner erstellen
- [x] Attachments nach `PUBLIC/Attachments/` verschieben
- [x] Attachment-Pfade in der Notiz werden automatisch von Obsidian aktualisiert
- [x] Settings: Attachments-Subfolder konfigurierbar

### Phase 5: Settings & UX [DONE]

- [x] Settings-Tab erstellen
  - [x] PUBLIC Ordner-Name konfigurierbar (default: "PUBLIC")
  - [x] Notes Ordner-Name konfigurierbar (default: "Notes")
  - [x] Attachments Subfolder konfigurierbar (default: "Attachments")
  - [x] Required Frontmatter Fields konfigurierbar
- [x] Statusmeldungen/Notifications
- [x] `styles.css` für besseres Modal-Styling

### Phase 6: Testing [TODO]

- [ ] Plugin im Vault testen
- [ ] Edge Cases prüfen
  - [ ] Keine Dateien zum Publishen
  - [ ] PUBLIC Ordner existiert nicht → wird automatisch erstellt
  - [ ] Datei existiert bereits in PUBLIC
  - [ ] Fehlende Attachments

---

## Obsidian Community Plugin Store - Requirements

### Notwendige Dateien

| Datei | Status | Beschreibung |
|-------|--------|--------------|
| `manifest.json` | DONE | Plugin-Metadaten |
| `main.js` | DONE | Compiled Plugin |
| `styles.css` | DONE | Modal Styling |
| `README.md` | DONE | Plugin-Dokumentation |
| `LICENSE` | DONE | MIT License |

### manifest.json Anforderungen

```json
{
  "id": "company-knowledge-hub",      // Unique, lowercase, kebab-case
  "name": "Company Knowledge Hub",    // Display name
  "version": "1.0.0",                 // SemVer
  "minAppVersion": "1.0.0",           // Minimum Obsidian version
  "description": "...",               // Kurzbeschreibung
  "author": "Robert Stickler",
  "authorUrl": "",                    // Optional
  "isDesktopOnly": false
}
```

### GitHub Release Anforderungen

1. **Tag muss exakt Version sein**: `1.0.0` (NICHT `v1.0.0`)
2. **Release Assets hochladen:**
   - `manifest.json`
   - `main.js`
   - `styles.css` (falls vorhanden)

### Submission Process

1. GitHub Repository erstellen (public)
2. Release erstellen mit korrektem Tag
3. PR an [obsidian-releases](https://github.com/obsidianmd/obsidian-releases) → `community-plugins.json`

```json
{
  "id": "company-knowledge-hub",
  "name": "Company Knowledge Hub",
  "author": "Robert Stickler",
  "description": "Publish notes to a shared knowledge hub for team collaboration",
  "repo": "username/company-knowledge-hub"
}
```

### Checkliste für Store-Release

- [ ] GitHub Repository erstellen
- [x] ~~README.md schreiben~~
- [x] ~~LICENSE hinzufügen (MIT)~~
- [x] ~~styles.css erstellen~~
- [x] ~~Unused imports entfernen (TFolder)~~
- [x] ~~Notice-Texte auf "true" ändern~~
- [ ] Edge Case Handling verbessern (optional)
- [ ] Version 1.0.0 Release erstellen
- [ ] PR an obsidian-releases

---

## Offene Fragen

- [x] ~~Soll es einen "Unpublish" Command geben?~~ → Ja, für aktuelle Datei
- [x] ~~Soll der PUBLIC Ordner automatisch erstellt werden?~~ → Ja, bereits implementiert
- [ ] Sollen auch `.base` Dateien mit verschoben werden können?
- [ ] Brauchen wir einen "Mark as Published" Command (setzt nur Frontmatter, verschiebt nicht)?
- [ ] Soll beim Unpublish auch die Attachments zurückverschoben werden?

---

## Quellen

- [Obsidian Plugin Submission Requirements](https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins)
- [Submit your plugin](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin)
- [obsidian-releases Repository](https://github.com/obsidianmd/obsidian-releases)
