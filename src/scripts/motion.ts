const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const blocks = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];

if (blocks.length && 'IntersectionObserver' in window && typeof Element.prototype.animate === 'function') {
  const tokens = getComputedStyle(document.documentElement);
  const duration = parseFloat(tokens.getPropertyValue('--motion-enter')) || 320;
  const distance = tokens.getPropertyValue('--motion-distance').trim() || '10px';
  const easing = tokens.getPropertyValue('--motion-ease').trim() || 'ease-out';
  const animations = new Set<Animation>();
  const reveal = (block: HTMLElement, animate = true) => {
    if (block.dataset.reveal === 'done') return;
    block.dataset.reveal = 'done';
    observer.unobserve(block);
    if (reducedMotion.matches || !animate || document.documentElement.dataset.pageTransition === 'active') return;
    const animation = block.animate([
      { opacity: 0, translate: `0 ${distance}` },
      { opacity: 1, translate: '0 0' },
    ], { duration, easing });
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) reveal(entry.target as HTMLElement);
    });
  }, { threshold: 0, rootMargin: '0px 0px 24px 0px' });

  blocks.forEach((block) => {
    const bounds = block.getBoundingClientRect();
    // Hash navigation and restored scroll positions should show preceding content immediately.
    if (reducedMotion.matches || bounds.bottom <= 0) {
      block.dataset.reveal = 'done';
    } else if (bounds.top < window.innerHeight) {
      reveal(block);
    } else {
      block.dataset.reveal = 'pending';
      observer.observe(block);
    }
  });
  document.addEventListener('focusin', (event) => {
    if (!(event.target instanceof Element)) return;
    const block = event.target.closest<HTMLElement>('[data-reveal="pending"]');
    if (block) reveal(block, false);
  });
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    observer.disconnect();
    blocks.forEach((block) => { block.dataset.reveal = 'done'; });
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  });
}
