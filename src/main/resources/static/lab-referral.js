// =========================================================
// SAMPLE & LAB REFERRAL CENTER
// =========================================================

(function () {

    function escapeLabHtml(value) {
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

    function getSampleType(record) {

        const symptoms =
            String(record.symptoms || "")
                .toLowerCase();

        if (
            symptoms.includes("cough") ||
            symptoms.includes("breathing") ||
            symptoms.includes("respiratory") ||
            symptoms.includes("nasal")
        ) {
            return "Nasal / respiratory sample";
        }

        if (
            symptoms.includes("diarrhea") ||
            symptoms.includes("diarrhoea") ||
            symptoms.includes("loose motion") ||
            symptoms.includes("watery")
        ) {
            return "Fecal sample";
        }

        if (
            symptoms.includes("blood") ||
            symptoms.includes("bleeding")
        ) {
            return "Blood sample";
        }

        return "Clinical sample";
    }

    function getReferralPriority(record) {

        if (
            record.mortalityReported ||
            record.healthStatus === "HIGH RISK" ||
            Number(record.temperature) >= 40
        ) {
            return "URGENT";
        }

        if (
            record.healthStatus === "AT RISK" ||
            record.healthStatus === "MEDIUM RISK"
        ) {
            return "HIGH";
        }

        return "ROUTINE";
    }

    function createSection() {

        if (
            document.getElementById(
                "labReferralSection"
            )
        ) {
            return;
        }

        const veterinarySection =
            document.getElementById(
                "veterinaryActionSection"
            );

        if (!veterinarySection) {
            return;
        }

        const section =
            document.createElement("section");

        section.id =
            "labReferralSection";

        section.className =
            "lab-referral-section";

        section.innerHTML = `
            <div class="section-heading">

                <div>
                    <span class="section-label">
                        DIAGNOSTIC SUPPORT
                    </span>

                    <h2>
                        🧪 Sample & Lab Referral
                    </h2>
                </div>

                <div class="live-indicator">
                    <span class="status-dot"></span>
                    Referral Tracking
                </div>

            </div>

            <div
                id="labReferralList"
                class="lab-referral-list">
            </div>
        `;

        veterinarySection.insertAdjacentElement(
            "afterend",
            section
        );
    }

    function renderReferrals() {

        const container =
            document.getElementById(
                "labReferralList"
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

        const records =
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

        if (records.length === 0) {

            container.innerHTML = `
                <div class="lab-empty">
                    <div class="lab-empty-icon">
                        ✓
                    </div>

                    <h3>
                        No Laboratory Referrals
                    </h3>

                    <p>
                        No current cases require
                        diagnostic sample referral.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML =
            records.map(record => {

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
                    getReferralPriority(record);

                const sampleType =
                    getSampleType(record);

                const referralKey =
                    `lab-referred-${record.id}`;

                const referred =
                    localStorage.getItem(
                        referralKey
                    ) === "true";

                return `
                    <div class="
                        lab-referral-card
                        ${priority.toLowerCase()}
                        ${referred ? "referred" : ""}
                    ">

                        <div class="lab-card-header">

                            <div>

                                <span class="lab-priority">
                                    ${escapeLabHtml(
                    priority
                )}
                                </span>

                                <h3>
                                    ${escapeLabHtml(
                    animalName
                )}
                                </h3>

                            </div>

                            <div class="lab-sample-icon">
                                🧪
                            </div>

                        </div>

                        <div class="lab-grid">

                            <div>
                                <span>Sample Type</span>
                                <strong>
                                    ${escapeLabHtml(
                    sampleType
                )}
                                </strong>
                            </div>

                            <div>
                                <span>Temperature</span>
                                <strong>
                                    ${escapeLabHtml(
                    record.temperature
                )} °C
                                </strong>
                            </div>

                            <div>
                                <span>Risk Status</span>
                                <strong>
                                    ${escapeLabHtml(
                    record.healthStatus
                )}
                                </strong>
                            </div>

                            <div>
                                <span>Symptoms</span>
                                <strong>
                                    ${escapeLabHtml(
                    record.symptoms ||
                    "Not provided"
                )}
                                </strong>
                            </div>

                        </div>

                        <div class="lab-recommendation">

                            <span>
                                Recommended Referral
                            </span>

                            <p>
                                Send the appropriate
                                clinical sample to a
                                veterinary diagnostic
                                laboratory for further
                                investigation.
                            </p>

                        </div>

                        <div class="lab-card-footer">

                            <button
                                class="lab-refer-button"
                                data-record-id="${record.id}"
                            >
                                ${
                    referred
                        ? "✓ Sample Referred"
                        : "Mark Sample Referred"
                }
                            </button>

                            <span>
                                Diagnostic workflow
                            </span>

                        </div>

                    </div>
                `;

            }).join("");

        document
            .querySelectorAll(
                ".lab-refer-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.recordId;

                        const key =
                            `lab-referred-${id}`;

                        const current =
                            localStorage.getItem(
                                key
                            ) === "true";

                        localStorage.setItem(
                            key,
                            String(!current)
                        );

                        renderReferrals();
                    }
                );
            });
    }

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(() => {

                createSection();
                renderReferrals();

            }, 1200);

            setInterval(
                renderReferrals,
                2000
            );
        }
    );

})();