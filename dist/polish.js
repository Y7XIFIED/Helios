(() => {
  const nav = document.querySelector('.hero-navigation');
  const hero = document.querySelector('#home');
  const progress = document.querySelector('.reading-progress');
  const links = [...nav.querySelectorAll('nav a')];
  const sections = links.map(a => document.querySelector(a.hash));
  let scheduled = false, navHeight = 72, max = 1, heroEnd = 0, tops = [];
  const measure = () => {
    navHeight = nav.offsetHeight;
    document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
    heroEnd = hero.getBoundingClientRect().bottom + scrollY;
    max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    tops = sections.map(s => s.getBoundingClientRect().top + scrollY);
    queue();
  };
  function update() {
    scheduled = false;
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY / max))})`;
    nav.classList.toggle('is-stuck', scrollY >= heroEnd);
    let active = -1;
    tops.forEach((top,i) => { if(top <= scrollY + navHeight + 80) active = i; });
    if(scrollY >= max - 2) active = links.length - 1;
    links.forEach((a,i) => i === active ? a.setAttribute('aria-current','location') : a.removeAttribute('aria-current'));
  }
  function queue() { if(!scheduled) { scheduled = true; requestAnimationFrame(update); } }
  addEventListener('scroll', queue, {passive:true});
  addEventListener('resize', measure, {passive:true});
  new ResizeObserver(measure).observe(document.body);
  document.fonts.ready.then(measure);
  document.querySelectorAll('.project-notes').forEach(detail=>detail.addEventListener('toggle',measure));
  document.querySelectorAll('.project-links a').forEach(a=>{a.innerHTML=a.innerHTML.replace('↗','<span class="link-arrow" aria-hidden="true">↗</span>');});
  measure();
})();
