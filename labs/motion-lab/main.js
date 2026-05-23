// Initialize Canvas
const canvas = new fabric.Canvas('motion-canvas', {
    backgroundColor: '#ffffff',
    selection: true,
    preserveObjectStacking: true
});

// State Management
const state = {
    currentTime: 0,
    duration: 5,
    keyframes: {}, // objectId -> { time -> props }
    isPlaying: false,
    currentTool: 'select',
    isDrawing: false
};

// UI Elements
const playhead = document.getElementById('playhead');
const timeDisplay = document.getElementById('time-display');
const tracksContainer = document.getElementById('tracks-container');
const labelsContainer = document.getElementById('track-labels-container');

// --- TOOLBAR LOGIC ---
const tools = ['select', 'pen', 'rect', 'circle', 'text', 'path-edit', 'delete'];
tools.forEach(toolId => {
    const btn = document.getElementById(`tool-${toolId}`);
    if (!btn) return;
    btn.addEventListener('click', () => {
        state.currentTool = toolId;

        // UI Update
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Logic Switch
        canvas.isDrawingMode = false;
        canvas.selection = (toolId === 'select');

        if (toolId === 'rect') addRect();
        if (toolId === 'circle') addCircle();
        if (toolId === 'text') addText();
        if (toolId === 'delete') deleteSelected();
        if (toolId === 'path-edit') togglePathEditing();
        if (toolId === 'pen') {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.width = 2;
            canvas.freeDrawingBrush.color = '#3b82f6';
        }
    });
});

function togglePathEditing() {
    const active = canvas.getActiveObject();
    if (!active) return alert('Select a path first');

    if (active.type === 'path' || active.type === 'polyline') {
        // Simple implementation: enable control points
        active.hasControls = true;
        active.hasBorders = true;
        // In more advanced Fabric, we'd use 'controls' for points, 
        // but for now we'll ensure it's selectable and editable.
        active.cornerStyle = 'circle';
        active.cornerColor = '#3b82f6';
        canvas.renderAll();
    }
}

// Shortcut Keys
window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
    if (e.key === 'v') document.getElementById('tool-select').click();
    if (e.key === 'p') document.getElementById('tool-pen').click();
    if (e.key === 'r') document.getElementById('tool-rect').click();
    if (e.key === 't') document.getElementById('tool-text').click();
});

function deleteSelected() {
    const active = canvas.getActiveObjects();
    if (active.length > 0) {
        active.forEach(obj => {
            delete state.keyframes[obj.id];
            canvas.remove(obj);
        });
        canvas.discardActiveObject();
        updateTimeline();
        updateLayerList();
    }
}

// --- SHAPE ADDITION ---
function addRect() {
    const rect = new fabric.Rect({
        left: 100, top: 100, width: 100, height: 100,
        fill: '#3b82f6', stroke: '#000000', strokeWidth: 0,
        id: 'RECT_' + Math.random().toString(36).substr(2, 5).toUpperCase()
    });
    canvas.add(rect).setActiveObject(rect);
    updateAll();
}

function addCircle() {
    const circle = new fabric.Circle({
        left: 150, top: 150, radius: 50,
        fill: '#ef4444', stroke: '#000000', strokeWidth: 0,
        id: 'CIRC_' + Math.random().toString(36).substr(2, 5).toUpperCase()
    });
    canvas.add(circle).setActiveObject(circle);
    updateAll();
}

function addText() {
    const text = new fabric.IText('New Text', {
        left: 200, top: 200, fontSize: 32, fill: '#333333',
        fontFamily: 'Inter', id: 'TEXT_' + Math.random().toString(36).substr(2, 5).toUpperCase()
    });
    canvas.add(text).setActiveObject(text);
    updateAll();
}

// --- TIMELINE RENDERING ---
function updateTimeline() {
    tracksContainer.innerHTML = '';
    labelsContainer.innerHTML = '';

    canvas.getObjects().forEach((obj, idx) => {
        const id = obj.id || `OBJ_${idx}`;

        // Label
        const label = document.createElement('div');
        label.className = 'track-label';
        label.innerText = id;
        labelsContainer.appendChild(label);

        // Track Track
        const track = document.createElement('div');
        track.className = 'track-row';
        track.style.position = 'relative';
        track.dataset.id = id;

        // Render Keyframe Markers for this object
        if (state.keyframes[id]) {
            Object.keys(state.keyframes[id]).forEach(time => {
                const marker = document.createElement('div');
                marker.className = 'keyframe-marker';
                const x = (parseFloat(time) / state.duration) * tracksContainer.offsetWidth;
                marker.style.left = (x - 5) + 'px';
                marker.title = `At ${time}s`;
                track.appendChild(marker);
            });
        }

        tracksContainer.appendChild(track);
    });
}

