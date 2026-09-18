/* =========================
   SCROLL REVEAL ANIMATION
========================= */

const revealElements = document.querySelectorAll(
    ".section-heading, .about-content, .timeline-item, .legacy-wrapper, .final-content"
);

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    },
    {
        threshold: 0.15
    }
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
});


/* =========================
   NAVBAR SCROLL EFFECT
========================= */

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});


/* =========================
   CURRENT YEAR
========================= */

const footerNote = document.querySelector(".footer-note");

if (footerNote) {
    const currentYear = new Date().getFullYear();

    footerNote.innerHTML =
        `Created as part of the OIBSIP Web Development & Designing Internship • ${currentYear}`;
}


/* =========================
   IMAGE LOADING
========================= */

const heroImage = document.querySelector(".hero-image img");

if (heroImage) {

    heroImage.addEventListener("load", () => {
        heroImage.classList.add("loaded");
    });

    heroImage.addEventListener("error", () => {
        console.log("Steve Jobs image could not be loaded.");
    });

}