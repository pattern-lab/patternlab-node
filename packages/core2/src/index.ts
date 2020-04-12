'use strict';

import { SyncHook, Hook } from 'tapable';

interface PatternLabHooks {
  configure: SyncHook<unknown, void>;
}

interface PatternLab {
  hooks: PatternLabHooks;
}

class PatternLab implements PatternLab {
  constructor() {
    this.hooks = {
      configure: new SyncHook(),
    };
  }

  configure() {
    console.log('configure entry');
    this.hooks.configure.call([]);
    console.log('configure exit');
  }
}

module.exports = PatternLab;

// test
const pl = new PatternLab();

// test logger tap hellow world
pl.hooks.configure.tap('LoggerPlugin', () =>
  console.log('hello from logger plugin within configure')
);

pl.configure();
