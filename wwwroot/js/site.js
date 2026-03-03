let currentLanguage = 'bg';
let currentUnit = 'metric';
let presets = JSON.parse(localStorage.getItem('metalCalcPresets') || '[]');
let calculationHistory = JSON.parse(localStorage.getItem('metalCalcHistory') || '[]');
let isReverseMode = false;
let reverseTarget = 'length';

const unitConversions = {
    mToFt: 3.28084, ftToM: 0.3048,
    mmToIn: 0.0393701, inToMm: 25.4,
    kgToLbs: 2.20462, lbsToKg: 0.453592
};

// ─────────────────────────────────────────────
//  ALERTS / MODALS
// ─────────────────────────────────────────────
function showCustomAlert(message) {
    const existing = document.querySelector('.custom-alert-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.innerHTML = `
        <div class="custom-alert">
            <div class="custom-alert-header">
                <div class="custom-alert-icon">⚠</div>
                <h3 class="custom-alert-title">${translations[currentLanguage].error}</h3>
            </div>
            <div class="custom-alert-message">${message}</div>
            <button class="custom-alert-button" onclick="this.closest('.custom-alert-overlay').remove()">
                ${translations[currentLanguage].ok}
            </button>
        </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
    });
}

function showSuccessMessage(message) {
    const existing = document.querySelector('.custom-alert-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.innerHTML = `
        <div class="custom-alert">
            <div class="custom-alert-header">
                <div class="custom-alert-icon" style="background:linear-gradient(135deg,#27ae60,#229954)">✓</div>
                <h3 class="custom-alert-title">${translations[currentLanguage].ok}</h3>
            </div>
            <div class="custom-alert-message">${message}</div>
            <button class="custom-alert-button" onclick="this.closest('.custom-alert-overlay').remove()">
                ${translations[currentLanguage].ok}
            </button>
        </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    setTimeout(() => overlay.remove(), 2000);
}

function showPresetModal() {
    const existing = document.querySelector('.custom-alert-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.innerHTML = `
        <div class="custom-alert preset-modal">
            <div class="custom-alert-header">
                <div class="custom-alert-icon" style="background:linear-gradient(135deg,#27ae60,#229954)">★</div>
                <h3 class="custom-alert-title">${translations[currentLanguage].savePreset}</h3>
            </div>
            <div class="preset-modal-body">
                <label class="preset-modal-label">${translations[currentLanguage].presetName}</label>
                <input type="text" id="presetNameInput" class="preset-modal-input"
                       placeholder="${translations[currentLanguage].enterPresetName}" autofocus />
            </div>
            <div class="preset-modal-actions">
                <button class="custom-alert-button preset-cancel-btn"
                        onclick="this.closest('.custom-alert-overlay').remove()">
                    ✕ ${translations[currentLanguage].cancel}
                </button>
                <button class="custom-alert-button" onclick="confirmSavePreset()">
                    ✓ ${translations[currentLanguage].savePreset}
                </button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    setTimeout(() => {
        const input = document.getElementById('presetNameInput');
        if (input) {
            input.focus();
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') confirmSavePreset();
                if (e.key === 'Escape') overlay.remove();
            });
        }
    }, 50);
}

// ─────────────────────────────────────────────
//  PRESETS
// ─────────────────────────────────────────────
function savePreset() {
    const product = document.getElementById("productSelect").value;
    const metal = document.getElementById("metalSelect").value;
    if (!product || !metal) { showCustomAlert(translations[currentLanguage].pleaseSelectProduct); return; }
    showPresetModal();
}

function confirmSavePreset() {
    const nameInput = document.getElementById('presetNameInput');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) { nameInput.classList.add('input-error'); nameInput.focus(); return; }
    const product = document.getElementById("productSelect").value;
    const metal = document.getElementById("metalSelect").value;
    const price = document.getElementById("pricePerKg")?.value || '';
    const preset = { id: Date.now(), name, product, metal, price, values: {} };
    document.querySelectorAll('#dynamicInputs input').forEach(input => {
        preset.values[input.id] = input.value;
    });
    presets.push(preset);
    localStorage.setItem('metalCalcPresets', JSON.stringify(presets));
    document.querySelector('.custom-alert-overlay')?.remove();
    updatePresetsList();
    showSuccessMessage(translations[currentLanguage].presetSaved);
}

