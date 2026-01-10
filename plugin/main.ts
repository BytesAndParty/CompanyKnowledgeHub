import {
  App,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  TFolder,
} from "obsidian";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface KnowledgeHubSettings {
  publicFolder: string;
  notesFolder: string;
  requiredFields: string[];
}

const DEFAULT_SETTINGS: KnowledgeHubSettings = {
  publicFolder: "PUBLIC",
  notesFolder: "Notes",
  requiredFields: ["categories"],
};

interface FileValidationResult {
  file: TFile;
  valid: boolean;
  errors: string[];
}

// ============================================================================
// Main Plugin
// ============================================================================

export default class KnowledgeHubPlugin extends Plugin {
  settings: KnowledgeHubSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    // Publish Command - scans all files
    this.addCommand({
      id: "publish-to-knowledge-hub",
      name: "Publish to Knowledge Hub",
      callback: () => this.openPublishModal(),
    });

    // Unpublish Command - current file only
    this.addCommand({
      id: "unpublish-current-file",
      name: "Unpublish current file",
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return false;

        // Only show if file is in PUBLIC folder
        const isInPublic = file.path.startsWith(this.settings.publicFolder + "/");
        if (!isInPublic) return false;

        if (!checking) {
          this.unpublishFile(file);
        }
        return true;
      },
    });

    // Settings Tab
    this.addSettingTab(new KnowledgeHubSettingTab(this.app, this));

    console.log("Company Knowledge Hub plugin loaded");
  }

  onunload() {
    console.log("Company Knowledge Hub plugin unloaded");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // ==========================================================================
  // Core Logic
  // ==========================================================================

  /**
   * Find all files with isPublished: yes that are NOT already in PUBLIC
   */
  async findPublishableFiles(): Promise<FileValidationResult[]> {
    const results: FileValidationResult[] = [];
    const files = this.app.vault.getMarkdownFiles();

    for (const file of files) {
      // Skip files already in PUBLIC
      if (file.path.startsWith(this.settings.publicFolder + "/")) {
        continue;
      }

      const cache = this.app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;

      // Check if isPublished is set
      if (!frontmatter) continue;
      const isPublished = frontmatter.isPublished;
      if (isPublished !== "yes" && isPublished !== true && isPublished !== "true") {
        continue;
      }

      // Validate required fields
      const errors: string[] = [];
      for (const field of this.settings.requiredFields) {
        const value = frontmatter[field];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errors.push(`Missing: ${field}`);
        }
      }

      results.push({
        file,
        valid: errors.length === 0,
        errors,
      });
    }

    return results;
  }

  /**
   * Move a file to PUBLIC folder and set publishDate
   */
  async publishFile(file: TFile): Promise<void> {
    // Ensure PUBLIC folder exists
    await this.ensureFolderExists(this.settings.publicFolder);

    // Set publishDate in frontmatter
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.publishDate = new Date().toISOString().split("T")[0];
    });

    // Move file to PUBLIC
    const newPath = `${this.settings.publicFolder}/${file.name}`;
    await this.app.fileManager.renameFile(file, newPath);
  }

  /**
   * Move a file from PUBLIC back to Notes and remove publish metadata
   */
  async unpublishFile(file: TFile): Promise<void> {
    // Ensure Notes folder exists
    await this.ensureFolderExists(this.settings.notesFolder);

    // Remove isPublished and publishDate from frontmatter
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      delete fm.isPublished;
      delete fm.publishDate;
    });

    // Move file to Notes
    const newPath = `${this.settings.notesFolder}/${file.name}`;
    await this.app.fileManager.renameFile(file, newPath);

    new Notice(`Unpublished: ${file.basename}`);
  }

  /**
   * Ensure a folder exists, create if not
   */
  async ensureFolderExists(folderPath: string): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }
  }

  /**
   * Open the publish confirmation modal
   */
  async openPublishModal(): Promise<void> {
    const results = await this.findPublishableFiles();

    if (results.length === 0) {
      new Notice("No files with isPublished: yes found");
      return;
    }

    new PublishModal(this.app, this, results).open();
  }
}

// ============================================================================
// Publish Confirmation Modal
// ============================================================================

class PublishModal extends Modal {
  plugin: KnowledgeHubPlugin;
  results: FileValidationResult[];
  selectedFiles: Set<TFile>;

