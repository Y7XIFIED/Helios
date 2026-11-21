import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { transform } from 'esbuild';

async function compile(path) {
  return (await transform(await readFile(path, 'utf8'), { loader: 'ts', format: 'cjs' })).code;
}
const themeCode = await compile('src/ink/ui/theme.ts');
const transitionCode = await compile('src/ink/ui/inkTransition.ts');

for (const reduced of [false, true]) {
  for (const blockedStorage of [false, true]) {
    test(`No-WebGL toggle: reduced=${reduced}, storage blocked=${blockedStorage}`, () => {
      const classes = new Set();
      const root = { dataset: {}, classList: { add: x => classes.add(x), remove: x => classes.delete(x) }, style: { setProperty() {} } };
      const label = {}, meta = {}, stored = {};
      const toggle = { setAttribute(k, v) { this[k] = v; } };
      const document = { documentElement: root, getElementById: () => label, querySelector: () => meta };
      const context = { document, localStorage: { setItem(k, v) { if (blockedStorage) throw Error('blocked'); stored[k] = v; } }, module: { exports: {} } };
      vm.runInNewContext(themeCode, context);
      const theme = context.module.exports;
      class Icon { set() {} morphTo() {} }
      const env = { document, window: { matchMedia: () => ({ matches: reduced }), clearTimeout() {}, setTimeout() {} }, module: { exports: {} }, require(name) {
        if (name === './theme') return theme;
        if (name === './themeIcon') return { ThemeIcon: Icon };
        if (name === '../gl/renderer') return { InkRenderer: { create: () => null } };
        if (name === '../capture/capture') return { renderScale: () => 1, layoutKey: () => 'test' };
        if (name === 'gsap') return {};
        if (name === '../gl/params') return { inkParams: {} };
        throw Error(name);
      } };
      vm.runInNewContext(transitionCode, env);
      const ink = new env.module.exports.InkTransition({}, toggle);
      assert.equal(root.dataset.ink, 'css');
      ink.toggle();
      assert.equal(root.dataset.theme, 'dark');
      assert.equal(toggle['aria-checked'], 'true');
      assert.equal(label.textContent, 'Dark');
      assert.equal(meta.content, '#10110f');
      ink.toggle();
      assert.equal(root.dataset.theme, 'light');
      assert.equal(toggle['aria-checked'], 'false');
      assert.equal(label.textContent, 'Light');
      if (!blockedStorage) assert.equal(stored['y7xified-theme'], 'light');
    });
  }
}