function loadPreset(presetId) {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    document.getElementById("productSelect").value = preset.product;
    document.getElementById("metalSelect").value = preset.metal;
    onProductChange(preset.product);
    setTimeout(() => {
        Object.keys(preset.values).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = preset.values[key];
        });
        if (preset.price && document.getElementById("pricePerKg"))
            document.getElementById("pricePerKg").value = preset.price;
        showSuccessMessage(translations[currentLanguage].presetLoaded);
    }, 100);
}

function deletePreset(presetId) {
    const existing = document.querySelector('.custom-alert-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.innerHTML = `
        <div class="custom-alert">
            <div class="custom-alert-header">
                <div class="custom-alert-icon">🗑</div>
                <h3 class="custom-alert-title">${translations[currentLanguage].deletePreset}?</h3>
            </div>
            <div class="custom-alert-message">${translations[currentLanguage].deletePresetConfirm}</div>
            <div class="preset-modal-actions">
                <button class="custom-alert-button preset-cancel-btn"
                        onclick="this.closest('.custom-alert-overlay').remove()">
                    ✕ ${translations[currentLanguage].cancel}
                </button>
                <button class="custom-alert-button" style="background:linear-gradient(135deg,#e74c3c,#c0392b)"
                        onclick="confirmDeletePreset(${presetId})">
                    🗑 ${translations[currentLanguage].deletePreset}
                </button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

function confirmDeletePreset(presetId) {
    presets = presets.filter(p => p.id !== presetId);
    localStorage.setItem('metalCalcPresets', JSON.stringify(presets));
    document.querySelector('.custom-alert-overlay')?.remove();
    updatePresetsList();
    showSuccessMessage(translations[currentLanguage].presetDeleted);
}

function updatePresetsList() {
    const container = document.getElementById('presetsContainer');
    if (!container) return;
    if (presets.length === 0) {
        container.innerHTML = `<p class="no-presets">${translations[currentLanguage].noPresets}</p>`;
        return;
    }
    container.innerHTML = presets.map(preset => `
        <div class="preset-item">
            <div class="preset-info">
                <strong>${preset.name}</strong>
                <small>${translations[currentLanguage][preset.product] || preset.product} — ${translations[currentLanguage][preset.metal] || preset.metal}</small>
            </div>
            <div class="preset-actions">
                <button class="preset-btn load-btn" onclick="loadPreset(${preset.id})">${translations[currentLanguage].loadPreset}</button>
                <button class="preset-btn delete-btn" onclick="deletePreset(${preset.id})">${translations[currentLanguage].deletePreset}</button>
            </div>
        </div>`).join('');
}

// ─────────────────────────────────────────────
//  UNITS
// ─────────────────────────────────────────────
function toggleUnits() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('unitSystem', currentUnit);
    updateUnitLabels();
    updateUnitButton();
}

function updateUnitButton() {
    const btn = document.querySelector('.unit-toggle-btn');
    if (btn) btn.textContent = currentUnit === 'metric'
        ? translations[currentLanguage].metric
        : translations[currentLanguage].imperial;
}

function updateUnitLabels() {
    const product = document.getElementById("productSelect").value;
    if (product) onProductChange(product);
}

function getUnitSuffix(type) {
    return currentUnit === 'metric'
        ? (type === 'length' ? '(m)' : '(mm)')
        : (type === 'length' ? '(ft)' : '(in)');
}

function convertInputValue(value, type) {
    if (currentUnit === 'imperial')
        return type === 'length' ? value * unitConversions.ftToM : value * unitConversions.inToMm;
    return value;
}

// ─────────────────────────────────────────────
//  REVERSE MODE
// ─────────────────────────────────────────────
const reverseOptions = {
    wire: ['length', 'amount', 'diameter'],
    square: ['length', 'amount', 'width'],
    hexagon: ['length', 'amount', 'diameter'],
    pipe: ['length', 'amount', 'diameter', 'wallThickness'],
    squarePipe: ['length', 'amount', 'width', 'wallThickness'],
    sheet: ['length', 'amount', 'width', 'thickness'],
    strip: ['length', 'amount', 'width', 'thickness'],
    flatbar: ['length', 'amount', 'width', 'thickness'],
    beam: ['length', 'amount'],
    channel: ['length', 'amount', 'wallThickness'],
    corner: ['length', 'amount', 'wallThickness'],
};

const reverseFieldLabels = {
    length: 'length', amount: 'amount', diameter: 'diameter',
    width: 'width', thickness: 'thickness', wallThickness: 'wallThickness',
};

function toggleReverseMode() {
    isReverseMode = !isReverseMode;
    const btn = document.getElementById('reverseModeBtn');
    if (btn) btn.classList.toggle('active', isReverseMode);

    const product = document.getElementById("productSelect").value;

    if (isReverseMode && product) {
        const opts = reverseOptions[product] || ['length'];
        if (!opts.includes(reverseTarget)) reverseTarget = opts[0];
    }

    if (product) onProductChange(product);
    updateCalcButton();
}

function onReverseSolveChange(value) {
    reverseTarget = value;
    const product = document.getElementById("productSelect").value;
    if (product) onProductChange(product);
    updateCalcButton();
}

function updateCalcButton() {
    const calcBtn = document.getElementById('calcBtn');
    if (!calcBtn) return;
    if (typeof translations === 'undefined' || !translations[currentLanguage]) return;
    const L = translations[currentLanguage];
    if (!isReverseMode) {
        calcBtn.textContent = L.calculateWeight;
        calcBtn.onclick = () => calculateWeight();
    } else {
        const fieldKey = reverseFieldLabels[reverseTarget] || reverseTarget;
        const rawLabel = L[fieldKey];
        const fieldName = rawLabel ? rawLabel.replace(/\(.*\)/, '').trim() : fieldKey;
        calcBtn.textContent = `⇄ ${L.solveFor}: ${fieldName}`;
        calcBtn.onclick = () => calculateReverse();
    }
}

// ─────────────────────────────────────────────
//  BUILD INPUTS
// ─────────────────────────────────────────────
function onProductChange(product) {
    const diagramImage = document.getElementById("diagramImage");
    const diagramTitle = document.getElementById("diagramTitle");
    const inputArea = document.getElementById("dynamicInputs");

    if (!product) {
        diagramTitle.textContent = translations[currentLanguage].pleaseSelectProduct;
        diagramImage.src = ""; diagramImage.style.display = "none";
        inputArea.innerHTML = "";
        document.getElementById("result").innerText = "";
        updateCalcButton();
        return;
    }

    diagramImage.src = `/diagrams/${product}.png`;
    diagramImage.style.display = "block";

    const lengthUnit = getUnitSuffix('length');
    const dimUnit = getUnitSuffix('dimension');
    const L = translations[currentLanguage];
    const lbl = key => L[key]?.replace(/\(.*\)/, '').trim() || key;

    if (isReverseMode) {
        const opts = reverseOptions[product] || ['length'];
        if (!opts.includes(reverseTarget)) reverseTarget = opts[0];
    }

    let inputs = "";

    if (isReverseMode) {
        const opts = reverseOptions[product] || ['length'];
        const weightUnit = currentUnit === 'metric' ? 'kg' : 'lbs';
        inputs += `
        <div class="form-group reverse-solve-group">
            <label>${L.solveFor}:</label>
            <select class="form-control reverse-solve-select" onchange="onReverseSolveChange(this.value)">
                ${opts.map(o => `<option value="${o}" ${o === reverseTarget ? 'selected' : ''}>${lbl(reverseFieldLabels[o])}</option>`).join('')}
            </select>
        </div>
        <div class="form-group reverse-weight-field">
            <label>${L.targetWeight || 'Target Weight'} (${weightUnit}):</label>
            <input type="number" step="any" id="targetWeight" class="form-control" autocomplete="off"/>
        </div>`;
    }

    const addField = (id, labelKey, unit) => {
        const isTarget = isReverseMode && id === reverseTarget;
        if (isTarget) {
            return `<div class="form-group reverse-target">
                <label>${lbl(labelKey)} ${unit} <span class="reverse-badge">${L.reverseTarget || 'TARGET'}</span>:</label>
                <input type="number" step="any" id="${id}" class="form-control reverse-input" autocomplete="off" placeholder="?" disabled/>
            </div>`;
        }
        return `<div class="form-group">
            <label>${lbl(labelKey)} ${unit}:</label>
            <input type="number" step="any" id="${id}" class="form-control" autocomplete="off"/>
        </div>`;
    };

    const amountField = (id = 'amount') => {
        const isTarget = isReverseMode && id === reverseTarget;
        if (isTarget) {
            return `<div class="form-group reverse-target">
                <label>${lbl('amount')} <span class="reverse-badge">${L.reverseTarget || 'TARGET'}</span>:</label>
                <input type="number" step="any" id="${id}" class="form-control reverse-input" autocomplete="off" placeholder="?" disabled/>
            </div>`;
        }
        return `<div class="form-group"><label>${L.amount}:</label><input type="number" step="any" id="${id}" class="form-control" autocomplete="off"/></div>`;
    };

    switch (product) {
        case "wire":
            inputs += addField('diameter', 'diameter', dimUnit);
            inputs += addField('length', 'length', lengthUnit);
            inputs += amountField();
            break;
        case "pipe":
            inputs += addField('diameter', 'diameter', dimUnit);
            inputs += addField('wallThickness', 'wallThickness', dimUnit);
            inputs += addField('length', 'length', lengthUnit);
            inputs += amountField();
            break;
        case "square":
            inputs += addField('width', 'width', dimUnit);
            inputs += addField('length', 'length', lengthUnit);
            inputs += amountField();
            break;
        case "squarePipe":
            inputs += addField('width', 'width', dimUnit);
            inputs += addField('height', 'height', dimUnit);
            inputs += addField('wallThickness', 'wallThickness', dimUnit);
            inputs += addField('length', 'length', lengthUnit);
            inputs += amountField();
            break;
        case "sheet":
        case "strip":
        case "flatbar":
            inputs += addField('width', 'width', dimUnit);
            inputs += addField('thickness', 'thickness', dimUnit);
            inputs += addField('length', 'length', lengthUnit);
            inputs += amountField();
            break;
        case "hexagon":
            inputs += addField('diameter', 'diameter', dimUnit);
            inputs += addField('length', 'length', lengthUnit);
            inputs += amountField();
            break;
        case "beam":
            inputs += addField('width', 'width', dimUnit);
            inputs += addField('height', 'height', dimUnit);
            inputs += addField('lintelThickness', 'lintelThickness', dimUnit);
            inputs += addField('shelvesThickness', 'shelfThickness', dimUnit);
            inputs += addField('length', 'length', lengthUnit);
            inputs += amountField();
            break;
        case "channel":
        case "corner":
            inputs += addField('width', 'width', dimUnit);
            inputs += addField('height', 'height', dimUnit);
            inputs += addField('wallThickness', 'wallThickness', dimUnit);
            inputs += addField('length', 'length', lengthUnit);
            inputs += amountField();
            break;
    }

    inputArea.innerHTML = inputs;

    inputArea.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', debounce(liveCalculate, 300));
    });
    document.getElementById('metalSelect')?.addEventListener('change', debounce(liveCalculate, 100));
    document.getElementById('pricePerKg')?.addEventListener('input', debounce(liveCalculate, 300));

    diagramTitle.innerText = `${L.diagram}: ${L[product]}`;
    updateCalcButton();
}

