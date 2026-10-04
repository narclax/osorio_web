(function(){
  /* ====== CONFIGURACIÓN ====== */
  // URL del video institucional (MP4/WebM). Déjelo vacío para mostrar el marcador.
  var VIDEO_SRC = "img/cedimat.mp4";

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header con sombra al hacer scroll */
  var header = document.querySelector('.site-header');
  var toTop = document.querySelector('.to-top');

  /* Enlace activo del menú según la sección visible */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#menu .nav-link'));
  var spy = navLinks.map(function(a){
    return {link: a, section: document.querySelector(a.getAttribute('href'))};
  }).filter(function(x){ return x.section; });
  var currentId = null;
  function updateActive(){
    var line = window.innerHeight * 0.35;
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    var active = spy[0];
    spy.forEach(function(x){ if (x.section.getBoundingClientRect().top <= line) active = x; });
    if (atBottom) active = spy[spy.length - 1];
    if (active && active.link.getAttribute('href') !== currentId) {
      currentId = active.link.getAttribute('href');
      navLinks.forEach(function(a){
        var on = a === active.link;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
  }

  function onScroll(){
    header.classList.toggle('scrolled', window.scrollY > 8);
    toTop.classList.toggle('show', window.scrollY > 500);
    updateActive();
  }
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  /* Volver arriba */
  document.querySelectorAll('.js-top').forEach(function(el){
    el.addEventListener('click', function(e){
      e.preventDefault();
      window.scrollTo({top: 0, behavior: reduce ? 'auto' : 'smooth'});
    });
  });

  /* Swiper */
  if (window.Swiper) {
    new Swiper('.hero-swiper', {
      effect: 'fade', fadeEffect: {crossFade: true},
      speed: 900, loop: true, grabCursor: true,
      autoplay: reduce ? false : {delay: 7000, disableOnInteraction: false, pauseOnMouseEnter: true},
      pagination: {el: '.hero-swiper .swiper-pagination', clickable: true},
      navigation: {nextEl: '.nav-btn.next', prevEl: '.nav-btn.prev'},
      a11y: {enabled: true}
    });
  } else {
    document.documentElement.classList.remove('js');
    document.querySelectorAll('.draw,.fadein').forEach(function(e){e.style.opacity=1;e.style.strokeDashoffset=0;});
  }

  /* Animaciones de entrada: se activan al entrar en pantalla (bajando o subiendo)
     y se reinician cuando el elemento sale por completo, para repetirse al volver. */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.intersectionRatio >= 0.15) { en.target.classList.add('in'); }
        else if (!en.isIntersecting) { en.target.classList.remove('in'); }
      });
    }, {threshold: [0, 0.15], rootMargin: '0px 0px -8% 0px'});
    items.forEach(function(el){ io.observe(el); });
  } else { items.forEach(function(el){ el.classList.add('in'); }); }

  /* Video institucional: autoplay inmediato (silenciado) y pausa solo si sale de pantalla */
  var video = document.getElementById('institutional-video');
  var placeholder = document.getElementById('videoPlaceholder');
  if (VIDEO_SRC) {
    video.muted = true; video.loop = true; video.playsInline = true;
    video.src = VIDEO_SRC;
    placeholder.style.display = 'none';
    var tryPlay = function(){ var p = video.play(); if (p && p.catch) p.catch(function(){}); };
    if (!reduce) {
      tryPlay();
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function(entries){
          entries.forEach(function(en){ if (en.isIntersecting) tryPlay(); else video.pause(); });
        }, {threshold: .25}).observe(video);
      }
    }
  } else {
    video.style.display = 'none';
  }


  /* Galería con lightbox */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  if (galleryItems.length) {
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lbImg');
    var lbCap = document.getElementById('lbCaption');
    var lbCount = document.getElementById('lbCount');
    var current = 0, lastFocused = null;
    function renderLb(){
      var el = galleryItems[current];
      var img = el.querySelector('img');
      lbImg.src = img.src; lbImg.alt = img.alt;
      lbCap.textContent = el.querySelector('.gallery-caption').textContent;
      lbCount.textContent = (current + 1) + ' / ' + galleryItems.length;
    }
    function openLb(i){
      current = i; lastFocused = document.activeElement;
      renderLb();
      lb.hidden = false;
      requestAnimationFrame(function(){ lb.classList.add('open'); });
      document.body.style.overflow = 'hidden';
      document.getElementById('lbClose').focus();
    }
    function closeLb(){
      lb.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(function(){ lb.hidden = true; }, 350);
      if (lastFocused) lastFocused.focus();
    }
    function step(n){ current = (current + n + galleryItems.length) % galleryItems.length; renderLb(); }
    galleryItems.forEach(function(el, i){ el.addEventListener('click', function(){ openLb(i); }); });
    document.getElementById('lbClose').addEventListener('click', closeLb);
    document.getElementById('lbPrev').addEventListener('click', function(){ step(-1); });
    document.getElementById('lbNext').addEventListener('click', function(){ step(1); });
    lb.addEventListener('click', function(e){ if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function(e){
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }

  /* Cerrar menú móvil al elegir un enlace */
  document.querySelectorAll('#menu .nav-link').forEach(function(a){
    a.addEventListener('click', function(){
      var el = document.getElementById('menu');
      if (el.classList.contains('show') && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(el).hide();
    });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
