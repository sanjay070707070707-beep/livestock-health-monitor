(function () {

    function createSection() {
        if (document.getElementById("outbreakMapSection")) return;

        const vaccination =
            document.getElementById(
                "vaccinationSurveillance"
            );

        if (!vaccination) return;

        const section = document.createElement("section");

        section.id = "outbreakMapSection";
        section.className = "outbreak-map-section";

        section.innerHTML = `
            <div class="section-heading">
                <div>
                    <span class="section-label">
                        OUTBREAK SURVEILLANCE
                    </span>

                    <h2>🚨 Village Outbreak Monitoring</h2>

                    <p>
                        Identify villages requiring immediate
                        disease surveillance and veterinary response.
                    </p>
                </div>
            </div>

            <div
                id="outbreakVillageList"
                class="outbreak-village-list">
            </div>
        `;

        vaccination.insertAdjacentElement(
            "afterend",
            section
        );
    }


    function renderOutbreaks() {

        const container =
            document.getElementById(
                "outbreakVillageList"
            );

        if (!container) return;

        if (
            typeof livestockData === "undefined" ||
            typeof healthRecordsData === "undefined"
        ) {
            return;
        }


        const villages = {};


        livestockData.forEach(animal => {

            const village =
                animal.village ||
                "Unknown Village";

            if (!villages[village]) {

                villages[village] = {
                    total: 0,
                    high: 0,
                    risk: 0,
                    mortality: 0,
                    animals: []
                };
            }

            villages[village].total++;

            villages[village]
                .animals
                .push(animal.id);
        });


        healthRecordsData.forEach(record => {

            const animal =
                livestockData.find(
                    item =>
                        item.id ===
                        record.livestockId
                );

            if (!animal) return;

            const village =
                animal.village ||
                "Unknown Village";

            const data =
                villages[village];

            if (!data) return;

            const status =
                String(
                    record.healthStatus || ""
                ).toUpperCase();

            if (status === "HIGH RISK") {
                data.high++;
            }

            if (
                status === "AT RISK" ||
                status === "MEDIUM RISK"
            ) {
                data.risk++;
            }

            if (
                record.mortalityReported === true
            ) {
                data.mortality++;
            }
        });


        const entries =
            Object.entries(villages)
                .map(([village, data]) => ({
                    village,
                    ...data,
                    score:
                        data.high * 3 +
                        data.risk +
                        data.mortality * 4
                }))
                .filter(item => item.score > 0)
                .sort(
                    (a, b) =>
                        b.score - a.score
                )
                .slice(0, 8);


        if (entries.length === 0) {

            container.innerHTML = `
                <div class="outbreak-empty">
                    ✓ No active village-level outbreak
                    indicators detected.
                </div>
            `;

            return;
        }


        container.innerHTML =
            entries.map(item => {

                let level = "MONITOR";
                let levelClass = "monitor";

                if (item.score >= 6) {
                    level = "HIGH ALERT";
                    levelClass = "high";
                } else if (item.score >= 3) {
                    level = "WATCH";
                    levelClass = "watch";
                }


                return `
                    <div
                        class="
                        outbreak-village-card
                        ${levelClass}
                        ">

                        <div
                            class="
                            outbreak-village-header">

                            <div>

                                <span
                                    class="
                                    outbreak-level
                                    ${levelClass}">

                                    ${level}

                                </span>

                                <h3>
                                    📍
                                    ${escapeHtml(
                    item.village
                )}
                                </h3>

                            </div>

                            <div
                                class="
                                outbreak-score">

                                ${item.score}

                            </div>

                        </div>


                        <div
                            class="
                            outbreak-village-stats">

                            <div>
                                <small>
                                    Animals
                                </small>
                                <strong>
                                    ${item.total}
                                </strong>
                            </div>

                            <div>
                                <small>
                                    High Risk
                                </small>
                                <strong class="red">
                                    ${item.high}
                                </strong>
                            </div>

                            <div>
                                <small>
                                    At Risk
                                </small>
                                <strong class="yellow">
                                    ${item.risk}
                                </strong>
                            </div>

                            <div>
                                <small>
                                    Mortality
                                </small>
                                <strong class="red">
                                    ${item.mortality}
                                </strong>
                            </div>

                        </div>


                        <div
                            class="
                            outbreak-response">

                            ${
                    levelClass === "high"
                        ? "🚨 Immediate veterinary surveillance recommended."
                        : levelClass === "watch"
                            ? "⚠️ Increase monitoring and field follow-up."
                            : "👁️ Continue routine surveillance."
                }

                        </div>

                    </div>
                `;

            }).join("");
    }


    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
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

                createSection();
                renderOutbreaks();

            }, 2400);

            setInterval(
                renderOutbreaks,
                3000
            );
        }
    );

})();