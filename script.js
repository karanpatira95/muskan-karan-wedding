
/* ══════════════════════════════════════════════════
   AUDIO
══════════════════════════════════════════════════ */
const bgAudio = document.getElementById('bg-audio');
const aOn = document.getElementById('a-on'), aOff = document.getElementById('a-off');
let playing = false;
function setAudio(on) {
  if (on) {
    if (bgAudio.readyState === 0) bgAudio.load();
    bgAudio.play().then(() => { playing=true; aOn.style.display='block'; aOff.style.display='none'; }).catch(()=>{});
  } else {
    bgAudio.pause(); playing=false; aOn.style.display='none'; aOff.style.display='block';
  }
}
document.getElementById('audio-btn').addEventListener('click', () => setAudio(!playing));

/* ══════════════════════════════════════════════════
   PETALS
══════════════════════════════════════════════════ */
(function() {
  const cvs = document.getElementById('petals-canvas');
  const ctx = cvs.getContext('2d');
  const COLORS = ['#F5EAED','#D9B0BA','#C58A96','#FFFFFF','#DCD0B3'];
  const N = window.innerWidth < 600 ? 22 : 40;
  function resize() { cvs.width = innerWidth; cvs.height = innerHeight; }
  resize(); window.addEventListener('resize', resize, {passive:true});
  class Petal {
    constructor(init) {
      this.x = Math.random() * cvs.width;
      this.y = init ? Math.random() * cvs.height * 2 - cvs.height : -20;
      this.r = 4 + Math.random() * 5;
      this.vx = (Math.random() - .5) * .8;
      this.vy = .6 + Math.random() * 1.1;
      this.rot = Math.random() * Math.PI * 2;
      this.drot = (Math.random() - .5) * .04;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = .5 + Math.random() * .4;
    }
    update() {
      this.x += this.vx + Math.sin(this.y * .01) * .35;
      this.y += this.vy; this.rot += this.drot;
      if (this.y > cvs.height + 20) { this.x = Math.random()*cvs.width; this.y = -20; }
    }
    draw() {
      ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.rot);
      ctx.globalAlpha = this.alpha; ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.ellipse(0,0,this.r*.55,this.r,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }
  const petals = Array.from({length:N}, (_,i)=>new Petal(true));
  function loop() { ctx.clearRect(0,0,cvs.width,cvs.height); petals.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(loop); }
  loop();
})();

/* ══════════════════════════════════════════════════
   AUTO-SCROLL
══════════════════════════════════════════════════ */
let userInteracted = false, autoScrollTo;
function handleInteract() {
  userInteracted = true;
  clearTimeout(autoScrollTo);
  ['wheel','touchstart','mousedown','keydown'].forEach(e=>window.removeEventListener(e,handleInteract));
}
function smoothScroll(endY, dur) {
  const startY = window.scrollY, dist = endY - startY;
  let t0 = null, rafId;
  function step(now) {
    if (userInteracted) { cancelAnimationFrame(rafId); return; }
    if (!t0) t0 = now;
    const elapsed = now - t0;
    let t = elapsed / (dur/2), run;
    if (t < 1) run = dist/2*t*t*t + startY;
    else { t-=2; run = dist/2*(t*t*t+2)+startY; }
    window.scrollTo(0, run);
    if (elapsed < dur) rafId = requestAnimationFrame(step);
  }
  rafId = requestAnimationFrame(step);
}

/* ══════════════════════════════════════════════════
   ENTRY GATE
══════════════════════════════════════════════════ */
const gate = document.getElementById('entry-gate');
const entryVid = document.getElementById('entry-video');
const mainEl = document.getElementById('main-content');
const petalCvs = document.getElementById('petals-canvas');

let revealed = false;

function revealMain() {

  if (revealed) return;

  revealed = true;

  gate.classList.add('fade-out');

  setTimeout(() => {
    gate.style.display = 'none';
  }, 900);

  mainEl.classList.add('visible');

  petalCvs.classList.add('active');

  document.body.style.overflow = 'auto';

  initCountdown();
  initEventExpand();
  initReveal();

  setTimeout(() => {
    ['wheel','touchstart','mousedown','keydown']
      .forEach(e =>
        window.addEventListener(e, handleInteract, { passive:true })
      );
  }, 1000);

  autoScrollTo = setTimeout(() => {

    if (!userInteracted) {

      const cdSection = document.getElementById('countdown-section');

      if (cdSection) {

        const offset = window.innerWidth < 480 ? 20 : 60;

        smoothScroll(
          cdSection.getBoundingClientRect().top +
          window.scrollY -
          offset,
          2000
        );
      }
    }

  }, 13500);
}

/* CLICK TO START */
gate.addEventListener('click', async () => {

  if (revealed) return;

  document.getElementById('play-overlay')
    .classList.add('hidden');

  try {

    entryVid.muted = true;

    await entryVid.play();

    setAudio(true);

  } catch (e) {

    console.log("Video failed:", e);

    revealMain();
  }
});

/* WHEN VIDEO ENDS */
entryVid.addEventListener('ended', revealMain);

/* IF VIDEO FAILS */
entryVid.addEventListener('error', () => {

  console.log("Entry video error");

  revealMain();
});

/* FALLBACK: NEVER GET STUCK */
setTimeout(() => {

  if (!revealed) {

    console.log("Fallback reveal triggered");

    revealMain();
  }

}, 10000);

document.body.style.overflow = 'hidden';


/* ══════════════════════════════════════════════════
   COUNTDOWN — July 09, 2026
══════════════════════════════════════════════════ */
function initCountdown() {
  // Target date set for July 09, 2026 at 13:00 (1:00 PM)
  const target = new Date('July 09, 2026 13:00:00').getTime();
  const els = {d:document.getElementById('cd-days'),h:document.getElementById('cd-hours'),m:document.getElementById('cd-mins'),s:document.getElementById('cd-secs')};
  
  function tick(){
    const diff = target - Date.now();
    if(diff <= 0){
      document.querySelector('.cd-grid').innerHTML="<p style='grid-column:1/-1;font-family:\"Great Vibes\",cursive;font-size:2.5rem;color:var(--sage-dark)'> Over and Out!!</p>";
      return;
    }
    const fmt = n => String(n).padStart(2,'0');
    els.d.textContent = fmt(Math.floor(diff/86400000));
    els.h.textContent = fmt(Math.floor((diff%86400000)/3600000));
    els.m.textContent = fmt(Math.floor((diff%3600000)/60000));
    els.s.textContent = fmt(Math.floor((diff%60000)/1000));
  }
  tick(); setInterval(tick,1000);
}

/* ══════════════════════════════════════════════════
   REVEAL ON SCROLL
══════════════════════════════════════════════════ */
function initReveal() {
  const items = document.querySelectorAll('.reveal:not(.revealed)');
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('revealed'); io.unobserve(e.target); } });
  },{threshold:.1,rootMargin:'0px 0px -40px 0px'});
  items.forEach(el=>io.observe(el));
}

