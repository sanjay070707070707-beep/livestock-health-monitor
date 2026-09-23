(function () {

    function createDashboard() {
        if (document.getElementById("governmentDashboard")) return;

        const mapSection = document.querySelector(".map-section");
        if (!mapSection) return;

        const section = document.createElement("section");
        section.id = "governmentDashboard";
        section.className = "government-dashboard";

        section.innerHTML = `
            <div class="section-heading">
                <div>
                    <span class="section-label">GOVERNMENT SURVEILLANCE</span>
                    <h2>🏛️ Livestock Health Command Center</h2>
                    <p>
                        Maharashtra livestock disease surveillance and
                        response overview.
                    </p>
                </div>

                <div class="gov-live">
                    <span class="status-dot"></span>
                    LIVE MONITORING
                </div>
            </div>

            <div class="gov-stats">

                <div class="gov-stat-card">
                    <span>🐄</span>
                    <small>Total Livestock</small>
                    <strong id="govTotalAnimals">0</strong>
                </div>

                <div class="gov-stat-card high">
                    <span>🚨</span>
                    <small>High Risk</small>
                    <strong id="govHighRisk">0</strong>
                </div>

                <div class="gov-stat-card warning">
                    <span>⚠️</span>
                    <small>At Risk</small>
                    <strong id="govAtRisk">0</strong>
                </div>

                <div class="gov-stat-card danger">
                    <span>☠️</span>
                    <small>Mortality</small>
                    <strong id="govMortality">0</strong>
                </div>

                <div class="gov-stat-card">
                    <span>💉</span>
                    <small>Vaccinated</small>
                    <strong id="govVaccinated">0</strong>
                </div>

                <div class="gov-stat-card">
                    <span>🧪</span>
                    <small>Lab Referrals</small>
                    <strong id="govLabReferrals">0</strong>
                </div>

            </div>

            <div class="gov-content-grid">

                <div class="gov-panel">

                    <div class="gov-panel-title">
                        <div>
                            <span class="section-label">GEOGRAPHICAL SURVEILLANCE</span>
                            <h3>District / Village Risk Distribution</h3>
                        </div>
                    </div>

                    <div id="govDistrictList"
                         class="gov-district-list">
                    </div>

                </div>

                <div class="gov-panel">

                    <div class="gov-panel-title">
                        <div>
                            <span class="section-label">RESPONSE STATUS</span>
                            <h3>Current Situation</h3>
                        </div>
                    </div>

                    <div class="gov-response-list">

                        <div class="gov-response-item">
                            <span>🔴</span>
                            <div>
                                <strong>High Risk Cases</strong>
                                <small>Immediate veterinary attention</small>
                            </div>
                            <b id="govResponseHigh">0</b>
                        </div>

                        <div class="gov-response-item">
                            <span>🟡</span>
                            <div>
                                <strong>At Risk Cases</strong>
                                <small>Requires monitoring</small>
                            </div>
                            <b id="govResponseAtRisk">0</b>
                        </div>

                        <div class="gov-response-item">
                            <span>🧪</span>
                            <div>
                                <strong>Diagnostic Referrals</strong>
                                <small>Samples requiring laboratory testing</small>
                            </div>
                            <b id="govResponseLab">0</b>
                        </div>

                        <div class="gov-response-item">
                            <span>💀</span>
                            <div>
                                <strong>Reported Mortality</strong>
                                <small>Deaths reported in health records</small>
                            </div>
                            <b id="govResponseMortality">0</b>
                        </div>

                    </div>

                </div>

            </div>
        `;

        mapSection.insertAdjacentElement("afterend", section);
    }


    function updateDashboard() {

        if (
            typeof livestockData === "undefined" ||
            typeof healthRecordsData === "undefined"
        ) {
            return;
        }

        const animals = livestockData;
        const records = healthRecordsData;

        let highRisk = 0;
        let atRisk = 0;
        let mortality = 0;
        let vaccinated = 0;
        let labReferrals = 0;

        const latestRecords = new Map();

        records.forEach(record => {
            const existing =
                latestRecords.get(record.livestockId);

            if (
                !existing ||
                new Date(record.reportDate || 0) >
                new Date(existing.reportDate || 0)
            ) {
                latestRecords.set(
                    record.livestockId,
                    record
                );
            }
        });

        latestRecords.forEach(record => {

            const status =
                String(record.healthStatus || "")
                    .toUpperCase();

            if (status === "HIGH RISK") {
                highRisk++;
            }

            if (
                status === "AT RISK" ||
                status === "MEDIUM RISK"
            ) {
                atRisk++;
            }

            if (record.mortalityReported === true) {
                mortality++;
            }

            if (
                String(
                    record.vaccinationStatus || ""
                ).toLowerCase() === "vaccinated"
            ) {
                vaccinated++;
            }

            if (
                status === "HIGH RISK" ||
                status === "AT RISK" ||
                status === "MEDIUM RISK"
            ) {
                labReferrals++;
            }
        });


        setText(
            "govTotalAnimals",
            animals.length
        );

        setText(
            "govHighRisk",
            highRisk
        );

        setText(
            "govAtRisk",
            atRisk
        );

        setText(
            "govMortality",
            mortality
        );

        setText(
            "govVaccinated",
            vaccinated
        );

        setText(
            "govLabReferrals",
            labReferrals
        );

        setText(
            "govResponseHigh",
            highRisk
        );

        setText(
            "govResponseAtRisk",
            atRisk
        );

        setText(
            "govResponseLab",
            labReferrals
        );

        setText(
            "govResponseMortality",
            mortality
        );

        renderDistricts(
            animals,
            latestRecords
        );
    }


    function renderDistricts(
        animals,
        latestRecords
    ) {

        const container =
            document.getElementById(
                "govDistrictList"
            );

        if (!container) return;

        const districts = {};

        animals.forEach(animal => {

            const district =
                animal.district ||
                "Unknown District";

            if (!districts[district]) {

                districts[district] = {
                    animals: 0,
                    high: 0,
                    risk: 0,
                    villages: new Set()
                };

            }

            districts[district].animals++;

            if (animal.village) {
                districts[district]
                    .villages
                    .add(animal.village);
            }

            const record =
                latestRecords.get(animal.id);

            if (!record) return;

            const status =
                String(record.healthStatus || "")
                    .toUpperCase();

            if (status === "HIGH RISK") {
                districts[district].high++;
            }

            if (
                status === "AT RISK" ||
                status === "MEDIUM RISK"
            ) {
                districts[district].risk++;
            }

        });


        const entries =
            Object.entries(districts)
                .sort((a, b) =>
                    (b[1].high + b[1].risk) -
                    (a[1].high + a[1].risk)
                );


        if (entries.length === 0) {

            container.innerHTML = `
                <div class="gov-empty">
                    No district surveillance data available.
                </div>
            `;

            return;
        }


        container.innerHTML =
            entries.map(([district, data]) => {

                const totalRisk =
                    data.high + data.risk;

                const percentage =
                    data.animals > 0
                        ? Math.round(
                            (totalRisk /
                                data.animals) * 100
                        )
                        : 0;

                return `
                    <div class="gov-district-card">

                        <div class="gov-district-top">

                            <div>
                                <strong>
                                    ${escapeHtml(district)}
                                </strong>

                                <small>
                                    ${data.villages.size}
                                    village(s)
                                </small>
                            </div>

                            <span>
                                ${data.animals} animals
                            </span>

                        </div>

                        <div class="gov-risk-bar">

                            <div
                                class="gov-risk-fill"
                                style="width:${Math.min(
                    percentage,
                    100
                )}%">
                            </div>

                        </div>

                        <div class="gov-district-bottom">

                            <span class="gov-high">
                                🔴 High: ${data.high}
                            </span>

                            <span class="gov-risk">
                                🟡 At Risk: ${data.risk}
                            </span>

                            <span>
                                ${percentage}% affected
                            </span>

                        </div>

                    </div>
                `;

            }).join("");
    }


    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }


    function escapeHtml(value) {

        if (value === null ||
            value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(() => {

                createDashboard();
                updateDashboard();

            }, 1600);

            setInterval(
                updateDashboard,
                3000
            );

        }
    );

})();