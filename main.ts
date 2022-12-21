import { Notice, Plugin, TFile } from 'obsidian';
import {
  DEFAULT_SETTINGS,
  LinkExploderSettings,
  LinkExploderSettingTab,
} from './lib/LinkExploderSettingsTab';
import { createCanvasFromFile } from './lib/canvas/canvas';
import { log } from './lib/Log';

export default class LinkExploderPlugin extends Plugin {

  settings: LinkExploderSettings;

  async onload(): Promise<void> {
    await this.loadSettings();

    log.setUp(this);
    log.info(`${this.manifest.name} Loaded`);

   this.addCommand({
      id: 'link-exploder-canvas-builder',
      name: 'Create Canvas From File Links',
      checkCallback: (checking: boolean) => {
        if (checking) {
          return true;
        }
        const activeFile: TFile | null = this.app.workspace.getActiveFile();
        if (activeFile) {
          const doesFileExist = (path: string) =>
            Boolean(this.app.metadataCache.getCache(path));
          const createFile = (path: string, data: string) =>
            this.app.vault.create(path, data);
          const openFile = (currentFile: TFile) =>
            this.app.workspace.getLeaf().openFile(currentFile);
          createCanvasFromFile(
            activeFile,
            this.app.metadataCache.resolvedLinks,
            doesFileExist,
            createFile,
            openFile
          ).catch(() => {
            new Notice('Something went wrong with creating the canvas');
          });
        }
      },
    });

    if (this.manifest.name.contains('Canary')) {
      this.addCommand({
        id: 'reloadLinkExploder',
        name: 'Reload LinkExploder (dev)',
        callback: () => {
          const id: string = this.manifest.id;
          // @ts-ignore - for this.app.plugins
          const plugins = this.app.plugins;
          plugins.disablePlugin(id).then(() => plugins.enablePlugin(id));
          new Notice('Reloading LinkExploder');
        },
        hotkeys: [{ key: 'r', modifiers: ['Mod', 'Shift'] }],
      });
    }

    this.addSettingTab(new LinkExploderSettingTab(this.app, this));
  }

  onunload(): void {
    log.info('unloading link exploder');
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}