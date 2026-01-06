// /js/strip-trackers.js
(function () {
    // 1) опционально сохраним значения, если вдруг понадобятся позже
    const url = new URL(location.href);
    const p = url.searchParams;
    const interesting = [
        "fbclid",
        "gclid",
        "msclkid",
        "yclid",
        "twclid",
        "igshid",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
    ];
    interesting.forEach((k) => {
        if (p.has(k)) sessionStorage.setItem("qp." + k, p.get(k));
    });

    // 2) ждём полной загрузки страницы, потом ещё чуть-чуть — чтобы теги успели отстрелить
    window.addEventListener("load", () => {
        setTimeout(() => {
            let changed = false;

            // убрать конкретные метки
            [
                "fbclid",
                "sfnsn",
                "gclid",
                "msclkid",
                "yclid",
                "twclid",
                "igshid",
            ].forEach((k) => {
                if (p.has(k)) {
                    p.delete(k);
                    changed = true;
                }
            });

            // убрать любые utm_*
            for (const k of [...p.keys()]) {
                if (/^utm_/i.test(k)) {
                    p.delete(k);
                    changed = true;
                }
            }

            if (changed) {
                const q = p.toString();
                const clean = url.pathname + (q ? "?" + q : "") + url.hash;
                history.replaceState({}, document.title, clean);
            }
        }, 1200); // 1.2 c — обычно достаточно для GA4/Pixel
    });
})();
