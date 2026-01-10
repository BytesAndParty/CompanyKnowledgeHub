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

## Frontmatter Requirements

### Minimum für Publish (Pflicht)

```yaml
---
isPublished: yes        # Trigger für Plugin
categories:             # Mindestens eine Category
  - "[[Meetings]]"
---
```

### Automatisch gesetzt beim Publish

```yaml
---
isPublished: yes
categories:
  - "[[Meetings]]"
publishDate: 2026-01-09  # ← Wird automatisch gesetzt
---
```

### Empfohlen (Nice to have)

```yaml
---
isPublished: yes
categories:
  - "[[Meetings]]"
publishDate: 2026-01-09
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
│  ✅ Ready to publish (3 files)                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ Meeting with Client X.md                              │   │
│  │ ☑ Product Roadmap 2026.md                               │   │
│  │ ☑ API Documentation.md                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ⚠️ Missing required frontmatter (2 files)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✗ Quick Note.md - Missing: categories                   │   │
│  │ ✗ Ideas.md - Missing: categories                        │   │
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
│   ├── package.json           # Dependencies (Bun)
│   ├── tsconfig.json          # TypeScript Config
│   └── esbuild.config.mjs     # Build-Konfiguration
├── Obsidian-Full-Vault/       # Beispiel-Vault (nur zur Veranschaulichung)
└── todo.md                    # Diese Datei
```

## Implementierungs-Schritte

### Phase 1: Setup

- [ ] Projekt-Setup mit Bun initialisieren
- [ ] Obsidian Plugin Grundstruktur erstellen (manifest.json, main.ts)
- [ ] TypeScript/ESBuild Konfiguration für Bun einrichten

### Phase 2: Core Features

- [ ] Frontmatter-Parser implementieren
  - `isPublished: yes` erkennen
  - `categories` validieren (muss vorhanden sein)
- [ ] Publish-Command registrieren
- [ ] Confirmation Modal implementieren
  - Liste der publishbaren Dateien
  - Liste der Dateien mit fehlender Frontmatter
  - Checkboxen zum An/Abwählen
- [ ] Datei-Verschiebe-Logik (Notes/ → PUBLIC/)
- [ ] `publishDate` automatisch setzen beim Verschieben

### Phase 3: Unpublish

- [ ] Unpublish-Command registrieren (nur für aktuelle Datei)
- [ ] Datei zurück nach Notes/ verschieben
- [ ] `isPublished` und `publishDate` aus Frontmatter entfernen

### Phase 4: Attachments

- [ ] Eingebettete Attachments erkennen (`![[bild.png]]`)
- [ ] Attachments mit verschieben
- [ ] Attachment-Pfade in der Notiz aktualisieren

### Phase 5: Settings & UX

- [ ] Settings-Tab erstellen
  - PUBLIC Ordner-Name konfigurierbar (default: "PUBLIC")
  - Notes Ordner-Name konfigurierbar (default: "Notes")
  - Required Frontmatter Fields konfigurierbar
- [ ] Statusmeldungen/Notifications
  - "X Dateien verschoben"
  - Fehlerbehandlung

### Phase 6: Testing

- [ ] Plugin im Beispiel-Vault testen
- [ ] Edge Cases prüfen
  - Keine Dateien zum Publishen
  - PUBLIC Ordner existiert nicht
  - Datei existiert bereits in PUBLIC
  - Fehlende Attachments

## Technische Details

### Obsidian API Nutzung

```typescript
// Frontmatter lesen
const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;

// Datei verschieben (Links werden automatisch aktualisiert)
await app.fileManager.renameFile(file, newPath);

// Frontmatter ändern
await app.fileManager.processFrontMatter(file, (fm) => {
  fm.publishDate = new Date().toISOString().split('T')[0];
});

// Modal anzeigen
new ConfirmationModal(app, files).open();
```

### Frontmatter Validation

```typescript
interface PublishRequirements {
  isPublished: 'yes' | 'true' | true;
  categories: string[];  // Mindestens ein Element
}

function validateFrontmatter(fm: any): ValidationResult {
  const errors: string[] = [];

  if (!fm.categories || fm.categories.length === 0) {
    errors.push('Missing: categories');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

## Offene Fragen

- [x] ~~Soll es einen "Unpublish" Command geben?~~ → Ja, für aktuelle Datei
- [ ] Soll der PUBLIC Ordner automatisch erstellt werden falls nicht vorhanden?
- [ ] Sollen auch `.base` Dateien mit verschoben werden können?
- [ ] Brauchen wir einen "Mark as Published" Command (setzt nur Frontmatter, verschiebt nicht)?
