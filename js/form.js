// 🔹 form.js — отправка формы и отображение сообщения пользователю

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".contact__form");
    const message = document.getElementById("form-message");

    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(form);

        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString(),
        })
            .then(() => {
                message.style.display = "block";
                form.reset();
                setTimeout(() => {
                    message.style.display = "none";
                }, 5000);
            })
            .catch((error) => {
                alert("אירעה שגיאה בשליחה, נסה שוב מאוחר יותר.");
                console.error("Ошибка:", error);
            });
    });
});
