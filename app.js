const profile = window.BIRTHDAY_PROFILE;
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

function renderProfile() {
  $('#letterName').textContent = profile.displayName;
  $('#signature').textContent = localStorage.getItem('zrj-signature') || profile.signature;
  $('#traits').innerHTML = profile.traits.map(t => `<article class="trait reveal"><div class="trait-copy"><i>${t.icon}</i><h3>${t.title}</h3><p>${t.text}</p></div><figure class="trait-illustration"><img src="${t.image}" alt="${t.alt}" loading="lazy"></figure></article>`).join('');
  $('#gallery').innerHTML = profile.photos.map((photo, i) => `<button class="photo-card reveal" data-index="${i}" aria-label="查看大图：${photo.caption}"><img src="${photo.src}" alt="${photo.alt}" loading="lazy"><p>${photo.caption}</p></button>`).join('');
  const saved = localStorage.getItem('zrj-letter-v23');
  $('#letterBody').innerHTML = saved || profile.letter.map(p => `<p>${p}</p>`).join('');
}

function updateCountdown() {
  const target = new Date(profile.birthday).getTime();
  const diff = target - Date.now();
  const el = $('#countdown');
  if (diff > 0) {
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    el.textContent = `距离二十三岁生日还有 ${days} 天 ${hours} 小时`;
  } else {
    el.textContent = '二十三岁的这一页，已经为你翻开 ✦';
  }
}

function setupReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return $$('.reveal').forEach(el => el.classList.add('is-visible'));
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
}

function setupNavigation() {
  $$('[data-target]').forEach(btn => btn.addEventListener('click', () => document.getElementById(btn.dataset.target).scrollIntoView({ behavior: 'smooth' })));
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) $$('.nav-dot').forEach(dot => dot.classList.toggle('is-active', dot.dataset.target === e.target.id));
  }), { threshold: .55 });
  $$('.chapter').forEach(section => io.observe(section));
}

function celebrate() {
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  const colors = ['#b96f72','#d3a85f','#87947a','#a9c0c7','#fffaf1'];
  const pieces = Array.from({ length: matchMedia('(prefers-reduced-motion: reduce)').matches ? 30 : 180 }, () => ({x:Math.random()*innerWidth,y:-20-Math.random()*innerHeight*.45,vx:(Math.random()-.5)*5,vy:2+Math.random()*4,r:3+Math.random()*6,c:colors[Math.floor(Math.random()*colors.length)],a:Math.random()*Math.PI,spin:(Math.random()-.5)*.18}));
  let frame = 0;
  function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);pieces.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.a+=p.spin;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.fillStyle=p.c;ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);ctx.restore()});if(frame++<220)requestAnimationFrame(draw);else ctx.clearRect(0,0,innerWidth,innerHeight)} draw();
}

function setupGallery() {
  const dialog = $('#lightbox');
  $$('.photo-card').forEach(card => card.addEventListener('click', () => {
    const photo = profile.photos[Number(card.dataset.index)];
    $('img', dialog).src = photo.src; $('img', dialog).alt = photo.alt; $('p', dialog).textContent = photo.caption; dialog.showModal();
  }));
  $('#closeLightbox').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
}

function setupEditing() {
  let timer;
  const save = () => { localStorage.setItem('zrj-letter-v23', $('#letterBody').innerHTML); localStorage.setItem('zrj-signature', $('#signature').textContent.trim()); $('#saveStatus').textContent = '已自动保存 ✓'; };
  [$('#letterBody'), $('#signature')].forEach(el => el.addEventListener('input', () => { $('#saveStatus').textContent = '正在保存…'; clearTimeout(timer); timer = setTimeout(save, 450); }));
}

function setupLetterReveal() {
  const stage = $('#letterStage');
  const button = $('#openLetterBtn');
  const paper = $('#letterPaper');
  button.addEventListener('click', () => {
    stage.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    paper.setAttribute('aria-hidden', 'false');
    setTimeout(() => paper.focus({ preventScroll: true }), 900);
  }, { once: true });
}

function setupHiddenSurprises() {
  const toast = $('#secretToast');
  let toastTimer;
  const showSecret = message => {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 5200);
  };

  let starClicks = 0;
  let starReset;
  $$('.floating-star').forEach(star => {
    star.setAttribute('role', 'button'); star.setAttribute('tabindex', '0'); star.setAttribute('aria-label', '一颗可以点击的小星星');
    const tapStar = () => { clearTimeout(starReset); starClicks += 1; star.classList.add('is-tapped'); setTimeout(() => star.classList.remove('is-tapped'), 350); if (starClicks >= 4) { showSecret('今天的星星都在为你庆祝。'); starClicks = 0; } starReset = setTimeout(() => starClicks = 0, 3200); };
    star.addEventListener('click', tapStar);
    star.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapStar(); } });
  });

  let cakeClicks = 0;
  const cake = $('.cake');
  cake.setAttribute('role', 'button'); cake.setAttribute('tabindex', '0'); cake.setAttribute('aria-label', '点击蛋糕收集好运');
  const tapCake = () => { cakeClicks += 1; cake.classList.add('is-tapped'); setTimeout(() => cake.classList.remove('is-tapped'), 280); if (cakeClicks === 3) showSecret('恭喜你，成功收集了多份好运。'); };
  cake.addEventListener('click', tapCake);
  cake.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapCake(); } });

  let albumTimer;
  let albumShown = false;
  const albumObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    clearTimeout(albumTimer);
    if (entry.isIntersecting && !albumShown) albumTimer = setTimeout(() => { albumShown = true; showSecret('照片会记录过去，而你会走向更明亮的未来。'); }, 10000);
  }), { threshold: .06 });
  albumObserver.observe($('#album'));

  const ending = $('#storyBegins');
  const endingObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting && $('#letterStage').classList.contains('is-open')) ending.classList.add('is-visible');
  }), { threshold: .8 });
  endingObserver.observe($('.signature'));
}

renderProfile(); updateCountdown(); setInterval(updateCountdown, 60000); setupReveal(); setupNavigation(); setupGallery(); setupEditing(); setupLetterReveal(); setupHiddenSurprises();
$('#celebrateBtn').addEventListener('click', celebrate); $('#replayBtn').addEventListener('click', celebrate);
setTimeout(celebrate, 600);
