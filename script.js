// Скролл нав бара прозрачность
window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".main-nav");
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

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
// Pause video if user prefers reduced motion
(() => {
    const v = document.querySelector(".header__bg-video");
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
        if (m.matches && !v.paused) v.pause();
    };

    m.addEventListener
        ? m.addEventListener("change", apply)
        : m.addListener(apply);
    apply();
})();
