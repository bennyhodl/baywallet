export * from "./DataProvider"
import { LightningStore } from "./lightning-store"
import { SettingsStore } from "./settings-store"
import { NostrKeyStore } from "./nostr-key-store"
// import { LspStore } from "./lsp-store"

export class DataStore {
    public lightningStore: LightningStore
    public nostrKeyStore: NostrKeyStore
    public settingsStore: SettingsStore
    // public lspStore: LspStore
    
    constructor() {
        this.lightningStore = new LightningStore(this)
        this.nostrKeyStore = new NostrKeyStore(this)
        this.settingsStore = new SettingsStore(this)
        // this.lspStore = new LspStore(this)
    }
}
