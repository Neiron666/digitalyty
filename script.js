// script.js (safe / no-crash version)

// -----------------------------
// Navbar transparency on scroll
// -----------------------------
(() => {
    const navbar = document.querySelector(".main-nav");
    if (!navbar) return;

    const onScroll = () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set initial state
})();

// -----------------------------
// Restart page - go to top
// (Do NOT break anchor links or browser back/forward scroll restore)
// -----------------------------
(() => {
    window.addEventListener("load", () => {
        // If there is a hash (#section) - keep browser behavior
        if (location.hash) return;

        // If browser wants to restore scroll position (back/forward), don't fight it
        // Best-effort: modern browsers expose scrollRestoration
        if (
            "scrollRestoration" in history &&
            history.scrollRestoration === "auto"
        ) {
            // We intentionally do nothing.
            return;
        }

        // If you still want "always go top on load", uncomment next line:
        // window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
})();

// -----------------------------
// "Scroll to top" button show/hide
// -----------------------------
(() => {
    const button = document.getElementById("scrollToTop");
    if (!button) return;

    const onScroll = () => {
        button.style.display = window.scrollY > 300 ? "block" : "none";
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
})();

// -----------------------------
// Netlify form submit (safe)
// -----------------------------
(() => {
    const form = document.querySelector(".contact__form");
    if (!form) return;

    const message = document.getElementById("form-message");

    const showMessage = () => {
        if (!message) return;
        message.style.display = "block";
        // auto-hide after 5s
        setTimeout(() => {
            if (!message) return;
            message.style.display = "none";
        }, 5000);
    };

    const encode = (formEl) => {
        const formData = new FormData(formEl);
        return new URLSearchParams(formData).toString();
    };

    async function handleFormSubmit(event) {
        event.preventDefault();

        try {
            const res = await fetch("/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: encode(form),
            });

            // Netlify often returns 200/302; we treat ok-ish responses as success
            if (!res.ok && res.status !== 302) {
                throw new Error(`Form submit failed: ${res.status}`);
            }

            showMessage();
            form.reset();
        } catch (error) {
            alert("אירעה שגיאה בשליחה, נסה שוב מאוחר יותר.");
            console.error("Form submit error:", error);
        }
    }

    form.addEventListener("submit", handleFormSubmit);
})();

// -----------------------------
// Pause video if user prefers reduced motion
// -----------------------------
(() => {
    const v = document.querySelector(".header__bg-video");
    if (!v) return;

    const m = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
        if (m.matches && !v.paused) v.pause();
    };

    if (typeof m.addEventListener === "function") {
        m.addEventListener("change", apply);
    } else if (typeof m.addListener === "function") {
        // Safari legacy
        m.addListener(apply);
    }

    apply();
})();
