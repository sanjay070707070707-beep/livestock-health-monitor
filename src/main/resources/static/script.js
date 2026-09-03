// =========================================================
// LIVESTOCK HEALTH MONITOR
// MAIN FRONTEND SCRIPT
// =========================================================

let livestockData = [];
let healthRecordsData = [];
let outbreakAlertsData = [];

// =========================================================
// COMMON UTILITIES
// =========================================================

function showMessage(elementId, message, type = "success") {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `form-message ${type}`;

    setTimeout(() => {
        element.textContent = "";
        element.className = "form-message";
    }, 4000);
}

function escapeHtml(value) {
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

function formatDate(dateValue) {
    if (!dateValue) {
        return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString();
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    const target = Number(targetValue) || 0;
    const duration = 500;
    const startTime = performance.now();

    function update(currentTime) {
        const progress =
            Math.min((currentTime - startTime) / duration, 1);

        const value = Math.floor(progress * target);

        element.textContent = value;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function showLoading(elementId, message = "Loading...") {
    const element = document.getElementById(elementId);

    if (element) {
        element.innerHTML =
            `<div class="empty-state">${escapeHtml(message)}</div>`;
    }
}

// =========================================================
// LOAD DASHBOARD DATA
// =========================================================

async function loadData() {
    try {
        showLoading(
            "livestockList",
            "Loading livestock..."
        );

        showLoading(
            "healthRecordsList",
            "Loading health records..."
        );

        const [
            livestockResponse,
            healthResponse
        ] = await Promise.all([
            fetch("/api/livestock"),
            fetch("/api/health-records")
        ]);

        if (!livestockResponse.ok) {
            throw new Error(
                "Failed to load livestock data"
            );
        }

        if (!healthResponse.ok) {
            throw new Error(
                "Failed to load health records"
            );
        }

        livestockData =
            await livestockResponse.json();

        healthRecordsData =
            await healthResponse.json();

        animateNumber(
            "totalLivestock",
            livestockData.length
        );

        animateNumber(
            "totalRecords",
            healthRecordsData.length
        );

        const highRiskCount =
            healthRecordsData.filter(
                record =>
                    record.healthStatus === "HIGH RISK"
            ).length;

        const mortalityCount =
            healthRecordsData.filter(
                record =>
                    record.mortalityReported === true
            ).length;

        animateNumber(
            "highRisk",
            highRiskCount
        );

        animateNumber(
            "mortalityCount",
            mortalityCount
        );

        updateLivestockDropdown();
        updateHistoryDropdown();

        displayLivestock();
        displayHealthRecords();
        displayRiskAlerts();
        updateVaccinationStats();

        await detectOutbreaks();

        // =================================================
        // UPDATE GEOSPATIAL SURVEILLANCE MAP
        // =================================================

        if (
            typeof updateSurveillanceMap ===
            "function"
        ) {
            updateSurveillanceMap(
                livestockData,
                healthRecordsData
            );
        }

    } catch (error) {
        console.error(
            "Error loading dashboard data:",
            error
        );

        showLoading(
            "livestockList",
            "Unable to load livestock data."
        );

        showLoading(
            "healthRecordsList",
            "Unable to load health records."
        );

        const mapMessage =
            document.getElementById("mapMessage");

        if (mapMessage) {
            mapMessage.textContent =
                "Unable to load surveillance map data.";
        }
    }
}

// =========================================================
// LIVESTOCK DROPDOWN
// =========================================================

function updateLivestockDropdown() {
    const select =
        document.getElementById("livestockSelect");

    if (!select) {
        return;
    }

    select.innerHTML =
        '<option value="">Select livestock</option>';

    livestockData.forEach(animal => {
        const option =
            document.createElement("option");

        option.value = animal.id;

        option.textContent =
            `${animal.tagNumber} - ${animal.animalType}`;

        select.appendChild(option);
    });
}

function updateHistoryDropdown() {
    const select =
        document.getElementById(
            "historyLivestockSelect"
        );

    if (!select) {
        return;
    }

    select.innerHTML =
        '<option value="">Select livestock</option>';

    livestockData.forEach(animal => {
        const option =
            document.createElement("option");

        option.value = animal.id;

        option.textContent =
            `${animal.tagNumber} - ${animal.animalType}`;

        select.appendChild(option);
    });
}

// =========================================================
// DISPLAY LIVESTOCK
// =========================================================

function displayLivestock() {
    const container =
        document.getElementById("livestockList");

    if (!container) {
        return;
    }

    if (livestockData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No livestock registered yet.
            </div>
        `;

        return;
    }

    container.innerHTML =
        livestockData.map(animal => `
            <div class="livestock-card">

                <div class="card-header">
                    <h3>
                        ${escapeHtml(animal.tagNumber)}
                    </h3>

                    <button
                        type="button"
                        class="delete-button"
                        onclick="deleteLivestock(
                            ${animal.id},
                            '${escapeHtml(animal.tagNumber)}'
                        )"
                    >
                        🗑️ Delete
                    </button>
                </div>

                <div class="card-details">

                    <p>
                        <strong>Animal:</strong>
                        ${escapeHtml(animal.animalType)}
                    </p>

                    <p>
                        <strong>Breed:</strong>
                        ${escapeHtml(animal.breed)}
                    </p>

                    <p>
                        <strong>Age:</strong>
                        ${escapeHtml(animal.age)} years
                    </p>

                    <p>
                        <strong>Gender:</strong>
                        ${escapeHtml(animal.gender)}
                    </p>

                    <p>
                        <strong>Village:</strong>
                        ${escapeHtml(animal.village)}
                    </p>

                    <p>
                        <strong>Block:</strong>
                        ${escapeHtml(animal.block)}
                    </p>

                    <p>
                        <strong>District:</strong>
                        ${escapeHtml(animal.district)}
                    </p>

                    ${
            animal.latitude !== null &&
            animal.latitude !== undefined &&
            animal.longitude !== null &&
            animal.longitude !== undefined
                ? `
                            <p>
                                <strong>Location:</strong>
                                ${escapeHtml(animal.latitude)},
                                ${escapeHtml(animal.longitude)}
                            </p>
                        `
                : ""
        }

                </div>
            </div>
        `).join("");
}

// =========================================================
// RISK CLASS
// =========================================================

function getRiskClass(status) {
    if (!status) {
        return "risk-unknown";
    }

    const normalizedStatus =
        status.toUpperCase();

    if (normalizedStatus === "HIGH RISK") {
        return "risk-high";
    }

    if (
        normalizedStatus === "AT RISK" ||
        normalizedStatus === "MEDIUM RISK"
    ) {
        return "risk-medium";
    }

    if (normalizedStatus === "HEALTHY") {
        return "risk-low";
    }

    return "risk-unknown";
}

// =========================================================
// DISPLAY HEALTH RECORDS
// =========================================================

function displayHealthRecords() {
    const container =
        document.getElementById(
            "healthRecordsList"
        );

    if (!container) {
        return;
    }

    if (healthRecordsData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No health records available yet.
            </div>
        `;

        return;
    }

    const sortedRecords =
        [...healthRecordsData].sort(
            (a, b) =>
                new Date(b.reportDate || 0) -
                new Date(a.reportDate || 0)
        );

    container.innerHTML =
        sortedRecords.map(record => {
            const animal =
                livestockData.find(
                    item =>
                        item.id === record.livestockId
                );

            const animalName =
                animal
                    ? animal.tagNumber
                    : `Livestock #${record.livestockId}`;

            const riskClass =
                getRiskClass(
                    record.healthStatus
                );

            return `
                <div class="health-record-card ${riskClass}">

                    <div class="card-header">
                        <h3>
                            ${escapeHtml(animalName)}
                        </h3>

                        <span class="risk-badge ${riskClass}">
                            ${escapeHtml(
                record.healthStatus ||
                "UNKNOWN"
            )}
                        </span>
                    </div>

                    <div class="card-details">

                        <p>
                            <strong>Temperature:</strong>
                            ${escapeHtml(record.temperature)} °C
                        </p>

                        <p>
                            <strong>Symptoms:</strong>
                            ${escapeHtml(
                record.symptoms || "None"
            )}
                        </p>

                        <p>
                            <strong>Vaccination:</strong>
                            ${escapeHtml(
                record.vaccinationStatus ||
                "Not provided"
            )}
                        </p>

                        <p>
                            <strong>Treatment:</strong>
                            ${escapeHtml(
                record.treatment ||
                "Not provided"
            )}
                        </p>

                        <p>
                            <strong>Reported By:</strong>
                            ${escapeHtml(
                record.reportedBy ||
                "Field User"
            )}
                        </p>

                        <p>
                            <strong>Reported:</strong>
                            ${formatDate(
                record.reportDate
            )}
                        </p>

                        ${
                record.mortalityReported
                    ? `
                                <p class="mortality-warning">
                                    <strong>☠ Mortality:</strong>
                                    ${escapeHtml(
                        record.mortalityReason ||
                        "Mortality reported"
                    )}
                                </p>
                            `
                    : ""
            }

                        <p>
                            <strong>Recommendation:</strong>
                            ${escapeHtml(
                record.recommendation ||
                "Continue monitoring"
            )}
                        </p>

                    </div>
                </div>
            `;
        }).join("");
}

// =========================================================
// DELETE LIVESTOCK
// =========================================================

async function deleteLivestock(
    id,
    tagNumber
) {
    const confirmed =
        confirm(
            `Are you sure you want to delete livestock "${tagNumber}"?\n\nThis action cannot be undone.`
        );

    if (!confirmed) {
        return;
    }

    try {
        const response =
            await fetch(
                `/api/livestock/${id}`,
                {
                    method: "DELETE"
                }
            );

        if (response.ok) {
            alert(
                `Livestock "${tagNumber}" deleted successfully.`
            );

            await loadData();

        } else if (response.status === 404) {
            alert(
                "Livestock not found. It may already be deleted."
            );

            await loadData();

        } else {
            const errorText =
                await response.text();

            console.error(
                "Delete failed:",
                response.status,
                errorText
            );

            alert(
                "Unable to delete livestock. Please check the application console."
            );
        }

    } catch (error) {
        console.error(
            "Error deleting livestock:",
            error
        );

        alert(
            "Unable to connect to the server. Please make sure the Spring Boot application is running."
        );
    }
}

// =========================================================
// SUBMIT LIVESTOCK
// =========================================================

async function submitLivestock(event) {
    event.preventDefault();

    const livestock = {
        tagNumber:
            document.getElementById(
                "tagNumber"
            ).value.trim(),

        animalType:
        document.getElementById(
            "animalType"
        ).value,

        breed:
            document.getElementById(
                "breed"
            ).value.trim(),

        age:
            Number(
                document.getElementById(
                    "age"
                ).value
            ),

        gender:
        document.getElementById(
            "gender"
        ).value,

        village:
            document.getElementById(
                "village"
            ).value.trim(),

        block:
            document.getElementById(
                "block"
            ).value.trim(),

        district:
            document.getElementById(
                "district"
            ).value.trim(),

        latitude:
            document.getElementById(
                "latitude"
            ).value
                ? Number(
                    document.getElementById(
                        "latitude"
                    ).value
                )
                : null,

        longitude:
            document.getElementById(
                "longitude"
            ).value
                ? Number(
                    document.getElementById(
                        "longitude"
                    ).value
                )
                : null
    };

    try {
        const response =
            await fetch(
                "/api/livestock",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify(
                            livestock
                        )
                }
            );

        if (!response.ok) {
            throw new Error(
                "Failed to register livestock"
            );
        }

        document.getElementById(
            "livestockForm"
        ).reset();

        showMessage(
            "livestockMessage",
            "Livestock registered successfully.",
            "success"
        );

        await loadData();

    } catch (error) {
        console.error(
            "Error registering livestock:",
            error
        );

        showMessage(
            "livestockMessage",
            "Unable to register livestock.",
            "error"
        );
    }
}

// =========================================================
// SUBMIT HEALTH RECORD
// =========================================================

async function submitHealthRecord(event) {
    event.preventDefault();

    const healthRecord = {
        livestockId:
            Number(
                document.getElementById(
                    "livestockSelect"
                ).value
            ),

        temperature:
            Number(
                document.getElementById(
                    "temperature"
                ).value
            ),

        symptoms:
            document.getElementById(
                "symptoms"
            ).value.trim(),

        vaccinationStatus:
        document.getElementById(
            "vaccinationStatus"
        ).value,

        treatment:
            document.getElementById(
                "treatment"
            ).value.trim(),

        reportedBy:
            document.getElementById(
                "reportedBy"
            ).value.trim(),

        mortalityReported:
        document.getElementById(
            "mortalityReported"
        ).checked,

        mortalityReason:
            document.getElementById(
                "mortalityReason"
            ).value.trim()
    };

    if (!healthRecord.livestockId) {
        showMessage(
            "healthMessage",
            "Please select a livestock animal.",
            "error"
        );

        return;
    }

    try {
        const response =
            await fetch(
                "/api/health-records",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify(
                            healthRecord
                        )
                }
            );

        if (!response.ok) {
            throw new Error(
                "Failed to submit health record"
            );
        }

        document.getElementById(
            "healthForm"
        ).reset();

        showMessage(
            "healthMessage",
            "Health record submitted successfully.",
            "success"
        );

        await loadData();

    } catch (error) {
        console.error(
            "Error submitting health record:",
            error
        );

        showMessage(
            "healthMessage",
            "Unable to submit health record.",
            "error"
        );
    }
}

// =========================================================
// RISK ALERTS
// =========================================================

function displayRiskAlerts() {
    const container =
        document.getElementById(
            "riskAlerts"
        );

    if (!container) {
        return;
    }

    const riskyRecords =
        healthRecordsData
            .filter(
                record =>
                    record.healthStatus ===
                    "HIGH RISK" ||
                    record.healthStatus ===
                    "AT RISK" ||
                    record.healthStatus ===
                    "MEDIUM RISK"
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
            <div class="empty-state">
                🟢 No active livestock risk alerts.
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

            const riskClass =
                getRiskClass(
                    record.healthStatus
                );

            return `
                <div class="risk-alert ${riskClass}">

                    <div>
                        <strong>
                            ${escapeHtml(animalName)}
                        </strong>

                        <span>
                            ${escapeHtml(
                record.healthStatus
            )}
                        </span>
                    </div>

                    <p>
                        ${escapeHtml(
                record.symptoms ||
                "Symptoms not provided"
            )}
                    </p>

                    <small>
                        ${escapeHtml(
                record.recommendation ||
                "Veterinary monitoring recommended"
            )}
                    </small>

                </div>
            `;
        }).join("");
}

