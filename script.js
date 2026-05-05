const THEME_KEY = "portfolio-theme-mode";
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");
const revealItems = document.querySelectorAll(".reveal");
const tiltCard = document.querySelector("[data-tilt]");

applySavedTheme();
setupThemeToggle();
setupRevealAnimation();
setupTiltEffect();

function applySavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light") {
    body.classList.remove("theme-dark");
    body.classList.add("theme-light");
  } else {
    body.classList.remove("theme-light");
    body.classList.add("theme-dark");
  }
  refreshThemeLabel();
}

function setupThemeToggle() {
  if (!themeToggle) {
    return;
  }

  themeToggle.addEventListener("click", () => {
    const isLight = body.classList.contains("theme-light");
    if (isLight) {
      body.classList.remove("theme-light");
      body.classList.add("theme-dark");
      localStorage.setItem(THEME_KEY, "dark");
    } else {
      body.classList.remove("theme-dark");
      body.classList.add("theme-light");
      localStorage.setItem(THEME_KEY, "light");
    }

    refreshThemeLabel();
  });
}

function refreshThemeLabel() {
  const isLight = body.classList.contains("theme-light");
  themeLabel.textContent = isLight ? "Dark Mode" : "Light Mode";
}

function setupRevealAnimation() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupTiltEffect() {
  if (!tiltCard) {
    return;
  }

  tiltCard.addEventListener("mousemove", (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;
    const rotateY = ((relativeX / rect.width) - 0.5) * 8;
    const rotateX = (0.5 - (relativeY / rect.height)) * 8;

    tiltCard.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
  });

  tiltCard.addEventListener("mouseleave", () => {
    tiltCard.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
  });
}
