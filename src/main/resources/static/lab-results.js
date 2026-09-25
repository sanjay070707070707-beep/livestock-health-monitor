document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        createLabResultTracking();
        updateLabResultTracking();
    }, 1100);
});

function createLabResultTracking() {
    if (document.getElementById("labResultTracking")) return;

    const responseSection = document.getElementById("responseTracking");

    if (!responseSection) return;

    const section = document.createElement("section");
    section.id = "labResultTracking";
    section.className = "lab-result-section";

    section.innerHTML = `
        <div class="section-heading">
            <span class="section-kicker">Diagnostic Support</span>
            <h2>Sample & Lab Result Tracking</h2>
            <p>Track diagnostic samples from referral to laboratory result.</p>
        </div>

        <div class="lab-result-summary">
            <div class="lab-result-stat">
                <span>Samples</span>
                <strong id="totalLabSamples">0</strong>
            </div>

            <div class="lab-result-stat">
                <span>Processing</span>
                <strong id="processingLabSamples">0</strong>
            </div>

            <div class="lab-result-stat">
                <span>Results Available</span>
                <strong id="completedLabSamples">0</strong>
            </div>
        </div>

        <div id="labResultList" class="lab-result-list"></div>
    `;

    responseSection.insertAdjacentElement("afterend", section);
}

function updateLabResultTracking() {
    const container = document.getElementById("labResultList");

    if (!container) return;

    if (
        typeof livestockData === "undefined" ||
        typeof healthRecordsData === "undefined"
    ) {
        return;
    }

    const records = healthRecordsData.filter(record => {
        const status = String(record.healthStatus || "").toUpperCase();

        return (
            status.includes("HIGH RISK") ||
            status.includes("AT RISK")
        );
    });

    const states =
        JSON.parse(
            localStorage.getItem("labResultStates") || "{}"
        );

    let processing = 0;
    let completed = 0;

    records.forEach(record => {
        const state = states[record.id] || "REFERRED";

        if (state === "PROCESSING") processing++;
        if (state === "RESULT AVAILABLE") completed++;
    });

    document.getElementById("totalLabSamples").textContent =
        records.length;

    document.getElementById("processingLabSamples").textContent =
        processing;

    document.getElementById("completedLabSamples").textContent =
        completed;

    if (!records.length) {
        container.innerHTML = `
            <div class="empty-lab-result">
                No laboratory referrals available.
            </div>
        `;
        return;
    }

    container.innerHTML = records.map(record => {
        const animal = livestockData.find(
            item => Number(item.id) === Number(record.livestockId)
        );

        const state = states[record.id] || "REFERRED";

        const sampleType = getSampleType(record.symptoms);

        return `
            <div class="lab-result-card">

                <div class="lab-result-header">
                    <div>
                        <span class="lab-status-badge">
                            ${escapeLabText(state)}
                        </span>

                        <h3>
                            ${escapeLabText(
            animal?.tagNumber || "Unknown Animal"
        )}
                        </h3>
                    </div>

                    <span class="sample-type">
                        ${escapeLabText(sampleType)}
                    </span>
                </div>

                <div class="lab-result-details">
                    <span>
                        🐄 ${escapeLabText(
            animal?.animalType || "Unknown"
        )}
                    </span>

                    <span>
                        📍 ${escapeLabText(
            animal?.village || "Unknown"
        )}
                    </span>

                    <span>
                        🧪 ${escapeLabText(sampleType)}
                    </span>
                </div>

                <p>
                    <strong>Symptoms:</strong>
                    ${escapeLabText(
            record.symptoms || "Not recorded"
        )}
                </p>

                <div class="lab-result-controls">

                    <button
                        onclick="setLabResultState(${record.id}, 'REFERRED')">
                        Referred
                    </button>

                    <button
                        onclick="setLabResultState(${record.id}, 'PROCESSING')">
                        Processing
                    </button>

                    <button
                        onclick="setLabResultState(${record.id}, 'RESULT AVAILABLE')">
                        Result Available
                    </button>

                </div>

                ${
            state === "RESULT AVAILABLE"
                ? `
                        <div class="lab-result-box">
                            <strong>Diagnostic result recorded</strong>
                            <span>
                                Veterinary review recommended.
                            </span>
                        </div>
                        `
                : ""
        }

            </div>
        `;
    }).join("");
}

function setLabResultState(id, state) {
    const states =
        JSON.parse(
            localStorage.getItem("labResultStates") || "{}"
        );

    states[id] = state;

    localStorage.setItem(
        "labResultStates",
        JSON.stringify(states)
    );

    updateLabResultTracking();
}

function getSampleType(symptoms) {
    const text = String(symptoms || "").toLowerCase();

    if (
        text.includes("cough") ||
        text.includes("breath") ||
        text.includes("respiratory")
    ) {
        return "Respiratory Sample";
    }

    if (
        text.includes("diarrhea") ||
        text.includes("diarrhoea") ||
        text.includes("stool")
    ) {
        return "Fecal Sample";
    }

    if (
        text.includes("skin") ||
        text.includes("lesion") ||
        text.includes("rash")
    ) {
        return "Skin Sample";
    }

    if (
        text.includes("fever") ||
        text.includes("temperature")
    ) {
        return "Blood Sample";
    }

    return "General Diagnostic Sample";
}

function escapeLabText(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}