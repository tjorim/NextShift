/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_REFERENCE_DATE?: string;
    readonly VITE_REFERENCE_TEAM?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
