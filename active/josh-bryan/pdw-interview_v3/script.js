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

function toggleSubCard(el) {
    const grid = el.parentElement;
    const isActive = el.classList.contains('active');

    // Remove active from all siblings
    grid.querySelectorAll('.sub-card').forEach(sc => sc.classList.remove('active'));

    if (!isActive) {
        el.classList.add('active');
        grid.classList.add('has-active');
    } else {
        grid.classList.remove('has-active');
    }
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

function showPlan(day) {
    const data = planData[day];
    if (!data) return;

    const overlay = document.getElementById('plan-details');
    const title = document.getElementById('plan-title');
    const content = document.getElementById('plan-content');

    title.innerText = data.title;

    content.innerHTML = `
        <div class="sub-card" onclick="event.stopPropagation(); toggleSubCard(this)">
            <div class="sub-card-inner">
                <h4 class="sub-card-main-title">PEOPLE</h4>
                <div class="sub-card-expansion">
                    <ul>${data.people.map(item => `<li>${item}</li>`).join('')}</ul>
                </div>
            </div>
        </div>
        <div class="sub-card" onclick="event.stopPropagation(); toggleSubCard(this)">
            <div class="sub-card-inner">
                <h4 class="sub-card-main-title">PROCESSES</h4>
                <div class="sub-card-expansion">
                    <ul>${data.processes.map(item => `<li>${item}</li>`).join('')}</ul>
                </div>
            </div>
        </div>
        <div class="sub-card" onclick="event.stopPropagation(); toggleSubCard(this)">
            <div class="sub-card-inner">
                <h4 class="sub-card-main-title">PRODUCT/PROJECT</h4>
                <div class="sub-card-expansion">
                    <ul>${data.projects.map(item => `<li>${item}</li>`).join('')}</ul>
                </div>
            </div>
        </div>
    `;

    overlay.classList.remove('hidden');

    // Set active waypoint
    document.querySelectorAll('.waypoint-v2').forEach(wp => wp.classList.remove('active'));
    const activeWp = document.getElementById(`wp-${day}`);
    if (activeWp) activeWp.classList.add('active');
}

function hidePlan() {
    document.getElementById('plan-details').classList.add('hidden');
    document.querySelectorAll('.waypoint-v2').forEach(wp => wp.classList.remove('active'));
}

function exitRoadmap() {
    const topo = document.getElementById('topo-bg');
    topo.classList.remove('roadmap-zoom-state');
    topo.classList.add('exit-zoom-state');

    setTimeout(() => {
        scrollToSection('end-slide');
    }, 1000);
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

/* REVIEW SYSTEM LOGIC */
let reviews = JSON.parse(localStorage.getItem('pdw_reviews')) || [];

function saveReviews() {
    localStorage.setItem('pdw_reviews', JSON.stringify(reviews));
}

function toggleReviewSidebar() {
    const sidebar = document.getElementById('review-sidebar');
    const toggleBtn = document.getElementById('review-toggle');
    sidebar.classList.toggle('closed');

    if (!sidebar.classList.contains('closed')) {
        toggleBtn.style.opacity = '0';
        toggleBtn.style.pointerEvents = 'none';
    } else {
        toggleBtn.style.opacity = '1';
        toggleBtn.style.pointerEvents = 'auto';
    }
}

function addComment() {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) return;

    // Get current context (section)
    const container = document.getElementById('app-container');
    const sections = Array.from(container.querySelectorAll('.section'));
    const currentScroll = container.scrollTop;
    const windowHeight = window.innerHeight;
    const currentIndex = Math.round(currentScroll / windowHeight);
    const sectionId = sections[currentIndex] ? sections[currentIndex].id : 'unknown';

    const comment = {
        id: Date.now(),
        section: sectionId,
        text: text,
        timestamp: new Date().toISOString()
    };

    reviews.push(comment);
    saveReviews();
    renderComments();
    input.value = '';
}

function renderComments() {
    const list = document.getElementById('comments-list');
    list.innerHTML = reviews.map(comment => `
        <div class="comment-item" data-id="${comment.id}">
            <span class="comment-tag">SECTION: ${comment.section}</span>
            <p class="comment-text">${comment.text}</p>
            <button class="delete-comment" onclick="deleteComment(${comment.id})">✕</button>
        </div>
    `).join('');
    list.scrollTop = list.scrollHeight;
}

function deleteComment(id) {
    reviews = reviews.filter(c => c.id !== id);
    saveReviews();
    renderComments();
}

function exportReviewJSON() {
    if (reviews.length === 0) {
        alert('No comments to export.');
        return;
    }

    const dataStr = JSON.stringify(reviews, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'pdw-feedback-' + new Date().toISOString().split('T')[0] + '.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function toggleEasterEgg(show) {
    const modal = document.getElementById('easter-egg-modal');
    if (show) {
        modal.classList.add('active');
    } else {
        modal.classList.remove('active');
    }
}

// Initial render of existing comments
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('comments-list')) {
        renderComments();
    }
});

/* VISUAL DESIGN MODE LOGIC */
let isDesignMode = false;
let activeDragEl = null;

function toggleDesignMode() {
    isDesignMode = !isDesignMode;
    document.body.classList.toggle('design-mode', isDesignMode);
    const btn = document.getElementById('design-mode-btn');
    btn.innerText = isDesignMode ? '[ Design Mode: ON ]' : '[ Design Mode: OFF ]';
    btn.classList.toggle('active', isDesignMode);

    if (isDesignMode) {
        initDraggable();
    } else {
        removeDraggable();
    }
}

function initDraggable() {
    const targets = document.querySelectorAll('.section-title, .subtitle-small, .expand-container');
    targets.forEach(el => {
        el.onmousedown = startDrag;
    });
}

function removeDraggable() {
    const targets = document.querySelectorAll('.section-title, .subtitle-small, .expand-container');
    targets.forEach(el => {
        el.onmousedown = null;
    });
}

function startDrag(e) {
    if (!isDesignMode) return;
    activeDragEl = e.currentTarget;
    const startY = e.clientY;
    const initialMargin = parseInt(window.getComputedStyle(activeDragEl).marginTop) || 0;

    function onMouseMove(moveE) {
        const deltaY = moveE.clientY - startY;
        activeDragEl.style.marginTop = (initialMargin + deltaY) + 'px';
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function saveLayout() {
    const title = document.querySelector('.section-title');
    const subtitle = document.querySelector('.subtitle-small');
    const container = document.querySelector('.expand-container');

    const layoutCss = `
/* COPY AND PASTE THIS TO ANTIGRAVITY */
.section-title { margin-top: ${title.style.marginTop} !important; }
.subtitle-small { margin-top: ${subtitle.style.marginTop} !important; }
.expand-container { margin-top: ${container.style.marginTop} !important; }
`;

    // Copy to clipboard
    navigator.clipboard.writeText(layoutCss).then(() => {
        alert("LAYOUT SAVED! The CSS has been copied to your clipboard. Please paste it into our chat so I can finalize the design.");
    });
}
