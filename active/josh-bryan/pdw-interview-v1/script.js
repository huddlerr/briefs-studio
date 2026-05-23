const NavigationState = {
    current: 'opening',
    history: [],

    navigateTo(sectionId) {
        if (this.current === sectionId) return;

        console.log(`Navigating from ${this.current} to ${sectionId}`);

        // Push current to history if not moving within sub-modules of the same landing
        // Actually, simple history is fine for "Back" button
        if (this.current !== 'opening') {
            this.history.push(this.current);
        }

        this.current = sectionId;
        this.render();
    },

    goBack() {
        if (this.history.length > 0) {
            this.current = this.history.pop();
            this.render();
        } else {
            this.navigateTo('home');
        }
    },

    render() {
        // Hide all sections
        document.querySelectorAll('.section').forEach(s => {
            s.classList.remove('active');
        });

        // Show current section
        const target = document.getElementById(this.current);
        if (target) {
            target.classList.add('active');

            // Scroll to top of content if sub-module
            if (target.classList.contains('sub-module')) {
                const container = target.querySelector('.content-container');
                if (container) container.scrollTop = 0;
            }
        }

        // Update URL hash for bookmarking/refreshing within session (optional)
        // window.location.hash = this.current;
    }
};

// Global Exposure
window.navigateTo = (id) => NavigationState.navigateTo(id);
window.goBack = () => NavigationState.goBack();

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowRight':
        case ' ':
            // In a real presentation, you might want a linear progression
            // For now, let's keep it manual or add a simple "Next" if possible
            break;
        case 'ArrowLeft':
        case 'Backspace':
            if (NavigationState.current !== 'opening' && NavigationState.current !== 'home') {
                window.goBack();
            }
            break;
        case 'Home':
            window.navigateTo('home');
            break;
        case 'Escape':
            window.goBack();
            break;
    }
});

// Fullscreen Toggle
document.getElementById('fullscreen-toggle').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check hash for starting section
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        NavigationState.current = hash;
    }
    NavigationState.render();

    // Easter Egg: Topographic Interactivity
    const topo = document.getElementById('topo-bg');
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        // Subtle shift (parallax)
        topo.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
    });
});
