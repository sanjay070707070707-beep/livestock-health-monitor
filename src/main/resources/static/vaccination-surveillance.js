(function () {

    function createSection() {
        if (document.getElementById("vaccinationSurveillance")) return;

        const weatherSection =
            document.getElementById("weatherRiskSection");

        if (!weatherSection) return;

        const section = document.createElement("section");

        section.id = "vaccinationSurveillance";
        section.className = "vaccination-surveillance";

        section.innerHTML = `
            <div class="section-heading">
                <div>
                    <span class="section-label">
                        PREVENTIVE HEALTH
                    </span>

                    <h2>💉 Vaccination Surveillance</h2>

                    <p>
                        Monitor vaccination coverage and identify
                        livestock requiring preventive action.
                    </p>
                </div>
            </div>

            <div class="vaccination-surveillance-grid">

                <div class="vaccination-main-card">

                    <div class="vaccination-circle">
                        <strong id="vsCoverage">0%</strong>
                        <span>Coverage</span>
                    </div>

                    <div class="vaccination-main-info">

                        <h3>Vaccination Coverage</h3>

                        <p>
                            Latest vaccination status across
                            registered livestock.
                        </p>

                        <div class="vaccination-progress">
                            <div
                                id="vsProgress"
                                class="vaccination-progress-fill">
                            </div>
                        </div>

                    </div>

                </div>

                <div class="vaccination-count-card">
                    <span>💉</span>
                    <small>Vaccinated</small>
                    <strong id="vsVaccinated">0</strong>
                </div>

                <div class="vaccination-count-card warning">
                    <span>⚠️</span>
                    <small>Not Vaccinated</small>
                    <strong id="vsUnvaccinated">0</strong>
                </div>

                <div class="vaccination-count-card">
                    <span>🐄</span>
                    <small>Total Animals</small>
                    <strong id="vsTotal">0</strong>
                </div>

            </div>

            <div class="vaccination-action-box">

                <div>
                    <span class="section-label">
                        PREVENTIVE ACTION
                    </span>

                    <h3 id="vsActionTitle">
                        Vaccination monitoring active
                    </h3>

                    <p id="vsActionText">
                        Continue maintaining vaccination records.
                    </p>
                </div>

                <div
                    id="vsActionBadge"
                    class="vaccination-action-badge">
                    MONITOR
                </div>

            </div>
        `;

        weatherSection.insertAdjacentElement(
            "afterend",
            section
        );
    }


    function updateData() {

        if (
            typeof livestockData === "undefined" ||
            typeof healthRecordsData === "undefined"
        ) {
            return;
        }

        const latest = new Map();

        healthRecordsData.forEach(record => {

            const existing =
                latest.get(record.livestockId);

            if (
                !existing ||
                new Date(record.reportDate || 0) >
                new Date(existing.reportDate || 0)
            ) {
                latest.set(
                    record.livestockId,
                    record
                );
            }
        });


        let vaccinated = 0;
        let unvaccinated = 0;

        livestockData.forEach(animal => {

            const record =
                latest.get(animal.id);

            if (!record) {
                unvaccinated++;
                return;
            }

            const status =
                String(
                    record.vaccinationStatus || ""
                ).toLowerCase();

            if (
                status === "vaccinated" ||
                status === "yes" ||
                status === "completed"
            ) {
                vaccinated++;
            } else {
                unvaccinated++;
            }
        });


        const total =
            vaccinated + unvaccinated;

        const coverage =
            total > 0
                ? Math.round(
                    (vaccinated / total) * 100
                )
                : 0;


        setText(
            "vsVaccinated",
            vaccinated
        );

        setText(
            "vsUnvaccinated",
            unvaccinated
        );

        setText(
            "vsTotal",
            total
        );

        setText(
            "vsCoverage",
            coverage + "%"
        );


        const progress =
            document.getElementById(
                "vsProgress"
            );

        if (progress) {
            progress.style.width =
                coverage + "%";
        }


        updateAction(
            coverage,
            unvaccinated
        );
    }


    function updateAction(
        coverage,
        unvaccinated
    ) {

        const title =
            document.getElementById(
                "vsActionTitle"
            );

        const text =
            document.getElementById(
                "vsActionText"
            );

        const badge =
            document.getElementById(
                "vsActionBadge"
            );

        if (!title || !text || !badge) {
            return;
        }


        if (coverage < 50) {

            title.textContent =
                "Low vaccination coverage";

            text.textContent =
                `${unvaccinated} animals require vaccination status review and preventive follow-up.`;

            badge.textContent =
                "ACTION REQUIRED";

            badge.className =
                "vaccination-action-badge danger";

        } else if (coverage < 80) {

            title.textContent =
                "Vaccination coverage needs improvement";

            text.textContent =
                `${unvaccinated} animals should be reviewed for pending vaccination.`;

            badge.textContent =
                "FOLLOW-UP";

            badge.className =
                "vaccination-action-badge warning";

        } else {

            title.textContent =
                "Vaccination coverage is being maintained";

            text.textContent =
                "Continue updating vaccination records during field visits.";

            badge.textContent =
                "MONITOR";

            badge.className =
                "vaccination-action-badge success";
        }
    }


    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(() => {

                createSection();
                updateData();

            }, 2200);

            setInterval(
                updateData,
                3000
            );
        }
    );

})();