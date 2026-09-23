// =========================================================
// VETERINARY ACTION CENTER
// =========================================================

(function () {

    function escapeActionHtml(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function detectConcern(record) {

        const text =
            String(record.symptoms || "")
                .toLowerCase();

        if (
            text.includes("cough") ||
            text.includes("breathing") ||
            text.includes("respiratory") ||
            text.includes("nasal")
        ) {
            return "Respiratory health concern";
        }

        if (
            text.includes("diarrhea") ||
            text.includes("diarrhoea") ||
            text.includes("loose motion") ||
            text.includes("watery") ||
            text.includes("dehydration")
        ) {
            return "Gastrointestinal health concern";
        }

        if (
            text.includes("collapse") ||
            text.includes("unable to stand") ||
            text.includes("bleeding") ||
            text.includes("convulsion") ||
            text.includes("severe")
        ) {
            return "Severe systemic health concern";
        }

        if (Number(record.temperature) >= 40) {
            return "High fever concern";
        }

        if (Number(record.temperature) >= 39) {
            return "Elevated temperature concern";
        }

        return "General health monitoring";
    }

    function getPriority(record) {

        if (
            record.mortalityReported ||
            record.healthStatus === "HIGH RISK" ||
            Number(record.temperature) >= 40
        ) {
            return "URGENT";
        }

        if (record.healthStatus === "AT RISK") {
            return "HIGH";
        }

        return "ROUTINE";
    }

    function getActions(record) {

        const priority =
            getPriority(record);

        const actions = [];

        if (priority === "URGENT") {

            actions.push(
                "Contact veterinary professional immediately"
            );

            actions.push(
                "Consider isolating the affected animal"
            );

            actions.push(
                "Perform clinical examination"
            );

            if (record.mortalityReported) {
                actions.push(
                    "Initiate mortality investigation"
                );
            }

        } else if (priority === "HIGH") {

            actions.push(
                "Monitor animal closely"
            );

            actions.push(
                "Repeat health assessment"
            );

            actions.push(
                "Consult veterinary professional if symptoms persist"
            );

        } else {

            actions.push(
                "Continue routine health monitoring"
            );

            actions.push(
                "Maintain preventive care"
            );
        }

        return actions;
    }

    function createPanel() {

        if (
            document.getElementById(
                "veterinaryActionSection"
            )
        ) {
            return;
        }

        const riskSection =
            document.querySelector(
                ".risk-section"
            );

        if (!riskSection) {
            return;
        }

        const section =
            document.createElement("section");

        section.id =
            "veterinaryActionSection";

        section.className =
            "veterinary-action-section";

        section.innerHTML = `
            <div class="section-heading">

                <div>
                    <span class="section-label">
                        VETERINARY RESPONSE
                    </span>

                    <h2>
                        🩺 Veterinary Action Center
                    </h2>
                </div>

                <div class="live-indicator">
                    <span class="status-dot"></span>
                    Action Monitoring
                </div>

            </div>

            <div
                id="veterinaryActionList"
                class="veterinary-action-list">
            </div>
        `;

        riskSection.insertAdjacentElement(
            "afterend",
            section
        );
    }

    function renderActions() {

        const container =
            document.getElementById(
                "veterinaryActionList"
            );

        if (!container) {
            return;
        }

        if (
            typeof healthRecordsData ===
            "undefined" ||
            typeof livestockData ===
            "undefined"
        ) {
            return;
        }

        const riskyRecords =
            healthRecordsData
                .filter(record =>
                    record.healthStatus === "HIGH RISK" ||
                    record.healthStatus === "AT RISK" ||
                    record.healthStatus === "MEDIUM RISK"
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.reportDate || 0
                        ) -
                        new Date(
                            a.reportDate || 0
                        )
                );

        if (riskyRecords.length === 0) {

            container.innerHTML = `
                <div class="veterinary-empty">
                    <div class="veterinary-empty-icon">
                        ✓
                    </div>

                    <h3>
                        No Veterinary Actions Pending
                    </h3>

                    <p>
                        No active livestock cases
                        require veterinary intervention.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML =
            riskyRecords.map(record => {

                const animal =
                    livestockData.find(
                        item =>
                            item.id ===
                            record.livestockId
                    );

                const animalName =
                    animal
                        ? animal.tagNumber
                        : `Livestock #${record.livestockId}`;

                const priority =
                    getPriority(record);

                const concern =
                    detectConcern(record);

                const actions =
                    getActions(record);

                const reviewedKey =
                    `vet-reviewed-${record.id}`;

                const reviewed =
                    localStorage.getItem(
                        reviewedKey
                    ) === "true";

                const priorityClass =
                    priority.toLowerCase();

                return `
                    <div class="
                        veterinary-action-card
                        ${priorityClass}
                        ${reviewed ? "reviewed" : ""}
                    ">

                        <div class="vet-card-top">

                            <div>
                                <span class="vet-priority">
                                    ${escapeActionHtml(priority)}
                                </span>

                                <h3>
                                    ${escapeActionHtml(
                    animalName
                )}
                                </h3>

                                <p class="vet-concern">
                                    ${escapeActionHtml(
                    concern
                )}
                                </p>
                            </div>

                            <div class="vet-temperature">
                                ${escapeActionHtml(
                    record.temperature
                )}°C
                            </div>

                        </div>

                        <div class="vet-details">

                            <div>
                                <span>Symptoms</span>
                                <strong>
                                    ${escapeActionHtml(
                    record.symptoms ||
                    "None reported"
                )}
                                </strong>
                            </div>

                            <div>
                                <span>Health Status</span>
                                <strong>
                                    ${escapeActionHtml(
                    record.healthStatus
                )}
                                </strong>
                            </div>

                            <div>
                                <span>Reported</span>
                                <strong>
                                    ${escapeActionHtml(
                    formatActionDate(
                        record.reportDate
                    )
                )}
                                </strong>
                            </div>

                        </div>

                        <div class="vet-actions">

                            <h4>
                                Recommended Actions
                            </h4>

                            <ul>
                                ${actions.map(
                    action => `
                                        <li>
                                            <span>✓</span>
                                            ${escapeActionHtml(
                        action
                    )}
                                        </li>
                                    `
                ).join("")}
                            </ul>

                        </div>

                        <div class="vet-card-footer">

                            <button
                                class="vet-review-button"
                                data-record-id="${record.id}"
                            >
                                ${reviewed
                    ? "✓ Reviewed"
                    : "Mark Reviewed"}
                            </button>

                            <span>
                                AI-assisted decision support
                            </span>

                        </div>

                    </div>
                `;

            }).join("");

        document
            .querySelectorAll(
                ".vet-review-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.recordId;

                        const key =
                            `vet-reviewed-${id}`;

                        const current =
                            localStorage.getItem(
                                key
                            ) === "true";

                        localStorage.setItem(
                            key,
                            String(!current)
                        );

                        renderActions();
                    }
                );
            });
    }

    function formatActionDate(value) {

        if (!value) {
            return "Not available";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(value);
        }

        return date.toLocaleDateString();
    }

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            createPanel();

            setTimeout(
                renderActions,
                1000
            );

            setInterval(
                renderActions,
                2000
            );
        }
    );

})();