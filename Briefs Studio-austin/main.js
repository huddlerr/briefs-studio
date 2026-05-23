// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Hero Animations
window.addEventListener('load', () => {
    const tl = gsap.timeline();

    tl.to('.hero-bg', {
        opacity: 1,
        duration: 2,
        ease: "power2.out"
    })
    .from('.hero-content h1', {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out"
    }, "-=1.5")
    .from('.hero-content .eyebrow', {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=1")
    .from('.hero-content .subtitle', {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=0.8")
    .from('.hero-cta', {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=0.8");
});

// Section Animations
const sections = document.querySelectorAll('.section');

sections.forEach(section => {
    const heading = section.querySelector('h2');
    const text = section.querySelector('.text-block');
    const image = section.querySelector('.image-wrapper');
    const lawCards = section.querySelectorAll('.law-card');

    if (heading) {
        gsap.from(heading, {
            scrollTrigger: {
                trigger: heading,
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    }

    if (text) {
        gsap.from(text.children, {
            scrollTrigger: {
                trigger: text,
                start: "top 80%",
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out"
        });
    }

    if (image) {
        gsap.from(image, {
            scrollTrigger: {
                trigger: image,
                start: "top 80%",
            },
            scale: 0.9,
            opacity: 0,
            duration: 1.5,
            ease: "power2.out"
        });
    }

    if (lawCards.length > 0) {
        gsap.from(lawCards, {
            scrollTrigger: {
                trigger: lawCards[0],
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });
    }
});

// Navbar change on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        nav.style.mixBlendMode = 'normal';
        nav.style.background = 'white';
        nav.style.color = 'var(--primary)';
        nav.style.padding = '20px 40px';
        nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
    } else {
        nav.style.mixBlendMode = 'difference';
        nav.style.background = 'transparent';
        nav.style.color = 'white';
        nav.style.padding = '30px 40px';
        nav.style.boxShadow = 'none';
    }
});
