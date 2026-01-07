(() => {
    if (!("serviceWorker" in navigator)) return;

    // Register after load to avoid blocking critical rendering
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js").catch((err) => {
            console.error("SW registration failed:", err);
        });
    });
})();
