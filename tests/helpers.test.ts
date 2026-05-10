import { describe, expect, test } from '@rstest/core';

import { dampenValue } from '../src/helpers';

describe('dampenValue', () => {
  test('dampens larger inputs sub-linearly', () => {
    expect(dampenValue(0)).toBeLessThan(0);
    expect(dampenValue(100)).toBeGreaterThan(dampenValue(50));
    expect(dampenValue(1000)).toBeGreaterThan(dampenValue(500));
    const at100 = dampenValue(100);
    const at1000 = dampenValue(1000);
    expect(at1000 - at100).toBeLessThan(at100);
  });
});