// =========================================================
// OUTBREAK DETECTION
// =========================================================

async function detectOutbreaks() {
    const container =
        document.getElementById(
            "outbreakAlerts"
        );

    if (!container) {
        return;
    }

    try {
        container.innerHTML = `
            <div class="empty-state">
                Checking for village-level outbreak patterns...
            </div>
        `;

        const response =
            await fetch(
                "/api/outbreaks/detect"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to detect outbreaks"
            );
        }

        outbreakAlertsData =
            await response.json();

        displayOutbreakAlerts();

    } catch (error) {
        console.error(
            "Outbreak detection error:",
            error
        );

        displayOutbreakError();
    }
}

function displayOutbreakAlerts() {
    const container =
        document.getElementById(
            "outbreakAlerts"
        );

    if (!container) {
        return;
    }

    if (
        outbreakAlertsData.length === 0
    ) {
        container.innerHTML = `
            <div class="empty-state">
                🟢 No outbreak patterns detected.
            </div>
        `;

        return;
    }

    container.innerHTML =
        outbreakAlertsData.map(alert => `
            <div class="outbreak-card outbreak-${escapeHtml(
            String(
                alert.riskLevel ||
                "LOW"
            ).toLowerCase()
        )}">

                <div class="card-header">

                    <h3>
                        🚨 ${escapeHtml(
            alert.village
        )}
                    </h3>

                    <span class="risk-badge">
                        ${escapeHtml(
            alert.riskLevel
        )}
                    </span>

                </div>

                <div class="card-details">

                    <p>
                        <strong>Block:</strong>
                        ${escapeHtml(
            alert.block ||
            "Not available"
        )}
                    </p>

                    <p>
                        <strong>District:</strong>
                        ${escapeHtml(
            alert.district ||
            "Not available"
        )}
                    </p>

                    <p>
                        <strong>Affected Animals:</strong>
                        ${escapeHtml(
            alert.affectedAnimals
        )}
                    </p>

                    <p>
                        <strong>Common Symptoms:</strong>
                        ${escapeHtml(
            alert.commonSymptoms ||
            "Multiple risky cases reported"
        )}
                    </p>

                    <p>
                        <strong>Recommendation:</strong>
                        ${escapeHtml(
            alert.recommendation
        )}
                    </p>

                    <p>
                        <strong>Detected:</strong>
                        ${formatDate(
            alert.detectedAt
        )}
                    </p>

                </div>
            </div>
        `).join("");
}

