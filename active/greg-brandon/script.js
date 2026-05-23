function initialize() {
    const initScreen = document.getElementById('init-screen');
    const appContainer = document.getElementById('app-container');
    const body = document.body;

    // 1. Trigger HUD Elements
    body.classList.remove('initialized-false');
    body.classList.add('initialized-true');

    // 2. Hide init screen and reveal main app
    initScreen.style.opacity = '0';
    initScreen.style.pointerEvents = 'none';

    setTimeout(() => {
        initScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');

        // Initial scroll position
        appContainer.scrollTop = 0;

        // Intersection Observer for scroll animations
        const observerOptions = {
            root: appContainer,
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active-section');
                } else {
                    entry.target.classList.remove('active-section');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }, 800);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function expandCard(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const container = card.parentElement;
    const cards = container.querySelectorAll('.expand-card');

    cards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // If init screen is active, Enter or Space starts the mapping
    if (document.body.classList.contains('initialized-false')) {
        if (e.key === 'Enter' || e.key === ' ') {
            initialize();
        }
        return;
    }

    const container = document.getElementById('app-container');
    const sections = Array.from(document.querySelectorAll('.section'));
    const currentScrollIndex = Math.round(container.scrollTop / window.innerHeight);

    switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case ' ':
            if (currentScrollIndex < sections.length - 1) {
                sections[currentScrollIndex + 1].scrollIntoView({ behavior: 'smooth' });
            }
            break;
        case 'ArrowUp':
        case 'ArrowLeft':
            if (currentScrollIndex > 0) {
                sections[currentScrollIndex - 1].scrollIntoView({ behavior: 'smooth' });
            }
            break;
    }
});

// Parallax/MouseMove Reactive Effect
document.addEventListener('mousemove', (e) => {
    if (!document.body.classList.contains('initialized-true')) return;

    const bg = document.getElementById('mesh-bg');
    const x = (window.innerWidth / 2 - e.pageX) / 50;
    const y = (window.innerHeight / 2 - e.pageY) / 50;

    bg.style.transform = `translate(${x}px, ${y}px)`;
});

// Initialization check on load
document.addEventListener('DOMContentLoaded', () => {
    // Ensuring clean state
});
