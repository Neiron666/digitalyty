// 🔹 scrollTop.js — отображение кнопки "вверх" и автоскролл на верх при загрузке

// При загрузке страницы скроллим вверх
window.addEventListener("load", () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 10);
});

// Появление кнопки "наверх" при скролле вниз
window.addEventListener("scroll", () => {
    const button = document.getElementById("scrollToTop");
    if (button) {
        button.style.display = window.scrollY > 300 ? "block" : "none";
    }
});
