document.addEventListener("DOMContentLoaded", function () {
    // Получаем кнопку-гамбургер и меню навигации
    const hamburger = document.getElementById("hamburger-toggle");
    const navLinks = document.getElementById("nav__menu");
    const links = document.querySelectorAll(".nav__menu-link");

    // Открытие/закрытие меню по клику на гамбургер
    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        hamburger.classList.toggle("active"); // <-- вот эта строка важна!

        if (!navLinks.classList.contains("active")) {
            links.forEach((link) => link.classList.remove("active"));
        }
    });

    // Клик по ссылке — активируем только её
    links.forEach((link) => {
        link.addEventListener("click", function (e) {
            links.forEach((l) => l.classList.remove("active"));
            this.classList.add("active");
            e.stopPropagation(); // чтобы клик не всплывал до body
        });
    });
});

// Скролл нав бара прозрачность
window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".main-nav");
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

//accessibility

const widgetToggle = document.getElementById("accessibility-toggle");
const menu = document.getElementById("accessibility-menu");
let fontSize = 100;
let highContrast = false;
let linksHighlighted = false;
let animationsOff = false;
let linksUnderlined = false;
let headingsUnderlined = false;

widgetToggle.addEventListener("click", toggleMenu);

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

    const focusableButtons = [...menu.querySelectorAll("button")];
    const currentIndex = focusableButtons.indexOf(document.activeElement);

    if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (currentIndex + 1) % focusableButtons.length;
        focusableButtons[next].focus();
    }

    if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev =
            (currentIndex - 1 + focusableButtons.length) %
            focusableButtons.length;
        focusableButtons[prev].focus();
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
    if (wrapper) {
        wrapper.style.filter = highContrast
            ? "invert(100%) hue-rotate(180deg)"
            : "";
    }
}

function highlightLinks() {
    linksHighlighted = !linksHighlighted;
    document.querySelectorAll("a").forEach((link) => {
        link.style.outline = linksHighlighted ? "2px solid #f00" : "";
        link.style.backgroundColor = linksHighlighted ? "#ff0" : "";
    });
}

function toggleAnimations() {
    animationsOff = !animationsOff;
    const style = document.createElement("style");
    style.id = "disable-animations";
    style.innerHTML =
        "* { animation: none !important; transition: none !important; }";
    if (animationsOff) {
        document.head.appendChild(style);
    } else {
        const existing = document.getElementById("disable-animations");
        if (existing) existing.remove();
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

    const wrapper = document.getElementById("site-wrapper");
    if (wrapper) wrapper.style.filter = "";

    document.querySelectorAll("a").forEach((link) => {
        link.style.outline = "";
        link.style.backgroundColor = "";
        link.style.textDecoration = "";
    });

    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        h.style.textDecoration = "";
    });

    const existing = document.getElementById("disable-animations");
    if (existing) existing.remove();

    highContrast = false;
    linksHighlighted = false;
    animationsOff = false;
    linksUnderlined = false;
    headingsUnderlined = false;
}
// restart page  - go to top
window.addEventListener("load", () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 10);
});

// Стрелка вверх
window.addEventListener("scroll", function () {
    const button = document.getElementById("scrollToTop");
    if (window.scrollY > 300) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
});

const form = document.querySelector(".contact__form");
const message = document.getElementById("form-message");

//Отправка формы + показ сообщения отправителю

function handleFormSubmit(event) {
    event.preventDefault(); // предотвращаем стандартное поведение

    // создаём объект данных формы
    //FormData(form) - Берёт HTML-элемент формы,Сканирует все поля внутри этой формы (<input>, <select>, <textarea>), у которых есть атрибут name
    //Создаёт объект, содержащий пары name=value.
    const formData = new FormData(form);

    // отправляем данные на Netlify
    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        //Преобразует данные формы (объект FormData) в формат ключ=значение
        //Превращает это в строку, готовую для отправки в теле запроса.
        body: new URLSearchParams(formData).toString(),
    })
        .then(() => {
            // Показываем сообщение
            message.style.display = "block";

            // Очищаем форму
            form.reset();

            // Через 5 секунд скрываем сообщение (опционально)
            setTimeout(() => {
                message.style.display = "none";
            }, 5000);
        })
        .catch((error) => {
            alert("אירעה שגיאה בשליחה, נסה שוב מאוחר יותר.");
            console.error("Ошибка:", error);
        });
}

if (form) {
    form.addEventListener("submit", handleFormSubmit);
}

//Регистрация service-worker.js в script.js
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("🟢 Service Worker registered"))
        .catch((err) => console.error("🔴 SW registration failed:", err));
}
