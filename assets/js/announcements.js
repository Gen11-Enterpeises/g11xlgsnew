/* Linga Global School — Announcements system
   NOTE: This is a front-end demo only. The "admin login" below stores a flag
   in the browser's localStorage purely so this page has something to gate
   the composer with. It is NOT secure authentication. To go live, connect
   this form to a real backend (e.g. Firebase Auth + Firestore, or your own
   API) and verify the admin session server-side before accepting posts. */

(function(){
  const STORAGE_KEY = 'lgs-announcements';
  const AUTH_KEY = 'lgs-admin-session';

  const seed = [
    {
      id: 'seed-1',
      title: 'Annual Sports Day — Save the Date',
      message: 'Our Annual Sports Day will be held on campus with track events, tug-of-war and the inter-house relay final. Parents are warmly invited.',
      ts: Date.now() - 1000*60*60*24*2
    },
    {
      id: 'seed-2',
      title: 'Term I Examination Schedule Released',
      message: 'The Term I examination timetable for Grades VI–XII has been shared with class teachers. Please check the diary of your child for the detailed schedule.',
      ts: Date.now() - 1000*60*60*24*6
    },
    {
      id: 'seed-3',
      title: 'PTA Meeting — Primary Wing',
      message: 'A Parent-Teacher meeting for Grades I–V will be held in the main auditorium. Class-wise slots will be shared via the school app.',
      ts: Date.now() - 1000*60*60*24*10
    }
  ];

  function loadAnnouncements(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    saveAnnouncements(seed);
    return seed;
  }
  function saveAnnouncements(list){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }catch(e){}
  }
  function isAdmin(){
    try{ return sessionStorage.getItem(AUTH_KEY) === '1'; }catch(e){ return false; }
  }

  function fmt(ts){
    const d = new Date(ts);
    const day = d.toLocaleDateString(undefined, {weekday:'long'});
    const date = d.toLocaleDateString(undefined, {day:'numeric', month:'long', year:'numeric'});
    const time = d.toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'});
    return {day, date, time};
  }

  function render(highlightId){
    const list = loadAnnouncements().sort((a,b)=> b.ts - a.ts);
    const wrap = document.getElementById('announceList');
    if(!wrap) return;
    wrap.innerHTML = '';
    if(!list.length){
      wrap.innerHTML = '<p class="muted">No announcements yet.</p>';
      return;
    }
    list.forEach(item=>{
      const {day, date, time} = fmt(item.ts);
      const card = document.createElement('div');
      card.className = 'card announce-card';
      card.style.marginBottom = '20px';
      card.innerHTML = `
        <div class="flex items-center justify-between" style="flex-wrap:wrap;gap:10px;">
          <span class="tag">${day}</span>
          <span class="small muted">${date} &middot; ${time}</span>
        </div>
        <h3 class="mt-16">${escapeHtml(item.title)}</h3>
        <p class="mt-8">${escapeHtml(item.message)}</p>
        ${isAdmin() ? `<button class="btn btn-outline btn-sm mt-16 delete-btn" data-id="${item.id}"><span>Delete</span></button>` : ''}
      `;
      if(item.id === highlightId){
        card.style.opacity = '0'; card.style.transform = 'translateY(-16px) scale(.97)';
        wrap.prepend(card);
        requestAnimationFrame(()=>{
          card.style.transition = 'opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1)';
          requestAnimationFrame(()=>{ card.style.opacity='1'; card.style.transform='translateY(0) scale(1)'; });
        });
      } else {
        wrap.appendChild(card);
      }
    });

    wrap.querySelectorAll('.delete-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-id');
        const list = loadAnnouncements().filter(a=> a.id !== id);
        saveAnnouncements(list);
        render();
      });
    });
  }

  function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function updateAdminUI(){
    const gate = document.getElementById('adminGate');
    const composer = document.getElementById('composer');
    const adminBadge = document.getElementById('adminBadge');
    if(!gate || !composer) return;
    if(isAdmin()){
      gate.style.display = 'none';
      composer.style.display = '';
      adminBadge.style.display = '';
    } else {
      gate.style.display = '';
      composer.style.display = 'none';
      adminBadge.style.display = 'none';
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    render();
    updateAdminUI();

    const loginForm = document.getElementById('adminLoginForm');
    if(loginForm){
      loginForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const err = document.getElementById('loginError');
        err.style.display = 'none';
        err.textContent = 'This demo has no real backend connected — hook this form up to your authentication service to enable posting.';
        err.style.display = 'block';
      });
    }

    const logoutBtn = document.getElementById('adminLogout');
    if(logoutBtn){
      logoutBtn.addEventListener('click', ()=>{
        try{ sessionStorage.removeItem(AUTH_KEY); }catch(e){}
        updateAdminUI();
      });
    }

    const postForm = document.getElementById('postForm');
    if(postForm){
      postForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const title = document.getElementById('postTitle').value.trim();
        const message = document.getElementById('postMessage').value.trim();
        if(!title || !message) return;
        const list = loadAnnouncements();
        const item = { id: 'a-'+Date.now(), title, message, ts: Date.now() };
        list.push(item);
        saveAnnouncements(list);
        postForm.reset();
        render(item.id);
      });
    }
  });
})();
