// 🔹 nav.js — управление гамбургер-меню и прозрачность навигации при прокрутке

document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.getElementById("hamburger-toggle");
    const navLinks = document.getElementById("nav__menu");
    const links = document.querySelectorAll(".nav__menu-link");

    // Переключение состояния меню по клику на гамбургер
    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        hamburger.classList.toggle("active");

        if (!navLinks.classList.contains("active")) {
            links.forEach((link) => link.classList.remove("active"));
        }
    });

    // Подсветка активной ссылки при клике
    links.forEach((link) => {
        link.addEventListener("click", function (e) {
            links.forEach((l) => l.classList.remove("active"));
            this.classList.add("active");
            e.stopPropagation();
        });
    });

    // Добавление класса прозрачности при скролле вниз
    const navbar = document.querySelector(".main-nav");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
});
