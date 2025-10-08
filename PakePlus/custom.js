// very important, if you don't know what it is, don't touch it
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })

// ---------------------- Added: Smart auto-scaling + manual slider ----------------------
// Create and inject slider control
function createScaleSlider() {
    const sliderContainer = document.createElement('div');
    sliderContainer.style.position = 'fixed';
    sliderContainer.style.bottom = '30px';
    sliderContainer.style.left = '50%';
    sliderContainer.style.transform = 'translateX(-50%)';
    sliderContainer.style.zIndex = '9999';
    sliderContainer.style.display = 'flex';
    sliderContainer.style.alignItems = 'center';
    sliderContainer.style.gap = '10px';
    sliderContainer.style.padding = '8px 16px';
    sliderContainer.style.backgroundColor = 'rgba(255,255,255,0.9)';
    sliderContainer.style.borderRadius = '20px';
    sliderContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

    const scaleText = document.createElement('span');
    scaleText.textContent = 'Scale: 100%';
    scaleText.style.fontSize = '14px';

    const scaleSlider = document.createElement('input');
    scaleSlider.type = 'range';
    scaleSlider.min = '0.5';
    scaleSlider.max = '2';
    scaleSlider.step = '0.1';
    scaleSlider.value = '1';
    scaleSlider.style.width = '200px';

    sliderContainer.appendChild(scaleText);
    sliderContainer.appendChild(scaleSlider);
    document.body.appendChild(sliderContainer);

    return { scaleSlider, scaleText };
}

// Update element scale and text display
function updateElementScale(selector, scaleRatio, scaleTextEl) {
    const elements = document.querySelectorAll(selector);
    const scalePercent = Math.round(scaleRatio * 100);
    scaleTextEl.textContent = `Scale: ${scalePercent}%`;

    elements.forEach(el => {
        el.style.transform = `scale(${scaleRatio})`;
        el.style.transition = 'transform 0.2s ease';
        el.style.transformOrigin = 'center center';
    });
}

// Smart auto-scale: Calculate ratio based on screen width vs target element's original width
function autoCalculateScaleRatio(selector) {
    const targetEl = document.querySelector(selector);
    if (!targetEl) return 1; // Default 100% if element not found

    const screenWidth = window.innerWidth;
    const elementOriginalWidth = targetEl.offsetWidth; // Get element's original width (unscaled)
    const safeMargin = 40; // Leave 40px margin on both sides

    // Calculate scale: Make element fit screen width (minus margin), min 0.5x, max 1.2x
    let autoScale = (screenWidth - safeMargin * 2) / elementOriginalWidth;
    autoScale = Math.max(0.5, Math.min(1.2, autoScale)); // Limit scale between 0.5-1.2x
    return parseFloat(autoScale.toFixed(1)); // Keep 1 decimal for slider compatibility
}

// Auto-adjust scale (page load/resize) and sync with slider
function autoAdjustScale(selector, scaleTextEl, scaleSliderEl) {
    const autoScaleRatio = autoCalculateScaleRatio(selector);
    updateElementScale(selector, autoScaleRatio, scaleTextEl);
    scaleSliderEl.value = autoScaleRatio;
}

// Initialize all scaling features
function initSmartScaling(scaleTargetSelector = '.scale-target') {
    const { scaleSlider, scaleText } = createScaleSlider();
    let isManualAdjust = false; // Flag to avoid auto-override after manual adjustment

    // Manual slider control
    scaleSlider.addEventListener('input', (e) => {
        isManualAdjust = true; // Mark as manual after user drags
        const manualScale = parseFloat(e.target.value);
        updateElementScale(scaleTargetSelector, manualScale, scaleText);
    });

    // Double-click to reset (back to auto-scale)
    scaleSlider.parentElement.addEventListener('dblclick', () => {
        isManualAdjust = false;
        autoAdjustScale(scaleTargetSelector, scaleText, scaleSlider);
    });

    // Auto-scale on page load
    autoAdjustScale(scaleTargetSelector, scaleText, scaleSlider);

    // Auto-scale on screen resize (only if no manual adjustment)
    window.addEventListener('resize', () => {
        if (!isManualAdjust) {
            autoAdjustScale(scaleTargetSelector, scaleText, scaleSlider);
        }
    });
}

// Example: Initialize - auto-scale elements with class "scale-target"
// Use: Add class="scale-target" to elements needing smart scaling
initSmartScaling('.scale-target');
