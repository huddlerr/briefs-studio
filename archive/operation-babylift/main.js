// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Custom Cursor
const dot = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    dot.style.left = `${posX}px`;
    dot.style.top = `${posY}px`;

    outline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Hero Animations
gsap.from(".hero-title", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    ease: "power4.out",
    delay: 0.5
});

gsap.from(".metadata span", {
    y: 20,
    opacity: 0,
    stagger: 0.2,
    duration: 1,
    ease: "power3.out",
    delay: 0.2
});

gsap.from(".hero-lead", {
    opacity: 0,
    duration: 1.5,
    delay: 1.2
});

// Scroll Reveal Animations
const revealElements = document.querySelectorAll('[data-gsap="fade-up"]');
revealElements.forEach(el => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none none"
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
});

// Section Title Reveal
const sectionTitles = document.querySelectorAll('.section-title');
sectionTitles.forEach(title => {
    gsap.from(title, {
        scrollTrigger: {
            trigger: title,
            start: "top 85%"
        },
        x: -50,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
    });
});

// Horizontal "Thread" Animation in Section 03
const threadNodes = document.querySelectorAll('.thread-node');
threadNodes.forEach(node => {
    gsap.from(node, {
        scrollTrigger: {
            trigger: ".thread-visualization",
            start: "top 70%"
        },
        scale: 0,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "back.out(1.7)"
    });
});

// Parallax for Hero Image
gsap.to(".hero-img", {
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    },
    y: 200,
    ease: "none"
});

// Parallax for Quote
gsap.from(".main-quote", {
    scrollTrigger: {
        trigger: ".quote-section",
        start: "top 90%",
        end: "bottom 10%",
        scrub: 1
    },
    scale: 0.9,
    opacity: 0.5
});

// Smooth Scroll for Nav Links
document.querySelectorAll('.nav-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
