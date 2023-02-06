import { PatternLabConfig } from './pattern-lab-config.interface';
import { Pattern, PatternData, PatternPartial } from './pattern.interface';

export interface PatternLabEngine {
  engineName: string;
  engineFileExtension: string[];
  expandPartials: boolean;

  renderPattern: (pattern: Pattern, data: PatternData, partials?: PatternPartial) => Promise<string>;
  registerPartial: (pattern: Pattern) => void;
  findPartials: (pattern: Pattern) => RegExpMatchArray | null;
  findPartialsWithPatternParameters: (pattern: Pattern) => RegExpMatchArray | null;
  findListItems: (pattern: Pattern) => RegExpMatchArray | null;
  findPartial: (partialString: string) => string;
  spawnFile: (config: PatternLabConfig, fileName: string) => void;
  spawnMeta: (config: PatternLabConfig) => void;
  usePatternLabConfig: (config: PatternLabConfig) => void;
}

interface PatternEngineConfigBase {
  package: string;
  fileExtensions: string[];
  extend?: string | string[];
}

export type PatternEngineConfigTwig = PatternEngineConfigBase & {
  namespaces?: Record<string, string>;
  loadExtensionsFile?: string;
};

export interface PatternEngineNamespaceOptions {
  id: string;
  recursive?: boolean;
  paths: string[];
}

export type PatternEngineConfigTwigPhp = PatternEngineConfigBase & {
  namespaces?: PatternEngineNamespaceOptions[];
  alterTwigEnv?: {
    file: string;
    functions: string[];
  }[];
  relativeFrom?: string;
};

export type PatternEngineConfig =
  | PatternEngineConfigBase
  | PatternEngineConfigTwig
  | PatternEngineConfigTwigPhp;
