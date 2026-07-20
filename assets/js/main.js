/* Linga Global School — shared site behaviour */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Page loader ---------- */
  const loader = document.querySelector('.loader');
  if(loader){
    window.addEventListener('load', () => {
      setTimeout(()=> loader.classList.add('hide'), 350);
    });
    setTimeout(()=> loader.classList.add('hide'), 1800); // fallback
  }

  /* ---------- Theme toggle (persisted) ---------- */
  const root = document.documentElement;
  const stored = null; // no localStorage reliance issues across pages still ok
  try{
    const saved = localStorage.getItem('lgs-theme');
    if(saved) root.setAttribute('data-theme', saved);
  }catch(e){}
  document.querySelectorAll('.theme-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const cur = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try{ localStorage.setItem('lgs-theme', next); }catch(e){}
    });
  });

  /* ---------- Sticky nav + mobile panel ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if(!nav) return;
    if(window.scrollY > 30) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    const backTop = document.querySelector('.back-top');
    if(backTop){ window.scrollY > 700 ? backTop.classList.add('show') : backTop.classList.remove('show'); }
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  const burger = document.querySelector('.nav-burger');
  const panel = document.querySelector('.mobile-panel');
  if(burger && panel){
    burger.addEventListener('click', ()=>{
      panel.classList.toggle('open');
    });
    panel.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> panel.classList.remove('open')));
  }

  const backTop = document.querySelector('.back-top');
  if(backTop){ backTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'})); }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.15, rootMargin:'0px 0px -60px 0px'});
    revealEls.forEach((el,i)=>{
      el.style.setProperty('--i', el.closest('.stagger') ? Array.from(el.parentElement.children).indexOf(el) : 0);
      io.observe(el);
    });
  } else {
    revealEls.forEach(el=> el.classList.add('in'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-counter'));
    const suffix = el.getAttribute('data-suffix') || '';
    const dur = 1800;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now-start)/dur, 1);
      const eased = 1 - Math.pow(1-p, 3);
      const val = target % 1 === 0 ? Math.floor(target*eased) : (target*eased).toFixed(1);
      el.textContent = val + suffix;
      if(p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };
  if(counters.length){
    if('IntersectionObserver' in window){
      const cio = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){ animateCounter(entry.target); cio.unobserve(entry.target); }
        });
      }, {threshold:.5});
      counters.forEach(c=> cio.observe(c));
    } else { counters.forEach(animateCounter); }
  }

  /* ---------- Cursor glow (desktop only) ---------- */
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    const glow = document.createElement('div');
    glow.style.cssText = 'position:fixed;width:340px;height:340px;border-radius:50%;pointer-events:none;z-index:1;background:radial-gradient(circle,rgba(255,193,10,.10),transparent 70%);transform:translate(-50%,-50%);transition:opacity .3s;opacity:0;';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e)=>{
      glow.style.left = e.clientX+'px'; glow.style.top = e.clientY+'px'; glow.style.opacity='1';
    });
    document.addEventListener('mouseleave', ()=> glow.style.opacity='0');
  }

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll('.magnetic').forEach(m=>{
    m.addEventListener('mousemove', (e)=>{
      const r = m.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      m.style.transform = `translate(${x*0.12}px, ${y*0.28}px)`;
    });
    m.addEventListener('mouseleave', ()=> m.style.transform = 'translate(0,0)');
  });

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.accordion-item').forEach(item=>{
    const head = item.querySelector('.accordion-head');
    const body = item.querySelector('.accordion-body');
    head.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(i=>{
        i.classList.remove('open');
        i.querySelector('.accordion-body').style.maxHeight = null;
      });
      if(!isOpen){
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Pill filters (generic, works for gallery/transport/facilities) ---------- */
  document.querySelectorAll('[data-filter-group]').forEach(group=>{
    const pills = group.querySelectorAll('.pill');
    const targetSelector = group.getAttribute('data-filter-group');
    const items = document.querySelectorAll(targetSelector);
    pills.forEach(pill=>{
      pill.addEventListener('click', ()=>{
        pills.forEach(p=>p.classList.remove('active'));
        pill.classList.add('active');
        const val = pill.getAttribute('data-filter');
        items.forEach(it=>{
          const cats = (it.getAttribute('data-cat')||'').split(' ');
          const show = val === 'all' || cats.includes(val);
          it.style.display = show ? '' : 'none';
        });
      });
    });
  });

  /* ---------- Lightbox for gallery ---------- */
  const lightbox = document.querySelector('.lightbox');
  if(lightbox){
    const lbImg = lightbox.querySelector('img');
    const lbCaption = lightbox.querySelector('.lb-caption');
    document.querySelectorAll('[data-lightbox]').forEach(trigger=>{
      trigger.addEventListener('click', ()=>{
        lbImg.src = trigger.getAttribute('data-lightbox');
        lbCaption.textContent = trigger.getAttribute('data-caption') || '';
        lightbox.classList.add('open');
      });
    });
    lightbox.addEventListener('click', (e)=>{
      if(e.target === lightbox || e.target.classList.contains('lb-close')) lightbox.classList.remove('open');
    });
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') lightbox.classList.remove('open'); });
  }

  /* ---------- Transport route search ---------- */
  const routeSearch = document.getElementById('routeSearch');
  if(routeSearch){
    routeSearch.addEventListener('input', ()=>{
      const q = routeSearch.value.trim().toLowerCase();
      document.querySelectorAll('.route-card').forEach(card=>{
        const text = card.getAttribute('data-search').toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  /* ---------- EmailJS powered forms (Contact + Admissions) ---------- */
  const emailCfg = window.LGS_EMAILJS;
  if(window.emailjs && emailCfg){
    try{ emailjs.init({ publicKey: emailCfg.PUBLIC_KEY }); }catch(e){ console.error('EmailJS init failed:', e); }
  }

  const wireEmailForm = (form, templateKey) => {
    if(!form) return;
    const btn = form.querySelector('button[type="submit"]');
    const btnLabel = btn ? btn.querySelector('span') : null;
    const originalLabel = btnLabel ? btnLabel.textContent : '';
    const msg = form.querySelector('.form-msg');

    const setMsg = (text, type) => {
      if(!msg) return;
      msg.textContent = text;
      msg.classList.remove('success','error');
      if(type) msg.classList.add(type);
      msg.style.display = 'block';
    };

    form.addEventListener('submit', (e)=>{
      e.preventDefault();

      if(!window.emailjs || !emailCfg || emailCfg.PUBLIC_KEY === 'YOUR_PUBLIC_KEY'){
        setMsg('This form is almost ready — the school just needs to connect EmailJS (see assets/js/emailjs-config.js). Meanwhile, please call +91 73737 27290 or email info@lingaschool.org.', 'error');
        return;
      }

      if(btn) btn.disabled = true;
      if(btnLabel) btnLabel.textContent = 'Sending…';
      if(msg){ msg.style.display = 'none'; msg.classList.remove('success','error'); }

      emailjs.sendForm(emailCfg.SERVICE_ID, emailCfg[templateKey], form)
        .then(()=>{
          setMsg("Thank you! Your message has been sent — we'll be in touch shortly.", 'success');
          form.reset();
        })
        .catch((err)=>{
          console.error('EmailJS error:', err);
          setMsg('Something went wrong sending your message. Please call +91 73737 27290 or email info@lingaschool.org directly.', 'error');
        })
        .finally(()=>{
          if(btn) btn.disabled = false;
          if(btnLabel) btnLabel.textContent = originalLabel;
        });
    });
  };

  wireEmailForm(document.getElementById('contactForm'), 'CONTACT_TEMPLATE_ID');
  wireEmailForm(document.getElementById('admissionForm'), 'ADMISSION_TEMPLATE_ID');

});
