import { PatternLabConfig } from './pattern-lab-config.interface';
import { PatternData } from './pattern.interface';

export interface PatternLab {
  /**
   * The configuration for this instance of Pattern Lab
   */
  config: PatternLabConfig;

  /**
   * The data for this instance of Pattern Lab.
   * Functions as global data for all patterns if no local
   * pattern specific data is provided.
   */
  data: PatternData;
}
