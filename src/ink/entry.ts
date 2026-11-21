import { InkTransition } from './ui/inkTransition';
import { applyTheme, getTheme, otherTheme } from './ui/theme';

const toggle = document.getElementById('theme-toggle') as HTMLButtonElement;
const canvas = document.createElement('canvas');
canvas.className = 'ink-canvas';
canvas.setAttribute('aria-hidden', 'true');
canvas.setAttribute('data-html2canvas-ignore', 'true');
document.body.append(canvas);
toggle.setAttribute('data-ink-live', '');
applyTheme(getTheme(), toggle);

let ink: InkTransition | null = null;
try { ink = new InkTransition(canvas, toggle); }
catch { document.documentElement.dataset.ink = 'css'; }

toggle.addEventListener('click', (event: MouseEvent) => {
  if (!ink) { applyTheme(otherTheme(getTheme()), toggle); return; }
  // Keyboard activation uses the button center; pointer clicks start at the ink drop.
  const point = event.detail > 0 ? { x: event.clientX, y: event.clientY } : undefined;
  ink.toggle(point);
});
