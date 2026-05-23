const planData = {
    '30': {
        title: '0-30: IMMERSION',
        people: [
            'Meet related teams, leadership, resources',
            'Stakeholder mapping (internal + external)',
            'One-on-ones with key individuals',
            'Assess training teams & resources state'
        ],
        processes: [
            'Absorb company culture & resources',
            'Learn products and competitors',
            'Front-end analysis: identify the delta',
            'Current state audit: curriculum, content',
            'Context: environment, threat, regulatory'
        ],
        projects: [
            'Understand future training vision',
            'Identify and prioritize critical needs',
            'Training needs: defense vs public safety',
            'Field visits: team and customer needs',
            'Consensus building, SME identification'
        ]
    },
    '60': {
        title: '31-60: PRIORITIZATION',
        people: [
            'Establish rhythm with teams & stakeholders',
            'Start prioritizing bandwidth and efforts',
            'Identify leads and individuals required'
        ],
        processes: [
            'Lessons learned repositories established',
            'Implement standardized training processes',
            'Customer literacy program: terms, concepts',
            'Frame internal tiered training for scaling'
        ],
        projects: [
            'Digital products framework (portals)',
            'Agile/modular curriculums: Def then Pub',
            'Swarming collective training approach',
            'Simulator and PDWCORE integration',
            'Mission support roadmap by location'
        ]
    },
    '90': {
        title: '61-90: IMPLEMENTATION & REFINEMENT',
        people: [
            'Implement scaling curriculum design',
            'Internal training tier development',
            'Mentoring programs active'
        ],
        processes: [
            'Proactive curriculum cycle (marketing/eng)',
            'Continual optimization mechanisms',
            'Implement customer literacy program',
            'Formal lessons learned dissemination',
            'Focus on refinements & assessment cycles'
        ],
        projects: [
            'Feedback loop: eng ↔ mkt ↔ customers',
            'Current and future payloads roadmap',
            'Proactive skeleton curriculum',
            'Onsite authorizations and coordination'
        ]
    }
};

