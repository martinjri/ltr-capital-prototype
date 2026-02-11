/* LTR Capital site interactions
   - Mobile nav toggle
   - Scroll progress
   - Reveal on scroll
   - Cursor glow
   - Magnet buttons
   - Video modal + image lightbox
   - Testimonial mini slider
   - Count-up for hero mini KPIs
*/

(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Mobile nav
  const nav = $('[data-nav]');
  const toggle = $('[data-nav-toggle]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('is-open'));
    $$('#top a, [data-nav] a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('is-open'));
    });
  }

  // Scroll progress
  const bar = $('[data-scrollbar]');
  const onScroll = () => {
    const h = document.documentElement;
    const max = (h.scrollHeight - h.clientHeight) || 1;
    const pct = (h.scrollTop / max) * 100;
    if (bar) bar.style.width = pct.toFixed(2) + '%';
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Sticky CTA hide near footer (simple heuristic)
  const sticky = $('[data-stickycta]');
  const footer = $('.footer');
  const onSticky = () => {
    if (!sticky || !footer) return;
    const rect = footer.getBoundingClientRect();
    const hide = rect.top < window.innerHeight - 80;
    sticky.classList.toggle('is-hidden', hide);
  };
  window.addEventListener('scroll', onSticky, { passive: true });
  onSticky();

  // Reveal on scroll
  const revealEls = $$('[data-reveal]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('is-revealed');
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Cursor glow
  const glow = $('[data-cursor]');
  if (glow) {
    let x = window.innerWidth/2, y = window.innerHeight/2;
    let tx = x, ty = y;

    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
    }, { passive: true });

    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      glow.style.left = x + 'px';
      glow.style.top = y + 'px';
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Magnet effect (subtle)
  const magnets = $$('[data-magnet]');
  magnets.forEach(el => {
    const strength = 14;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      el.style.transform = `translate(${dx*strength}px, ${dy*strength}px)`;
    };
    const onLeave = () => {
      el.style.transform = 'translate(0px, 0px)';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
  });

  // Count-up KPIs (very small, very fast)
  const countEls = $$('[data-count]');
  const runCount = (el) => {
    const target = parseInt(el.getAttribute('data-count') || '0', 10);
    const dur = 800;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const v = Math.round(target * (0.15 + 0.85*p));
      el.textContent = String(v);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };
    requestAnimationFrame(step);
  };
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.ran) {
        e.target.dataset.ran = '1';
        runCount(e.target);
      }
    });
  }, { threshold: 0.6 });
  countEls.forEach(el => countIO.observe(el));

  // Video modal
  const modal = $('[data-modal]');
  const modalIframe = $('[data-modal-iframe]');
  const openVideoBtns = $$('[data-open-video]');
  const closeModalEls = $$('[data-close-modal]');

  const openModal = (src) => {
    if (!modal || !modalIframe) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modalIframe.src = src + (src.includes('?') ? '&' : '?') + 'autoplay=1';
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    if (!modal || !modalIframe) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalIframe.src = '';
    document.body.style.overflow = '';
  };

  openVideoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-video');
      if (src) openModal(src);
    });
  });
  closeModalEls.forEach(el => el.addEventListener('click', closeModal));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Lightbox
  const lb = $('[data-lightbox-root]');
  const lbImg = $('[data-lightbox-img]');
  const closeLbEls = $$('[data-close-lightbox]');
  const lbBtns = $$('[data-lightbox-src]');

  const openLb = (src) => {
    if (!lb || !lbImg) return;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    lbImg.src = src;
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    if (!lb || !lbImg) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    document.body.style.overflow = '';
  };
  lbBtns.forEach(btn => btn.addEventListener('click', () => openLb(btn.getAttribute('data-lightbox-src'))));
  closeLbEls.forEach(el => el.addEventListener('click', closeLb));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLb();
  });

  // Testimonials (tiny local slider)
  const testimonials = [
    { quote: "“Fast response, clean process, and no confusion on terms. Execution felt professional.”", author: "Procurement Lead", company: "Industrial Buyer" },
    { quote: "“They pushed for proper documents first — saved everyone from a messy deal.”", author: "Trading Partner", company: "Commodity Desk" },
    { quote: "“Quality checks at loading were strict. Exactly what buyers need.”", author: "Logistics Coordinator", company: "Freight & Port Ops" }
  ];
  let tIndex = 0;
  const tCard = $('[data-tcard]');
  const tQuote = $('[data-tquote]');
  const tAuthor = $('[data-tauthor]');
  const tCompany = $('[data-tcompany]');
  const prev = $('[data-tprev]');
  const next = $('[data-tnext]');

  const renderT = () => {
    if (!tCard || !tQuote || !tAuthor || !tCompany) return;
    const t = testimonials[tIndex];
    tCard.style.opacity = '0';
    tCard.style.transform = 'translateY(6px)';
    setTimeout(() => {
      tQuote.textContent = t.quote;
      tAuthor.textContent = t.author;
      tCompany.textContent = t.company;
      tCard.style.opacity = '1';
      tCard.style.transform = 'translateY(0)';
    }, 120);
  };
  if (prev) prev.addEventListener('click', () => { tIndex = (tIndex - 1 + testimonials.length) % testimonials.length; renderT(); });
  if (next) next.addEventListener('click', () => { tIndex = (tIndex + 1) % testimonials.length; renderT(); });

  // Contact form -> mailto
  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name') || '';
      const company = data.get('company') || '';
      const email = data.get('email') || '';
      const phone = data.get('phone') || '';
      const message = data.get('message') || '';
      const subject = encodeURIComponent(`LTR Capital Inquiry — ${name}${company ? " ("+company+")" : ""}`);
      const body = encodeURIComponent(
`Name: ${name}
Company: ${company}
Email: ${email}
Phone: ${phone}

Requirements:
${message}
`);
      window.location.href = `mailto:tetminerals@icloud.com?subject=${subject}&body=${body}`;
    });
  }
})();