function updateAll() {
    updateLayerList();
    updateTimeline();
}

// --- SELECTION & INSPECTOR ---
canvas.on('selection:created', updateInspector);
canvas.on('selection:updated', updateInspector);
canvas.on('object:moving', updateInspector);
canvas.on('object:scaling', updateInspector);
canvas.on('object:rotating', updateInspector);

function updateInspector() {
    const active = canvas.getActiveObject();
    if (!active) return;

    document.getElementById('prop-x').value = Math.round(active.left);
    document.getElementById('prop-y').value = Math.round(active.top);
    document.getElementById('prop-w').value = Math.round(active.width * active.scaleX);
    document.getElementById('prop-h').value = Math.round(active.height * active.scaleY);
    document.getElementById('prop-scale').value = active.scaleX.toFixed(2);
    document.getElementById('prop-rotation').value = Math.round(active.angle);
    document.getElementById('prop-fill').value = active.fill;
    document.getElementById('prop-stroke').value = active.stroke || '#000000';
    document.getElementById('prop-stroke-width').value = active.strokeWidth || 0;
    document.getElementById('prop-opacity').value = active.opacity || 1;
}

// Property Input Listeners
const propInputs = ['prop-x', 'prop-y', 'prop-w', 'prop-h', 'prop-scale', 'prop-rotation', 'prop-fill', 'prop-stroke', 'prop-stroke-width', 'prop-opacity'];
propInputs.forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
        const active = canvas.getActiveObject();
        if (!active) return;

        const val = e.target.value;
        switch (id) {
            case 'prop-x': active.set('left', parseFloat(val)); break;
            case 'prop-y': active.set('top', parseFloat(val)); break;
            case 'prop-scale':
                active.set('scaleX', parseFloat(val));
                active.set('scaleY', parseFloat(val));
                break;
            case 'prop-rotation': active.set('angle', parseFloat(val)); break;
            case 'prop-fill': active.set('fill', val); break;
            case 'prop-stroke': active.set('stroke', val); break;
            case 'prop-stroke-width': active.set('strokeWidth', parseFloat(val)); break;
            case 'prop-opacity': active.set('opacity', parseFloat(val)); break;
        }
        canvas.renderAll();
    });
});

// --- KEYFRAMING ---
document.getElementById('set-keyframe').addEventListener('click', () => {
    const active = canvas.getActiveObject();
    if (!active) return;

    const id = active.id;
    if (!state.keyframes[id]) state.keyframes[id] = {};

    state.keyframes[id][state.currentTime.toFixed(2)] = {
        left: active.left,
        top: active.top,
        scaleX: active.scaleX,
        scaleY: active.scaleY,
        angle: active.angle,
        fill: active.fill,
        stroke: active.stroke,
        strokeWidth: active.strokeWidth,
        opacity: active.opacity,
        easing: document.getElementById('prop-easing').value
    };

    updateTimeline();
});

// Timeline Scrubbing
const trackArea = document.getElementById('timeline-track-area');
trackArea.addEventListener('mousedown', (e) => {
    const rect = trackArea.getBoundingClientRect();
    const timelineWidth = rect.width - 30; // Offset for safety

    const updatePlayhead = (e) => {
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        state.currentTime = (x / rect.width) * state.duration;
        playhead.style.left = x + 'px';
        timeDisplay.innerText = state.currentTime.toFixed(2) + 's';

        applyKeyframesAtTime(state.currentTime);
    };

    updatePlayhead(e);

    const onMouseMove = (e) => updatePlayhead(e);
    const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
});

