// Аккордеон TOC
(function () {
    const toggle = document.querySelector(".toc__toggle");
    const panel = document.getElementById("toc-panel");
    if (!toggle || !panel) return;

    function openPanel() {
        toggle.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        panel.classList.add("is-open");
    }
    function closePanel() {
        toggle.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
        // ждём окончания анимации, потом скрываем для a11y
        setTimeout(() => {
            panel.hidden = true;
        }, 220);
    }

    toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        expanded ? closePanel() : openPanel();
    });

    // Подсветка текущего раздела
    const links = [...document.querySelectorAll(".toc__link")];
    const map = new Map(
        links
            .filter((a) => a.hash && document.querySelector(a.hash))
            .map((a) => [a.hash, a])
    );
    if (map.size) {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = "#" + entry.target.id;
                    const link = map.get(id);
                    if (!link) return;
                    if (entry.isIntersecting) {
                        links.forEach((l) => l.classList.remove("is-active"));
                        link.classList.add("is-active");
                    }
                });
            },
            { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
        );

        map.forEach((_, hash) => {
            const el = document.querySelector(hash);
            if (el) obs.observe(el);
        });
    }

    // Закрывать панель после клика на пункт (опционально)
    document.addEventListener("click", (e) => {
        if (e.target.closest(".toc__link")) {
            closePanel();
        }
    });
})();
// Конец аккордеона TOC
