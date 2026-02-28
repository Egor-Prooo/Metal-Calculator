let currentLanguage = 'bg';
let currentUnit = 'metric'; // 'metric' or 'imperial'
let presets = JSON.parse(localStorage.getItem('metalCalcPresets') || '[]');

// Unit conversion factors
const unitConversions = {
    // Length conversions
    mToFt: 3.28084,
    ftToM: 0.3048,
    // Dimension conversions (mm to inches)
    mmToIn: 0.0393701,
    inToMm: 25.4,
    // Weight conversions
    kgToLbs: 2.20462,
    lbsToKg: 0.453592
};

// Custom Alert Function
function showCustomAlert(message) {
    const existingAlert = document.querySelector('.custom-alert-overlay');
    if (existingAlert) {
        existingAlert.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';

    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';

    const header = document.createElement('div');
    header.className = 'custom-alert-header';

    const icon = document.createElement('div');
    icon.className = 'custom-alert-icon';
    icon.innerHTML = '⚠';

    const title = document.createElement('h3');
    title.className = 'custom-alert-title';
    title.textContent = translations[currentLanguage].error;

    header.appendChild(icon);
    header.appendChild(title);

    const messageDiv = document.createElement('div');
    messageDiv.className = 'custom-alert-message';
    messageDiv.textContent = message;

    const button = document.createElement('button');
    button.className = 'custom-alert-button';
    button.textContent = translations[currentLanguage].ok;
    button.onclick = () => overlay.remove();

    alertBox.appendChild(header);
    alertBox.appendChild(messageDiv);
    alertBox.appendChild(button);
    overlay.appendChild(alertBox);

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Show success message
function showSuccessMessage(message) {
    const existingAlert = document.querySelector('.custom-alert-overlay');
    if (existingAlert) {
        existingAlert.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';

    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';

    const header = document.createElement('div');
    header.className = 'custom-alert-header';

    const icon = document.createElement('div');
    icon.className = 'custom-alert-icon';
    icon.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
    icon.innerHTML = '✓';

    const title = document.createElement('h3');
    title.className = 'custom-alert-title';
    title.textContent = translations[currentLanguage].ok;

    header.appendChild(icon);
    header.appendChild(title);

    const messageDiv = document.createElement('div');
    messageDiv.className = 'custom-alert-message';
    messageDiv.textContent = message;

    const button = document.createElement('button');
    button.className = 'custom-alert-button';
    button.textContent = translations[currentLanguage].ok;
    button.onclick = () => overlay.remove();

    alertBox.appendChild(header);
    alertBox.appendChild(messageDiv);
    alertBox.appendChild(button);
    overlay.appendChild(alertBox);

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    setTimeout(() => overlay.remove(), 2000);
}

// Toggle unit system
function toggleUnits() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('unitSystem', currentUnit);
    updateUnitLabels();
    updateUnitButton();
}

// Update unit button text to show current system
function updateUnitButton() {
    const unitBtn = document.querySelector('.unit-toggle-btn');
    if (unitBtn) {
        unitBtn.textContent = currentUnit === 'metric' ?
            translations[currentLanguage].metric :
            translations[currentLanguage].imperial;
    }
}

// Update labels based on unit system
function updateUnitLabels() {
    const product = document.getElementById("productSelect").value;
    if (product) {
        onProductChange(product);
    }
}

// Get unit suffix for labels
function getUnitSuffix(type) {
    if (currentUnit === 'metric') {
        return type === 'length' ? '(m)' : '(mm)';
    } else {
        return type === 'length' ? '(ft)' : '(in)';
    }
}

// Convert input value based on current unit
function convertInputValue(value, type) {
    if (currentUnit === 'imperial') {
        if (type === 'length') {
            return value * unitConversions.ftToM; // feet to meters
        } else {
            return value * unitConversions.inToMm; // inches to mm
        }
    }
    return value; // Already in metric
}

// Save current configuration as preset
function savePreset() {
    const product = document.getElementById("productSelect").value;
    const metal = document.getElementById("metalSelect").value;

    if (!product || !metal) {
        showCustomAlert(translations[currentLanguage].pleaseSelectProduct);
        return;
    }

    const name = prompt(translations[currentLanguage].enterPresetName);
    if (!name) return;

    const preset = {
        id: Date.now(),
        name: name,
        product: product,
        metal: metal,
        values: {}
    };

    // Capture all input values
    const inputs = document.querySelectorAll('#dynamicInputs input');
    inputs.forEach(input => {
        preset.values[input.id] = input.value;
    });

    presets.push(preset);
    localStorage.setItem('metalCalcPresets', JSON.stringify(presets));
    updatePresetsList();
    showSuccessMessage(translations[currentLanguage].presetSaved);
}

// Load a preset
function loadPreset(presetId) {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    // Set product and metal
    document.getElementById("productSelect").value = preset.product;
    document.getElementById("metalSelect").value = preset.metal;

    // Trigger product change to show inputs
    onProductChange(preset.product);

    // Set input values
    setTimeout(() => {
        Object.keys(preset.values).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = preset.values[key];
            }
        });
        showSuccessMessage(translations[currentLanguage].presetLoaded);
    }, 100);
}

