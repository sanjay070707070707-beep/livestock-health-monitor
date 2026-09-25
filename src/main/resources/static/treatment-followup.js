document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        createTreatmentFollowup();
        updateTreatmentFollowup();
    }, 1300);
});

function createTreatmentFollowup() {
    if (document.getElementById("treatmentFollowup")) return;

    const labSection = document.getElementById("labResultTracking");

    if (!labSection) return;

    const section = document.createElement("section");
    section.id = "treatmentFollowup";
    section.className = "treatment-followup-section";

    section.innerHTML = `
        <div class="section-heading">
            <span class="section-kicker">Animal Care</span>
            <h2>Treatment & Follow-up</h2>
            <p>Track treatment progress and follow-up status for livestock cases.</p>
        </div>

        <div class="treatment-summary">
            <div class="treatment-stat">
                <span>Cases</span>
                <strong id="totalTreatmentCases">0</strong>
            </div>

            <div class="treatment-stat">
                <span>Treatment Pending</span>
                <strong id="pendingTreatmentCases">0</strong>
            </div>

            <div class="treatment-stat">
                <span>Recovered</span>
                <strong id="recoveredTreatmentCases">0</strong>
            </div>
        </div>

        <div id="treatmentCaseList" class="treatment-case-list"></div>
    `;

    labSection.insertAdjacentElement("afterend", section);
}

function updateTreatmentFollowup() {
    const container = document.getElementById("treatmentCaseList");

    if (!container) return;

    if (
        typeof livestockData === "undefined" ||
        typeof healthRecordsData === "undefined"
    ) {
        return;
    }

    const cases = healthRecordsData.filter(record => {
        const status = String(record.healthStatus || "").toUpperCase();

        return (
            status.includes("HIGH RISK") ||
            status.includes("AT RISK")
        );
    });

    const states =
        JSON.parse(
            localStorage.getItem("treatmentFollowupStates") || "{}"
        );

    let pending = 0;
    let recovered = 0;

    cases.forEach(record => {
        const state = states[record.id] || "TREATMENT PENDING";

        if (state === "TREATMENT PENDING") pending++;
        if (state === "RECOVERED") recovered++;
    });

    document.getElementById("totalTreatmentCases").textContent =
        cases.length;

    document.getElementById("pendingTreatmentCases").textContent =
        pending;

    document.getElementById("recoveredTreatmentCases").textContent =
        recovered;

    if (!cases.length) {
        container.innerHTML = `
            <div class="empty-treatment">
                No active treatment cases.
            </div>
        `;
        return;
    }

    container.innerHTML = cases.map(record => {
        const animal = livestockData.find(
            item => Number(item.id) === Number(record.livestockId)
        );

        const state =
            states[record.id] || "TREATMENT PENDING";

        return `
            <div class="treatment-card">

                <div class="treatment-card-header">

                    <div>
                        <span class="treatment-risk">
                            ${escapeTreatmentText(
            record.healthStatus || "AT RISK"
        )}
                        </span>

                        <h3>
                            ${escapeTreatmentText(
            animal?.tagNumber || "Unknown Animal"
        )}
                        </h3>
                    </div>

                    <span class="treatment-state ${getTreatmentClass(state)}">
                        ${escapeTreatmentText(state)}
                    </span>

                </div>

                <div class="treatment-details">
                    <span>
                        🐄 ${escapeTreatmentText(
            animal?.animalType || "Unknown"
        )}
                    </span>

                    <span>
                        📍 ${escapeTreatmentText(
            animal?.village || "Unknown"
        )}
                    </span>

                    <span>
                        💉 ${escapeTreatmentText(
            record.treatment || "Treatment not recorded"
        )}
                    </span>
                </div>

                <p>
                    <strong>Recommendation:</strong>
                    ${escapeTreatmentText(
            record.recommendation ||
            "Veterinary follow-up required."
        )}
                </p>

                <div class="treatment-controls">

                    <button
                        onclick="setTreatmentState(${record.id}, 'TREATMENT PENDING')">
                        Pending
                    </button>

                    <button
                        onclick="setTreatmentState(${record.id}, 'UNDER TREATMENT')">
                        Under Treatment
                    </button>

                    <button
                        onclick="setTreatmentState(${record.id}, 'FOLLOW-UP REQUIRED')">
                        Follow-up
                    </button>

                    <button
                        onclick="setTreatmentState(${record.id}, 'RECOVERED')">
                        Recovered
                    </button>

                </div>

            </div>
        `;
    }).join("");
}

function setTreatmentState(id, state) {
    const states =
        JSON.parse(
            localStorage.getItem("treatmentFollowupStates") || "{}"
        );

    states[id] = state;

    localStorage.setItem(
        "treatmentFollowupStates",
        JSON.stringify(states)
    );

    updateTreatmentFollowup();
}

function getTreatmentClass(state) {
    if (state === "RECOVERED") return "recovered";
    if (state === "UNDER TREATMENT") return "treatment";
    if (state === "FOLLOW-UP REQUIRED") return "followup";

    return "pending";
}

function escapeTreatmentText(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}