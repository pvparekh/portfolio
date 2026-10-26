import { describe, expect, it } from 'vitest';
import { decideTier, type CapabilityEnv } from './capability';

const desktop: CapabilityEnv = {
  search: '',
  coarsePointer: false,
  saveData: false,
  deviceMemory: 8,
  hardwareConcurrency: 12,
  webgl2: true,
  storedTier: null,
  demoted: false,
};

describe('tier decision', () => {
  it.each([
    ['capable desktop', {}, 3],
    ['low memory desktop', { deviceMemory: 2 }, 2],
    ['few cores', { hardwareConcurrency: 4 }, 2],
    ['phone or tablet', { coarsePointer: true, deviceMemory: 4, hardwareConcurrency: 6 }, 2],
    ['touch device without memory hints', { coarsePointer: true, deviceMemory: undefined, hardwareConcurrency: undefined }, 2],
    ['low-memory phone', { coarsePointer: true, deviceMemory: 2 }, 1],
    ['low-core phone', { coarsePointer: true, hardwareConcurrency: 2 }, 1],
    ['no WebGL2', { webgl2: false }, 1],
    ['Save-Data', { saveData: true }, 1],
    ['demoted after errors', { demoted: true }, 1],
    ['build flag off', { spatialEnv: 'off' }, 1],
    ['?spatial=off', { search: '?spatial=off' }, 0],
    ['?spatial=lite', { search: '?spatial=lite' }, 2],
    ['?spatial=full on touch', { search: '?spatial=full', coarsePointer: true }, 3],
    ['?spatial=full without WebGL2', { search: '?spatial=full', webgl2: false }, 1],
    ['stored css preference', { storedTier: 'css' }, 1],
    ['test mode keeps normal detection', { search: '?spatial=test' }, 3],
  ] as const)('%s', (_label, overrides, expected) => {
    expect(decideTier({ ...desktop, ...overrides })).toBe(expected);
  });
});
