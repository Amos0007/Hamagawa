(() => {
  'use strict';

  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  const closeMenu = () => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    body.classList.remove('menu-open');
  };

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
      body.classList.toggle('menu-open', !open);
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const handleHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  handleHeader();
  window.addEventListener('scroll', handleHeader, { passive: true });

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const revealNodes = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    revealNodes.forEach((node) => revealObserver.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add('is-visible'));
  }

  const filterButtons = document.querySelectorAll('[data-filter]');
  const galleryItems = document.querySelectorAll('.gallery-item[data-category]');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      galleryItems.forEach((item) => {
        item.hidden = filter !== 'all' && item.dataset.category !== filter;
      });
    });
  });

  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const lightboxCaption = lightbox?.querySelector('.lightbox-caption');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  let lastFocused = null;

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('menu-open');
    lastFocused?.focus();
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-caption strong')?.textContent || img?.alt || '';
      if (!img) return;
      lastFocused = item;
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      body.classList.add('menu-open');
      lightboxClose?.focus();
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox?.classList.contains('open')) closeLightbox();
  });

  const formStatus = document.querySelector('.form-status');
  if (formStatus) {
    const params = new URLSearchParams(window.location.search);
    const state = params.get('status');
    if (state === 'success') {
      formStatus.textContent = 'Thank you. Your enquiry has been sent successfully.';
      formStatus.className = 'form-status show success';
    } else if (state === 'error') {
      formStatus.textContent = 'The message could not be sent. Please email or call us directly.';
      formStatus.className = 'form-status show error';
    } else if (state === 'invalid') {
      formStatus.textContent = 'Please check the form and complete all required fields.';
      formStatus.className = 'form-status show error';
    }
  }
})();