function applyKeyframesAtTime(time) {
    canvas.getObjects().forEach(obj => {
        const id = obj.id;
        const keys = state.keyframes[id];
        if (!keys) return;

        const times = Object.keys(keys).map(Number).sort((a, b) => a - b);
        let prev = null, next = null;
        for (let t of times) {
            if (t <= time) prev = t;
            if (t > time && next === null) next = t;
        }

        if (prev !== null && next !== null) {
            const progress = (time - prev) / (next - prev);
            const start = keys[prev.toFixed(2)];
            const end = keys[next.toFixed(2)];

            obj.set({
                left: start.left + (end.left - start.left) * progress,
                top: start.top + (end.top - start.top) * progress,
                scaleX: start.scaleX + (end.scaleX - start.scaleX) * progress,
                scaleY: start.scaleY + (end.scaleY - start.scaleY) * progress,
                angle: start.angle + (end.angle - start.angle) * progress,
                opacity: start.opacity + (end.opacity - start.opacity) * progress
            });
        } else if (prev !== null) {
            obj.set(keys[prev.toFixed(2)]);
        }
    });
    canvas.renderAll();
}

// Playback Logic
document.getElementById('play-btn').addEventListener('click', () => {
    if (state.isPlaying) return;
    state.isPlaying = true;

    const tl = gsap.timeline({
        onUpdate: () => {
            const progress = tl.progress();
            state.currentTime = progress * state.duration;
            const x = progress * trackArea.offsetWidth;
            playhead.style.left = x + 'px';
            timeDisplay.innerText = state.currentTime.toFixed(2) + 's';
            canvas.renderAll();
        },
        onComplete: () => { state.isPlaying = false; }
    });

    canvas.getObjects().forEach(obj => {
        const keys = state.keyframes[obj.id];
        if (!keys) return;
        const times = Object.keys(keys).map(Number).sort((a, b) => a - b);
        times.forEach((t, i) => {
            if (i === 0) tl.set(obj, keys[t.toFixed(2)], 0);
            else {
                tl.to(obj, {
                    ...keys[t.toFixed(2)],
                    duration: t - times[i - 1],
                    ease: keys[t.toFixed(2)].easing || 'none'
                }, times[i - 1]);
            }
        });
    });
    tl.play();
});

document.getElementById('stop-btn').addEventListener('click', () => {
    state.isPlaying = false;
    gsap.killTweensOf(canvas.getObjects());
    state.currentTime = 0;
    playhead.style.left = '0px';
    timeDisplay.innerText = '0.00s';
    applyKeyframesAtTime(0);
});

// Layer List Helper
function updateLayerList() {
    const list = document.getElementById('layers');
    list.innerHTML = '';
    canvas.getObjects().slice().reverse().forEach(obj => {
        const item = document.createElement('div');
        item.className = 'layer-item';
        item.style.padding = '8px 16px';
        item.style.fontSize = '12px';
        item.style.borderBottom = '1px solid var(--border-dim)';
        item.style.cursor = 'pointer';
        item.style.background = (canvas.getActiveObject() === obj) ? 'var(--bg-element)' : 'transparent';
        item.innerText = (obj.id || 'PATH').toUpperCase();
        item.onclick = () => {
            canvas.setActiveObject(obj);
            canvas.renderAll();
            updateAll();
        };
        list.appendChild(item);
    });
}

// Initial Sync
updateAll();
// --- ARRANGEMENT ---
document.getElementById('bring-forward').onclick = () => {
    const active = canvas.getActiveObject();
    if (active) { canvas.bringForward(active); updateLayerList(); }
};
document.getElementById('send-backward').onclick = () => {
    const active = canvas.getActiveObject();
    if (active) { canvas.sendBackwards(active); updateLayerList(); }
};
document.getElementById('bring-to-front').onclick = () => {
    const active = canvas.getActiveObject();
    if (active) { canvas.bringToFront(active); updateLayerList(); }
};
document.getElementById('send-to-back').onclick = () => {
    const active = canvas.getActiveObject();
    if (active) { canvas.sendToBack(active); updateLayerList(); }
};

// Deployment & Saving
document.getElementById('save-scene').onclick = () => {
    const sceneData = {
        objects: canvas.toJSON(['id']),
        keyframes: state.keyframes,
        duration: state.duration
    };
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Briefs Studio-motion-${Date.now()}.json`;
    a.click();
};

document.getElementById('deploy-btn').onclick = async () => {
    const brief = document.getElementById('brief-selector').value;
    if (!brief) return alert('Select a brief first');

    // Simulate push
    alert(`Deploying motion engine to /${brief}/...`);
};