// ─────────────────────────────────────────────
//  VOLUME FACTOR
// ─────────────────────────────────────────────
function computeVolumeFactor(product, dims) {
    const { d, w, h, t, wall, middleT, shelvesT } = dims;
    switch (product) {
        case "wire": return Math.PI * Math.pow(d / 20, 2);
        case "pipe": {
            const oR = d / 2, iR = oR - wall;
            return Math.PI * (Math.pow(oR / 10, 2) - Math.pow(iR / 10, 2));
        }
        case "square": return (w / 10) * (w / 10);
        case "squarePipe": {
            const oA = (w / 10) * (h / 10);
            const iA = ((w - 2 * wall) / 10) * ((h - 2 * wall) / 10);
            return oA - iA;
        }
        case "sheet": case "strip": case "flatbar":
            return (w / 10) * (t / 10);
        case "hexagon": {
            const side = d / (2 * Math.cos(Math.PI / 6));
            return (3 * Math.sqrt(3) / 2) * Math.pow(side / 10, 2);
        }
        case "beam": {
            const flangeA = 2 * ((w / 10) * (shelvesT / 10));
            const webA = (middleT / 10) * ((h - 2 * shelvesT) / 10);
            return flangeA + webA;
        }
        case "channel": {
            const baseA = (wall / 10) * ((h - 2 * wall) / 10);
            const sideA = 2 * ((w / 10) * (wall / 10));
            return baseA + sideA;
        }
        case "corner": {
            const vert = (wall / 10) * (h / 10);
            const horiz = (wall / 10) * (w / 10);
            const ovlp = (wall / 10) * (wall / 10);
            return vert + horiz - ovlp;
        }
    }
    return 0;
}