function initialize() {
    const initScreen = document.getElementById('init-screen');
    const appContainer = document.getElementById('app-container');
    const body = document.body;

    // 1. Trigger Topo Background
    body.classList.remove('initialized-false');
    body.classList.add('initialized-true');

    // 2. Hide init screen
    initScreen.style.opacity = '0';
    setTimeout(() => {
        initScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');

        // Initial scroll check
        appContainer.scrollTop = 0;

        // Setup Intersection Observer for scroll animations
        const observerOptions = {
            root: appContainer,
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active-section');
                    // Add body class for specific section background effects
                    if (entry.target.id === 'plan-30-60-90') {
                        body.classList.add('in-roadmap-view');
                    }
                } else {
                    entry.target.classList.remove('active-section');
                    if (entry.target.id === 'plan-30-60-90') {
                        body.classList.remove('in-roadmap-view');
                    }
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
    // Get the parent container to find sibling cards
    const card = document.getElementById(cardId);
    if (!card) return;

    const container = card.parentElement;
    const cards = container.querySelectorAll('.expand-card');

    cards.forEach(c => {
        c.classList.remove('active');
        // Reset any sub-cards when switching main cards
        const grid = c.querySelector('.sub-card-grid');
        if (grid) {
            grid.classList.remove('has-active');
            grid.querySelectorAll('.sub-card').forEach(sc => sc.classList.remove('active'));
        }
    });

    card.classList.add('active');
}

/* Tactical Modal Logic (Local & Section-Aware) */
function openTacticalModal(title, items, originEl) {
    // Find the nearest section or container to locate the local overlay
    const section = originEl.closest('section') || originEl.closest('.roadmap-detail-panel');
    const overlay = section.querySelector('.tactical-overlay');
    const contentArea = overlay.querySelector('.modal-content-area');

    if (!overlay || !contentArea) return;

    contentArea.innerHTML = `
        <h2 class="tactical-title">${title}</h2>
        <div class="tactical-divider"></div>
        <ul class="tactical-list">
            ${items.map((item, index) => `<li style="animation-delay: ${0.1 * index}s">${item}</li>`).join('')}
        </ul>
    `;

    overlay.classList.remove('hidden');
    void overlay.offsetWidth; // Force reflow
    overlay.classList.add('visible');
}

function closeTacticalModal(btn) {
    const overlay = btn.closest('.tactical-overlay');
    if (!overlay) return;

    overlay.classList.remove('visible');
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 300);
}

function openRoadmapModal(type, day, btn) {
    const data = planData[day];
    if (!data) return;

    let items = [];
    let title = "";

    if (type === 'PEOPLE') {
        items = data.people;
        title = "PEOPLE";
    } else if (type === 'PROCESSES') {
        items = data.processes;
        title = "PROCESSES";
    } else {
        items = data.projects;
        title = "PRODUCT / PROJECT";
    }

    openTacticalModal(title, items, btn);
}

function toggleSubCard(el) {
    const title = el.querySelector('.sub-card-main-title').innerText;
    const expansion = el.querySelector('.sub-card-expansion');
    if (!expansion) return;

    const items = Array.from(expansion.querySelectorAll('li')).map(li => li.innerText);
    openTacticalModal(title, items, el);
}

function toggleStep(el) {
    const visual = el.parentElement;
    const isActive = el.classList.contains('active');

    // Exclusive accordion: close all other steps
    visual.querySelectorAll('.step').forEach(s => s.classList.remove('active'));

    if (!isActive) {
        el.classList.add('active');
        visual.classList.add('has-active');
    } else {
        visual.classList.remove('has-active');
    }
}


function showRoadmapDetail(day) {
    const data = planData[day];
    if (!data) return;

    const panel = document.getElementById('roadmap-detail-panel');
    const emptyState = panel.querySelector('.empty-state');
    const contentDisplay = document.getElementById('roadmap-content-display');

    // Update markers
    document.querySelectorAll('.node-hotspot').forEach(n => n.classList.remove('active'));
    document.querySelector(`.wp-${day}`).classList.add('active');

    // UI Logic
    emptyState.classList.add('hidden');
    contentDisplay.classList.remove('hidden');

    document.getElementById('display-day').innerText = day;
    document.getElementById('display-title').innerText = data.title;

    const grid = document.getElementById('display-grid');
    grid.innerHTML = `
        <div class="sub-card" onclick="openRoadmapModal('PEOPLE', '${day}', this)">
            <div class="sub-card-inner">
                <h4 class="sub-card-main-title">PEOPLE</h4>
            </div>
        </div>
        <div class="sub-card" onclick="openRoadmapModal('PROCESSES', '${day}', this)">
            <div class="sub-card-inner">
                <h4 class="sub-card-main-title">PROCESSES</h4>
            </div>
        </div>
        <div class="sub-card" onclick="openRoadmapModal('PROJECTS', '${day}', this)">
            <div class="sub-card-inner">
                <h4 class="sub-card-main-title">PRODUCT / PROJECT</h4>
            </div>
        </div>
    `;
}

function resetDetailPanel() {
    const panel = document.getElementById('roadmap-detail-panel');
    const emptyState = panel.querySelector('.empty-state');
    const contentDisplay = document.getElementById('roadmap-content-display');

    emptyState.classList.remove('hidden');
    contentDisplay.classList.add('hidden');
    document.querySelectorAll('.node-hotspot').forEach(n => n.classList.remove('active'));
}


function showPlan(day) {
    showRoadmapDetail(day);
}

function hidePlan() {
    resetDetailPanel();
}

function exitRoadmap() {
    scrollToSection('end-slide');
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
    // If init screen is active, only space/enter starts
    if (document.body.classList.contains('initialized-false')) {
        if (e.key === 'Enter' || e.key === ' ') {
            initialize();
        }
        return;
    }

    const container = document.getElementById('app-container');
    const sections = Array.from(document.querySelectorAll('.section'));
    const currentScroll = container.scrollTop;
    const windowHeight = window.innerHeight;

    let currentIndex = Math.round(currentScroll / windowHeight);

    switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case ' ':
            if (currentIndex < sections.length - 1) {
                sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
            }
            break;
        case 'ArrowUp':
        case 'ArrowLeft':
            if (currentIndex > 0) {
                sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
            }
            break;
        case 'Escape':
            hidePlan();
            break;
    }
});

// Parallax Topo Effect & Scroll Response
document.addEventListener('mousemove', (e) => {
    if (!document.body.classList.contains('initialized-true')) return;

    const topo = document.getElementById('topo-bg');
    // More aggressive parallax
    const x = (window.innerWidth / 2 - e.pageX) / 40;
    const y = (window.innerHeight / 2 - e.pageY) / 40;

    topo.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
});

// Shift topo on scroll
document.getElementById('app-container').addEventListener('scroll', (e) => {
    const topo = document.getElementById('topo-bg');
    const scrollPercent = e.target.scrollTop / e.target.scrollHeight;
    topo.style.backgroundPosition = `center ${scrollPercent * 100}%`;
});

function toggleEasterEgg(show) {
    const modal = document.getElementById('easter-egg-modal');
    if (show) {
        modal.classList.add('active');
    } else {
        modal.classList.remove('active');
    }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    // Basic initialization if needed
});
