// =========================================================
// EMERGENCY ALERT / NOTIFICATION CENTER
// =========================================================

(function () {

    const STORAGE_KEY = "livestock-resolved-emergency-alerts";

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

    function getResolvedAlerts() {
        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );
        } catch {
            return [];
        }
    }

    function saveResolvedAlerts(alerts) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(alerts)
        );
    }

    function getAlertId(alert) {
        return [
            alert.village || "",
            alert.block || "",
            alert.district || "",
            alert.riskLevel || "",
            alert.affectedAnimals || "",
            alert.commonSymptoms || ""
        ].join("|").toLowerCase();
    }

    function createSection() {

        if (
            document.getElementById(
                "emergencyAlertSection"
            )
        ) {
            return;
        }

        const outbreakSection =
            document.getElementById(
                "outbreakSurveillance"
            );

        if (!outbreakSection) {
            return;
        }

        const section =
            document.createElement("section");

        section.id =
            "emergencyAlertSection";

        section.className =
            "emergency-alert-section";

        section.innerHTML = `
            <div class="section-heading">
                <div>
                    <span class="section-label">
                        EMERGENCY RESPONSE
                    </span>

                    <h2>
                        🚨 Emergency Alert Center
                    </h2>

                    <p class="emergency-subtitle">
                        Critical livestock health notifications requiring immediate field response.
                    </p>
                </div>

                <div class="emergency-status-pill">
                    <span class="emergency-status-dot"></span>
                    <span id="emergencyAlertStatus">
                        Monitoring
                    </span>
                </div>
            </div>

            <div class="emergency-summary">

                <div class="emergency-stat">
                    <span>Critical Alerts</span>
                    <strong id="criticalAlertCount">
                        0
                    </strong>
                </div>

                <div class="emergency-stat">
                    <span>High Risk Animals</span>
                    <strong id="emergencyHighRiskCount">
                        0
                    </strong>
                </div>

                <div class="emergency-stat">
                    <span>Villages Requiring Action</span>
                    <strong id="emergencyVillageCount">
                        0
                    </strong>
                </div>

                <div class="emergency-stat">
                    <span>Resolved</span>
                    <strong id="resolvedAlertCount">
                        0
                    </strong>
                </div>

            </div>

            <div
                id="emergencyAlertList"
                class="emergency-alert-list"
            >
                <div class="empty-state">
                    Checking emergency alerts...
                </div>
            </div>
        `;

        outbreakSection.insertAdjacentElement(
            "afterend",
            section
        );
    }

    function getCriticalAlerts() {

        const alerts = [];

        // -----------------------------------------
        // OUTBREAK ALERTS
        // -----------------------------------------

        if (
            typeof outbreakAlertsData !==
            "undefined" &&
            Array.isArray(outbreakAlertsData)
        ) {

            outbreakAlertsData.forEach(alert => {

                const level =
                    String(
                        alert.riskLevel || ""
                    ).toUpperCase();

                if (
                    level === "HIGH" ||
                    level === "MEDIUM"
                ) {

                    alerts.push({
                        type: "OUTBREAK",
                        severity:
                            level === "HIGH"
                                ? "CRITICAL"
                                : "HIGH",

                        village:
                        alert.village,

                        block:
                        alert.block,

                        district:
                        alert.district,

                        affectedAnimals:
                            Number(
                                alert.affectedAnimals || 0
                            ),

                        symptoms:
                            alert.commonSymptoms ||
                            "Multiple risky cases reported",

                        recommendation:
                            alert.recommendation ||
                            "Veterinary field inspection required.",

                        detectedAt:
                        alert.detectedAt
                    });
                }
            });
        }

        // -----------------------------------------
        // HIGH-RISK ANIMAL ALERTS
        // -----------------------------------------

        if (
            typeof healthRecordsData !==
            "undefined" &&
            typeof livestockData !==
            "undefined"
        ) {

            healthRecordsData
                .filter(record =>
                    String(
                        record.healthStatus || ""
                    ).toUpperCase() ===
                    "HIGH RISK"
                )
                .forEach(record => {

                    const animal =
                        livestockData.find(
                            item =>
                                item.id ===
                                record.livestockId
                        );

                    if (!animal) {
                        return;
                    }

                    alerts.push({
                        type: "ANIMAL",
                        severity: "CRITICAL",

                        animalTag:
                        animal.tagNumber,

                        village:
                        animal.village,

                        block:
                        animal.block,

                        district:
                        animal.district,

                        affectedAnimals: 1,

                        temperature:
                        record.temperature,

                        symptoms:
                            record.symptoms ||
                            "High-risk health condition",

                        recommendation:
                            record.recommendation ||
                            "Immediate veterinary attention required.",

                        detectedAt:
                        record.reportDate
                    });
                });
        }

        return alerts;
    }

    function renderAlerts() {

        const container =
            document.getElementById(
                "emergencyAlertList"
            );

        if (!container) {
            return;
        }

        const alerts =
            getCriticalAlerts();

        const resolved =
            getResolvedAlerts();

        const activeAlerts =
            alerts.filter(
                alert =>
                    !resolved.includes(
                        getAlertId(alert)
                    )
            );

        const criticalCount =
            activeAlerts.filter(
                alert =>
                    alert.severity ===
                    "CRITICAL"
            ).length;

        const highRiskAnimals =
            activeAlerts.filter(
                alert =>
                    alert.type === "ANIMAL"
            ).length;

        const villages =
            new Set(
                activeAlerts
                    .map(
                        alert =>
                            alert.village
                    )
                    .filter(Boolean)
            );

        document.getElementById(
            "criticalAlertCount"
        ).textContent = criticalCount;

        document.getElementById(
            "emergencyHighRiskCount"
        ).textContent = highRiskAnimals;

        document.getElementById(
            "emergencyVillageCount"
        ).textContent = villages.size;

        document.getElementById(
            "resolvedAlertCount"
        ).textContent =
            resolved.length;

        const status =
            document.getElementById(
                "emergencyAlertStatus"
            );

        if (status) {

            status.textContent =
                activeAlerts.length > 0
                    ? "Action Required"
                    : "All Clear";

            status.parentElement.classList.toggle(
                "emergency-active",
                activeAlerts.length > 0
            );
        }

        if (activeAlerts.length === 0) {

            container.innerHTML = `
                <div class="emergency-clear">
                    <div class="emergency-clear-icon">
                        ✓
                    </div>

                    <div>
                        <h3>
                            No Active Emergency Alerts
                        </h3>

                        <p>
                            No unresolved critical livestock health or outbreak alerts are currently detected.
                        </p>
                    </div>
                </div>
            `;

            return;
        }

        container.innerHTML =
            activeAlerts
                .sort(
                    (a, b) =>
                        a.severity ===
                        "CRITICAL"
                            ? -1
                            : 1
                )
                .map(
                    (alert, index) => {

                        const id =
                            getAlertId(alert);

                        const isCritical =
                            alert.severity ===
                            "CRITICAL";

                        return `
                            <div
                                class="
                                    emergency-card
                                    ${isCritical
                            ? "emergency-critical"
                            : "emergency-high"}
                                "
                            >

                                <div class="emergency-card-header">

                                    <div>
                                        <span
                                            class="
                                                emergency-severity
                                                ${isCritical
                            ? "critical"
                            : "high"}
                                            "
                                        >
                                            ${
                            isCritical
                                ? "🚨 CRITICAL"
                                : "⚠️ HIGH PRIORITY"
                        }
                                        </span>

                                        <h3>
                                            ${
                            alert.type ===
                            "OUTBREAK"
                                ? `📍 ${escapeHtml(
                                    alert.village ||
                                    "Unknown Village"
                                )}`
                                : `🐄 ${escapeHtml(
                                    alert.animalTag ||
                                    "Livestock"
                                )}`
                        }
                                        </h3>
                                    </div>

                                    <span class="emergency-type">
                                        ${escapeHtml(
                            alert.type
                        )}
                                    </span>

                                </div>

                                <div class="emergency-location">

                                    <span>
                                        📍
                                        ${escapeHtml(
                            alert.village ||
                            "Unknown Village"
                        )}
                                    </span>

                                    <span>
                                        ${escapeHtml(
                            alert.block ||
                            "Block unavailable"
                        )}
                                    </span>

                                    <span>
                                        ${escapeHtml(
                            alert.district ||
                            "District unavailable"
                        )}
                                    </span>

                                </div>

                                <div class="emergency-details">

                                    ${
                            alert.temperature !==
                            undefined
                                ? `
                                                <div>
                                                    <span>
                                                        Temperature
                                                    </span>

                                                    <strong>
                                                        ${escapeHtml(
                                    alert.temperature
                                )} °C
                                                    </strong>
                                                </div>
                                            `
                                : ""
                        }

                                    <div>
                                        <span>
                                            Affected Animals
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                            alert.affectedAnimals
                        )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Alert Type
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                            alert.type
                        )}
                                        </strong>
                                    </div>

                                </div>

                                <div class="emergency-symptoms">

                                    <span>
                                        Reported Symptoms
                                    </span>

                                    <p>
                                        ${escapeHtml(
                            alert.symptoms
                        )}
                                    </p>

                                </div>

                                <div class="emergency-action">

                                    <span>
                                        🩺 Recommended Field Action
                                    </span>

                                    <p>
                                        ${escapeHtml(
                            alert.recommendation
                        )}
                                    </p>

                                </div>

                                <div class="emergency-card-footer">

                                    <small>
                                        Detected:
                                        ${
                            alert.detectedAt
                                ? new Date(
                                    alert.detectedAt
                                ).toLocaleString()
                                : "Recently"
                        }
                                    </small>

                                    <button
                                        type="button"
                                        class="emergency-resolve-button"
                                        data-alert-id="${escapeHtml(
                            id
                        )}"
                                    >
                                        ✓ Mark Resolved
                                    </button>

                                </div>

                            </div>
                        `;
                    }
                )
                .join("");

        document
            .querySelectorAll(
                ".emergency-resolve-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.alertId;

                        const resolved =
                            getResolvedAlerts();

                        if (
                            !resolved.includes(id)
                        ) {
                            resolved.push(id);
                        }

                        saveResolvedAlerts(
                            resolved
                        );

                        renderAlerts();
                    }
                );
            });
    }

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(() => {

                createSection();

                renderAlerts();

            }, 1800);

            setInterval(
                renderAlerts,
                4000
            );
        }
    );

})();