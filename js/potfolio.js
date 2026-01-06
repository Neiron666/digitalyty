(function initAutoScroll() {
    const frames = document.querySelectorAll("[data-auto-scroll]");
    frames.forEach((frame) => {
        const speed = Number(frame.getAttribute("data-speed")) || 100; // px/sec
        const screen = frame.querySelector(".screen");
        const img = frame.querySelector(".screen__content");
        const hint = frame.querySelector(".hint");

        let raf = null;
        let state = { y: 0, playing: false };

        function maxOffset() {
            const screenH = screen.clientHeight;
            const imgH = img.naturalHeight || img.clientHeight;
            return Math.max(0, imgH - screenH);
        }

        function play() {
            if (state.playing) return;
            state.playing = true;
            if (hint) hint.style.display = "none";

            let last = performance.now();
            function tick(now) {
                const dt = (now - last) / 1000; // שניות
                last = now;
                const max = maxOffset();

                state.y = Math.min(max, state.y + speed * dt);
                img.style.transform = `translateY(${-state.y}px)`;

                if (state.playing) raf = requestAnimationFrame(tick);
            }
            raf = requestAnimationFrame(tick);
        }

        function stopAndReturn() {
            if (!state.playing) return;
            state.playing = false;
            if (raf) cancelAnimationFrame(raf);
            state.y = 0;
            img.style.transform = "translateY(0)";
            if (hint) hint.style.display = "";
        }

        frame.addEventListener("mouseenter", play);
        frame.addEventListener("mouseleave", stopAndReturn);

        let touchPlaying = false;
        frame.addEventListener(
            "touchstart",
            () => {
                if (touchPlaying) {
                    stopAndReturn();
                    touchPlaying = false;
                } else {
                    play();
                    touchPlaying = true;
                }
            },
            { passive: true }
        );

        window.addEventListener("visibilitychange", () => {
            if (document.hidden) stopAndReturn();
        });
    });
})();
