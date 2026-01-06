/* Main navigation interactions for desktop/mobile */

document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger-toggle");
    const navMenu = document.getElementById("nav__menu");
    const navLinks = document.querySelectorAll(".nav__menu-link");
    const submenuToggles = document.querySelectorAll(".nav__menu-link--toggle");
    const mobileQuery = window.matchMedia("(max-width: 1000px)");

    const closeAllSubmenus = () => {
        document.querySelectorAll(".nav__menu-item--open").forEach((item) => {
            item.querySelector(".nav__submenu")?.style.setProperty(
                "--submenu-target-height",
                "0px"
            );
            item.classList.remove("nav__menu-item--open");
            item
                .querySelector(".nav__menu-link--toggle")
                ?.setAttribute("aria-expanded", "false");
        });
    };

    const closeMenu = () => {
        navMenu?.classList.remove("active");
        hamburger?.classList.remove("active");
        hamburger?.setAttribute("aria-expanded", "false");
        closeAllSubmenus();
    };

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            const isActive = navMenu.classList.toggle("active");
            hamburger.classList.toggle("active", isActive);
            hamburger.setAttribute("aria-expanded", isActive ? "true" : "false");
            if (!isActive) closeAllSubmenus();
        });
    }

    submenuToggles.forEach((toggle) => {
        const menuItem = toggle.closest(".nav__menu-item--has-submenu");
        const submenu = menuItem?.querySelector(".nav__submenu");
        if (!menuItem || !submenu) return;

        toggle.setAttribute("aria-expanded", "false");

        toggle.addEventListener("click", (event) => {
            event.preventDefault();
            const shouldOpen = !menuItem.classList.contains("nav__menu-item--open");
            closeAllSubmenus();

            if (shouldOpen) {
                menuItem.classList.add("nav__menu-item--open");
                toggle.setAttribute("aria-expanded", "true");

                if (!mobileQuery.matches) {
                    submenu.style.setProperty(
                        "--submenu-target-height",
                        `${submenu.scrollHeight}px`
                    );
                }
            } else {
                submenu.style.setProperty("--submenu-target-height", "0px");
            }
        });

        submenu.addEventListener("transitionend", () => {
            if (!menuItem.classList.contains("nav__menu-item--open")) {
                submenu.style.setProperty("--submenu-target-height", "0px");
            }
        });

        submenu.addEventListener("click", (event) => {
            if (!event.target.closest("a, button")) return;
            closeAllSubmenus();
            if (mobileQuery.matches) closeMenu();
        });
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (link.classList.contains("nav__menu-link--toggle")) return;
            navLinks.forEach((item) => item.classList.remove("active"));
            link.classList.add("active");
            if (mobileQuery.matches) closeMenu();
        });
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".main-nav")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    const handleViewportChange = () => {
        if (!mobileQuery.matches) {
            closeAllSubmenus();
        }
    };

    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener("change", handleViewportChange);
    } else if (mobileQuery.addListener) {
        mobileQuery.addListener(handleViewportChange);
    }

    const navbar = document.querySelector(".main-nav");
    if (navbar) {
        const syncNavState = () => {
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        };
        window.addEventListener("scroll", syncNavState);
        syncNavState();
    }
});