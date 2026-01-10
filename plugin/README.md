# Company Knowledge Hub

An Obsidian plugin for teams to share knowledge from personal vaults to a central repository.

> *"Embrace the chaos. Let your notes be messy. Trust the links."*

## How it works

1. Mark notes you want to share with `isPublished: true` in frontmatter
2. Run the **"Publish to Knowledge Hub"** command
3. Review and confirm which files to publish
4. Files are moved to your `PUBLIC/` folder
5. Use [Obsidian Git](https://github.com/denolehov/obsidian-git) to sync with your team's repository

## Features

- **Publish Command** - Scans vault for publishable files and shows confirmation modal
- **Unpublish Command** - Move current file back to Notes folder (only available for files in PUBLIC)
- **Frontmatter Validation** - Ensures required fields (like `categories`) are present
- **Automatic Attachments** - Embedded images and files are moved to `PUBLIC/Attachments/`
- **Publish Date** - Automatically sets `publishDate` in frontmatter when publishing
- **Configurable** - Customize folder names and required fields in settings

## Usage

### Mark a note for publishing

Add this to your note's frontmatter:

```yaml
---
isPublished: true
categories:
  - "[[Meetings]]"
---
```

### Publish

1. Open Command Palette (`Cmd/Ctrl + P`)
2. Run **"Publish to Knowledge Hub"**
3. Review the files in the confirmation modal
4. Click **"Publish X files"**

### Unpublish

1. Open a file that's in the PUBLIC folder
2. Open Command Palette (`Cmd/Ctrl + P`)
3. Run **"Unpublish current file"**

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Public folder | `PUBLIC` | Where published files are moved to |
| Notes folder | `Notes` | Where unpublished files are moved to |
| Attachments subfolder | `Attachments` | Subfolder within PUBLIC for images |
| Required fields | `categories` | Comma-separated list of required frontmatter fields |

## Workflow with Git

This plugin is designed to work with [Obsidian Git](https://github.com/denolehov/obsidian-git):

```
Personal Vault
    │
    │  Plugin: "Publish to Knowledge Hub"
    ▼
PUBLIC/ folder
    │
    │  Obsidian Git: commit & push
    ▼
GitHub Repository (shared with team)
```

Your team can:
- Clone the shared repo
- Create PRs for new/updated notes
- Review and merge changes
- Resolve conflicts like code

## Installation

### From Obsidian Community Plugins

1. Open Settings → Community Plugins
2. Search for "Company Knowledge Hub"
3. Install and enable

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create folder: `.obsidian/plugins/company-knowledge-hub/`
3. Copy the files into that folder
4. Reload Obsidian
5. Enable the plugin in Settings → Community Plugins

## Development

```bash
# Install dependencies
bun install

# Build (watch mode)
bun run dev

# Build (production)
bun run build
```

## Part of the BytesAndParty Plugin Suite

This plugin works great alongside other plugins from the same author:

- [Auto Categories](https://github.com/BytesAndParty/Obsidian_AutoCategories) - Automatically create category pages from frontmatter
- [Better Gitignore](https://github.com/BytesAndParty/BetterGitignore) - Beautiful .gitignore editor with templates
- [Command Overview](https://github.com/BytesAndParty/CommandOverview) - Quick command palette with shortcuts
- [Customer Tag](https://github.com/BytesAndParty/CustomerTag) - Organize notes by customer tags

## License

MIT
