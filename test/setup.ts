// Minimal browser polyfills needed by Phaser in test environment
(globalThis as any).window = globalThis;
(globalThis as any).document = {
  currentScript: null,
  querySelector: () => null,
  createElement: () => ({ style: {}, appendChild: () => {} }),
  body: { appendChild: () => {} },
};
(globalThis as any).navigator = { userAgent: 'node' };
(globalThis as any).cancelAnimationFrame = () => {};
(globalThis as any).requestAnimationFrame = (cb: () => void) => setTimeout(cb, 16);
(globalThis as any).performance = { now: () => Date.now() };
(globalThis as any).location = { href: 'http://localhost' };
(globalThis as any).history = { pushState: () => {} };
(globalThis as any).localStorage = { getItem: () => null, setItem: () => {} };
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: () => Math.random().toString(36).slice(2) },
  writable: true,
  configurable: true,
});
