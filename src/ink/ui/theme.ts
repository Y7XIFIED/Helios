export type Theme = 'light' | 'dark';
const root = document.documentElement;
export function getTheme(): Theme { return root.dataset.theme === 'dark' ? 'dark' : 'light'; }
export function otherTheme(theme: Theme): Theme { return theme === 'dark' ? 'light' : 'dark'; }
export function applyTheme(theme: Theme, toggle?: HTMLButtonElement | null): void {
  root.dataset.theme = theme;
  toggle?.setAttribute('aria-checked', String(theme === 'dark'));
  const label = document.getElementById('theme-label');
  if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#10110f' : '#f0ece2';
  try { localStorage.setItem('y7xified-theme', theme); } catch {}
}
