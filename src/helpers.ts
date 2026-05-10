type AnyFunction = (...args: never[]) => unknown;

interface Style {
  [key: string]: string;
}

const cache = new WeakMap<HTMLElement, Style>();

export function camelToKebab(key: string): string {
  return key.startsWith('--') ? key : key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
}

export function set(el: Element | HTMLElement | null | undefined, styles: Style, ignoreCache = false) {
  if (!el || !(el instanceof HTMLElement)) {
    return;
  }
  // Merge into whatever's already cached. Without this, sequential set() calls clobbered the
  // cache, so reset() would only undo the most recent call's keys.
  const originalStyles: Style = { ...(cache.get(el) ?? {}) };

  Object.entries(styles).forEach(([key, value]: [string, string]) => {
    if (key.startsWith('--')) {
      el.style.setProperty(key, value);
      return;
    }

    const cssProperty = camelToKebab(key);
    if (!(key in originalStyles)) {
      originalStyles[key] = el.style.getPropertyValue(cssProperty);
    }
    el.style.setProperty(cssProperty, value);
  });

  if (ignoreCache) {
    return;
  }

  cache.set(el, originalStyles);
}

export function reset(el: Element | HTMLElement | null, prop?: string) {
  if (!el || !(el instanceof HTMLElement)) {
    return;
  }
  const originalStyles = cache.get(el);

  if (!originalStyles) {
    return;
  }

  if (prop) {
    el.style.setProperty(camelToKebab(prop), originalStyles[prop]);
  } else {
    Object.entries(originalStyles).forEach(([key, value]: [string, string]) => {
      el.style.setProperty(camelToKebab(key), value);
    });
  }
}

export function dampenValue(v: number) {
  return 8 * (Math.log(v + 1) - 2);
}

export function assignStyle(element: HTMLElement | null | undefined, style: Partial<CSSStyleDeclaration>) {
  if (!element) {
    return () => {};
  }

  // Snapshot only the keys we're about to change. Restoring the full cssText would also wipe
  // any inline styles other helpers (like set()) wrote in the meantime.
  const previousValues: Record<string, string> = {};
  for (const key of Object.keys(style)) {
    previousValues[key] = element.style.getPropertyValue(camelToKebab(key));
  }
  Object.assign(element.style, style);

  return () => {
    for (const key of Object.keys(previousValues)) {
      element.style.setProperty(camelToKebab(key), previousValues[key]);
    }
  };
}

/**
 * Receives functions as arguments and returns a new function that calls all.
 */
export function chain<T>(...fns: T[]) {
  return (...args: T extends AnyFunction ? Parameters<T> : never) => {
    for (const fn of fns) {
      if (typeof fn === 'function') {
        fn(...args);
      }
    }
  };
}