function getDims() {
    return {
        d: convertInputValue(parseInput("diameter"), 'dimension'),
        w: convertInputValue(parseInput("width"), 'dimension'),
        h: convertInputValue(parseInput("height"), 'dimension'),
        t: convertInputValue(parseInput("thickness"), 'dimension'),
        wall: convertInputValue(parseInput("wallThickness"), 'dimension'),
        middleT: convertInputValue(parseInput("lintelThickness"), 'dimension'),
        shelvesT: convertInputValue(parseInput("shelvesThickness"), 'dimension'),
    };
}

const densities = {
    copper: 8.96, bronze: 8.7, aluminum: 2.7, zinc: 7.14, tin: 7.31,
    steel: 7.85, lead: 11.34, titanium: 4.51, nickel: 8.9, brass: 8.73
};

// ─────────────────────────────────────────────
//  LIVE CALCULATE
// ─────────────────────────────────────────────
function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function liveCalculate() {
    const product = document.getElementById("productSelect").value;
    const metal = document.getElementById("metalSelect").value;
    if (!product || !metal) return;

    if (isReverseMode) {
        const tw = parseFloat(document.getElementById("targetWeight")?.value);
        if (!tw || isNaN(tw)) return;
        const inputs = document.querySelectorAll(`#dynamicInputs input:not(.reverse-input):not([id="targetWeight"])`);
        for (const inp of inputs) {
            if (inp.id === 'amount') continue; // amount is optional
            if (!inp.value || isNaN(parseFloat(inp.value))) return;
        }
        calculateReverse(true);
    } else {
        const inputs = document.querySelectorAll('#dynamicInputs input:not([id="amount"])');
        for (const inp of inputs) {
            if (!inp.value || isNaN(parseFloat(inp.value))) return;
        }
        calculateWeight(true);
    }
}