/* ══════════════════════════════════════════════════
   EVENT VIDEO AUTO-EXPAND
══════════════════════════════════════════════════ */
function initEventExpand() {
  const wraps = document.querySelectorAll('.evt-video');
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('open'); io.unobserve(e.target); } });
  },{threshold:.3});
  wraps.forEach(w=>io.observe(w));
}

/* ══════════════════════════════════════════════════
   RSVP
══════════════════════════════════════════════════ */
function showRsvpError(msg) {
  const errEl = document.getElementById('rsvp-error');
  errEl.textContent = msg;
  errEl.style.display = 'block';
  errEl.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function clearRsvpError() {
  const errEl = document.getElementById('rsvp-error');
  errEl.style.display = 'none';
  errEl.textContent = '';
}

function getSelectedTransport() {
  const selected = document.querySelector(
    '.evt-checks input[type="radio"]:checked'
  );

  return selected ? selected.value : '';
}

async function submitRSVP() {
  clearRsvpError();

  const name   = (document.getElementById('rsvp-name').value || '').trim();
  const phone  = (document.getElementById('rsvp-phone').value || '').trim();
  const guests = document.getElementById('rsvp-guests').value;
  const msg    = (document.getElementById('rsvp-msg').value || '').trim();
  const transport = getSelectedTransport();

  if (!name) {
    showRsvpError('Please enter your full name to RSVP.');
    document.getElementById('rsvp-name').focus();
    return;
  }
  if (!transport) {
    showRsvpError('Please select at least one transport you will be attending.');
    return;
  }

  const btn = document.getElementById('rsvp-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  const data = {
    name,
    phone,
    guest_count: guests,
    transportation: transport,
    message: msg,
    clientId: 'MuskanwedsKaran-wedding-2026'
  };

  try {
    const res = await fetch('https://script.google.com/macros/s/AKfycbwgmWNDMgviiOlG6goNFRz98fi8d1_z_HbC8IEQ0aGuRGHWL1lYDZSpAxWRtNllJdbSyA/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.success) {
      document.getElementById('rsvp-form-inner').style.display = 'none';
      document.getElementById('rsvp-success').style.display = 'block';
    } else {
      showRsvpError('Something went wrong. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Confirm RSVP →';
    }
  } catch (err) {
    console.error(err);
    showRsvpError('Unable to submit. Please check your connection and try again.');
    btn.disabled = false;
    btn.textContent = 'Confirm RSVP →';
  }
}
