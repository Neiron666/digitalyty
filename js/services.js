// TOC accordion (класс .is-open согласно твоему CSS)
(() => {
    const btn = document.querySelector(".toc__toggle");
    const panel = document.getElementById("toc-panel");
    if (!btn || !panel) return;

    // старт: закрыто
    panel.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") = "true";
        btn.setAttribute("aria-expanded", String(!open));
        panel.classList.toggle("is-open", !open);
    });
})();

// Active link on scroll (подсветка .is-active)
(() => {
    const links = [...document.querySelectorAll(".toc__link")];
    if (!links.length) return;
    const map = new Map(
        links
            .map((a) => [a.getAttribute("href")?.slice(1), a])
            .filter(([id]) => id && document.getElementById(id))
    );

    const obs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const id = entry.target.id;
                const link = map.get(id);
                if (!link) return;
                if (entry.isIntersecting) {
                    links.forEach((l) => l.classList.remove("is-active"));
                    link.classList.add("is-active");
                }
            });
        },
        {
            rootMargin: "-20% 0px -60% 0px", // триггерим ближе к верхней части экрана
            threshold: 0.01,
        }
    );

    map.forEach((_, id) => obs.observe(document.getElementById(id)));

    // плавный скролл + корректный фокус
    document.addEventListener("click", (e) => {
        const a = e.target.closest(".toc__link");
        if (!a) return;
        const id = a.getAttribute("href").slice(1);
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
    });
})();
