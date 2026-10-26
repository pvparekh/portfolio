/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'off' disables the spatial WebGL layer at build time (instant rollback). */
  readonly VITE_SPATIAL?: string;
}
