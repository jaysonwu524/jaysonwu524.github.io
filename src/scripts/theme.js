// Runs in the head before page content is painted so a saved choice never flashes.
(() => {
  const key = 'site-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const readPreference = () => {
    try {
      const value = localStorage.getItem(key);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  };
  let preference = readPreference();

  const updateButtons = () => {
    const dark = root.dataset.theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('title', button.getAttribute(dark ? 'data-light-label' : 'data-dark-label') || '');
      button.removeAttribute('hidden');
    });
  };
  const applyTheme = () => {
    root.dataset.theme = preference || (system.matches ? 'dark' : 'light');
    updateButtons();
  };

  applyTheme();
  document.addEventListener('DOMContentLoaded', updateButtons, { once: true });
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-theme-toggle]')) return;
    preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(key, preference);
    } catch {
      // The current page still switches when browser storage is unavailable.
    }
    applyTheme();
  });
  system.addEventListener('change', () => {
    if (!preference) applyTheme();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) {
      preference = readPreference();
      applyTheme();
    }
  });
})();
