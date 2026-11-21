/**
 * BranchedMenu - Direct Vanilla JS port of React Bits component
 * Rendered in a persistent floating dock that is always visible and accessible across the entire website.
 */
(() => {
  const mount = document.getElementById('branched-menu-mount');
  const dock = document.getElementById('sticky-branched-hub');
  const toggleBtn = document.getElementById('branched-dock-toggle');
  const closeBtn = document.getElementById('branched-dock-close');
  const detailsTitle = document.getElementById('branched-preview-title');
  const detailsDesc = document.getElementById('branched-preview-desc');
  const detailsAction = document.getElementById('branched-preview-action');
  if (!mount || !dock) return;

  // Toggle dock open/close
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = dock.hasAttribute('data-expanded');
      if (isExpanded) {
        dock.removeAttribute('data-expanded');
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        dock.setAttribute('data-expanded', '');
        toggleBtn.setAttribute('aria-expanded', 'true');
        updateMarker(false);
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      dock.removeAttribute('data-expanded');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // Close on Escape or click outside
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      dock.removeAttribute('data-expanded');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', e => {
    if (!dock.contains(e.target)) {
      dock.removeAttribute('data-expanded');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  const MENU_DATA = [
    {
      label: 'Projects',
      children: [
        {
          value: 'win98',
          label: 'Windows 98',
          icon: '<rect x="2" y="3" width="12" height="10" rx="1"/><line x1="2" y1="6" x2="14" y2="6"/>',
          desc: 'A haunted browser-based take on the classic Windows 98 desktop with events, drag interactions, and boot flow.',
          link: '#project-win98',
          actionText: 'Go to project ↓'
        },
        {
          value: 'arvion',
          label: 'ARVION OS',
          icon: '<circle cx="8" cy="8" r="6"/><line x1="8" y1="2" x2="8" y2="5"/>',
          desc: 'A browser-based desktop OS with boot sequences, customizable theme accents, and modal window handling.',
          link: '#project-arvion',
          actionText: 'Go to project ↓'
        },
        {
          value: 'koda',
          label: 'Koda Player',
          icon: '<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2"/>',
          desc: 'Vinyl-inspired music player simulating turntable physics, drag mechanics, and real-time audio controls.',
          link: '#project-koda',
          actionText: 'Go to project ↓'
        },
        {
          value: 'typewriter',
          label: 'Vintage Typewriter',
          icon: '<path d="M3 5h10M4 9h8M6 13h4"/>',
          desc: 'Mechanical keyboard typewriter with responsive audio clicks, key resistance, and snapshot paper logs.',
          link: '#project-typewriter',
          actionText: 'Go to project ↓'
        }
      ]
    },
    {
      label: 'Explorations',
      children: [
        {
          value: 'os',
          label: 'OS Architecture',
          icon: '<path d="M2 4h12v9H2z"/>',
          desc: 'Analyzing low-level systems, kernel abstractions, and desktop windowing architectures.',
          link: '#learning',
          actionText: 'View Exploring ↗'
        },
        {
          value: 'android',
          label: 'Android & Jetpack',
          icon: '<path d="M4 11V6a4 4 0 0 1 8 0v5"/>',
          desc: 'Building with Kotlin, Compose, and exploring Android open-source OS customization.',
          link: '#learning',
          actionText: 'View Exploring ↗'
        },
        {
          value: 'character',
          label: 'Character UI',
          icon: '<circle cx="8" cy="8" r="5"/>',
          desc: 'Crafting interfaces with personality, tactile feedback, and retro-futuristic mechanical nuance.',
          link: '#about',
          actionText: 'View About ↗'
        }
      ]
    }
  ];

  // ReactBits configuration constants
  const PAD = 4;
  const ROW_HEIGHT = 32;
  const TRUNK = 12;
  const INDENT = 36;
  const RADIUS = 8;
  const MARK = 14;
  const r = Math.min(RADIUS, ROW_HEIGHT / 2 - 2);
  const endX = INDENT - 6;
  const rowY = k => PAD + k * ROW_HEIGHT + ROW_HEIGHT / 2;
  const branchD = k => `M ${TRUNK} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${TRUNK + r} ${rowY(k)} H ${endX}`;
  const reachD = k => `M ${TRUNK} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${TRUNK + r} ${rowY(k)} H ${endX}`;
  const pathLength = k => rowY(k) - r + (Math.PI * r) / 2 + (endX - TRUNK - r);

  let activeValue = 'win98';
  const openSections = new Set([0]); // Default first section open

  const nav = document.createElement('nav');
  nav.className = 'branched-menu';

  const marker = document.createElement('span');
  marker.className = 'branched-menu__marker';
  marker.setAttribute('aria-hidden', 'true');
  nav.append(marker);

  const headElements = [];
  const reachEntries = [];

  function updatePreview(kid) {
    if (detailsTitle) detailsTitle.textContent = kid.label;
    if (detailsDesc) detailsDesc.textContent = kid.desc;
    if (detailsAction) {
      detailsAction.href = kid.link;
      detailsAction.textContent = kid.actionText;
    }
  }

  function updateMarker(glide = true) {
    const activeSecIdx = MENU_DATA.findIndex(sec => sec.children?.some(c => c.value === activeValue));
    const isShown = activeSecIdx >= 0 && openSections.has(activeSecIdx);
    const headEl = headElements[activeSecIdx];

    if (!glide) marker.style.transition = 'none';
    if (isShown && headEl) {
      marker.style.top = `${headEl.offsetTop + (headEl.offsetHeight - MARK) / 2}px`;
      marker.setAttribute('data-on', '');
    } else {
      marker.removeAttribute('data-on');
    }
    if (!glide) {
      void marker.offsetHeight;
      marker.style.transition = '';
    }
  }

  MENU_DATA.forEach((sec, sIdx) => {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'branched-menu__section';
    if (openSections.has(sIdx)) sectionEl.setAttribute('data-open', '');

    const headBtn = document.createElement('button');
    headBtn.type = 'button';
    headBtn.className = 'branched-menu__head';
    headBtn.textContent = sec.label;
    headBtn.setAttribute('aria-expanded', String(openSections.has(sIdx)));
    headElements[sIdx] = headBtn;

    headBtn.addEventListener('click', () => {
      if (openSections.has(sIdx)) {
        openSections.delete(sIdx);
        sectionEl.removeAttribute('data-open');
        headBtn.setAttribute('aria-expanded', 'false');
      } else {
        openSections.add(sIdx);
        sectionEl.setAttribute('data-open', '');
        headBtn.setAttribute('aria-expanded', 'true');
      }
      updateMarker(true);
    });

    sectionEl.append(headBtn);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'branched-menu__body';

    const foldEl = document.createElement('div');
    foldEl.className = 'branched-menu__fold';

    const bodyH = PAD * 2 + sec.children.length * ROW_HEIGHT;
    const treeEl = document.createElement('div');
    treeEl.className = 'branched-menu__tree';
    treeEl.style.height = `${bodyH}px`;

    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('class', 'branched-menu__lines');
    svgEl.setAttribute('width', `${INDENT}`);
    svgEl.setAttribute('height', `${bodyH}`);
    svgEl.setAttribute('aria-hidden', 'true');

    const trunkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    trunkPath.setAttribute('class', 'branched-menu__base');
    trunkPath.setAttribute('d', `M ${TRUNK} 0 V ${rowY(sec.children.length - 1) - r}`);
    svgEl.append(trunkPath);

    sec.children.forEach((_, k) => {
      const bPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      bPath.setAttribute('class', 'branched-menu__base');
      bPath.setAttribute('d', branchD(k));
      svgEl.append(bPath);
    });

    sec.children.forEach((kid, k) => {
      const rPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      rPath.setAttribute('class', 'branched-menu__reach');
      rPath.setAttribute('d', reachD(k));
      const len = pathLength(k);
      rPath.style.strokeDasharray = `${len}`;
      rPath.style.strokeDashoffset = kid.value === activeValue ? '0' : `${len}`;
      svgEl.append(rPath);
      reachEntries.push({ rPath, len, value: kid.value });
    });

    treeEl.append(svgEl);

    sec.children.forEach(kid => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'branched-menu__item';
      if (kid.value === activeValue) {
        btn.setAttribute('data-active', '');
        btn.setAttribute('aria-current', 'true');
        updatePreview(kid);
      }

      btn.innerHTML = `
        <span class="branched-menu__icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">${kid.icon}</svg>
        </span>
        <span class="branched-menu__label">${kid.label}</span>
      `;

      btn.addEventListener('click', () => {
        activeValue = kid.value;
        reachEntries.forEach(re => {
          re.rPath.style.strokeDashoffset = re.value === activeValue ? '0' : `${re.len}`;
        });
        document.querySelectorAll('.branched-menu__item').forEach(b => {
          b.removeAttribute('data-active');
          b.removeAttribute('aria-current');
        });
        btn.setAttribute('data-active', '');
        btn.setAttribute('aria-current', 'true');
        updatePreview(kid);
        updateMarker(true);
      });

      treeEl.append(btn);
    });

    foldEl.append(treeEl);
    bodyEl.append(foldEl);
    sectionEl.append(bodyEl);
    nav.append(sectionEl);
  });

  mount.append(nav);
  requestAnimationFrame(() => updateMarker(false));
  window.addEventListener('resize', () => updateMarker(false));
})();