// ─────────────────────────────────────────────
//  REQUIRED FIELDS PER PRODUCT
// ─────────────────────────────────────────────
function getRequiredDimFields(product) {
    switch (product) {
        case 'wire': return ['diameter'];
        case 'square': return ['width'];
        case 'hexagon': return ['diameter'];
        case 'pipe': return ['diameter', 'wallThickness'];
        case 'squarePipe': return ['width', 'height', 'wallThickness'];
        case 'sheet':
        case 'strip':
        case 'flatbar': return ['width', 'thickness'];
        case 'beam': return ['width', 'height', 'lintelThickness', 'shelvesThickness'];
        case 'channel':
        case 'corner': return ['width', 'height', 'wallThickness'];
        default: return [];
    }
}

// ─────────────────────────────────────────────
//  CALCULATE WEIGHT (forward)
// ─────────────────────────────────────────────
function calculateWeight(silent = false) {
    const product = document.getElementById("productSelect").value;
    const metal = document.getElementById("metalSelect").value;

    if (!silent) {
        if (!product) { showCustomAlert(translations[currentLanguage].pleaseSelectProduct); return; }
        if (!metal) { showCustomAlert(translations[currentLanguage].pleaseSelectMetal); return; }
    }
    if (!product || !metal) return;

    const L = translations[currentLanguage];

    if (!silent) {
        for (const fieldId of getRequiredDimFields(product)) {
            const val = parseInput(fieldId);
            if (!val || val <= 0) {
                const labelKey = fieldId === 'shelvesThickness' ? 'shelfThickness' : fieldId;
                const fieldName = L[labelKey]?.replace(/\(.*\)/, '').trim() || fieldId;
                showCustomAlert(`${L.pleaseInput}: ${fieldName}`);
                const el = document.getElementById(fieldId);
                if (el) { el.classList.add('input-error'); setTimeout(() => el.classList.remove('input-error'), 1500); }
                return;
            }
        }
    }

    const dims = getDims();
    const length = convertInputValue(parseInput("length"), 'length') * 100;
    const amount = parseInput("amount") || 1;

    if (!silent && !length) {
        showCustomAlert(`${L.pleaseInput}: ${L.length?.replace(/\(.*\)/, '').trim()}`);
        const el = document.getElementById('length');
        if (el) { el.classList.add('input-error'); setTimeout(() => el.classList.remove('input-error'), 1500); }
        return;
    }

    const vf = computeVolumeFactor(product, dims);
    const volume = vf * (length / 10);
    const density = densities[metal] || 0;
    let weight = volume * density * amount / 100;

    let weightUnit = 'kg';
    if (currentUnit === 'imperial') { weight *= unitConversions.kgToLbs; weightUnit = 'lbs'; }
    weight = Math.round(weight * 100) / 100;

    const pricePerKg = parseFloat(document.getElementById("pricePerKg")?.value) || 0;
    const weightKg = currentUnit === 'imperial' ? weight * unitConversions.lbsToKg : weight;

    let resultHTML = `<div class="result-main">${L.weight}: <strong>${weight} ${weightUnit}</strong></div>`;
    if (pricePerKg > 0) {
        const cost = (weightKg * pricePerKg).toFixed(2);
        const currency = document.getElementById("currency")?.value || '';
        resultHTML += `<div class="result-cost">${L.estimatedCost}: <strong>${cost} ${currency}</strong></div>`;
    }

    document.getElementById("result").innerHTML = resultHTML;
    if (!silent && weight > 0)
        addToHistory({ product, metal, weight, weightUnit, length: parseInput("length"), amount, pricePerKg });
}

