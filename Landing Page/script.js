document.documentElement.classList.add("js");

const revealElements = document.querySelectorAll(".reveal");
const progressBar = document.querySelector(".scroll-progress");
const parallaxTarget = document.querySelector("[data-parallax]");

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -8% 0px"
  }
);

revealElements.forEach((element) => revealObserver.observe(element));

let ticking = false;

const updateScrollEffects = () => {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollRange = doc.scrollHeight - doc.clientHeight;
  const ratio = scrollRange > 0 ? scrollTop / scrollRange : 0;

  if (progressBar) {
    progressBar.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
  }

  if (parallaxTarget) {
    const offset = Math.max(-42, scrollTop * -0.075);
    parallaxTarget.style.transform = `translateY(${offset}px)`;
  }
};

const onScroll = () => {
  if (ticking) {
    return;
  }

  ticking = true;
  window.requestAnimationFrame(() => {
    updateScrollEffects();
    ticking = false;
  });
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", updateScrollEffects);
updateScrollEffects();
