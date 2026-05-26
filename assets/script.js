const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const progressBar = document.querySelector(".scroll-progress span");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const customCursor = document.querySelector(".interactive-cursor");
const magneticItems = document.querySelectorAll(".magnetic-card");
const mapBoard = document.querySelector(".map-board");
const mapNodes = document.querySelectorAll(".map-node");
const mapInspector = document.querySelector(".map-inspector");
const mapInspectorClose = document.querySelector(".map-inspector-close");
const isMentalMapPage = document.body.classList.contains("mental-map-home");

if (isMentalMapPage) {
  window.addEventListener(
    "pointermove",
    (event) => {
      document.body.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.body.style.setProperty("--pointer-y", `${event.clientY}px`);
    },
    { passive: true }
  );
}

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

if (mapBoard) {
  mapBoard.addEventListener(
    "pointermove",
    (event) => {
      const rect = mapBoard.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      mapBoard.style.setProperty("--map-x", `${x}%`);
      mapBoard.style.setProperty("--map-y", `${y}%`);
      mapBoard.classList.add("is-engaged");
    },
    { passive: true }
  );

  mapBoard.addEventListener("pointerleave", () => {
    mapBoard.classList.remove("is-engaged");
  });
}

const clearMapFocus = () => {
  mapNodes.forEach((node) => node.classList.remove("is-active"));
  document.querySelectorAll(".mind-card.is-focused").forEach((card) => {
    card.classList.remove("is-focused");
  });
};

const openMapInspector = (node, targetCard) => {
  if (!mapInspector || !targetCard) {
    return;
  }

  const title = targetCard.querySelector("h2")?.textContent?.trim() || node.textContent.trim();
  const copy = targetCard.querySelector("p:not(.map-kicker)")?.textContent?.trim() || "";
  const kicker = targetCard.querySelector(".map-kicker")?.textContent?.trim() || "Selected node";

  mapInspector.querySelector(".map-kicker").textContent = kicker;
  mapInspector.querySelector("h2").textContent = title;
  mapInspector.querySelector("p:not(.map-kicker)").textContent = copy;
  mapInspector.classList.add("is-open");
};

