import gsap from 'gsap';
import type { Theme } from './theme';

// Portfolio adapter: retain the existing Nasalization label and sliding switch.
export class ThemeIcon {
  private tween: gsap.core.Tween | null = null;
  private thumb: HTMLElement | null;
  constructor(private button: HTMLElement) { this.thumb = button.querySelector('.theme-thumb'); }
  kill(): void { this.tween?.kill(); this.tween = null; }
  setTimeScale(scale: number): void { this.tween?.timeScale(scale); }
  readChrome() {
    const css = getComputedStyle(this.button);
    return { backgroundColor: css.backgroundColor, borderColor: css.borderTopColor, color: css.color };
  }
  set(theme: Theme): void {
    this.kill();
    if (this.thumb) this.thumb.style.transform = `translateX(${theme === 'dark' ? 14 : 0}px)`;
  }
  morphTo(theme: Theme, opts: { duration: number; ease: string; timeScale: number; chromeDelay?: number; chromeFrom?: unknown }): void {
    this.kill();
    if (!this.thumb) return;
    this.tween = gsap.to(this.thumb, { transform: `translateX(${theme === 'dark' ? 14 : 0}px)`, duration: Math.min(opts.duration, .45), ease: opts.ease }).timeScale(opts.timeScale);
  }
}
