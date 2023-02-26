import { PatternLab } from './pattern-lab.interface';

export type PatternData = Record<string, unknown>;

export type PatternPartial = Record<string, any>;

export type CompileStateKey = 'NEEDS_REBUILD' | 'BUILDING' | 'CLEAN';
export type CompileState = Record<CompileStateKey, string>;

export interface PatternGroupData {
  /**
   * the order of the group relative to root or parent group
   */
  order: number;

  /**
   * Flag if the group should not be shown in the UI
   */
  hidden: boolean;
}

export interface Pattern {
  /**
   * this is the unique name, subDir + fileName (sans extension)
   */
  name: string;

  /**
   * The relative path from the pattern source directory to the pattern.
   * e.g. 'atoms/global/colors.hbs'
   */
  relPath: string;

  /**
   * The sub directory of the pattern source directory where the pattern is located
   * without the pattern file name and extension. e.g. 'atoms/global'
   */
  subDir: string;

  /**
   * The full name of the pattern file excluding the extension
   */
  fileName: string;

  /**
   * The file extension of the pattern. e.g. '.hbs', '.twig'
   */
  fileExtension: string;

  /**
   * The pattern this pattern extends
   */
  basePattern: Pattern;

  /**
   * The engine used to render this pattern
   */
  engine: string;

  /**
   * the joined pattern group and subgroup directory
   */
  flatPatternPath: string;

  /**
   * Definition of flat pattern:
   * The flat pattern is a high level pattern which is attached directly to
   * the main root folder or to a root directory.
   * --- This ---
   * root
   *  flatPattern
   * --- OR That ---
   * root
   *  molecules
   *   flatPattern
   */
  isFlatPattern: string;

  /**
   * Is either a pattern (true) or a meta data pattern (false) generated form markdown files
   */
  isPattern: boolean;

  /**
   * The pseudo pattern flag is used to identify patterns that are generated from data json files
   */
  isPseudoPattern: boolean;

  /**
   * the JSON used to render values in the pattern
   */
  jsonFileData: string;

  /**
   * The filename where tildes are flipped to dashes
   */
  patternBaseName: string;

  /**
   * Calculated path from the root of the public directory to the generated
   * (rendered!) html file for this pattern, to be shown in the iframe
   */
  patternLink: string;

  /**
   * Fancy name - Uppercase letters of pattern name partials.
   * global-colors -> 'Global Colors'
   * this is the display name for the ui. strip numeric + hyphen prefixes
   */
  patternName: string;

  /**
   * The canonical "key" by which this pattern is known. This is the callable
   * name of the pattern.
   */
  patternPartial: string;

  /**
   * @deprecated https://github.com/pattern-lab/patternlab-node/issues/1180
   */
  patternPartialCode: string;

  /**
   * The pattern state. e.g. 'ready', 'wip', 'deprecated' (self defined by user)
   */
  patternState: string;

  /**
   * The top-level pattern group this pattern belongs to. e.g. 'atoms'
   */
  patternGroup: string;

  /**
   * Extraction of the pattern group markdown settings
   */
  patternGroupData: PatternGroupData;

  /**
   * The sub-group this pattern belongs to. e.g. 'form'
   */
  patternSubgroup: string;

  /**
   * Extraction of the pattern subgroup markdown settings
   */
  patternSubgroupData: PatternGroupData;

  /**
   * The template from the patterns source file
   */
  template: string;

  /**
   * The template used to render the pattern. It could be the same as the template if
   * it has no includes or it contains the full template with all its includes.
   * The extended template is used by the pattern engines.
   */
  extendedTemplate: string;

  /**
   * The definition where the pattern should be sorted in the context of its group and subgroup.
   */
  order: string;

  /**
   * If the pattern is a pseudo pattern, the variant could have its own sorting order.
   */
  variantOrder: string;

  /**
   * A possible way to identify the pattern location. e.g. 'atoms-form/button'
   */
  verbosePartial: string;

  /**
   * Determines if this pattern needs to be recompiled.
   * @see {@link CompileState}
   */
  compileState: CompileState;

  /**
   * Timestamp in milliseconds when the pattern template or auxiliary file (e.g. json) were modified.
   * If multiple files are affected, this is the timestamp of the most recent change.
   *
   * @see {@link pattern}
   */
  lastModified: number | null;

  lineage: string;

  lineageIndex: string;

  lineageR: string;

  lineageRIndex: string;

  /**
   * Render function - acts as a proxy for the PatternEngine's `renderPattern` function
   *
   * @see {@link PatternEngine.renderPattern}
   * @returns The rendered pattern
   */
  render: (data: PatternData, partials: PatternPartial) => Promise<string>;

  /**
   * Register a partial for the pattern engine
   * @see {@link PatternEngine.registerPartial}
   */
  registerPartial: () => void;

  /**
   * calculated path from the root of the public directory to the generated html
   * file for this pattern.
   *
   * Should look something like 'atoms-global-colors/atoms-global-colors.html'
   *
   * @param patternlab Current patternlab instance
   * @param suffixType File suffix
   * @param customFileExtension Custom extension
   */
  getPatternLink: (patternlab: PatternLab, suffixType: string, customFileExtension: string) => void;

  /**
   * The finders all delegate to the PatternEngine, which also
   * encapsulates all appropriate regex's
   * @see {@link PatternEngine.findPartials}
   * @returns The partials found in the pattern
   */
  findPartials: () => RegExpMatchArray | null;

  /**
   * The finders all delegate to the PatternEngine, which also
   * encapsulates all appropriate regex's
   * @see {@link PatternEngine.findPartialsWithPatternParameters}
   * @returns The partials found in the pattern
   */
  findPartialsWithPatternParameters: () => RegExpMatchArray | null;

  /**
   * The finders all delegate to the PatternEngine, which also
   * encapsulates all appropriate regex's
   * @see {@link PatternEngine.findListItems}
   * @returns The list items found in the pattern
   */
  findListItems: () => RegExpMatchArray | null;

  /**
   * The finders all delegate to the PatternEngine, which also
   * encapsulates all appropriate regex's
   * @see {@link PatternEngine.findPartial}
   * @returns The pattern parameters found in the pattern
   */
  findPartial: (partialString: string) => string;

  /**
   * Reset the information that the pattern has it's own directory,
   * so that this pattern will not be handled as flat pattern if it
   * is located on a top level folder.
   *
   * @param patternlab Current patternlab instance
   */
  promoteFromDirectoryToFlatPattern: (patternlab: PatternLab) => void;

  /**
   * factory: creates an empty Pattern for miscellaneous internal use, such as
   * by list_item_hunter
   *
   * @param customProps Properties to apply to new pattern
   * @param patternlab Current patternlab instance
   */
  createEmpty: (customProps: Partial<Pattern>, patternlab: PatternLab) => Pattern;

  /**
   * factory: creates a Pattern object on-demand from a hash; the hash accepts
   * parameters that replace the positional parameters that the Pattern
   * constructor takes.
   */
  create: (
    relPath: string,
    data: PatternData,
    customProps: Partial<Pattern>,
    patternlab: PatternLab,
  ) => Pattern;
}
