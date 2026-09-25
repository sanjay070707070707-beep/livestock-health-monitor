document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        createMvpFinalDashboard();
        updateMvpFinalDashboard();
    }, 1500);
});

/* =========================================================
   MAIN MVP DASHBOARD
   ========================================================= */

function createMvpFinalDashboard() {

    if (document.getElementById("mvpFinalDashboard")) {
        return;
    }

    const lastSection =
        document.getElementById("treatmentFollowup") ||
        document.getElementById("labResultTracking") ||
        document.getElementById("responseTracking") ||
        document.getElementById("emergencyAlertCenter");

    if (!lastSection) {
        return;
    }

    const section = document.createElement("section");

    section.id = "mvpFinalDashboard";
    section.className = "mvp-final-section";

    section.innerHTML = `

        <div class="section-heading">

            <div>
                <span class="section-kicker">
                    INTELLIGENCE & ANALYTICS
                </span>

                <h2>📊 Analytics & Performance Dashboard</h2>

                <p>
                    Consolidated livestock health, risk,
                    treatment and surveillance indicators.
                </p>
            </div>

        </div>

        <!-- ANALYTICS -->

        <div class="mvp-analytics-grid">

            <div class="mvp-metric">
                <span>Total Animals</span>
                <strong id="mvpTotalAnimals">0</strong>
            </div>

            <div class="mvp-metric">
                <span>Total Health Records</span>
                <strong id="mvpTotalRecords">0</strong>
            </div>

            <div class="mvp-metric">
                <span>High Risk</span>
                <strong id="mvpHighRisk">0</strong>
            </div>

            <div class="mvp-metric">
                <span>At Risk</span>
                <strong id="mvpAtRisk">0</strong>
            </div>

            <div class="mvp-metric">
                <span>Mortality</span>
                <strong id="mvpMortality">0</strong>
            </div>

            <div class="mvp-metric">
                <span>Vaccination Coverage</span>
                <strong id="mvpVaccination">0%</strong>
            </div>

        </div>


        <!-- RISK DISTRIBUTION -->

        <div class="mvp-panel">

            <div class="mvp-panel-header">

                <div>
                    <span class="mvp-small-label">
                        HEALTH STATUS
                    </span>

                    <h3>Risk Distribution</h3>
                </div>

            </div>

            <div id="mvpRiskBars"></div>

        </div>


        <!-- SEARCH & FILTER -->

        <div class="mvp-panel">

            <div class="mvp-panel-header">

                <div>
                    <span class="mvp-small-label">
                        SURVEILLANCE
                    </span>

                    <h3>🔎 Livestock Search & Filtering</h3>
                </div>

            </div>

            <div class="mvp-filter-grid">

                <input
                    id="mvpSearchInput"
                    type="text"
                    placeholder="Search tag number, village or district..."
                >

                <select id="mvpAnimalFilter">

                    <option value="">All Animals</option>

                </select>

                <select id="mvpRiskFilter">

                    <option value="">All Risk Levels</option>
                    <option value="HEALTHY">Healthy</option>
                    <option value="AT RISK">At Risk</option>
                    <option value="HIGH RISK">High Risk</option>

                </select>

                <select id="mvpDistrictFilter">

                    <option value="">All Districts</option>

                </select>

            </div>

            <div
                id="mvpSearchResults"
                class="mvp-search-results">
            </div>

        </div>


        <!-- FIELD OFFICER -->

        <div class="mvp-panel">

            <div class="mvp-panel-header">

                <div>
                    <span class="mvp-small-label">
                        FIELD OPERATIONS
                    </span>

                    <h3>👨‍⚕️ Field Officer Dashboard</h3>
                </div>

            </div>

            <div class="field-officer-grid">

                <div class="field-officer-card">

                    <span>Pending Cases</span>

                    <strong id="mvpPendingCases">
                        0
                    </strong>

                </div>

                <div class="field-officer-card">

                    <span>High-Risk Visits</span>

                    <strong id="mvpHighRiskVisits">
                        0
                    </strong>

                </div>

                <div class="field-officer-card">

                    <span>Follow-ups</span>

                    <strong id="mvpFollowups">
                        0
                    </strong>

                </div>

                <div class="field-officer-card">

                    <span>Completed</span>

                    <strong id="mvpCompletedCases">
                        0
                    </strong>

                </div>

            </div>

        </div>


        <!-- DISEASE ANALYTICS -->

        <div class="mvp-panel">

            <div class="mvp-panel-header">

                <div>
                    <span class="mvp-small-label">
                        DISEASE INTELLIGENCE
                    </span>

                    <h3>🧬 Symptom & Disease Analytics</h3>
                </div>

            </div>

            <div id="mvpDiseaseAnalytics"></div>

        </div>


        <!-- DISTRICT ANALYTICS -->

        <div class="mvp-panel">

            <div class="mvp-panel-header">

                <div>
                    <span class="mvp-small-label">
                        GEOGRAPHICAL ANALYTICS
                    </span>

                    <h3>📍 District Risk Distribution</h3>
                </div>

            </div>

            <div id="mvpDistrictAnalytics"></div>

        </div>


        <!-- REPORT GENERATION -->

        <div class="mvp-panel">

            <div class="mvp-panel-header">

                <div>
                    <span class="mvp-small-label">
                        REPORTING
                    </span>

                    <h3>📄 Surveillance Reports</h3>

                    <p>
                        Generate a printable summary of
                        current livestock health data.
                    </p>
                </div>

            </div>

            <div class="mvp-report-buttons">

                <button
                    onclick="generateMvpReport('FULL')">
                    📊 Full Surveillance Report
                </button>

                <button
                    onclick="generateMvpReport('RISK')">
                    🚨 Risk Report
                </button>

                <button
                    onclick="generateMvpReport('VACCINATION')">
                    💉 Vaccination Report
                </button>

                <button
                    onclick="generateMvpReport('OUTBREAK')">
                    🗺 Outbreak Report
                </button>

            </div>

        </div>

    `;

    lastSection.insertAdjacentElement(
        "afterend",
        section
    );


    /* SEARCH EVENTS */

    document
        .getElementById("mvpSearchInput")
        ?.addEventListener(
            "input",
            updateMvpSearch
        );

    document
        .getElementById("mvpAnimalFilter")
        ?.addEventListener(
            "change",
            updateMvpSearch
        );

    document
        .getElementById("mvpRiskFilter")
        ?.addEventListener(
            "change",
            updateMvpSearch
        );

    document
        .getElementById("mvpDistrictFilter")
        ?.addEventListener(
            "change",
            updateMvpSearch
        );
}


