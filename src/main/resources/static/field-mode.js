(function () {
    const STORAGE_KEY = "livestock-field-drafts";

    function getDrafts() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch {
            return [];
        }
    }

    function saveDrafts(drafts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
        renderDrafts();
        updateOnlineStatus();
    }

    function escapeHtml(value) {
        if (value === null || value === undefined) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function collectFormData(form) {
        const data = {};

        new FormData(form).forEach((value, key) => {
            data[key] = value;
        });

        const mortality = document.getElementById("mortalityReported");

        if (mortality) {
            data.mortalityReported =
                mortality.type === "checkbox"
                    ? mortality.checked
                    : mortality.value === "true";
        }

        return data;
    }

    function createDraft(type, form) {
        const data = collectFormData(form);

        const draft = {
            id: "draft-" + Date.now(),
            type,
            data,
            createdAt: new Date().toISOString(),
            status: "PENDING"
        };

        const drafts = getDrafts();
        drafts.unshift(draft);
        saveDrafts(drafts);

        showFieldMessage(
            `${type === "livestock" ? "Animal registration" : "Health report"} saved offline.`,
            "success"
        );
    }

    function showFieldMessage(message, type) {
        let box = document.getElementById("fieldModeMessage");

        if (!box) return;

        box.className = "field-mode-message " + type;
        box.textContent = message;

        clearTimeout(window.fieldMessageTimer);

        window.fieldMessageTimer = setTimeout(() => {
            box.textContent = "";
            box.className = "field-mode-message";
        }, 4000);
    }

    function renderDrafts() {
        const container = document.getElementById("fieldDraftList");

        if (!container) return;

        const drafts = getDrafts();

        if (drafts.length === 0) {
            container.innerHTML = `
                <div class="field-empty">
                    ✓ No offline drafts
                </div>
            `;
            return;
        }

        container.innerHTML = drafts.map(draft => `
            <div class="field-draft-card">
                <div>
                    <strong>
                        ${draft.type === "livestock"
            ? "🐄 Animal Registration"
            : "🩺 Health Report"}
                    </strong>

                    <small>
                        ${new Date(draft.createdAt).toLocaleString()}
                    </small>
                </div>

                <div class="field-draft-actions">
                    <button
                        class="field-sync-one"
                        data-id="${escapeHtml(draft.id)}">
                        Sync
                    </button>

                    <button
                        class="field-delete-one"
                        data-id="${escapeHtml(draft.id)}">
                        Delete
                    </button>
                </div>
            </div>
        `).join("");

        document.querySelectorAll(".field-sync-one").forEach(button => {
            button.addEventListener("click", () => {
                syncDraft(button.dataset.id);
            });
        });

        document.querySelectorAll(".field-delete-one").forEach(button => {
            button.addEventListener("click", () => {
                deleteDraft(button.dataset.id);
            });
        });
    }

    function deleteDraft(id) {
        const drafts = getDrafts().filter(draft => draft.id !== id);
        saveDrafts(drafts);
    }

    async function syncDraft(id) {
        if (!navigator.onLine) {
            showFieldMessage(
                "No internet connection. Draft kept safely on this device.",
                "error"
            );
            return;
        }

        const drafts = getDrafts();
        const draft = drafts.find(item => item.id === id);

        if (!draft) return;

        try {
            let endpoint = "";
            let payload = { ...draft.data };

            if (draft.type === "livestock") {
                endpoint = "/api/livestock";

                payload.age = Number(payload.age || 0);

                if (payload.latitude !== "") {
                    payload.latitude = Number(payload.latitude);
                }

                if (payload.longitude !== "") {
                    payload.longitude = Number(payload.longitude);
                }
            }

            if (draft.type === "health") {
                endpoint = "/api/health-records";

                payload.livestockId = Number(payload.livestockId);
                payload.temperature = Number(payload.temperature || 0);
                payload.mortalityReported =
                    payload.mortalityReported === true ||
                    payload.mortalityReported === "true";
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Server rejected draft");
            }

            const updatedDrafts =
                getDrafts().filter(item => item.id !== id);

            saveDrafts(updatedDrafts);

            showFieldMessage(
                "Draft synced successfully.",
                "success"
            );

            if (typeof loadData === "function") {
                setTimeout(() => loadData(), 500);
            }

        } catch (error) {
            console.error("Draft sync failed:", error);

            showFieldMessage(
                "Sync failed. Draft remains محفوظ safely on this device.",
                "error"
            );
        }
    }

    async function syncAllDrafts() {
        if (!navigator.onLine) {
            showFieldMessage(
                "You are offline. Connect to the internet first.",
                "error"
            );
            return;
        }

        const drafts = [...getDrafts()];

        if (drafts.length === 0) {
            showFieldMessage(
                "No drafts waiting for synchronization.",
                "success"
            );
            return;
        }

        for (const draft of drafts) {
            await syncDraft(draft.id);
        }
    }

    function updateOnlineStatus() {
        const indicator = document.getElementById("fieldNetworkStatus");
        const label = document.getElementById("fieldNetworkLabel");

        if (!indicator || !label) return;

        if (navigator.onLine) {
            indicator.classList.remove("offline");
            indicator.classList.add("online");
            label.textContent = "Online";
        } else {
            indicator.classList.remove("online");
            indicator.classList.add("offline");
            label.textContent = "Offline Mode";
        }

        const count = getDrafts().length;

        const countElement =
            document.getElementById("fieldDraftCount");

        if (countElement) {
            countElement.textContent =
                `${count} offline draft${count === 1 ? "" : "s"}`;
        }
    }

    function createFieldPanel() {
        if (document.getElementById("fieldModeSection")) return;

        const livestockForm =
            document.getElementById("livestockForm");

        if (!livestockForm) return;

        const section = document.createElement("section");

        section.id = "fieldModeSection";
        section.className = "field-mode-section";

        section.innerHTML = `
            <div class="section-heading field-heading">
                <div>
                    <span class="section-label">
                        FIELD WORKER MODE
                    </span>

                    <h2>📱 Mobile / Offline Workflow</h2>

                    <p>
                        Capture animal and health information even when
                        network connectivity is unavailable.
                    </p>
                </div>

                <div
                    id="fieldNetworkStatus"
                    class="field-network-status online">

                    <span class="status-dot"></span>

                    <span id="fieldNetworkLabel">
                        Online
                    </span>
                </div>
            </div>

            <div class="field-mode-grid">

                <div class="field-mode-card">

                    <div class="field-card-icon">
                        📝
                    </div>

                    <h3>Save Offline</h3>

                    <p>
                        Store field data safely on the device and
                        synchronize it when connectivity returns.
                    </p>

                    <div class="field-actions">

                        <button
                            id="saveLivestockOffline"
                            class="field-primary-button">
                            🐄 Save Animal Offline
                        </button>

                        <button
                            id="saveHealthOffline"
                            class="field-secondary-button">
                            🩺 Save Health Report Offline
                        </button>

                    </div>

                </div>

                <div class="field-mode-card">

                    <div class="field-card-icon">
                        🔄
                    </div>

                    <h3>Synchronization</h3>

                    <p>
                        Pending field reports are kept locally until
                        they can be uploaded to the central system.
                    </p>

                    <div class="field-sync-status">
                        <strong id="fieldDraftCount">
                            0 offline drafts
                        </strong>
                    </div>

                    <button
                        id="syncAllFieldDrafts"
                        class="field-sync-button">
                        🔄 Sync All Drafts
                    </button>

                </div>

            </div>

            <div
                id="fieldModeMessage"
                class="field-mode-message">
            </div>

            <div class="field-drafts-wrapper">

                <div class="field-drafts-header">

                    <div>
                        <span class="section-label">
                            LOCAL QUEUE
                        </span>

                        <h3>Pending Field Reports</h3>
                    </div>

                </div>

                <div
                    id="fieldDraftList"
                    class="field-draft-list">
                </div>

            </div>
        `;

        const healthForm =
            document.getElementById("healthForm");

        healthForm.insertAdjacentElement(
            "afterend",
            section
        );

        document
            .getElementById("saveLivestockOffline")
            .addEventListener("click", () => {
                createDraft(
                    "livestock",
                    livestockForm
                );
            });

        document
            .getElementById("saveHealthOffline")
            .addEventListener("click", () => {
                createDraft(
                    "health",
                    healthForm
                );
            });

        document
            .getElementById("syncAllFieldDrafts")
            .addEventListener(
                "click",
                syncAllDrafts
            );

        renderDrafts();
        updateOnlineStatus();
    }

    function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) return;

        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("/sw.js")
                .then(() => {
                    console.log(
                        "Field Mode service worker registered."
                    );
                })
                .catch(error => {
                    console.warn(
                        "Service worker registration failed:",
                        error
                    );
                });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
            createFieldPanel();
            updateOnlineStatus();
        }, 1000);

        window.addEventListener(
            "online",
            () => {
                updateOnlineStatus();

                showFieldMessage(
                    "Connection restored. Pending drafts are ready to sync.",
                    "success"
                );
            }
        );

        window.addEventListener(
            "offline",
            () => {
                updateOnlineStatus();

                showFieldMessage(
                    "Internet disconnected. Field Mode is active.",
                    "error"
                );
            }
        );

        setInterval(updateOnlineStatus, 2000);

        registerServiceWorker();
    });
})();