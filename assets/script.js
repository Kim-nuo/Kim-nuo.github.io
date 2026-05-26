const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const progressBar = document.querySelector(".scroll-progress span");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const customCursor = document.querySelector(".interactive-cursor");
const magneticItems = document.querySelectorAll(".magnetic-card");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (customCursor) {
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let targetX = cursorX;
  let targetY = cursorY;

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    },
    { passive: true }
  );

  magneticItems.forEach((item) => {
    item.addEventListener("pointerenter", () => customCursor.classList.add("is-active"));
    item.addEventListener("pointerleave", () => customCursor.classList.remove("is-active"));
  });

  const moveCursor = () => {
    cursorX += (targetX - cursorX) * 0.22;
    cursorY += (targetY - cursorY) * 0.22;
    customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(moveCursor);
  };

  moveCursor();
}

magneticItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.translate = `${x * 0.08}px ${y * 0.08}px`;
  });

  item.addEventListener("pointerleave", () => {
    item.style.translate = "";
  });
});

const updateScrollProgress = () => {
  if (!progressBar) {
    return;
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable <= 0 ? 0 : window.scrollY / scrollable;
  progressBar.style.width = `${Math.min(progress, 1) * 100}%`;
};

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const revealItems = document.querySelectorAll("[data-reveal]");

if (revealItems.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 7}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

if (parallaxItems.length > 0) {
  const updateParallax = () => {
    const offset = window.scrollY * -0.08;
    parallaxItems.forEach((item) => {
      item.style.transform = `translate3d(0, ${offset}px, 0) scale(1.04)`;
    });
  };

  window.addEventListener("scroll", updateParallax, { passive: true });
  updateParallax();
}

const fieldCanvas = document.querySelector("#field-canvas");

if (fieldCanvas) {
  const context = fieldCanvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMentalMap = document.body.classList.contains("mental-map-home");
  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let width = 0;
  let height = 0;
  let stars = [];
  let ribbons = [];

  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    fieldCanvas.width = Math.floor(width * ratio);
    fieldCanvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const starCount = width < 720 ? 58 : 112;
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: randomBetween(0.7, 2.2),
      depth: randomBetween(0.2, 1),
      alpha: randomBetween(0.12, 0.5),
      phase: Math.random() * Math.PI * 2,
    }));

    ribbons = Array.from({ length: isMentalMap ? 6 : 4 }, (_, index) => ({
      y: height * randomBetween(0.18, 0.88),
      amplitude: isMentalMap ? randomBetween(24, 72) : randomBetween(38, 110),
      speed: randomBetween(0.08, 0.24) * (index % 2 === 0 ? 1 : -1),
      alpha: isMentalMap ? randomBetween(0.1, 0.22) : randomBetween(0.08, 0.16),
      hue: isMentalMap
        ? ["216, 111, 134", "157, 189, 146", "170, 203, 225"][index % 3]
        : index % 2 === 0
          ? "125, 184, 255"
          : "255, 255, 255",
    }));
  };

  const drawRibbon = (ribbon, time) => {
    context.beginPath();
    for (let x = -40; x <= width + 40; x += 18) {
      const wave =
        Math.sin(x * 0.006 + time * ribbon.speed) * ribbon.amplitude +
        Math.cos(x * 0.012 - time * ribbon.speed * 0.7) * ribbon.amplitude * 0.28;
      const y = ribbon.y + wave + pointer.y * 28;
      if (x === -40) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.strokeStyle = `rgba(${ribbon.hue}, ${ribbon.alpha})`;
    context.lineWidth = width < 720 ? 1 : 1.35;
    context.stroke();
  };

  const draw = (timeMs = 0) => {
    const time = timeMs / 1000;
    pointer.x += (target.x - pointer.x) * 0.045;
    pointer.y += (target.y - pointer.y) * 0.045;

    context.clearRect(0, 0, width, height);

    const gradient = context.createRadialGradient(
      width * (0.68 + pointer.x * 0.06),
      height * (0.26 + pointer.y * 0.06),
      40,
      width * 0.5,
      height * 0.5,
      Math.max(width, height)
    );
    if (isMentalMap) {
      gradient.addColorStop(0, "#fbf8f3");
      gradient.addColorStop(0.45, "#f2f4ee");
      gradient.addColorStop(1, "#f9f3f1");
    } else {
      gradient.addColorStop(0, "#263247");
      gradient.addColorStop(0.38, "#11141d");
      gradient.addColorStop(1, "#050608");
    }
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    ribbons.forEach((ribbon) => drawRibbon(ribbon, reduceMotion ? 0 : time));

    stars.forEach((star) => {
      const shimmer = reduceMotion ? 0 : Math.sin(time * 0.9 + star.phase) * 0.18;
      const x = star.x + pointer.x * 44 * star.depth;
      const y = star.y + pointer.y * 34 * star.depth;
      context.beginPath();
      context.fillStyle = isMentalMap
        ? `rgba(${star.depth > 0.68 ? "216, 111, 134" : "96, 124, 112"}, ${0.12 + star.alpha * 0.52 + shimmer * 0.3})`
        : `rgba(247, 247, 242, ${star.alpha + shimmer})`;
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fill();
    });

    const glowX = width * 0.68 + pointer.x * 70;
    const glowY = height * 0.46 + pointer.y * 56;
    const glow = context.createRadialGradient(glowX, glowY, 12, glowX, glowY, Math.min(width, height) * 0.52);
    if (isMentalMap) {
      glow.addColorStop(0, "rgba(216, 111, 134, 0.16)");
      glow.addColorStop(0.42, "rgba(170, 203, 225, 0.1)");
      glow.addColorStop(1, "rgba(157, 189, 146, 0)");
    } else {
      glow.addColorStop(0, "rgba(125, 184, 255, 0.26)");
      glow.addColorStop(0.42, "rgba(125, 184, 255, 0.08)");
      glow.addColorStop(1, "rgba(125, 184, 255, 0)");
    }
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize);
  window.addEventListener(
    "pointermove",
    (event) => {
      target.x = event.clientX / window.innerWidth - 0.5;
      target.y = event.clientY / window.innerHeight - 0.5;
    },
    { passive: true }
  );

  resize();
  requestAnimationFrame(draw);
}
