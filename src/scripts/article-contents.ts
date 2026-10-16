const articleBody = document.querySelector<HTMLElement>('.writing-body');
const contentsLinks = [...document.querySelectorAll<HTMLAnchorElement>('.writing-contents a')];

if (articleBody && contentsLinks.length) {
  const headings = [...articleBody.querySelectorAll<HTMLElement>('h2[id]')];
  let positions: number[] = [];
  let offset = 0;
  let frame = 0;
  let current = '';
  const update = () => {
    frame = 0;
    if (!headings.length) return;
    // Positions are cached on layout changes; scrolling only searches this small array.
    const readingLine = window.scrollY + offset + 1;
    let index = 0;
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] > readingLine) break;
      index = i;
    }
    const id = headings[index].id;
    if (id === current) return;
    current = id;
    contentsLinks.forEach((link) => {
      if (link.hash === `#${encodeURIComponent(id)}` || decodeURIComponent(link.hash.slice(1)) === id) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  const measure = () => {
    positions = headings.map((heading) => heading.getBoundingClientRect().top + window.scrollY);
    offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    schedule();
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('pageshow', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(articleBody);
  document.fonts.ready.then(measure);

  const mobileContents = document.querySelector<HTMLDetailsElement>('.writing-mobile-contents');
  mobileContents?.addEventListener('toggle', measure);
  mobileContents?.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('.writing-contents a')) return;
    mobileContents.open = false;
    mobileContents.querySelector('summary')?.focus({ preventScroll: true });
    // Collapsing the menu moves all headings; measure before native anchor navigation.
    measure();
  });
  measure();
}