// Delete a preset
function deletePreset(presetId) {
    if (!confirm(translations[currentLanguage].deletePreset + "?")) return;

    presets = presets.filter(p => p.id !== presetId);
    localStorage.setItem('metalCalcPresets', JSON.stringify(presets));
    updatePresetsList();
    showSuccessMessage(translations[currentLanguage].presetDeleted);
}

// Update presets list display
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
                <small>${translations[currentLanguage][preset.product]} - ${translations[currentLanguage][preset.metal]}</small>
            </div>
            <div class="preset-actions">
                <button class="preset-btn load-btn" onclick="loadPreset(${preset.id})">
                    ${translations[currentLanguage].loadPreset}
                </button>
                <button class="preset-btn delete-btn" onclick="deletePreset(${preset.id})">
                    ${translations[currentLanguage].deletePreset}
                </button>
            </div>
        </div>
    `).join('');
}

function onProductChange(product) {
    const diagramImage = document.getElementById("diagramImage");
    const diagramTitle = document.getElementById("diagramTitle");
    const inputArea = document.getElementById("dynamicInputs");

    if (!product) {
        diagramTitle.textContent = translations[currentLanguage].pleaseSelectProduct;
        diagramImage.src = "";
        diagramImage.style.display = "none";
        inputArea.innerHTML = "";
        document.getElementById("result").innerText = "";
        return;
    }

    diagramImage.src = `/diagrams/${product}.png`;
    diagramImage.style.display = "block";

    const lengthUnit = getUnitSuffix('length');
    const dimUnit = getUnitSuffix('dimension');

    const lengthLabel = translations[currentLanguage].length.replace(/\(.*\)/, '').trim();
    const diameterLabel = translations[currentLanguage].diameter.replace(/\(.*\)/, '').trim();
    const thicknessLabel = translations[currentLanguage].thickness.replace(/\(.*\)/, '').trim();
    const wallThicknessLabel = translations[currentLanguage].wallThickness.replace(/\(.*\)/, '').trim();
    const lintelThicknessLabel = translations[currentLanguage].lintelThickness.replace(/\(.*\)/, '').trim();
    const shelfThicknessLabel = translations[currentLanguage].shelfThickness.replace(/\(.*\)/, '').trim();
    const widthLabel = translations[currentLanguage].width.replace(/\(.*\)/, '').trim();
    const heightLabel = translations[currentLanguage].height.replace(/\(.*\)/, '').trim();
    const amountLabel = translations[currentLanguage].amount;

    let inputs = "";
    switch (product) {
        case "wire":
            inputs += `<div class="form-group"><label>${diameterLabel} ${dimUnit}:</label><input type="number" step="any" id="diameter" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${lengthLabel} ${lengthUnit}:</label><input type="number" step="any" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${amountLabel}:</label><input type="number" step="any" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "pipe":
            inputs += `<div class="form-group"><label>${diameterLabel} ${dimUnit}:</label><input type="number" step="any" id="diameter" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${wallThicknessLabel} ${dimUnit}:</label><input type="number" step="any" id="wallThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${lengthLabel} ${lengthUnit}:</label><input type="number" step="any" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${amountLabel}:</label><input type="number" step="any" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "square":
            inputs += `<div class="form-group"><label>${widthLabel} ${dimUnit}:</label><input type="number" step="any" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${lengthLabel} ${lengthUnit}:</label><input type="number" step="any" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${amountLabel}:</label><input type="number" step="any" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "squarePipe":
            inputs += `<div class="form-group"><label>${widthLabel} ${dimUnit}:</label><input type="number" step="any" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${heightLabel} ${dimUnit}:</label><input type="number" step="any" id="height" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${wallThicknessLabel} ${dimUnit}:</label><input type="number" step="any" id="wallThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${lengthLabel} ${lengthUnit}:</label><input type="number" step="any" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${amountLabel}:</label><input type="number" step="any" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "sheet":
            inputs += `<div class="form-group"><label>${widthLabel} ${dimUnit}:</label><input type="number" step="any" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${thicknessLabel} ${dimUnit}:</label><input type="number" step="any" id="thickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${lengthLabel} ${lengthUnit}:</label><input type="number" step="any" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${amountLabel}:</label><input type="number" step="any" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "strip":
        case "flatbar":
            inputs += `<div class="form-group"><label>${widthLabel} ${dimUnit}:</label><input type="number" step="any" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${thicknessLabel} ${dimUnit}:</label><input type="number" step="any" id="thickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${lengthLabel} ${lengthUnit}:</label><input type="number" step="any" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${amountLabel}:</label><input type="number" step="any" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "hexagon":
            inputs += `<div class="form-group"><label>${diameterLabel} ${dimUnit}:</label><input type="number" step="any" id="diameter" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${lengthLabel} ${lengthUnit}:</label><input type="number" step="any" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${amountLabel}:</label><input type="number" step="any" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "beam":
            inputs += `<div class="form-group"><label>${widthLabel} ${dimUnit}:</label><input type="number" step="any" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${heightLabel} ${dimUnit}:</label><input type="number" step="any" id="height" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${lintelThicknessLabel} ${dimUnit}:</label><input type="number" step="any" id="lintelThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${shelfThicknessLabel} ${dimUnit}:</label><input type="number" step="any" id="shelvesThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${lengthLabel} ${lengthUnit}:</label><input type="number" step="any" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${amountLabel}:</label><input type="number" step="any" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "channel":
            inputs += `<div class="form-group"><label>${widthLabel} ${dimUnit}:</label><input type="number" step="any" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${heightLabel} ${dimUnit}:</label><input type="number" step="any" id="height" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${wallThicknessLabel} ${dimUnit}:</label><input type="number" step="any" id="wallThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${lengthLabel} ${lengthUnit}:</label><input type="number" step="any" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${amountLabel}:</label><input type="number" step="any" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "corner":
            inputs += `<div class="form-group"><label>${widthLabel} ${dimUnit}:</label><input type="number" step="any" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${heightLabel} ${dimUnit}:</label><input type="number" step="any" id="height" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${wallThicknessLabel} ${dimUnit}:</label><input type="number" step="any" id="wallThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${lengthLabel} ${lengthUnit}:</label><input type="number" step="any" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label>${amountLabel}:</label><input type="number" step="any" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
    }
    inputArea.innerHTML = inputs;

    const titleElement = document.getElementById("diagramTitle");
    titleElement.innerText = translations[currentLanguage].diagram + ": " + translations[currentLanguage][product];
}

function calculateWeight() {
    const product = document.getElementById("productSelect").value;
    const metal = document.getElementById("metalSelect").value;

    if (!product) {
        showCustomAlert(translations[currentLanguage].pleaseSelectProduct);
        return;
    }

    if (!metal) {
        showCustomAlert(translations[currentLanguage].pleaseSelectMetal);
        return;
    }

    const fieldLabels = {
        diameter: translations[currentLanguage].diameter,
        width: translations[currentLanguage].width,
        height: translations[currentLanguage].height,
        thickness: translations[currentLanguage].thickness,
        wallThickness: translations[currentLanguage].wallThickness,
        lintelThickness: translations[currentLanguage].lintelThickness,
        shelvesThickness: translations[currentLanguage].shelfThickness,
        length: translations[currentLanguage].length,
        amount: translations[currentLanguage].amount
    };

    const missingFields = [];

    switch (product) {
        case "wire":
            if (!document.getElementById("diameter")?.value) missingFields.push(fieldLabels.diameter);
            if (!document.getElementById("length")?.value) missingFields.push(fieldLabels.length);
            if (!document.getElementById("amount")?.value) missingFields.push(fieldLabels.amount);
            break;
        case "pipe":
            if (!document.getElementById("diameter")?.value) missingFields.push(fieldLabels.diameter);
            if (!document.getElementById("wallThickness")?.value) missingFields.push(fieldLabels.wallThickness);
            if (!document.getElementById("length")?.value) missingFields.push(fieldLabels.length);
            if (!document.getElementById("amount")?.value) missingFields.push(fieldLabels.amount);
            break;
        case "square":
            if (!document.getElementById("width")?.value) missingFields.push(fieldLabels.width);
            if (!document.getElementById("length")?.value) missingFields.push(fieldLabels.length);
            if (!document.getElementById("amount")?.value) missingFields.push(fieldLabels.amount);
            break;
        case "squarePipe":
            if (!document.getElementById("width")?.value) missingFields.push(fieldLabels.width);
            if (!document.getElementById("height")?.value) missingFields.push(fieldLabels.height);
            if (!document.getElementById("wallThickness")?.value) missingFields.push(fieldLabels.wallThickness);
            if (!document.getElementById("length")?.value) missingFields.push(fieldLabels.length);
            if (!document.getElementById("amount")?.value) missingFields.push(fieldLabels.amount);
            break;
        case "sheet":
        case "strip":
        case "flatbar":
            if (!document.getElementById("width")?.value) missingFields.push(fieldLabels.width);
            if (!document.getElementById("thickness")?.value) missingFields.push(fieldLabels.thickness);
            if (!document.getElementById("length")?.value) missingFields.push(fieldLabels.length);
            if (!document.getElementById("amount")?.value) missingFields.push(fieldLabels.amount);
            break;
        case "hexagon":
            if (!document.getElementById("diameter")?.value) missingFields.push(fieldLabels.diameter);
            if (!document.getElementById("length")?.value) missingFields.push(fieldLabels.length);
            if (!document.getElementById("amount")?.value) missingFields.push(fieldLabels.amount);
            break;
        case "beam":
            if (!document.getElementById("width")?.value) missingFields.push(fieldLabels.width);
            if (!document.getElementById("height")?.value) missingFields.push(fieldLabels.height);
            if (!document.getElementById("lintelThickness")?.value) missingFields.push(fieldLabels.lintelThickness);
            if (!document.getElementById("shelvesThickness")?.value) missingFields.push(fieldLabels.shelvesThickness);
            if (!document.getElementById("length")?.value) missingFields.push(fieldLabels.length);
            if (!document.getElementById("amount")?.value) missingFields.push(fieldLabels.amount);
            break;
        case "channel":
        case "corner":
            if (!document.getElementById("width")?.value) missingFields.push(fieldLabels.width);
            if (!document.getElementById("height")?.value) missingFields.push(fieldLabels.height);
            if (!document.getElementById("wallThickness")?.value) missingFields.push(fieldLabels.wallThickness);
            if (!document.getElementById("length")?.value) missingFields.push(fieldLabels.length);
            if (!document.getElementById("amount")?.value) missingFields.push(fieldLabels.amount);
            break;
    }

    if (missingFields.length > 0) {
        const message = translations[currentLanguage].pleaseInput + ": " + missingFields.join(", ");
        showCustomAlert(message);
        return;
    }

    // Convert imperial to metric if needed
    const d = convertInputValue(parseInput("diameter"), 'dimension');
    const w = convertInputValue(parseInput("width"), 'dimension');
    const h = convertInputValue(parseInput("height"), 'dimension');
    const t = convertInputValue(parseInput("thickness"), 'dimension');
    const wall = convertInputValue(parseInput("wallThickness"), 'dimension');
    const middleT = convertInputValue(parseInput("lintelThickness"), 'dimension');
    const shelvesT = convertInputValue(parseInput("shelvesThickness"), 'dimension');
    const length = convertInputValue(parseInput("length"), 'length') * 100;
    const amount = parseInput("amount");

    let volume = 0;

    switch (product) {
        case "wire":
            volume = Math.PI * Math.pow(d / 20, 2) * (length / 10);
            break;
        case "pipe":
            const outerRadius = d / 2;
            const innerRadius = outerRadius - wall;
            volume = Math.PI * ((Math.pow(outerRadius / 10, 2) - Math.pow(innerRadius / 10, 2)) * (length / 10));
            break;
        case "square":
            volume = (w / 10) * (w / 10) * (length / 10);
            break;
        case "squarePipe":
            const outerArea = (w / 10) * (h / 10);
            const innerArea = ((w - 2 * wall) / 10) * ((h - 2 * wall) / 10);
            volume = (outerArea - innerArea) * (length / 10);
            break;
        case "sheet":
        case "strip":
        case "flatbar":
            volume = (w / 10) * (t / 10) * (length / 10);
            break;
        case "hexagon":
            const side = d / (2 * Math.cos(Math.PI / 6));
            const hexArea = (3 * Math.sqrt(3) / 2) * Math.pow(side / 10, 2);
            volume = hexArea * (length / 10);
            break;
        case "beam":
            const flangeArea = 2 * ((w / 10) * (shelvesT / 10));
            const webArea = (middleT / 10) * ((h - 2 * shelvesT) / 10);
            volume = (flangeArea + webArea) * (length / 10);
            break;
        case "channel":
            const baseArea = (wall / 10) * ((h - 2 * wall) / 10);
            const sideArea = 2 * ((w / 10) * (wall / 10));
            volume = (baseArea + sideArea) * (length / 10);
            break;
        case "corner":
            const vertical = (wall / 10) * (h / 10);
            const horizontal = (wall / 10) * (w / 10);
            const overlap = (wall / 10) * (wall / 10);
            volume = (vertical + horizontal - overlap) * (length / 10);
            break;
    }

    const densities = {
        copper: 8.96,
        bronze: 8.7,
        aluminum: 2.7,
        zinc: 7.14,
        tin: 7.31,
        steel: 7.85,
        lead: 11.34,
        titanium: 4.51,
        nickel: 8.9,
        brass: 8.73
    };

    const density = densities[metal] || 0;
    let weight = (volume * density * amount / 100);

    // Convert to imperial if needed
    let weightUnit = 'kg';
    if (currentUnit === 'imperial') {
        weight = weight * unitConversions.kgToLbs;
        weightUnit = 'lbs';
    }

    weight = weight.toFixed(2);

    const weightWord = translations[currentLanguage]?.weight || "Weight";
    document.getElementById("result").innerText = weightWord + ": " + weight + " " + weightUnit;
}

function parseInput(id) {
    const element = document.getElementById(id);
    if (!element) return 0;
    const raw = element.value || "0";
    const normalized = raw.replace(",", ".");
    return parseFloat(normalized);
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('lang', lang);
    translateUI();
    updateUnitButton(); // <-- FIX: update button text when language changes
    updatePresetsList();

    const product = document.getElementById("productSelect").value;
    if (product) {
        onProductChange(product);
    }
}

function translateUI() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        const translation = translations[currentLanguage]?.[key];
        if (!translation) return;

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
        } else if (el.tagName === 'OPTION') {
            el.textContent = translation;
        } else {
            el.textContent = translation;
        }
    });

    const result = document.getElementById("result");
    if (result && result.textContent) {
        if (result.textContent.includes(":")) {
            result.textContent = "";
        }
    }

    const product = document.getElementById("productSelect").value;
    const titleElement = document.getElementById("diagramTitle");

    if (product) {
        titleElement.innerText = translations[currentLanguage].diagram + ": " + translations[currentLanguage][product];
    } else {
        titleElement.innerText = translations[currentLanguage].pleaseSelectProduct;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem('lang');
    if (saved) {
        setLanguage(saved);
    } else {
        translateUI();
    }

    // Load saved unit system
    const savedUnit = localStorage.getItem('unitSystem');
    if (savedUnit) {
        currentUnit = savedUnit;
    }

    updateUnitButton();
    updatePresetsList();
});