mapNodes.forEach((node) => {
  node.addEventListener("click", (event) => {
    const id = node.getAttribute("href");
    const targetCard = id ? document.querySelector(id) : null;

    if (!targetCard) {
      return;
    }

    event.preventDefault();
    clearMapFocus();
    node.classList.add("is-active");
    targetCard.classList.add("is-focused");
    openMapInspector(node, targetCard);

    window.setTimeout(() => {
      targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  });
});

if (mapInspectorClose && mapInspector) {
  mapInspectorClose.addEventListener("click", () => {
    mapInspector.classList.remove("is-open");
    clearMapFocus();
  });
}

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
  let blots = [];

  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    fieldCanvas.width = Math.floor(width * ratio);
    fieldCanvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const starCount = isMentalMap ? (width < 720 ? 290 : 620) : width < 720 ? 58 : 112;
    const centerX = width * 0.52;
    const centerY = height * 0.42;
    const radiusX = Math.min(width, height) * (width < 720 ? 0.3 : 0.26);
    const radiusY = Math.min(width, height) * (width < 720 ? 0.36 : 0.34);

    stars = Array.from({ length: starCount }, () => {
      if (!isMentalMap) {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: randomBetween(0.7, 2.2),
          depth: randomBetween(0.2, 1),
          alpha: randomBetween(0.12, 0.5),
          phase: Math.random() * Math.PI * 2,
        };
      }

      const mode = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const jitterX = randomBetween(-26, 26);
      const jitterY = randomBetween(-22, 22);
      let x = Math.random() * width;
      let y = Math.random() * height;
      let color = "177, 51, 74";
      let radius = randomBetween(0.75, 1.8);
      let alpha = randomBetween(0.28, 0.72);
      let soft = false;

      if (mode < 0.56) {
        const ring = randomBetween(0.88, 1.34);
        x = centerX + Math.cos(angle) * radiusX * ring + jitterX;
        y = centerY + Math.sin(angle) * radiusY * ring + jitterY;
        color = Math.random() > 0.22 ? "177, 51, 74" : "203, 92, 112";
        radius = randomBetween(0.55, 1.45);
        alpha = randomBetween(0.34, 0.82);
      } else if (mode < 0.8) {
        x = centerX + randomBetween(-radiusX * 0.34, radiusX * 0.3) + Math.sin(angle) * 18;
        y = centerY + randomBetween(-radiusY * 0.88, radiusY * 0.92);
        color = Math.random() > 0.36 ? "152, 103, 48" : "188, 139, 72";
        radius = randomBetween(0.8, 3.1);
        alpha = randomBetween(0.22, 0.64);
      } else if (mode < 0.92) {
        x = centerX + Math.cos(angle) * radiusX * randomBetween(0.24, 0.76) + jitterX;
        y = centerY + Math.sin(angle) * radiusY * randomBetween(0.2, 0.72) + jitterY;
        color = Math.random() > 0.5 ? "120, 151, 176" : "157, 189, 146";
        radius = randomBetween(1.6, 4.8);
        alpha = randomBetween(0.08, 0.24);
        soft = true;
      }

      return {
        x,
        y,
        radius,
        depth: randomBetween(0.2, 1),
        alpha,
        phase: Math.random() * Math.PI * 2,
        color,
        soft,
      };
    });

    blots = isMentalMap
      ? Array.from({ length: width < 720 ? 8 : 14 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: randomBetween(52, 160),
          alpha: randomBetween(0.055, 0.16),
          color: ["216, 111, 134", "157, 189, 146", "170, 203, 225"][
            Math.floor(Math.random() * 3)
          ],
          phase: Math.random() * Math.PI * 2,
        }))
      : [];

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

    if (isMentalMap) {
      const ovalX = width * 0.52 + pointer.x * 26;
      const ovalY = height * 0.42 + pointer.y * 20;
      const ovalRadiusX = Math.min(width, height) * (width < 720 ? 0.31 : 0.27);
      const ovalRadiusY = Math.min(width, height) * (width < 720 ? 0.37 : 0.35);

      context.save();
      context.filter = "blur(18px)";
      context.beginPath();
      context.fillStyle = "rgba(150, 181, 202, 0.34)";
      context.ellipse(ovalX, ovalY, ovalRadiusX, ovalRadiusY, -0.08, 0, Math.PI * 2);
      context.fill();
      context.restore();

      context.save();
      context.filter = "blur(18px)";
      blots.forEach((blot) => {
        const float = reduceMotion ? 0 : Math.sin(time * 0.16 + blot.phase) * 18;
        const x = blot.x + pointer.x * 60 + float;
        const y = blot.y + pointer.y * 44 - float * 0.35;
        const wash = context.createRadialGradient(x, y, 2, x, y, blot.radius);
        wash.addColorStop(0, `rgba(${blot.color}, ${blot.alpha})`);
        wash.addColorStop(1, `rgba(${blot.color}, 0)`);
        context.fillStyle = wash;
        context.beginPath();
        context.arc(x, y, blot.radius, 0, Math.PI * 2);
        context.fill();
      });
      context.restore();
    }

    stars.forEach((star) => {
      const shimmer = reduceMotion ? 0 : Math.sin(time * 0.9 + star.phase) * 0.18;
      const x = star.x + pointer.x * 44 * star.depth;
      const y = star.y + pointer.y * 34 * star.depth;
      if (isMentalMap && star.soft) {
        context.save();
        context.filter = "blur(5px)";
      }
      context.beginPath();
      context.fillStyle = isMentalMap
        ? `rgba(${star.color}, ${0.11 + star.alpha * 0.56 + shimmer * 0.28})`
        : `rgba(247, 247, 242, ${star.alpha + shimmer})`;
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fill();
      if (isMentalMap && star.soft) {
        context.restore();
      }
    });

    const glowX = isMentalMap ? width * (0.5 + pointer.x) : width * 0.68 + pointer.x * 70;
    const glowY = isMentalMap ? height * (0.5 + pointer.y) : height * 0.46 + pointer.y * 56;
    const glow = context.createRadialGradient(glowX, glowY, 12, glowX, glowY, Math.min(width, height) * 0.52);
    if (isMentalMap) {
      glow.addColorStop(0, "rgba(216, 111, 134, 0.28)");
      glow.addColorStop(0.28, "rgba(170, 203, 225, 0.16)");
      glow.addColorStop(0.56, "rgba(157, 189, 146, 0.1)");
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
