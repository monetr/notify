import { afterEach, describe, expect, test } from '@rstest/core';

import { assignStyle, camelToKebab, chain, dampenValue, reset, set } from '../src/helpers';

let mounted: HTMLElement[] = [];
function newEl() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  mounted.push(el);
  return el;
}

afterEach(() => {
  for (const el of mounted) {
    el.remove();
  }
  mounted = [];
});

describe('camelToKebab', () => {
  test('passes through single-word lowercase', () => {
    expect(camelToKebab('color')).toBe('color');
    expect(camelToKebab('opacity')).toBe('opacity');
  });

  test('converts camelCase to kebab', () => {
    expect(camelToKebab('borderRadius')).toBe('border-radius');
    expect(camelToKebab('transitionTimingFunction')).toBe('transition-timing-function');
  });

  test('passes through already-kebab keys unchanged', () => {
    expect(camelToKebab('border-radius')).toBe('border-radius');
  });

  test('preserves CSS custom properties even when they contain capitals', () => {
    expect(camelToKebab('--my-color')).toBe('--my-color');
    expect(camelToKebab('--myColor')).toBe('--myColor');
  });

  test('handles empty string', () => {
    expect(camelToKebab('')).toBe('');
  });
});

describe('helpers.set / reset', () => {
  test('reset() restores originals from sequential set() calls', () => {
    const el = newEl();
    el.style.color = 'red';
    el.style.background = 'blue';

    set(el, { color: 'green' });
    set(el, { background: 'yellow' });
    reset(el);

    expect(el.style.color).toBe('red');
    expect(el.style.background).toBe('blue');
  });

  test('clears properties that had no prior inline value', () => {
    const el = newEl();
    set(el, { transform: 'scale(0.9)' });
    expect(el.style.transform).toBe('scale(0.9)');

    reset(el);
    expect(el.style.transform).toBe('');
  });

  test('reset(el, prop) restores only that one property', () => {
    const el = newEl();
    el.style.color = 'red';
    el.style.background = 'blue';

    set(el, { color: 'green', background: 'yellow' });
    reset(el, 'color');

    expect(el.style.color).toBe('red');
    expect(el.style.background).toBe('yellow');
  });

  test('applies CSS custom properties; reset does not restore them', () => {
    const el = newEl();
    el.style.setProperty('--my-color', 'red');

    set(el, { '--my-color': 'green' });
    expect(el.style.getPropertyValue('--my-color')).toBe('green');

    reset(el);
    expect(el.style.getPropertyValue('--my-color')).toBe('green');
  });
});

describe('helpers.assignStyle', () => {
  test('cleanup restores prior values', () => {
    const el = newEl();
    el.style.color = 'red';

    const cleanup = assignStyle(el, { color: 'green' });
    expect(el.style.color).toBe('green');

    cleanup();
    expect(el.style.color).toBe('red');
  });

  test('cleanup clears keys that had no prior inline value', () => {
    const el = newEl();
    const cleanup = assignStyle(el, { transform: 'scale(0.9)' });
    expect(el.style.transform).toBe('scale(0.9)');

    cleanup();
    expect(el.style.transform).toBe('');
  });

  test('handles null element with no-op cleanup', () => {
    const cleanup = assignStyle(null, { transform: 'scale(0.9)' });
    expect(() => cleanup()).not.toThrow();
  });
});

describe('helpers.dampenValue', () => {
  test('returns smaller numbers for larger inputs (logarithmic)', () => {
    expect(dampenValue(0)).toBeLessThan(0); // 8 * (log(1) - 2) = -16
    expect(dampenValue(100)).toBeGreaterThan(dampenValue(50));
    expect(dampenValue(1000)).toBeGreaterThan(dampenValue(500));
    // The growth is sub-linear: doubling the input adds a small amount.
    const at100 = dampenValue(100);
    const at1000 = dampenValue(1000);
    expect(at1000 - at100).toBeLessThan(at100);
  });
});

describe('helpers.chain', () => {
  test('calls every function with the same args', () => {
    const calls: number[] = [];
    const a = (n: number) => calls.push(n);
    const b = (n: number) => calls.push(n * 10);
    chain(a, b)(3);
    expect(calls).toEqual([3, 30]);
  });

  test('skips non-function entries without throwing', () => {
    const calls: number[] = [];
    chain((n: number) => calls.push(n), undefined as unknown as (n: number) => void)(1);
    expect(calls).toEqual([1]);
  });
});
