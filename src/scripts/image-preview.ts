const dialog = document.querySelector<HTMLDialogElement>('[data-image-preview]');

if (dialog && typeof dialog.showModal === 'function') {
  const fullImage = dialog.querySelector<HTMLImageElement>('[data-preview-full]')!;
  const viewport = dialog.querySelector<HTMLElement>('[data-preview-viewport]')!;
  const canvas = dialog.querySelector<HTMLElement>('[data-preview-canvas]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-preview-caption]')!;
  const count = dialog.querySelector<HTMLElement>('[data-preview-count]')!;
  const scale = dialog.querySelector<HTMLElement>('[data-preview-scale]')!;
  const status = dialog.querySelector<HTMLElement>('[data-preview-status]')!;
  const close = dialog.querySelector<HTMLButtonElement>('[data-preview-close]')!;
  const zoomIn = dialog.querySelector<HTMLButtonElement>('[data-preview-in]')!;
  const zoomOut = dialog.querySelector<HTMLButtonElement>('[data-preview-out]')!;
  const reset = dialog.querySelector<HTMLButtonElement>('[data-preview-reset]')!;
  const previous = dialog.querySelector<HTMLButtonElement>('[data-preview-previous]')!;
  const next = dialog.querySelector<HTMLButtonElement>('[data-preview-next]')!;
  const images = [...document.querySelectorAll<HTMLImageElement>('main img')]
    .filter((image) => !image.closest('[aria-hidden="true"], [data-no-preview]'));
  let activeIndex = 0;
  let zoom = 1;
  let ready = false;
  let opener: HTMLElement | null = null;
  let previousOverflow = '';
  let previousGutter = '';
  let loadVersion = 0;
  let closing = false;
  let imageAnimation: Animation | undefined;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animateImage = (frames: Keyframe[], duration = 220) => {
    imageAnimation?.cancel();
    if (!reducedMotion.matches) {
      imageAnimation = fullImage.animate(frames, { duration, easing: 'cubic-bezier(.2, .7, .2, 1)' });
    }
  };
  let pointer: { id: number; x: number; y: number; left: number; top: number; touch: boolean } | null = null;

  const setStatus = (message: string) => {
    status.textContent = message;
    status.hidden = !message;
  };
  const fitImage = () => {
    if (!ready) return;
    const padding = parseFloat(getComputedStyle(viewport).paddingLeft) * 2;
    const ratio = Math.min(
      (viewport.clientWidth - padding) / fullImage.naturalWidth,
      (viewport.clientHeight - padding) / fullImage.naturalHeight,
      1,
    );
    canvas.style.width = `${Math.max(1, fullImage.naturalWidth * ratio * zoom)}px`;
    canvas.style.height = `${Math.max(1, fullImage.naturalHeight * ratio * zoom)}px`;
    viewport.dataset.zoomed = String(zoom > 1);
    zoomIn.disabled = zoom >= 4;
    zoomOut.disabled = reset.disabled = zoom === 1;
    scale.textContent = `${Math.round(zoom * 100)}%`;
  };
  const changeZoom = (value: number) => {
    if (!ready || closing) return;
    const previousZoom = zoom;
    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    const centerY = viewport.scrollTop + viewport.clientHeight / 2;
    zoom = Math.max(1, Math.min(4, value));
    fitImage();
    viewport.scrollLeft = centerX * zoom / previousZoom - viewport.clientWidth / 2;
    viewport.scrollTop = centerY * zoom / previousZoom - viewport.clientHeight / 2;
    if (zoom !== previousZoom) animateImage([
      { transform: `scale(${previousZoom / zoom})` },
      { transform: 'scale(1)' },
    ], 180);
  };
  const showImage = (index: number) => {
    if (closing) return;
    const direction = Math.sign(index - activeIndex);
    imageAnimation?.cancel();
    activeIndex = index;
    const image = images[index];
    const version = ++loadVersion;
    zoom = 1;
    ready = false;
    fullImage.hidden = true;
    viewport.dataset.zoomed = 'false';
    canvas.style.width = canvas.style.height = '0px';
    zoomIn.disabled = zoomOut.disabled = reset.disabled = true;
    previous.disabled = index === 0;
    next.disabled = index === images.length - 1;
    const description = image.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || image.alt;
    caption.textContent = description;
    count.textContent = `${index + 1} / ${images.length}`;
    scale.textContent = '100%';
    fullImage.alt = image.alt;
    setStatus(dialog.dataset.loadingLabel || '');
    // Choose the largest responsive variant when the page uses optimized thumbnails.
    const source = image.srcset.split(',')
      .map((candidate) => candidate.trim().split(/\s+/))
      .filter((candidate) => candidate[0])
      .sort((a, b) => parseFloat(b[1] || '0') - parseFloat(a[1] || '0'))[0]?.[0];
    fullImage.src = image.dataset.previewSrc || source || image.currentSrc || image.src;
    fullImage.decode().then(() => {
      if (version !== loadVersion || !dialog.open) return;
      ready = true;
      fullImage.hidden = false;
      setStatus('');
      fitImage();
      viewport.scrollTo(0, 0);
      animateImage([
        { opacity: 0, transform: `translateX(${direction * 16}px) scale(.985)` },
        { opacity: 1, transform: 'translateX(0) scale(1)' },
      ]);
    }).catch(() => {
      if (version === loadVersion && dialog.open) setStatus(dialog.dataset.errorLabel || '');
    });
  };
  const openImage = (index: number, trigger: HTMLElement) => {
    if (dialog.open || closing) return;
    opener = trigger;
    previousOverflow = document.documentElement.style.overflow;
    previousGutter = document.documentElement.style.scrollbarGutter;
    document.documentElement.style.scrollbarGutter = 'stable';
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    showImage(index);
    close.focus({ preventScroll: true });
  };
  const closePreview = async () => {
    if (!dialog.open || closing) return;
    closing = true;
    ++loadVersion;
    dialog.dataset.closing = 'true';
    if (!reducedMotion.matches) {
      const animation = dialog.animate([
        { opacity: 1, transform: 'translateY(0) scale(1)' },
        { opacity: 0, transform: 'translateY(8px) scale(.985)' },
      ], { duration: 180, easing: 'ease-in', fill: 'forwards' });
      await animation.finished.catch(() => {});
      dialog.close();
      animation.cancel();
    } else {
      dialog.close();
    }
  };

  images.forEach((image, index) => {
    // Keep existing picture, grid and portrait positioning intact.
    const trigger = image.closest<HTMLAnchorElement>('a') || image;
    image.dataset.previewImage = '';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-label', `${dialog.dataset.openLabel}: ${image.alt}`);
    if (trigger === image) {
      trigger.tabIndex = 0;
      trigger.setAttribute('role', 'button');
    }
    trigger.addEventListener('click', (event) => {
      if (event instanceof MouseEvent && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
      event.preventDefault();
      openImage(index, trigger);
    });
    trigger.addEventListener('keydown', (event) => {
      if (!(event instanceof KeyboardEvent)) return;
      if (event.key === ' ' || (event.key === 'Enter' && trigger === image)) {
        event.preventDefault();
        openImage(index, trigger);
      }
    });
  });
  close.addEventListener('click', closePreview);
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); void closePreview(); });
  previous.addEventListener('click', () => { if (activeIndex > 0) showImage(activeIndex - 1); });
  next.addEventListener('click', () => { if (activeIndex < images.length - 1) showImage(activeIndex + 1); });
  zoomIn.addEventListener('click', () => changeZoom(zoom + .5));
  zoomOut.addEventListener('click', () => changeZoom(zoom - .5));
  reset.addEventListener('click', () => changeZoom(1));
  viewport.addEventListener('dblclick', () => changeZoom(zoom === 1 ? 2 : 1));
  dialog.addEventListener('keydown', (event) => {
    if (closing) return;
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    } else if (event.key === 'ArrowLeft' && zoom === 1 && activeIndex > 0) {
      event.preventDefault(); showImage(activeIndex - 1);
    } else if (event.key === 'ArrowRight' && zoom === 1 && activeIndex < images.length - 1) {
      event.preventDefault(); showImage(activeIndex + 1);
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault(); changeZoom(zoom + .5);
    } else if (event.key === '-') {
      event.preventDefault(); changeZoom(zoom - .5);
    } else if (event.key === '0') {
      event.preventDefault(); changeZoom(1);
    }
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) void closePreview();
  });
  dialog.addEventListener('close', () => {
    ++loadVersion;
    closing = false;
    delete dialog.dataset.closing;
    imageAnimation?.cancel();
    pointer = null;
    viewport.dataset.dragging = 'false';
    document.documentElement.style.overflow = previousOverflow;
    document.documentElement.style.scrollbarGutter = previousGutter;
    opener?.focus({ preventScroll: true });
  });
  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, touch: event.pointerType === 'touch' };
    if (zoom > 1 && !pointer.touch) {
      viewport.setPointerCapture(event.pointerId);
      viewport.dataset.dragging = 'true';
      event.preventDefault();
    }
  });
  viewport.addEventListener('pointermove', (event) => {
    if (!pointer || pointer.id !== event.pointerId || pointer.touch || zoom === 1) return;
    viewport.scrollLeft = pointer.left - (event.clientX - pointer.x);
    viewport.scrollTop = pointer.top - (event.clientY - pointer.y);
  });
  viewport.addEventListener('pointerup', (event) => {
    if (pointer?.id === event.pointerId && pointer.touch && zoom === 1) {
      const distance = event.clientX - pointer.x;
      if (Math.abs(distance) > 60 && Math.abs(event.clientY - pointer.y) < 60) {
        const index = activeIndex + (distance < 0 ? 1 : -1);
        if (index >= 0 && index < images.length) showImage(index);
      }
    }
    pointer = null;
    viewport.dataset.dragging = 'false';
  });
  viewport.addEventListener('pointercancel', () => { pointer = null; viewport.dataset.dragging = 'false'; });
  new ResizeObserver(() => { if (dialog.open) fitImage(); }).observe(viewport);
}
