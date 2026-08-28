// Motor de animación compartido para las secciones futprov-*.
// Reutiliza el sistema scroll-trigger de Dawn (assets/animations.js) para reveals simples;
// esto solo cubre lo que Dawn no ofrece: parallax, contadores, timeline y tilt de tarjetas.
(() => {
  if (window.__fpInit) return;
  window.__fpInit = true;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal genérico por IntersectionObserver (usado por hero title y steps timeline)
  const revealTargets = document.querySelectorAll('[data-fp-inview]');
  if (revealTargets.length) {
    if (reduced) {
      revealTargets.forEach((el) => el.classList.add('fp-in-view'));
    } else {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('fp-in-view');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      revealTargets.forEach((el) => io.observe(el));
    }
  }

  // Parallax del fondo del hero
  if (!reduced) {
    const parallaxEls = document.querySelectorAll('[data-fp-parallax]');
    if (parallaxEls.length) {
      let ticking = false;
      const update = () => {
        parallaxEls.forEach((el) => {
          const rect = el.parentElement.getBoundingClientRect();
          const offset = rect.top * 0.25;
          el.style.transform = `translate3d(0, ${offset}px, 0)`;
        });
        ticking = false;
      };
      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
          }
        },
        { passive: true }
      );
    }
  }

  // Contadores numéricos
  const counters = document.querySelectorAll('[data-fp-counter]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.fpCounter, 10) || 0;
      if (reduced) {
        el.textContent = target;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => io.observe(el));
  }

  // Tilt 3D suave en tarjetas del catálogo (solo con puntero fino)
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.fp-card');
      if (!card) return;
      const inner = card.querySelector('.fp-card__inner');
      if (!inner) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      inner.style.transform = `rotateY(${x * 6}deg) rotateX(${y * -6}deg)`;
    });
    document.addEventListener(
      'mouseout',
      (e) => {
        const card = e.target.closest('.fp-card');
        if (!card) return;
        const inner = card.querySelector('.fp-card__inner');
        if (inner) inner.style.transform = '';
      },
      true
    );
  }
})();