// ─────────────────────────────────────────────
//  CALCULATE REVERSE
// ─────────────────────────────────────────────
function calculateReverse(silent = false) {
    const product = document.getElementById("productSelect").value;
    const metal = document.getElementById("metalSelect").value;

    if (!silent) {
        if (!product) { showCustomAlert(translations[currentLanguage].pleaseSelectProduct); return; }
        if (!metal) { showCustomAlert(translations[currentLanguage].pleaseSelectMetal); return; }
    }
    if (!product || !metal) return;

    let targetWeightInput = parseInput("targetWeight");
    if (!targetWeightInput) {
        if (!silent) showCustomAlert(translations[currentLanguage].pleaseInput + ": " + (translations[currentLanguage].targetWeight || 'Target Weight'));
        return;
    }

    let targetWeightKg = currentUnit === 'imperial' ? targetWeightInput * unitConversions.lbsToKg : targetWeightInput;

    const density = densities[metal] || 0;
    const L = translations[currentLanguage];
    const dimUnit = currentUnit === 'metric' ? 'mm' : 'in';
    const lenUnit = currentUnit === 'metric' ? 'm' : 'ft';

    let result = null;
    let resultLabel = '';
    let resultUnit = '';
    let fieldId = reverseTarget;

    const dims = getDims();

    if (reverseTarget === 'length') {
        const amount = parseInput("amount") || 1;
        const vf = computeVolumeFactor(product, dims);
        if (!vf) { if (!silent) showCustomAlert(translations[currentLanguage].pleaseInput + ": dimensions"); return; }
        let lengthCm = (targetWeightKg * 1000) / (vf * density * amount);
        let lengthM = lengthCm / 100;
        if (currentUnit === 'imperial') lengthM *= unitConversions.mToFt;
        result = Math.round(lengthM * 1000) / 1000;
        resultLabel = L.requiredLength || 'Required Length';
        resultUnit = lenUnit;

    } else if (reverseTarget === 'amount') {
        const length = convertInputValue(parseInput("length"), 'length') * 100;
        if (!length) { if (!silent) showCustomAlert(translations[currentLanguage].pleaseInput + ": " + L.length); return; }
        const vf = computeVolumeFactor(product, dims);
        if (!vf) return;
        result = (targetWeightKg * 1000) / (vf * (length / 10) * density);
        result = Math.round(result * 100) / 100;
        resultLabel = L.requiredAmount || 'Required Amount';
        resultUnit = L.pcs || 'pcs';

    } else if (reverseTarget === 'diameter') {
        const amount = parseInput("amount") || 1;
        const length = convertInputValue(parseInput("length"), 'length') * 100;
        if (!length) { if (!silent) showCustomAlert(translations[currentLanguage].pleaseInput + ": " + L.length); return; }
        const requiredVf = (targetWeightKg * 1000) / ((length / 10) * density * amount);

        if (product === 'wire') {
            const d_mm = 20 * Math.sqrt(requiredVf / Math.PI);
            result = currentUnit === 'imperial' ? d_mm * unitConversions.mmToIn : d_mm;
        } else if (product === 'hexagon') {
            const side_cm = Math.sqrt(requiredVf / (3 * Math.sqrt(3) / 2));
            const d_mm = side_cm * 10 * 2 * Math.cos(Math.PI / 6);
            result = currentUnit === 'imperial' ? d_mm * unitConversions.mmToIn : d_mm;
        } else if (product === 'pipe') {
            const wall = dims.wall;
            const d_mm = (requiredVf * 100 / Math.PI + wall * wall) / wall;
            result = currentUnit === 'imperial' ? d_mm * unitConversions.mmToIn : d_mm;
        }
        result = Math.round(result * 100) / 100;
        resultLabel = L.requiredDiameter || ('Required ' + (L.diameter?.replace(/\(.*\)/, '').trim() || 'Diameter'));
        resultUnit = dimUnit;

    } else if (reverseTarget === 'width') {
        const amount = parseInput("amount") || 1;
        const length = convertInputValue(parseInput("length"), 'length') * 100;
        if (!length) { if (!silent) showCustomAlert(translations[currentLanguage].pleaseInput + ": " + L.length); return; }
        const requiredVf = (targetWeightKg * 1000) / ((length / 10) * density * amount);

        let w_mm = 0;
        if (product === 'square') {
            w_mm = 10 * Math.sqrt(requiredVf);
        } else if (['sheet', 'strip', 'flatbar'].includes(product)) {
            const t = dims.t;
            if (!t) { if (!silent) showCustomAlert(translations[currentLanguage].pleaseInput + ": " + L.thickness); return; }
            w_mm = requiredVf * 100 / t;
        }
        result = currentUnit === 'imperial' ? w_mm * unitConversions.mmToIn : w_mm;
        result = Math.round(result * 100) / 100;
        resultLabel = L.requiredWidth || ('Required ' + (L.width?.replace(/\(.*\)/, '').trim() || 'Width'));
        resultUnit = dimUnit;

    } else if (reverseTarget === 'thickness') {
        const amount = parseInput("amount") || 1;
        const length = convertInputValue(parseInput("length"), 'length') * 100;
        if (!length) { if (!silent) showCustomAlert(translations[currentLanguage].pleaseInput + ": " + L.length); return; }
        const requiredVf = (targetWeightKg * 1000) / ((length / 10) * density * amount);
        const w = dims.w;
        if (!w) { if (!silent) showCustomAlert(translations[currentLanguage].pleaseInput + ": " + L.width); return; }
        let t_mm = requiredVf * 100 / w;
        result = currentUnit === 'imperial' ? t_mm * unitConversions.mmToIn : t_mm;
        result = Math.round(result * 100) / 100;
        resultLabel = L.requiredThickness || ('Required ' + (L.thickness?.replace(/\(.*\)/, '').trim() || 'Thickness'));
        resultUnit = dimUnit;

    } else if (reverseTarget === 'wallThickness') {
        const amount = parseInput("amount") || 1;
        const length = convertInputValue(parseInput("length"), 'length') * 100;
        if (!length) { if (!silent) showCustomAlert(translations[currentLanguage].pleaseInput + ": " + L.length); return; }
        const requiredVf = (targetWeightKg * 1000) / ((length / 10) * density * amount);

        let wall_mm = 0;
        if (product === 'pipe') {
            const R = dims.d / 2;
            const C = requiredVf * 100 / Math.PI;
            const discriminant = R * R - C;
            if (discriminant < 0) { if (!silent) showCustomAlert('Target weight too high for this pipe diameter.'); return; }
            wall_mm = R - Math.sqrt(discriminant);
        } else if (product === 'squarePipe') {
            const w = dims.w, h = dims.h;
            const a = 4, b = -2 * (w + h), c = requiredVf * 100;
            const disc = b * b - 4 * a * c;
            if (disc < 0) { if (!silent) showCustomAlert('Target weight too high for these dimensions.'); return; }
            wall_mm = (-b - Math.sqrt(disc)) / (2 * a);
        } else if (['channel', 'corner'].includes(product)) {
            const w = dims.w, h = dims.h;
            let lo = 0.01, hi = Math.min(w, h) / 2;
            for (let i = 0; i < 60; i++) {
                const mid = (lo + hi) / 2;
                const testVf = computeVolumeFactor(product, { ...dims, wall: mid });
                if (testVf < requiredVf) lo = mid; else hi = mid;
            }
            wall_mm = (lo + hi) / 2;
        }
        result = currentUnit === 'imperial' ? wall_mm * unitConversions.mmToIn : wall_mm;
        result = Math.round(result * 100) / 100;
        resultLabel = L.requiredWallThickness || ('Required ' + (L.wallThickness?.replace(/\(.*\)/, '').trim() || 'Wall Thickness'));
        resultUnit = dimUnit;
    }

    if (result === null || isNaN(result) || result <= 0) {
        if (!silent) showCustomAlert(translations[currentLanguage].error + ': ' + (translations[currentLanguage].invalidInput || 'invalid input or unsolvable'));
        return;
    }

    document.getElementById("result").innerHTML =
        `<div class="result-main">${resultLabel}: <strong>${result} ${resultUnit}</strong></div>`;

    const targetInput = document.getElementById(fieldId);
    if (targetInput) {
        targetInput.value = result;
        targetInput.classList.add('result-highlight');
        setTimeout(() => targetInput.classList.remove('result-highlight'), 1500);
    }
}

