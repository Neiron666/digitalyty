(function () {
    const items = Array.from(document.querySelectorAll("#faq .faq-item"));
    const qs = items.map((i) => i.querySelector(".faq-question"));
    const ans = items.map((i) => i.querySelector(".faq-answer"));

    function closeAll(except) {
        items.forEach((it) => {
            if (it !== except) {
                it.classList.remove("active");
                const panel = it.querySelector(".faq-answer");
                panel.style.maxHeight = "0px";
                it.querySelector(".faq-question").setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        });
    }

    function toggle(item) {
        const panel = item.querySelector(".faq-answer");
        const btn = item.querySelector(".faq-question");
        const isOpen = item.classList.contains("active");

        if (isOpen) {
            item.classList.remove("active");
            panel.style.maxHeight = "0px";
            btn.setAttribute("aria-expanded", "false");
        } else {
            closeAll(item);
            item.classList.add("active");
            // сначала сброс, потом выставляем фактическую высоту контента
            panel.style.maxHeight = panel.scrollHeight + "px";
            btn.setAttribute("aria-expanded", "true");
        }
    }

    // Инициализация: на случай большого контента пересчитываем высоты при ресайзе
    qs.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const item = e.currentTarget.closest(".faq-item");
            toggle(item);
        });
    });

    window.addEventListener("resize", () => {
        const open = document.querySelector(
            "#faq .faq-item.active .faq-answer"
        );
        if (open) {
            open.style.maxHeight = open.scrollHeight + "px";
        }
    });

    toggle(items[0]);
})();
