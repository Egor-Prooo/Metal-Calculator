let currentLanguage = 'bg';

function onProductChange(product) {
    const diagramImage = document.getElementById("diagramImage");
    const diagramTitle = document.getElementById("diagramTitle");
    const inputArea = document.getElementById("dynamicInputs");

    if (!product) {
        diagramTitle.textContent = translations[currentLanguage].pleaseSelectProduct;
        diagramImage.src = "";
        diagramImage.style.display = "none";
        inputArea.innerHTML = "";
        document.getElementById("result").innerText = ``;
        return;
    }

    diagramImage.src = `/diagrams/${product}.png`;
    diagramImage.style.display = "block";

    let inputs = "";
    switch (product) {
        case "wire":
            inputs += `<div class="form-group"><label data-translate="diameter">Диаметър (mm):</label><input type="number" id="diameter" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="length">Дължина (m):</label><input type="number" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="amount">Количество:</label><input type="number" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "pipe":
            inputs += `<div class="form-group"><label data-translate="diameter">Диаметър (mm):</label><input type="number" id="diameter" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="wallThickness">Дебелина на стената (mm):</label><input type="number" id="wallThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="length">Дължина (m):</label><input type="number" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="amount">Количество:</label><input type="number" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "square":
            inputs += `<div class="form-group"><label data-translate="width">Ширина (mm):</label><input type="number" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="length">Дължина (m):</label><input type="number" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="amount">Количество:</label><input type="number" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "squarePipe":
            inputs += `<div class="form-group"><label data-translate="width">Ширина (mm):</label><input type="number" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="height">Височина (mm):</label><input type="number" id="height" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="wallThickness">Дебелина на стената (mm):</label><input type="number" id="wallThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="length">Дължина (m):</label><input type="number" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="amount">Количество:</label><input type="number" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "sheet":
            inputs += `<div class="form-group"><label data-translate="width">Ширина (mm):</label><input type="number" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="thickness">Дебелина (mm):</label><input type="number" id="thickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="length">Дължина (m):</label><input type="number" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="amount">Количество:</label><input type="number" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "strip":
        case "flatbar":
            inputs += `<div class="form-group"><label data-translate="width">Ширина (mm):</label><input type="number" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="thickness">Дебелина (mm):</label><input type="number" id="thickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="length">Дължина (m):</label><input type="number" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="amount">Количество:</label><input type="number" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "hexagon":
            inputs += `<div class="form-group"><label data-translate="diameter">Диаметър (mm):</label><input type="number" id="diameter" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="length">Дължина (m):</label><input type="number" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="amount">Количество:</label><input type="number" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "beam":
            inputs += `<div class="form-group"><label data-translate="width">Ширина (mm):</label><input type="number" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="height">Височина (mm):</label><input type="number" id="height" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="lintelThickness">Дебелина на щурца (mm):</label><input type="number" id="lintelThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="shelfThickness">Дебелина на рафтовете (mm):</label><input type="number" id="shelvesThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="length">Дължина (m):</label><input type="number" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="amount">Количество:</label><input type="number" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "channel":
            inputs += `<div class="form-group"><label data-translate="width">Ширина (mm):</label><input type="number" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="height">Височина (mm):</label><input type="number" id="height" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="wallThickness">Дебелина на стената (mm):</label><input type="number" id="wallThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="length">Дължина (m):</label><input type="number" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="amount">Количество:</label><input type="number" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
        case "corner":
            inputs += `<div class="form-group"><label data-translate="width">Ширина (mm):</label><input type="number" id="width" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="height">Височина (mm):</label><input type="number" id="height" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="wallThickness">Дебелина на стената (mm):</label><input type="number" id="wallThickness" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="length">Дължина (m):</label><input type="number" id="length" class="form-control" autocomplete="off"/></div>`;
            inputs += `<div class="form-group"><label data-translate="amount">Количество:</label><input type="number" id="amount" class="form-control" autocomplete="off"/></div>`;
            break;
    }
    inputArea.innerHTML = inputs;
    translateUI();

    // Update diagram title with translation
    const titleElement = document.getElementById("diagramTitle");
    titleElement.innerText = translations[currentLanguage].diagram + ": " + translations[currentLanguage][product];
}

function calculateWeight() {
    const product = document.getElementById("productSelect").value;
    const metal = document.getElementById("metalSelect").value;

    const d = parseInput("diameter");
    const w = parseInput("width");
    const h = parseInput("height");
    const t = parseInput("thickness");
    const wall = parseInput("wallThickness");
    const middleT = parseInput("lintelThickness");
    const shelvesT = parseInput("shelvesThickness");
    const length = parseInput("length") * 100;
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
    const weight = (volume * density * amount / 100).toFixed(2);

    // Use translated "Weight" word
    const weightWord = translations[currentLanguage].weight || "Тегло";
    document.getElementById("result").innerText = `${weightWord}: ${weight} kg`;
}

function parseInput(id) {
    const raw = document.getElementById(id)?.value || "0";
    const normalized = raw.replace(",", ".");
    return parseFloat(normalized);
}

function setLanguage(lang) {
    currentLanguage = lang;

    // Save preference in local storage
    localStorage.setItem('lang', lang);

    translateUI();

    // Refresh product display if one is selected
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

    // Clear result when language changes
    const result = document.getElementById("result");
    if (result && result.textContent) {
        // Only clear if it contains weight data
        if (result.textContent.includes(":")) {
            result.textContent = "";
        }
    }

    // Update diagram title
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
        translateUI(); // Default language
    }
});