/* =========================================================
   UPDATE EVERYTHING
   ========================================================= */

function updateMvpFinalDashboard() {

    if (
        typeof livestockData === "undefined" ||
        typeof healthRecordsData === "undefined"
    ) {
        return;
    }

    updateMvpMetrics();

    updateMvpRiskDistribution();

    populateMvpFilters();

    updateMvpSearch();

    updateFieldOfficerDashboard();

    updateDiseaseAnalytics();

    updateDistrictAnalytics();
}


/* =========================================================
   MAIN METRICS
   ========================================================= */

function updateMvpMetrics() {

    const records = healthRecordsData || [];

    const highRisk =
        records.filter(
            r =>
                String(r.healthStatus || "")
                    .toUpperCase()
                    .includes("HIGH RISK")
        ).length;

    const atRisk =
        records.filter(
            r =>
                String(r.healthStatus || "")
                    .toUpperCase()
                    .includes("AT RISK")
        ).length;

    const mortality =
        records.filter(
            r => r.mortalityReported === true
        ).length;

    const vaccinationMap = {};

    records.forEach(record => {

        if (!record.livestockId) {
            return;
        }

        const existing =
            vaccinationMap[record.livestockId];

        if (
            !existing ||
            new Date(record.reportDate || 0) >
            new Date(existing.reportDate || 0)
        ) {
            vaccinationMap[record.livestockId] =
                record;
        }

    });

    const latestRecords =
        Object.values(vaccinationMap);

    const vaccinated =
        latestRecords.filter(
            r =>
                String(
                    r.vaccinationStatus || ""
                ).toLowerCase()
                    .includes("vaccinated")
        ).length;

    const vaccinationCoverage =
        livestockData.length
            ? Math.round(
                (vaccinated /
                    livestockData.length) *
                100
            )
            : 0;

    setMvpText(
        "mvpTotalAnimals",
        livestockData.length
    );

    setMvpText(
        "mvpTotalRecords",
        records.length
    );

    setMvpText(
        "mvpHighRisk",
        highRisk
    );

    setMvpText(
        "mvpAtRisk",
        atRisk
    );

    setMvpText(
        "mvpMortality",
        mortality
    );

    setMvpText(
        "mvpVaccination",
        `${vaccinationCoverage}%`
    );
}


