/**
 * Briefs Studio Interactive Topo
 * Using topo_01.png as a heightmap
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    segments: 256, // Higher = more detail, lower = better performance
    heightScale: 4.0,
    cameraStartY: 15,
    cameraEndY: 4,
    cameraStartZ: 0.1,
    cameraEndZ: 10,
    terrainRotation: 0.45,
    colors: {
        background: 0x0a0a12,
        terrain: 0xd4a574,
        accent: 0xf5e6d3,
        lines: 0xd4a574
    }
};

let scene, camera, renderer, terrain, contourLines;
let scrollProgress = 0;
let heightData = null;

const canvas = document.getElementById('three-canvas');

// ============================================
// ASSET LOADING & PROCESSING
// ============================================

async function loadHeightmap(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = CONFIG.segments;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);

            const imgData = ctx.getImageData(0, 0, size, size).data;
            const heights = new Float32Array(size * size);

            for (let i = 0; i < imgData.length; i += 4) {
                // Use luminosity formula or just R channel for height
                const r = imgData[i];
                const g = imgData[i + 1];
                const b = imgData[i + 2];
                // Average brightness normalized 0-1
                heights[i / 4] = (r + g + b) / (3 * 255.0);
            }
            resolve(heights);
        };
        img.onerror = reject;
        img.src = url;
    });
}

// ============================================
// THREE.JS SETUP
// ============================================

async function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colors.background);
    scene.fog = new THREE.FogExp2(CONFIG.colors.background, 0.05);

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, CONFIG.cameraStartY, CONFIG.cameraStartZ);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xd4a574, 1.0);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);

    // Initial setup
    setupScrollAnimation();
    animate();

    // Load and create terrain
    try {
        console.log("Attempting to load high-fidelity heightmap...");
        heightData = await loadHeightmap('assets/topo_01.png');
        console.log("Heightmap loaded successfully.");
        createTerrain(heightData);
    } catch (e) {
        console.warn("Could not load image heightmap (likely due to file:// protocol security restrictions). Falling back to procedural terrain.");
        console.info("TIP: To use the actual image asset, run this folder through a local server (e.g., 'npx serve' or the Live Server extension).");

        // Procedural Fallback
        const fallbackData = generateProceduralHeightmap();
        createTerrain(fallbackData);
    }

    window.addEventListener('resize', onWindowResize);
}

function generateProceduralHeightmap() {
    const size = CONFIG.segments;
    const data = new Float32Array(size * size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const x = (i / size) * 10;
            const y = (j / size) * 10;
            // Simple wavy topo pattern
            const h = (Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.5 + 0.5) *
                (Math.sin(x * 1.2) * Math.sin(y * 1.5) * 0.3 + 0.7);
            data[i * size + j] = h;
        }
    }
    return data;
}

function createTerrain(heights) {
    const size = 15;
    const segments = CONFIG.segments - 1;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

    const positions = geometry.attributes.position.array;

    for (let i = 0; i < heights.length; i++) {
        // Plane geometry vertices are arranged in a grid
        // index * 3 + 2 is the Z coordinate (height)
        positions[i * 3 + 2] = heights[i] * CONFIG.heightScale;
    }

    geometry.computeVertexNormals();

    // Custom Material with Contour Lines
    const material = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.terrain,
        roughness: 0.6,
        metalness: 0.3,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
    });

    // Add contour lines via shader
    material.onBeforeCompile = (shader) => {
        shader.uniforms.lineColor = { value: new THREE.Color(CONFIG.colors.accent) };
        shader.uniforms.lineColor2 = { value: new THREE.Color(CONFIG.colors.terrain) };
        shader.uniforms.lineSpacing = { value: 0.15 };

        shader.vertexShader = `
            varying float vHeight;
            ${shader.vertexShader}
        `.replace(
            `#include <begin_vertex>`,
            `#include <begin_vertex>
             vHeight = position.z;`
        );

        shader.fragmentShader = `
            uniform vec3 lineColor;
            uniform vec3 lineColor2;
            uniform float lineSpacing;
            varying float vHeight;
            ${shader.fragmentShader}
        `.replace(
            `#include <dithering_fragment>`,
            `#include <dithering_fragment>
             float line = abs(fract(vHeight / lineSpacing - 0.5) - 0.5) / fwidth(vHeight / lineSpacing);
             line = 1.0 - smoothstep(0.0, 1.0, line);
             gl_FragColor.rgb = mix(gl_FragColor.rgb, lineColor, line * 0.4);`
        );
    };

    terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Create POI markers
    createPOIMarkers();
}

function createPOIMarkers() {
    const markers = [
        { x: -3, z: -2, label: "Phase 1" },
        { x: 1, z: 1, label: "Phase 2" },
        { x: 4, z: -3, label: "Phase 3" }
    ];

    markers.forEach((m, i) => {
        const group = new THREE.Group();

        // Sphere
        const sphereGeom = new THREE.SphereGeometry(0.12, 32, 32);
        const sphereMat = new THREE.MeshBasicMaterial({ color: CONFIG.colors.accent });
        const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        group.add(sphere);

        // Ring
        const ringGeom = new THREE.RingGeometry(0.18, 0.22, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.accent,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        // Position - start hidden below terrain
        group.position.set(m.x, -5, m.z);
        group.userData = { label: m.label, index: i, type: 'poi' };
        scene.add(group);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// SCROLL ANIMATION
// ============================================

function setupScrollAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.scroll-spacer',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
            onUpdate: (self) => {
                updateUI(self.progress);
            }
        }
    });

    // Camera move
    tl.to(camera.position, {
        y: CONFIG.cameraEndY,
        z: CONFIG.cameraEndZ,
        x: -4,
        ease: "power2.inOut"
    }, 0);

    // Look at point adjustment
    const lookTarget = { y: 0, z: 0 };
    tl.to(lookTarget, {
        y: 1.5,
        z: -2,
        onUpdate: () => {
            camera.lookAt(0, lookTarget.y, lookTarget.z);
        },
        ease: "power2.inOut"
    }, 0);

    // Terrain rotation
    tl.to(terrain.rotation, {
        z: CONFIG.terrainRotation,
        ease: "power2.inOut"
    }, 0);

    // POI Markers
    scene.traverse(child => {
        if (child.userData && child.userData.type === 'poi') {
            const index = child.userData.index;
            const start = 0.4 + index * 0.15;

            tl.to(child.position, {
                y: 1.5, // Float above terrain
                duration: 0.2,
                ease: "back.out(2)"
            }, start);

            tl.from(child.scale, {
                x: 0, y: 0, z: 0,
                duration: 0.2,
                ease: "back.out(2)"
            }, start);
        }
    });
}

function updateUI(progress) {
    const progressBar = document.getElementById('progress');
    const introSection = document.getElementById('intro');
    const scrollIndicator = document.getElementById('scrollIndicator');
    const roadmapSection = document.getElementById('roadmap');
    const milestones = document.querySelectorAll('.milestone');

    progressBar.style.transform = `scaleX(${progress})`;

    // Fade out intro
    if (progress > 0.1) {
        introSection.classList.add('hidden');
        scrollIndicator.classList.add('hidden');
    } else {
        introSection.classList.remove('hidden');
        scrollIndicator.classList.remove('hidden');
    }

    // Show roadmap
    if (progress > 0.4) {
        roadmapSection.classList.add('visible');
        milestones.forEach((m, i) => {
            if (progress > 0.5 + i * 0.12) {
                m.classList.add('visible');
            } else {
                m.classList.remove('visible');
            }
        });
    } else {
        roadmapSection.classList.remove('visible');
    }
}

// ============================================
// RENDER LOOP
// ============================================

function animate() {
    requestAnimationFrame(animate);

    // Subtle float
    if (terrain) {
        terrain.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }

    renderer.render(scene, camera);
}

// ============================================
// INIT
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
} else {
    initThree();
}
