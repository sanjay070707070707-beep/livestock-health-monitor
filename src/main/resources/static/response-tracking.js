document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        createResponseTracking();
        updateResponseTracking();
    }, 900);
});

function createResponseTracking() {
    if (document.getElementById("responseTracking")) return;

    const emergencySection = document.getElementById("emergencyAlertCenter");

    if (!emergencySection) return;

    const section = document.createElement("section");
    section.id = "responseTracking";
    section.className = "response-tracking-section";

    section.innerHTML = `
        <div class="section-heading">
            <span class="section-kicker">Field Operations</span>
            <h2>Veterinary Response Tracking</h2>
            <p>Track veterinary actions for high-risk livestock cases.</p>
        </div>

        <div class="response-summary">
            <div class="response-stat">
                <span>Pending</span>
                <strong id="pendingResponseCount">0</strong>
            </div>

            <div class="response-stat">
                <span>In Progress</span>
                <strong id="progressResponseCount">0</strong>
            </div>

            <div class="response-stat">
                <span>Completed</span>
                <strong id="completedResponseCount">0</strong>
            </div>
        </div>

        <div id="responseTrackingList" class="response-tracking-list"></div>
    `;

    emergencySection.insertAdjacentElement("afterend", section);
}

function updateResponseTracking() {
    const container = document.getElementById("responseTrackingList");

    if (!container) return;

    if (
        typeof livestockData === "undefined" ||
        typeof healthRecordsData === "undefined"
    ) {
        return;
    }

    const cases = healthRecordsData
        .filter(record => {
            const status = String(record.healthStatus || "").toUpperCase();

            return (
                status.includes("HIGH RISK") ||
                status.includes("AT RISK")
            );
        })
        .map(record => {
            const animal = livestockData.find(
                item => Number(item.id) === Number(record.livestockId)
            );

            return {
                id: record.id,
                tag: animal?.tagNumber || "Unknown",
                animal: animal?.animalType || "Unknown",
                village: animal?.village || "Unknown",
                district: animal?.district || "Unknown",
                status: record.healthStatus || "AT RISK",
                symptoms: record.symptoms || "No symptoms recorded"
            };
        });

    const responseStates =
        JSON.parse(
            localStorage.getItem("veterinaryResponseStates") || "{}"
        );

    let pending = 0;
    let progress = 0;
    let completed = 0;

    cases.forEach(item => {
        const state = responseStates[item.id] || "PENDING";

        if (state === "PENDING") pending++;
        if (state === "IN PROGRESS") progress++;
        if (state === "COMPLETED") completed++;
    });

    document.getElementById("pendingResponseCount").textContent = pending;
    document.getElementById("progressResponseCount").textContent = progress;
    document.getElementById("completedResponseCount").textContent = completed;

    if (!cases.length) {
        container.innerHTML = `
            <div class="empty-response">
                No active veterinary cases.
            </div>
        `;
        return;
    }

    container.innerHTML = cases.map(item => {
        const currentState =
            responseStates[item.id] || "PENDING";

        return `
            <div class="response-card">

                <div class="response-card-header">
                    <div>
                        <span class="response-risk">
                            ${escapeResponseText(item.status)}
                        </span>

                        <h3>
                            ${escapeResponseText(item.tag)}
                        </h3>
                    </div>

                    <span class="response-state ${stateClass(currentState)}">
                        ${escapeResponseText(currentState)}
                    </span>
                </div>

                <div class="response-details">
                    <span>🐄 ${escapeResponseText(item.animal)}</span>
                    <span>📍 ${escapeResponseText(item.village)}</span>
                    <span>🏛 ${escapeResponseText(item.district)}</span>
                </div>

                <p>
                    <strong>Symptoms:</strong>
                    ${escapeResponseText(item.symptoms)}
                </p>

                <div class="response-controls">
                    <button
                        onclick="setVeterinaryResponse(${item.id}, 'PENDING')">
                        Pending
                    </button>

                    <button
                        onclick="setVeterinaryResponse(${item.id}, 'IN PROGRESS')">
                        In Progress
                    </button>

                    <button
                        onclick="setVeterinaryResponse(${item.id}, 'COMPLETED')">
                        Completed
                    </button>
                </div>

            </div>
        `;
    }).join("");
}

function setVeterinaryResponse(id, state) {
    const states =
        JSON.parse(
            localStorage.getItem("veterinaryResponseStates") || "{}"
        );

    states[id] = state;

    localStorage.setItem(
        "veterinaryResponseStates",
        JSON.stringify(states)
    );

    updateResponseTracking();
}

function stateClass(state) {
    if (state === "COMPLETED") return "completed";
    if (state === "IN PROGRESS") return "progress";
    return "pending";
}

function escapeResponseText(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}