/* =========================================================
   RISK DISTRIBUTION
   ========================================================= */

function updateMvpRiskDistribution() {

    const container =
        document.getElementById(
            "mvpRiskBars"
        );

    if (!container) {
        return;
    }

    const records =
        healthRecordsData || [];

    const counts = {
        "HEALTHY": 0,
        "AT RISK": 0,
        "HIGH RISK": 0
    };

    records.forEach(record => {

        const status =
            String(
                record.healthStatus || ""
            ).toUpperCase();

        if (status.includes("HIGH RISK")) {
            counts["HIGH RISK"]++;
        } else if (status.includes("AT RISK")) {
            counts["AT RISK"]++;
        } else {
            counts["HEALTHY"]++;
        }

    });

    const total =
        Math.max(records.length, 1);

    container.innerHTML =
        Object.entries(counts)
            .map(([name, count]) => {

                const percentage =
                    Math.round(
                        (count / total) * 100
                    );

                return `

                    <div class="mvp-risk-row">

                        <div class="mvp-risk-label">

                            <span>
                                ${name}
                            </span>

                            <strong>
                                ${count}
                            </strong>

                        </div>

                        <div class="mvp-risk-track">

                            <div
                                class="mvp-risk-fill ${getMvpRiskClass(name)}"
                                style="width:${percentage}%">
                            </div>

                        </div>

                        <small>
                            ${percentage}%
                        </small>

                    </div>

                `;

            })
            .join("");
}


/* =========================================================
   FILTERS
   ========================================================= */

function populateMvpFilters() {

    const animalFilter =
        document.getElementById(
            "mvpAnimalFilter"
        );

    const districtFilter =
        document.getElementById(
            "mvpDistrictFilter"
        );

    if (!animalFilter || !districtFilter) {
        return;
    }

    const animalTypes =
        [
            ...new Set(
                livestockData
                    .map(
                        animal =>
                            animal.animalType
                    )
                    .filter(Boolean)
            )
        ].sort();

    const districts =
        [
            ...new Set(
                livestockData
                    .map(
                        animal =>
                            animal.district
                    )
                    .filter(Boolean)
            )
        ].sort();

    animalFilter.innerHTML =
        `<option value="">All Animals</option>` +
        animalTypes
            .map(
                type =>
                    `<option value="${escapeMvp(type)}">
                        ${escapeMvp(type)}
                    </option>`
            )
            .join("");

    districtFilter.innerHTML =
        `<option value="">All Districts</option>` +
        districts
            .map(
                district =>
                    `<option value="${escapeMvp(district)}">
                        ${escapeMvp(district)}
                    </option>`
            )
            .join("");
}


/* =========================================================
   SEARCH
   ========================================================= */

function updateMvpSearch() {

    const container =
        document.getElementById(
            "mvpSearchResults"
        );

    if (!container) {
        return;
    }

    const search =
        String(
            document.getElementById(
                "mvpSearchInput"
            )?.value || ""
        )
            .toLowerCase()
            .trim();

    const animalType =
        document.getElementById(
            "mvpAnimalFilter"
        )?.value || "";

    const risk =
        document.getElementById(
            "mvpRiskFilter"
        )?.value || "";

    const district =
        document.getElementById(
            "mvpDistrictFilter"
        )?.value || "";

    const results =
        livestockData.filter(animal => {

            const latest =
                getLatestMvpRecord(
                    animal.id
                );

            const healthStatus =
                String(
                    latest?.healthStatus ||
                    "HEALTHY"
                ).toUpperCase();

            const matchesSearch =
                !search ||
                String(
                    animal.tagNumber || ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    animal.village || ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    animal.district || ""
                )
                    .toLowerCase()
                    .includes(search);

            const matchesAnimal =
                !animalType ||
                animal.animalType === animalType;

            const matchesRisk =
                !risk ||
                healthStatus === risk;

            const matchesDistrict =
                !district ||
                animal.district === district;

            return (
                matchesSearch &&
                matchesAnimal &&
                matchesRisk &&
                matchesDistrict
            );

        });

    if (!results.length) {

        container.innerHTML = `
            <div class="mvp-empty">
                No livestock matches the selected filters.
            </div>
        `;

        return;
    }

    container.innerHTML =
        results
            .slice(0, 50)
            .map(animal => {

                const record =
                    getLatestMvpRecord(
                        animal.id
                    );

                const status =
                    record?.healthStatus ||
                    "HEALTHY";

                return `

                    <div class="mvp-animal-result">

                        <div>

                            <strong>
                                ${escapeMvp(
                    animal.tagNumber ||
                    "Unknown"
                )}
                            </strong>

                            <small>
                                ${escapeMvp(
                    animal.animalType ||
                    "Animal"
                )}
                                •
                                ${escapeMvp(
                    animal.village ||
                    "Unknown village"
                )}
                                •
                                ${escapeMvp(
                    animal.district ||
                    "Unknown district"
                )}
                            </small>

                        </div>

                        <span
                            class="mvp-status ${getMvpRiskClass(status)}">
                            ${escapeMvp(status)}
                        </span>

                    </div>

                `;

            })
            .join("");
}


