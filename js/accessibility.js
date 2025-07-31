// 🔹 accessibility.js — функциональность доступности для пользователей

const widgetToggle = document.getElementById("accessibility-toggle");
const menu = document.getElementById("accessibility-menu");
let fontSize = 100;
let highContrast = false;
let linksHighlighted = false;
let animationsOff = false;
let linksUnderlined = false;
let headingsUnderlined = false;

widgetToggle?.addEventListener("click", toggleMenu);

function toggleMenu() {
    const expanded = widgetToggle.getAttribute("aria-expanded") === "true";
    widgetToggle.setAttribute("aria-expanded", !expanded);
    if (!expanded) {
        menu.classList.add("show");
        menu.querySelector("button").focus();
    } else {
        menu.classList.remove("show");
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("show")) {
        widgetToggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("show");
        widgetToggle.focus();
    }

    const buttons = [...menu.querySelectorAll("button")];
    const index = buttons.indexOf(document.activeElement);

    if (e.key === "ArrowDown") {
        e.preventDefault();
        buttons[(index + 1) % buttons.length].focus();
    }

    if (e.key === "ArrowUp") {
        e.preventDefault();
        buttons[(index - 1 + buttons.length) % buttons.length].focus();
    }
});

function increaseFontSize() {
    fontSize += 10;
    document.documentElement.style.fontSize = fontSize + "%";
}
function decreaseFontSize() {
    fontSize -= 10;
    document.documentElement.style.fontSize = fontSize + "%";
}
function toggleContrast() {
    highContrast = !highContrast;
    const wrapper = document.getElementById("site-wrapper");
    if (wrapper) wrapper.style.filter = highContrast ? "invert(100%) hue-rotate(180deg)" : "";
}
function highlightLinks() {
    linksHighlighted = !linksHighlighted;
    document.querySelectorAll("a").forEach((link) => {
        link.style.outline = linksHighlighted ? "2px solid red" : "";
        link.style.backgroundColor = linksHighlighted ? "yellow" : "";
    });
}
function toggleAnimations() {
    animationsOff = !animationsOff;
    const style = document.createElement("style");
    style.id = "disable-animations";
    style.innerHTML = "* { animation: none !important; transition: none !important; }";
    if (animationsOff) {
        document.head.appendChild(style);
    } else {
        document.getElementById("disable-animations")?.remove();
    }
}
function underlineLinks() {
    linksUnderlined = !linksUnderlined;
    document.querySelectorAll("a").forEach((link) => {
        link.style.textDecoration = linksUnderlined ? "underline" : "";
    });
}
function underlineHeadings() {
    headingsUnderlined = !headingsUnderlined;
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        h.style.textDecoration = headingsUnderlined ? "underline" : "";
    });
}
function resetAccessibility() {
    fontSize = 100;
    document.documentElement.style.fontSize = "";
    document.getElementById("site-wrapper")?.style.removeProperty("filter");
    document.querySelectorAll("a").forEach((link) => {
        link.style = "";
    });
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        h.style.textDecoration = "";
    });
    document.getElementById("disable-animations")?.remove();
    highContrast = false;
    linksHighlighted = false;
    animationsOff = false;
    linksUnderlined = false;
    headingsUnderlined = false;
}
