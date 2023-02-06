export type PatternData = Record<string, unknown>;

export type PatternPartial = Record<string, any>;

export interface Pattern {
  template: string;
  patternPartial: string;
  verbosePartial: string;
  extendedTemplate: string;
  relPath: string;
  name: string;
  patternName: string;
  patternPath: string;
  basePattern: Pattern;
  isPseudoPattern: boolean;
}