/* =========================================================
   FIELD OFFICER DASHBOARD
   ========================================================= */

function updateFieldOfficerDashboard() {

    const records =
        healthRecordsData || [];

    const states =
        JSON.parse(
            localStorage.getItem(
                "veterinaryResponseStates"
            ) || "{}"
        );

    let pending = 0;
    let highRisk = 0;
    let followups = 0;
    let completed = 0;

    records.forEach(record => {

        const status =
            String(
                record.healthStatus || ""
            ).toUpperCase();

        if (
            status.includes("HIGH RISK") ||
            status.includes("AT RISK")
        ) {

            const state =
                states[record.id] ||
                "PENDING";

            if (
                state === "PENDING" ||
                state === "TREATMENT PENDING"
            ) {
                pending++;
            }

            if (status.includes("HIGH RISK")) {
                highRisk++;
            }

            if (
                state === "FOLLOW-UP REQUIRED"
            ) {
                followups++;
            }

            if (
                state === "COMPLETED" ||
                state === "RECOVERED"
            ) {
                completed++;
            }

        }

    });

    setMvpText(
        "mvpPendingCases",
        pending
    );

    setMvpText(
        "mvpHighRiskVisits",
        highRisk
    );

    setMvpText(
        "mvpFollowups",
        followups
    );

    setMvpText(
        "mvpCompletedCases",
        completed
    );
}


/* =========================================================
   DISEASE / SYMPTOM ANALYTICS
   ========================================================= */