  constructor(app: App, plugin: KnowledgeHubPlugin, results: FileValidationResult[]) {
    super(app);
    this.plugin = plugin;
    this.results = results;
    this.selectedFiles = new Set(results.filter((r) => r.valid).map((r) => r.file));
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("knowledge-hub-modal");

    // Title
    contentEl.createEl("h2", { text: "Publish to Knowledge Hub" });

    const validFiles = this.results.filter((r) => r.valid);
    const invalidFiles = this.results.filter((r) => !r.valid);

    // Valid files section
    if (validFiles.length > 0) {
      const validSection = contentEl.createDiv("valid-section");
      validSection.createEl("h3", {
        text: `Ready to publish (${validFiles.length} files)`,
      });

      const validList = validSection.createDiv("file-list");
      for (const result of validFiles) {
        const item = validList.createDiv("file-item");
        const checkbox = item.createEl("input", { type: "checkbox" });
        checkbox.checked = this.selectedFiles.has(result.file);
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            this.selectedFiles.add(result.file);
          } else {
            this.selectedFiles.delete(result.file);
          }
          this.updateButtonText();
        });
        item.createSpan({ text: result.file.basename, cls: "file-name" });
      }
    }

    // Invalid files section
    if (invalidFiles.length > 0) {
      const invalidSection = contentEl.createDiv("invalid-section");
      invalidSection.createEl("h3", {
        text: `Missing required frontmatter (${invalidFiles.length} files)`,
        cls: "warning-header",
      });

      const invalidList = invalidSection.createDiv("file-list");
      for (const result of invalidFiles) {
        const item = invalidList.createDiv("file-item invalid");
        item.createSpan({ text: result.file.basename, cls: "file-name" });
        item.createSpan({
          text: ` - ${result.errors.join(", ")}`,
          cls: "error-text",
        });
      }
    }

    // Buttons
    const buttonContainer = contentEl.createDiv("button-container");

    const cancelButton = buttonContainer.createEl("button", { text: "Cancel" });
    cancelButton.addEventListener("click", () => this.close());

    this.publishButton = buttonContainer.createEl("button", {
      text: `Publish ${this.selectedFiles.size} files`,
      cls: "mod-cta",
    });
    this.publishButton.addEventListener("click", () => this.doPublish());
  }

  private publishButton!: HTMLButtonElement;

  private updateButtonText() {
    this.publishButton.textContent = `Publish ${this.selectedFiles.size} files`;
    this.publishButton.disabled = this.selectedFiles.size === 0;
  }

  private async doPublish() {
    const files = Array.from(this.selectedFiles);
    let successCount = 0;

    for (const file of files) {
      try {
        await this.plugin.publishFile(file);
        successCount++;
      } catch (error) {
        console.error(`Failed to publish ${file.path}:`, error);
        new Notice(`Failed to publish ${file.basename}`);
      }
    }

    new Notice(`Published ${successCount} files to ${this.plugin.settings.publicFolder}`);
    this.close();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

// ============================================================================
// Settings Tab
// ============================================================================

class KnowledgeHubSettingTab extends PluginSettingTab {
  plugin: KnowledgeHubPlugin;

  constructor(app: App, plugin: KnowledgeHubPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Company Knowledge Hub Settings" });

    new Setting(containerEl)
      .setName("Public folder")
      .setDesc("Folder where published files will be moved to")
      .addText((text) =>
        text
          .setPlaceholder("PUBLIC")
          .setValue(this.plugin.settings.publicFolder)
          .onChange(async (value) => {
            this.plugin.settings.publicFolder = value || "PUBLIC";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Notes folder")
      .setDesc("Folder where unpublished files will be moved to")
      .addText((text) =>
        text
          .setPlaceholder("Notes")
          .setValue(this.plugin.settings.notesFolder)
          .onChange(async (value) => {
            this.plugin.settings.notesFolder = value || "Notes";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Required frontmatter fields")
      .setDesc("Comma-separated list of fields required for publishing")
      .addText((text) =>
        text
          .setPlaceholder("categories")
          .setValue(this.plugin.settings.requiredFields.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.requiredFields = value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            await this.plugin.saveSettings();
          })
      );
  }
}
