(() => {
    const video = document.getElementById("bgVideo");
    const btn = document.getElementById("videoToggleBtn");

    // Если пользователь предпочитает меньше анимаций — не автоплеим
    const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );
    const honorReducedMotion = () => {
        if (prefersReduced.matches) {
            // Останавливаем и убираем autoplay, чтобы видео не стартовало повторно
            video.pause();
            video.removeAttribute("autoplay");
            updateUI();
        }
    };
    prefersReduced.addEventListener?.("change", honorReducedMotion);
    honorReducedMotion();

    function updateUI() {
        const paused = video.paused;
        btn.setAttribute("aria-pressed", String(!paused));
        // Текст кнопки: если пауза — показать «נגן וידאו», иначе «עצור וידאו»
        btn.textContent = paused ? "▶︎ נגן וידאו" : "⏸︎ עצור וידאו";
        btn.setAttribute("aria-label", paused ? "נגן וידאו" : "השהה וידאו");
    }

    btn.addEventListener("click", () => {
        if (video.paused) {
            video.play().catch(() => {
                /* игнорируем, если браузер блокирует */
            });
        } else {
            video.pause();
        }
        updateUI();
    });

    // На всякий случай обновим UI после загрузки метаданных
    video.addEventListener("loadedmetadata", updateUI);
    // И при автоматическом старте
    video.addEventListener("play", updateUI);
    video.addEventListener("pause", updateUI);

    // Инициализация
    updateUI();
})();