function updateDiseaseAnalytics() {

    const container =
        document.getElementById(
            "mvpDiseaseAnalytics"
        );

    if (!container) {
        return;
    }

    const symptomCounts = {};

    (healthRecordsData || [])
        .forEach(record => {

            const symptoms =
                String(
                    record.symptoms ||
                    "No symptoms recorded"
                )
                    .split(",")
                    .map(
                        symptom =>
                            symptom.trim()
                    )
                    .filter(Boolean);

            symptoms.forEach(symptom => {

                const key =
                    symptom.toLowerCase();

                symptomCounts[key] =
                    (symptomCounts[key] || 0) +
                    1;

            });

        });

    const entries =
        Object.entries(symptomCounts)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 8);

    if (!entries.length) {

        container.innerHTML = `
            <div class="mvp-empty">
                No symptom data available.
            </div>
        `;

        return;
    }

    const max =
        Math.max(
            ...entries.map(
                item => item[1]
            ),
            1
        );

    container.innerHTML =
        entries
            .map(
                ([name, count]) => {

                    const width =
                        Math.round(
                            (count / max) *
                            100
                        );

                    return `

                        <div class="mvp-disease-row">

                            <div>
                                <span>
                                    ${escapeMvp(name)}
                                </span>

                                <strong>
                                    ${count}
                                </strong>
                            </div>

                            <div class="mvp-disease-track">

                                <div
                                    style="width:${width}%">
                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");
}


/* =========================================================
   DISTRICT ANALYTICS
   ========================================================= */

function updateDistrictAnalytics() {

    const container =
        document.getElementById(
            "mvpDistrictAnalytics"
        );

    if (!container) {
        return;
    }

    const districts = {};

    livestockData.forEach(animal => {

        const district =
            animal.district ||
            "Unknown";

        if (!districts[district]) {

            districts[district] = {
                total: 0,
                high: 0,
                atRisk: 0,
                mortality: 0
            };

        }

        districts[district].total++;

        const record =
            getLatestMvpRecord(
                animal.id
            );

        const status =
            String(
                record?.healthStatus ||
                "HEALTHY"
            ).toUpperCase();

        if (status.includes("HIGH RISK")) {
            districts[district].high++;
        }

        if (status.includes("AT RISK")) {
            districts[district].atRisk++;
        }

        if (record?.mortalityReported === true) {
            districts[district].mortality++;
        }

    });

    const entries =
        Object.entries(districts)
            .sort(
                (a, b) =>
                    (
                        b[1].high +
                        b[1].atRisk
                    ) -
                    (
                        a[1].high +
                        a[1].atRisk
                    )
            );

    container.innerHTML =
        entries
            .map(
                ([district, data]) => `

                    <div class="mvp-district-row">

                        <div class="mvp-district-name">

                            <strong>
                                ${escapeMvp(district)}
                            </strong>

                            <small>
                                ${data.total} animals
                            </small>

                        </div>

                        <div class="mvp-district-stats">

                            <span>
                                High: ${data.high}
                            </span>

                            <span>
                                At Risk: ${data.atRisk}
                            </span>

                            <span>
                                Mortality: ${data.mortality}
                            </span>

                        </div>

                    </div>

                `
            )
            .join("");
}


/* =========================================================
   REPORT GENERATION
   ========================================================= */

function generateMvpReport(type) {

    if (
        typeof livestockData === "undefined" ||
        typeof healthRecordsData === "undefined"
    ) {
        return;
    }

    const now =
        new Date().toLocaleString();

    const totalAnimals =
        livestockData.length;

    const totalRecords =
        healthRecordsData.length;

    const highRisk =
        healthRecordsData.filter(
            r =>
                String(
                    r.healthStatus || ""
                )
                    .toUpperCase()
                    .includes("HIGH RISK")
        ).length;

    const atRisk =
        healthRecordsData.filter(
            r =>
                String(
                    r.healthStatus || ""
                )
                    .toUpperCase()
                    .includes("AT RISK")
        ).length;

    const mortality =
        healthRecordsData.filter(
            r =>
                r.mortalityReported === true
        ).length;

    let title =
        "Livestock Health Surveillance Report";

    let body = "";

    if (type === "RISK") {

        title =
            "Livestock Risk Report";

        body = `
            <h2>Risk Summary</h2>

            <p>
                High Risk Cases:
                <strong>${highRisk}</strong>
            </p>

            <p>
                At Risk Cases:
                <strong>${atRisk}</strong>
            </p>

            <p>
                Mortality Reports:
                <strong>${mortality}</strong>
            </p>
        `;

    } else if (type === "VACCINATION") {

        title =
            "Livestock Vaccination Report";

        const vaccinated =
            getVaccinatedCount();

        const coverage =
            totalAnimals
                ? Math.round(
                    (vaccinated /
                        totalAnimals) *
                    100
                )
                : 0;

        body = `

            <h2>Vaccination Summary</h2>

            <p>
                Total Animals:
                <strong>${totalAnimals}</strong>
            </p>

            <p>
                Vaccinated:
                <strong>${vaccinated}</strong>
            </p>

            <p>
                Coverage:
                <strong>${coverage}%</strong>
            </p>

        `;

    } else if (type === "OUTBREAK") {

        title =
            "Outbreak Surveillance Report";

        const outbreaks =
            typeof outbreakAlertsData !==
            "undefined"
                ? outbreakAlertsData
                : [];

        body = `

            <h2>Outbreak Summary</h2>

            <p>
                Detected Alerts:
                <strong>${outbreaks.length}</strong>
            </p>

            ${
            outbreaks.length
                ? outbreaks
                    .map(
                        alert => `
                                <p>
                                    <strong>
                                        ${escapeMvp(
                            alert.village ||
                            "Unknown"
                        )}
                                    </strong>
                                    —
                                    ${escapeMvp(
                            alert.riskLevel ||
                            "Unknown"
                        )}
                                </p>
                            `
                    )
                    .join("")
                : "<p>No outbreak alerts detected.</p>"
        }

        `;

    } else {

        body = `

            <h2>Overall Summary</h2>

            <p>
                Total Livestock:
                <strong>${totalAnimals}</strong>
            </p>

            <p>
                Health Records:
                <strong>${totalRecords}</strong>
            </p>

            <p>
                High Risk:
                <strong>${highRisk}</strong>
            </p>

            <p>
                At Risk:
                <strong>${atRisk}</strong>
            </p>

            <p>
                Mortality Reports:
                <strong>${mortality}</strong>
            </p>

            <h2>System Modules</h2>

            <ul>
                <li>Livestock Registration</li>
                <li>Health Assessment</li>
                <li>AI/ML Risk Prediction</li>
                <li>Risk Alerts</li>
                <li>Geospatial Surveillance</li>
                <li>Outbreak Detection</li>
                <li>Veterinary Response</li>
                <li>Laboratory Referral</li>
                <li>Treatment & Follow-up</li>
                <li>Vaccination Surveillance</li>
                <li>Offline Field Reporting</li>
                <li>Multilingual Alerts</li>
            </ul>

        `;
    }

    const reportWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );

    if (!reportWindow) {
        alert(
            "Please allow pop-ups to generate the report."
        );
        return;
    }

    reportWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                ${escapeMvp(title)}
            </title>

            <style>

                body {
                    font-family:
                        Arial,
                        sans-serif;

                    max-width:
                        850px;

                    margin:
                        40px auto;

                    padding:
                        30px;

                    color:
                        #17251e;

                    line-height:
                        1.6;
                }

                h1 {
                    color:
                        #176b4a;

                    border-bottom:
                        2px solid #176b4a;

                    padding-bottom:
                        12px;
                }

                h2 {
                    color:
                        #176b4a;

                    margin-top:
                        30px;
                }

                strong {
                    color:
                        #0b5d3e;
                }

                .report-header {
                    display:
                        flex;

                    justify-content:
                        space-between;

                    margin-bottom:
                        30px;
                }

                .footer {
                    margin-top:
                        50px;

                    padding-top:
                        15px;

                    border-top:
                        1px solid #ddd;

                    font-size:
                        12px;

                    color:
                        #777;
                }

                button {
                    padding:
                        10px 16px;

                    border:
                        0;

                    background:
                        #176b4a;

                    color:
                        white;

                    cursor:
                        pointer;

                    border-radius:
                        6px;
                }

                @media print {

                    button {
                        display:
                            none;
                    }

                }

            </style>

        </head>

        <body>

            <div class="report-header">

                <div>

                    <h1>
                        ${escapeMvp(title)}
                    </h1>

                    <p>
                        Smart Livestock Health
                        Monitoring System
                    </p>

                </div>

                <button
                    onclick="window.print()">
                    Print / Save PDF
                </button>

            </div>

            <p>
                Generated:
                ${escapeMvp(now)}
            </p>

            ${body}

            <div class="footer">
                Livestock Health Monitor •
                SIH 2026 MVP
            </div>

        </body>

        </html>

    `);

    reportWindow.document.close();
}


/* =========================================================
   HELPERS
   ========================================================= */

function getLatestMvpRecord(livestockId) {

    const records =
        (healthRecordsData || [])
            .filter(
                record =>
                    Number(
                        record.livestockId
                    ) === Number(livestockId)
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

    return records[0] || null;
}


function getVaccinatedCount() {

    const latest = {};

    (healthRecordsData || [])
        .forEach(record => {

            const id =
                record.livestockId;

            if (!id) {
                return;
            }

            if (
                !latest[id] ||
                new Date(
                    record.reportDate || 0
                ) >
                new Date(
                    latest[id].reportDate || 0
                )
            ) {
                latest[id] = record;
            }

        });

    return Object.values(latest)
        .filter(
            record =>
                String(
                    record.vaccinationStatus ||
                    ""
                )
                    .toLowerCase()
                    .includes("vaccinated")
        ).length;
}


function getMvpRiskClass(status) {

    const value =
        String(status || "")
            .toUpperCase();

    if (value.includes("HIGH")) {
        return "mvp-high";
    }

    if (value.includes("AT RISK")) {
        return "mvp-at-risk";
    }

    return "mvp-healthy";
}


function setMvpText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function escapeMvp(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}