function displayOutbreakError() {
    const container =
        document.getElementById(
            "outbreakAlerts"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-state">
            Unable to check outbreak patterns.
        </div>
    `;
}

// =========================================================
// VACCINATION STATISTICS
// =========================================================

function updateVaccinationStats() {
    const latestRecords =
        new Map();

    healthRecordsData.forEach(record => {
        if (!record.livestockId) {
            return;
        }

        const existing =
            latestRecords.get(
                record.livestockId
            );

        if (
            !existing ||
            new Date(
                record.reportDate || 0
            ) >
            new Date(
                existing.reportDate || 0
            )
        ) {
            latestRecords.set(
                record.livestockId,
                record
            );
        }
    });

    let vaccinatedCount = 0;
    let unvaccinatedCount = 0;

    livestockData.forEach(animal => {
        const record =
            latestRecords.get(
                animal.id
            );

        if (!record) {
            unvaccinatedCount++;
            return;
        }

        const status =
            String(
                record.vaccinationStatus ||
                ""
            )
                .toLowerCase()
                .trim();

        if (
            status.includes("up to date") ||
            status.includes("vaccinated") ||
            status.includes("complete") ||
            status.includes("completed")
        ) {
            if (
                !status.includes(
                    "not vaccinated"
                ) &&
                !status.includes(
                    "partially vaccinated"
                )
            ) {
                vaccinatedCount++;
                return;
            }
        }

        unvaccinatedCount++;
    });

    const total =
        livestockData.length;

    const coverage =
        total > 0
            ? Math.round(
                (vaccinatedCount / total) *
                100
            )
            : 0;

    animateNumber(
        "vaccinatedCount",
        vaccinatedCount
    );

    animateNumber(
        "unvaccinatedCount",
        unvaccinatedCount
    );

    animateNumber(
        "vaccinationCoverage",
        coverage
    );

    const progress =
        document.getElementById(
            "vaccinationProgress"
        );

    if (progress) {
        progress.style.width =
            `${coverage}%`;
    }
}

// =========================================================
// HEALTH HISTORY
// =========================================================

async function loadHealthHistory() {
    const select =
        document.getElementById(
            "historyLivestockSelect"
        );

    const container =
        document.getElementById(
            "healthHistory"
        );

    if (!select || !container) {
        return;
    }

    const livestockId =
        select.value;

    if (!livestockId) {
        container.innerHTML = `
            <div class="empty-state">
                Select livestock to view health history.
            </div>
        `;

        return;
    }

    try {
        container.innerHTML = `
            <div class="empty-state">
                Loading health history...
            </div>
        `;

        const response =
            await fetch(
                `/api/health-records/livestock/${livestockId}`
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load health history"
            );
        }

        const history =
            await response.json();

        displayHealthHistory(
            history
        );

    } catch (error) {
        console.error(
            "Health history error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load health history.
            </div>
        `;
    }
}

