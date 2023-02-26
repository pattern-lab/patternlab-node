import { PatternEngineConfig } from './engine.interface';

export interface PatternLabConfig {
  paths: {
    source: {
      root: string;
      patterns: string;
      data: string;
      meta: string;
      annotations: string;
    };
    public: {
      root: string;
      patterns: string;
      data: string;
      meta: string;
      annotations: string;
    };
  };
  patternExtension: string;
  patternExportDirectory: string;
  ishControlsHide: {
    s: boolean;
    m: boolean;
    l: boolean;
    full: boolean;
    random: boolean;
    disco: boolean;
    hay: boolean;
    mqs: boolean;
    find: boolean;
    viewsAll: boolean;
    viewsCode: boolean;
    viewsNew: boolean;
    tools: boolean;
  };
  cacheBuster: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  engines?: Record<string, PatternEngineConfig>;
}
