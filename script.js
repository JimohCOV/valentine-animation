function splitLetters(el) {
  const text = el.textContent;
  el.textContent = "";
  [...text].forEach(ch => {
    const span = document.createElement("span");
    span.className = "ch";
    span.textContent = ch === " " ? "\u00A0" : ch;
    el.appendChild(span);
  });
}

function makePetals(count = 22) {
  const wrap = document.getElementById("petals");
  wrap.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    p.style.left = Math.random() * 100 + "%";
    p.style.opacity = (0.35 + Math.random() * 0.55).toFixed(2);
    const s = 10 + Math.random() * 16;
    p.style.width = s + "px";
    p.style.height = (s * 0.7) + "px";
    wrap.appendChild(p);

    gsap.set(p, { rotation: (Math.random() * 60) - 30 });

    gsap.to(p, {
      y: window.innerHeight + 200,
      x: (Math.random() * 160) - 80,
      rotation: "+=" + (Math.random() * 240 - 120),
      duration: 6 + Math.random() * 6,
      delay: Math.random() * 4,
      ease: "none",
      repeat: -1
    });
  }
}

const scene = document.getElementById("scene");
const you = document.querySelector(".you");
const her = document.querySelector(".her");
const message = document.getElementById("message");
const sub = document.getElementById("sub");
const bouquet = document.getElementById("bouquet");
const bloom = document.getElementById("bloom");
const sparkles = document.getElementById("sparkles");

const replayBtn = document.getElementById("replay");
const tapToStart = document.getElementById("tapToStart");
const musicBtn = document.getElementById("musicBtn");
const bgm = document.getElementById("bgm");

splitLetters(message);
makePetals(24);

function getBouquetMiddle() {
  const y = you.getBoundingClientRect();
  const h = her.getBoundingClientRect();

  const isMobile = window.innerWidth <= 520;

  if (isMobile) {
    // middle of the GAP between them (best for phones)
    const gapCenterX = (y.right + h.left) / 2;

    // place bouquet around upper torso height (not head)
    const torsoY = Math.min(y.bottom, h.bottom) - Math.min(y.height, h.height) * 0.45;

    return {
      x: gapCenterX,     // no left shift on mobile
      y: torsoY
    };
  }

  // desktop/tablet fallback (your old logic, slightly improved)
  const centerX = (y.left + y.width / 2 + h.left + h.width / 2) / 2;

  return {
    x: centerX - 80,                 // your left shift for desktop
    y: y.top + y.height * 0.66
  };
}

let idleYou, idleHer;
let musicOn = false;

function burstHearts(x, y) {
  const icons = ["💗","✨","💖","✨","💞","✨"];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = icons[i % icons.length];
    sparkles.appendChild(s);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 90;

    gsap.set(s, { x, y });

    gsap.to(s, {
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist - (10 + Math.random() * 20),
      opacity: 1,
      scale: 1,
      duration: 0.55,
      ease: "power2.out"
    });

    gsap.to(s, {
      opacity: 0,
      duration: 0.6,
      delay: 0.35,
      ease: "power2.out",
      onComplete: () => s.remove()
    });
  }
}

function play() {
  if (idleYou) idleYou.kill();
  if (idleHer) idleHer.kill();

  gsap.killTweensOf([you, her, bouquet, bloom, scene, ".message .ch", sub]);
  sparkles.innerHTML = "";

  // reset
  gsap.set(scene, { scale: 1 });
  gsap.set(you, { xPercent: -160, y: 0 });
  gsap.set(her, { xPercent: 160, y: 0 });

  gsap.set(".message .ch", { opacity: 0, y: 12 });
  gsap.set(sub, { opacity: 0, y: 10 });

  gsap.set(bouquet, { opacity: 0, scale: 0.75, x: window.innerWidth/2, y: window.innerHeight/2 });
  gsap.set(bloom, { opacity: 0, scale: 0.9, x: window.innerWidth/2, y: window.innerHeight/2 });

  const tl = gsap.timeline();

  // camera push-in (slow)
  tl.to(scene, { scale: 1.03, duration: 10, ease: "power1.out" }, 0);

  // you walk in
  tl.to(you, { xPercent: 0, duration: 3.0, ease: "power2.out" }, 0)
    .to(you, { keyframes: [{ y: -6 }, { y: 0 }, { y: -4 }, { y: 0 }], duration: 3.0, ease: "sine.inOut" }, 0);

  // text
  tl.to(".message .ch", { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.03 }, 3.1);

  // her walk in
  tl.to(her, { xPercent: 0, duration: 3.0, ease: "power2.out" }, 4.1)
    .to(her, { keyframes: [{ y: -5 }, { y: 0 }, { y: -3 }, { y: 0 }], duration: 3.0, ease: "sine.inOut" }, 4.1);

  // bouquet appears between them + bloom pulse + heart burst
  tl.add(() => {
    const pos = getBouquetMiddle();
    gsap.set(bouquet, { x: pos.x, y: pos.y });
    gsap.set(bloom, { x: pos.x, y: pos.y });
  }, 6.2);

  tl.to(bloom, { opacity: 1, scale: 1.0, duration: 0.5, ease: "power2.out" }, 6.2)
    .to(bloom, { opacity: 0.7, scale: 1.1, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: 1 }, 6.35);

  tl.to(bouquet, { opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.7)" }, 6.2);

  tl.add(() => {
    const pos = getBouquetMiddle();
    burstHearts(pos.x, pos.y - 30);
    // tiny emphasis zoom
    gsap.to(scene, { scale: 1.05, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" });
  }, 6.35);

  // final line
  tl.to(sub, { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" }, 6.9);

  // idle breathing
  tl.add(() => {
    idleYou = gsap.to(you, { y: "+=3", duration: 1.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
    idleHer = gsap.to(her, { y: "+=3", duration: 1.7, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }, 7.6);

  return tl;
}

// tap-to-start (required for mobile audio)
tapToStart.addEventListener("click", async () => {
  tapToStart.classList.add("hidden");
  play();
  // optional: start music on first tap if user wants
});

replayBtn.addEventListener("click", play);

musicBtn.addEventListener("click", async () => {
  try {
    if (!musicOn) {
      await bgm.play();
      musicOn = true;
      musicBtn.textContent = "Music: On";
    } else {
      bgm.pause();
      musicOn = false;
      musicBtn.textContent = "Music: Off";
    }
  } catch (e) {
    // if browser blocks, user must tap screen first
    alert("Tap the screen once, then try Music again.");
  }
});

window.addEventListener("resize", () => {
  makePetals(24);
});

// Start with overlay (so mobile is safe)

