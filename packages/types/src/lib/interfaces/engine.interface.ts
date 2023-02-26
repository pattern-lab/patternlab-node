import { PatternLabConfig } from './pattern-lab-config.interface';
import { Pattern, PatternData, PatternPartial } from './pattern.interface';

export interface PatternLabEngine {
  /**
   * The unique name of the engine used to key out the engine in the pattern lab instance
   */
  engineName: string;

  /**
   * The file extensions that this engine can render and by which patterns are loaded.
   * e.g. ['.hbs', '.handlebars']
   */
  engineFileExtension: string[];

  /**
   * Defines if the engine should look out for partials directly on the include sub pattern mechanism
   * @deprecated is only used by mustache engine and will be removed in the future
   * in favor of default behavior https://github.com/pattern-lab/patternlab-node/issues/1180
   */
  expandPartials: boolean;

  /**
   * Render the pattern template with the given data and partials
   * @param pattern the pattern to render
   * @param data additional data to pass to the pattern template
   * @param partials partials to pass to the pattern template or which need to be added to the engine)
   * @returns the rendered pattern
   */
  renderPattern: (pattern: Pattern, data: PatternData, partials?: PatternPartial) => Promise<string>;

  /**
   * Register a pattern to the engine so that it can be used in the render process later on
   * @param pattern the pattern to register
   */
  registerPartial: (pattern: Pattern) => void;

  /**
   * Fin all partials in the given pattern
   * @param pattern the pattern to search for partials
   * @returns the partials found in the pattern
   */
  findPartials: (pattern: Pattern) => RegExpMatchArray | null;

  /**
   * Fin all partials with pattern parameters in the given pattern
   * @param pattern the pattern to search for partials
   * @returns the partials found in the pattern
   * @deprecated is only used by mustache engine and will be removed in the future in favor
   * of default behavior https://github.com/pattern-lab/patternlab-node/issues/1180
   */
  findPartialsWithPatternParameters: (pattern: Pattern) => RegExpMatchArray | null;

  /**
   * Fin all list items in the given pattern
   * @param pattern the pattern to search for list items
   * @returns the list items found in the pattern
   * @deprecated this feature is not supported anymore and will be removed in the future
   * https://github.com/pattern-lab/patternlab-node/issues/1178
   */
  findListItems: (pattern: Pattern) => RegExpMatchArray | null;

  /**
   * Fin a specific partial in the given pattern
   * @param partialString the partial to search for
   * @returns the pattern partial found in the pattern
   */
  findPartial: (partialString: string) => string;

  /**
   *
   * @param config
   * @returns
   */
  spawnMeta: (config: PatternLabConfig) => void;

  /**
   *
   * @param config
   * @returns
   */
  usePatternLabConfig: (config: PatternLabConfig) => void;
}

interface PatternEngineConfigBase {
  /**
   * The name of the npm package to load the engine from
   */
  package: string;

  /**
   * The file extensions that this engine can render and by which patterns are loaded.
   * e.g. ['.hbs', '.handlebars']
   */
  fileExtensions: string[];

  /**
   * The location of extensions that should be loaded by the engine
   */
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
