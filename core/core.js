/**
 * Briefs Studio CORE ENGINE v1.0
 * Shared interactive logic for all briefs.
 */

class Briefs StudioEngine {
    constructor() {
        this.init();
    }

    init() {
        this.setupObservers();
        this.setupMouseTracking();
        this.setupKeyboardNav();
        console.log("🚀 Briefs Studio Engine Initialized");
    }

    setupObservers() {
        const options = { threshold: 0.2 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, options);

        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }

    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;

            document.querySelectorAll('.mouse-parallax').forEach(el => {
                const depth = el.dataset.depth || 1;
                el.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
            });
        });
    }

    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'f' || e.key === 'F') {
                this.toggleFullscreen();
            }
        });
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.Briefs Studio = new Briefs StudioEngine();
});