// ─────────────────────────────────────────────
//  HISTORY
// ─────────────────────────────────────────────
function addToHistory(entry) {
    const item = { id: Date.now(), timestamp: new Date().toLocaleString(), ...entry };
    calculationHistory.unshift(item);
    if (calculationHistory.length > 50) calculationHistory.pop();
    localStorage.setItem('metalCalcHistory', JSON.stringify(calculationHistory));
    updateHistoryPanel();
}

function updateHistoryPanel() {
    const container = document.getElementById('historyContainer');
    if (!container) return;
    const L = translations[currentLanguage];
    if (calculationHistory.length === 0) {
        container.innerHTML = `<p class="no-presets">${L.noHistory}</p>`;
        return;
    }
    container.innerHTML = calculationHistory.map(item => `
        <div class="history-item" onclick="reloadHistory(${item.id})" title="Click to reload">
            <div class="history-info">
                <strong>${item.weight} ${item.weightUnit}</strong>
                <span>${L[item.product] || item.product} · ${L[item.metal] || item.metal}</span>
                <small>${item.timestamp}</small>
            </div>
        </div>`).join('');
}

function reloadHistory(id) {
    const item = calculationHistory.find(h => h.id === id);
    if (!item) return;
    document.getElementById("productSelect").value = item.product;
    document.getElementById("metalSelect").value = item.metal;
    onProductChange(item.product);
    setTimeout(() => {
        if (document.getElementById("length")) document.getElementById("length").value = item.length;
        if (document.getElementById("amount")) document.getElementById("amount").value = item.amount;
        showSuccessMessage(translations[currentLanguage].historyLoaded);
    }, 100);
}

function clearHistory() {
    calculationHistory = [];
    localStorage.removeItem('metalCalcHistory');
    updateHistoryPanel();
}

// ─────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────
function parseInput(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    return parseFloat((el.value || "0").replace(",", ".")) || 0;
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('lang', lang);
    translateUI();
    updateUnitButton();
    updatePresetsList();
    updateHistoryPanel();
    const product = document.getElementById("productSelect").value;
    if (product) onProductChange(product);
}

function translateUI() {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        const tr = translations[currentLanguage]?.[key];
        if (!tr) return;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = tr;
        else el.textContent = tr;
    });
    const result = document.getElementById("result");
    if (result && result.textContent.includes(":")) result.innerHTML = "";
    const product = document.getElementById("productSelect").value;
    const titleEl = document.getElementById("diagramTitle");
    const L = translations[currentLanguage];
    titleEl.innerText = product ? `${L.diagram}: ${L[product]}` : L.pleaseSelectProduct;
    updateCalcButton();
}

document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) setLanguage(savedLang); else translateUI();
    const savedUnit = localStorage.getItem('unitSystem');
    if (savedUnit) currentUnit = savedUnit;
    updateUnitButton();
    updatePresetsList();
    updateHistoryPanel();
    updateCalcButton();
});