"use client";

import { useEffect } from "react";

export function FpAnimations() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealTargets = document.querySelectorAll("[data-fp-inview]");
    let cleanupReveal = () => {};
    if (reduced) {
      revealTargets.forEach((el) => el.classList.add("fp-in-view"));
    } else {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("fp-in-view");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 },
      );
      revealTargets.forEach((el) => io.observe(el));
      const safety = setTimeout(() => {
        revealTargets.forEach((el) => el.classList.add("fp-in-view"));
      }, 1500);

      cleanupReveal = () => {
        io.disconnect();
        clearTimeout(safety);
      };
    }

    let cleanupParallax = () => {};
    if (!reduced) {
      const parallaxEls = document.querySelectorAll<HTMLElement>("[data-fp-parallax]");
      if (parallaxEls.length) {
        let ticking = false;
        const update = () => {
          parallaxEls.forEach((el) => {
            const rect = el.parentElement?.getBoundingClientRect();
            if (!rect) return;
            const offset = rect.top * 0.25;
            el.style.transform = `translate3d(0, ${offset}px, 0)`;
          });
          ticking = false;
        };
        const onScroll = () => {
          if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
          }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanupParallax = () => window.removeEventListener("scroll", onScroll);
      }
    }

    const counters = document.querySelectorAll<HTMLElement>("[data-fp-counter]");
    let counterIo: IntersectionObserver | undefined;
    if (counters.length) {
      const animateCounter = (el: HTMLElement) => {
        const target = parseInt(el.dataset.fpCounter ?? "0", 10) || 0;
        if (reduced) {
          el.textContent = String(target);
          return;
        }
        const duration = 1400;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      counterIo = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target as HTMLElement);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 },
      );
      counters.forEach((el) => counterIo!.observe(el));
    }

    let onMove: ((e: MouseEvent) => void) | undefined;
    let onOut: ((e: MouseEvent) => void) | undefined;
    if (!reduced && window.matchMedia("(pointer: fine)").matches) {
      onMove = (e: MouseEvent) => {
        const card = (e.target as HTMLElement).closest(".fp-card");
        if (!card) return;
        const inner = card.querySelector<HTMLElement>(".fp-card__inner");
        if (!inner) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        inner.style.transform = `rotateY(${x * 6}deg) rotateX(${y * -6}deg)`;
      };
      onOut = (e: MouseEvent) => {
        const card = (e.target as HTMLElement).closest(".fp-card");
        if (!card) return;
        const inner = card.querySelector<HTMLElement>(".fp-card__inner");
        if (inner) inner.style.transform = "";
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseout", onOut, true);
    }

    return () => {
      cleanupReveal();
      cleanupParallax();
      counterIo?.disconnect();
      if (onMove) document.removeEventListener("mousemove", onMove);
      if (onOut) document.removeEventListener("mouseout", onOut, true);
    };
  }, []);

  return null;
}
