/* ============ DunRite homepage interactions ============ */
(function () {
  "use strict";

  /* ---- mobile drawer ---- */
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");
  var drawerClose = document.getElementById("drawerClose");
  function openDrawer() { if (drawer) { drawer.classList.add("open"); document.body.style.overflow = "hidden"; } }
  function closeDrawer() { if (drawer) { drawer.classList.remove("open"); document.body.style.overflow = ""; } }
  if (burger) burger.addEventListener("click", openDrawer);
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (drawer) drawer.querySelectorAll("[data-close]").forEach(function (a) {
    a.addEventListener("click", closeDrawer);
  });

  /* ---- scroll reveal ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---- animated counters ---- */
  var counted = false;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function runCounters() {
    if (counted) return; counted = true;
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (reducedMotion) { el.textContent = target; return; }
      var dur = 1500, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }
  var ticker = document.querySelector(".ticker");
  if (ticker) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCounters(); io2.disconnect(); } });
    }, { threshold: 0.4 });
    io2.observe(ticker);
  }

  /* ---- portfolio filter ---- */
  var filterWrap = document.getElementById("filters");
  var tiles = Array.prototype.slice.call(document.querySelectorAll("#grid .tile"));
  if (filterWrap) {
    filterWrap.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      filterWrap.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var f = btn.getAttribute("data-f");
      tiles.forEach(function (t) {
        var show = f === "all" || t.getAttribute("data-cat") === f;
        t.classList.toggle("hide", !show);
      });
    });
  }

  /* ---- lightbox ---- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbClose = document.getElementById("lbClose");
  var lbTileIdx = -1;
  var visibleTiles = function () { return tiles.filter(function (t) { return !t.classList.contains("hide"); }); };
  function openLb(t) {
    if (!lightbox) return;
    var vt = visibleTiles();
    lbTileIdx = vt.indexOf(t);
    lbImg.src = t.getAttribute("data-img");
    lbImg.alt = t.getAttribute("data-title") || "";
    lbCap.textContent = (t.getAttribute("data-title") || "") + " — " + (t.getAttribute("data-sub") || "");
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function lbNav(dir) {
    var vt = visibleTiles();
    if (!vt.length) return;
    lbTileIdx = (lbTileIdx + dir + vt.length) % vt.length;
    var t = vt[lbTileIdx];
    lbImg.src = t.getAttribute("data-img");
    lbImg.alt = t.getAttribute("data-title") || "";
    lbCap.textContent = (t.getAttribute("data-title") || "") + " — " + (t.getAttribute("data-sub") || "");
  }
  tiles.forEach(function (t) {
    t.addEventListener("click", function () { openLb(t); });
  });
  function closeLb() { if (lightbox) { lightbox.classList.remove("open"); document.body.style.overflow = ""; } }
  if (lbClose) lbClose.addEventListener("click", closeLb);
  if (lightbox) lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeLb(); closeDrawer(); }
    if (lightbox && lightbox.classList.contains("open")) {
      if (e.key === "ArrowRight") lbNav(1);
      if (e.key === "ArrowLeft") lbNav(-1);
    }
  });

  /* ---- testimonials slider ---- */
  var items = Array.prototype.slice.call(document.querySelectorAll(".testi-item"));
  var dotsWrap = document.getElementById("tDots");
  var idx = 0, timer = null;
  if (items.length && dotsWrap) {
    items.forEach(function (_, i) {
      var d = document.createElement("i");
      if (i === 0) d.classList.add("on");
      d.addEventListener("click", function () { go(i); reset(); });
      dotsWrap.appendChild(d);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);
    function go(n) {
      idx = (n + items.length) % items.length;
      items.forEach(function (it, i) { it.classList.toggle("active", i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle("on", i === idx); });
    }
    function reset() { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 6000); }
    var tNext = document.getElementById("tNext");
    var tPrev = document.getElementById("tPrev");
    if (tNext) tNext.addEventListener("click", function () { go(idx + 1); reset(); });
    if (tPrev) tPrev.addEventListener("click", function () { go(idx - 1); reset(); });
    reset();

    /* ---- smooth scroll to anchors with sticky header offset ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (targetId === "#") return;
        var targetEl = document.querySelector(targetId === "#top" ? "body" : targetId);
        if (targetEl) {
          e.preventDefault();
          
          // Calculate header height dynamically (usually ~78px)
          var header = document.querySelector(".header");
          var headerHeight = 0;
          if (header && window.getComputedStyle(header).position === "sticky") {
            headerHeight = header.offsetHeight;
          }
          
          var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
          });
        }
      });
    });
  }

  /* ---- gantt: TODAY line + tooltips ---- */
  (function () {
    var NOW_WEEK = 3.2, TOTAL_WEEKS = 10;
    var nowEl = document.getElementById('ganttNow');

    function positionNow() {
      if (!nowEl) return;
      var inner = nowEl.parentElement;
      var gnlEl = inner && inner.querySelector('.gnl');
      var tlEl  = inner && inner.querySelector('.gantt-tl');
      if (!gnlEl || !tlEl) return;
      nowEl.style.left = (gnlEl.offsetWidth + (NOW_WEEK / TOTAL_WEEKS) * tlEl.offsetWidth) + 'px';
    }
    positionNow();
    window.addEventListener('resize', positionNow);

    /* floating tooltip */
    var tip = document.createElement('div');
    tip.className = 'g-tip';
    document.body.appendChild(tip);

    document.querySelectorAll('.g-bar[data-tip]').forEach(function (bar) {
      bar.addEventListener('mouseenter', function () {
        tip.textContent = bar.getAttribute('data-tip');
        tip.classList.add('show');
      });
      bar.addEventListener('mousemove', function (e) {
        tip.style.left = (e.clientX + 14) + 'px';
        tip.style.top  = (e.clientY - 42) + 'px';
      });
      bar.addEventListener('mouseleave', function () {
        tip.classList.remove('show');
      });
    });
  }());

})();