function displayHealthHistory(
    history
) {
    const container =
        document.getElementById(
            "healthHistory"
        );

    if (!container) {
        return;
    }

    if (
        !history ||
        history.length === 0
    ) {
        container.innerHTML = `
            <div class="empty-state">
                No health history available for this animal.
            </div>
        `;

        return;
    }

    const sortedHistory =
        [...history].sort(
            (a, b) =>
                new Date(
                    b.reportDate || 0
                ) -
                new Date(
                    a.reportDate || 0
                )
        );

    container.innerHTML =
        sortedHistory.map(record => `
            <div class="history-card">

                <div class="card-header">

                    <h3>
                        ${escapeHtml(
            record.healthStatus ||
            "UNKNOWN"
        )}
                    </h3>

                    <span>
                        ${formatDate(
            record.reportDate
        )}
                    </span>

                </div>

                <div class="card-details">

                    <p>
                        <strong>Temperature:</strong>
                        ${escapeHtml(
            record.temperature
        )} °C
                    </p>

                    <p>
                        <strong>Symptoms:</strong>
                        ${escapeHtml(
            record.symptoms ||
            "None"
        )}
                    </p>

                    <p>
                        <strong>Vaccination:</strong>
                        ${escapeHtml(
            record.vaccinationStatus ||
            "Not provided"
        )}
                    </p>

                    <p>
                        <strong>Treatment:</strong>
                        ${escapeHtml(
            record.treatment ||
            "Not provided"
        )}
                    </p>

                    <p>
                        <strong>Recommendation:</strong>
                        ${escapeHtml(
            record.recommendation ||
            "Continue monitoring"
        )}
                    </p>

                    ${
            record.mortalityReported
                ? `
                            <p class="mortality-warning">
                                <strong>☠ Mortality:</strong>
                                ${escapeHtml(
                    record.mortalityReason ||
                    "Mortality reported"
                )}
                            </p>
                        `
                : ""
        }

                </div>
            </div>
        `).join("");
}

// =========================================================
// INITIALIZE APPLICATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const livestockForm =
            document.getElementById(
                "livestockForm"
            );

        if (livestockForm) {
            livestockForm.addEventListener(
                "submit",
                submitLivestock
            );
        }

        const healthForm =
            document.getElementById(
                "healthForm"
            );

        if (healthForm) {
            healthForm.addEventListener(
                "submit",
                submitHealthRecord
            );
        }

        const viewHistoryButton =
            document.getElementById(
                "viewHistoryButton"
            );

        if (viewHistoryButton) {
            viewHistoryButton.addEventListener(
                "click",
                loadHealthHistory
            );
        }

        loadData();
    }
);

// =========================================================
// REFRESH WHEN USER RETURNS TO TAB
// =========================================================

document.addEventListener(
    "visibilitychange",
    () => {
        if (!document.hidden) {
            loadData();
        }
    }
);