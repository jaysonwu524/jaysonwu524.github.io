document.querySelectorAll<HTMLElement>('[data-share-action]').forEach((element) => {
  const button = element.querySelector<HTMLButtonElement>('[data-share-button]')!;
  const label = element.querySelector<HTMLElement>('[data-share-label]')!;
  const status = element.querySelector<HTMLElement>('[data-share-status]')!;
  const field = element.querySelector<HTMLInputElement>('[data-share-url]')!;
  const canShare = typeof navigator.share === 'function';
  let feedbackTimer: number | undefined;
  label.textContent = (canShare ? element.dataset.shareLabel : element.dataset.copyLabel) || '';
  element.hidden = false;

  button.addEventListener('click', async () => {
    window.clearTimeout(feedbackTimer);
    delete element.dataset.state;
    button.disabled = true;
    status.textContent = '';
    field.hidden = true;
    try {
      if (canShare) {
        try {
          await navigator.share({ title: element.dataset.title, text: element.dataset.description, url: field.value });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          // If native sharing is unavailable or rejected, offer the same URL through copying.
        }
      }
      await navigator.clipboard.writeText(field.value);
      element.dataset.state = 'copied';
      feedbackTimer = window.setTimeout(() => { delete element.dataset.state; }, 2400);
      status.textContent = element.dataset.copiedLabel || '';
    } catch {
      status.textContent = element.dataset.manualLabel || '';
      field.hidden = false;
      field.focus();
      field.select();
    } finally {
      button.disabled = false;
    }
  });
});
