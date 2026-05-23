const planData = {
    '30': {
        title: '30 DAYS: IMMERSION',
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
        title: '60 DAYS: PRIORITIZATION',
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
        title: '90 DAYS: IMPLEMENTATION',
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

        // Scroll to top just in case
        appContainer.scrollTop = 0;
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
    });

    card.classList.add('active');
}

function showPlan(day) {
    const data = planData[day];
    if (!data) return;

    const overlay = document.getElementById('plan-details');
    const title = document.getElementById('plan-title');
    const content = document.getElementById('plan-content');

    title.innerText = data.title;

    content.innerHTML = `
        <div class="plan-col-v2">
            <h3>PEOPLE</h3>
            <ul>${data.people.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="plan-col-v2">
            <h3>PROCESSES</h3>
            <ul>${data.processes.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="plan-col-v2">
            <h3>PROJECTS</h3>
            <ul>${data.projects.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
    `;

    overlay.classList.remove('hidden');

    // Set active waypoint
    document.querySelectorAll('.waypoint').forEach(wp => wp.classList.remove('active'));
    document.getElementById(`wp-${day}`).classList.add('active');
}

function hidePlan() {
    document.getElementById('plan-details').classList.add('hidden');
    document.querySelectorAll('.waypoint').forEach(wp => wp.classList.remove('active'));
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
