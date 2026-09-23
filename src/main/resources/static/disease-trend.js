(function () {

    function createTrendSection() {
        if (document.getElementById("diseaseTrendSection")) return;

        const govDashboard =
            document.getElementById("governmentDashboard");

        if (!govDashboard) return;

        const section = document.createElement("section");

        section.id = "diseaseTrendSection";
        section.className = "disease-trend-section";

        section.innerHTML = `
            <div class="section-heading">
                <div>
                    <span class="section-label">DISEASE SURVEILLANCE</span>
                    <h2>📈 Disease Risk Trend</h2>
                    <p>
                        Recent livestock health cases and risk distribution.
                    </p>
                </div>
            </div>

            <div class="trend-summary">
                <div class="trend-summary-card">
                    <span>HIGH RISK</span>
                    <strong id="trendHigh">0</strong>
                </div>

                <div class="trend-summary-card">
                    <span>AT RISK</span>
                    <strong id="trendAtRisk">0</strong>
                </div>

                <div class="trend-summary-card">
                    <span>HEALTHY</span>
                    <strong id="trendHealthy">0</strong>
                </div>

                <div class="trend-summary-card">
                    <span>TOTAL REPORTS</span>
                    <strong id="trendTotal">0</strong>
                </div>
            </div>

            <div class="trend-chart-wrapper">
                <div id="diseaseTrendChart"
                     class="disease-trend-chart">
                </div>
            </div>
        `;

        govDashboard.insertAdjacentElement(
            "afterend",
            section
        );
    }

    function renderTrend() {

        const chart =
            document.getElementById("diseaseTrendChart");

        if (!chart) return;

        if (
            typeof healthRecordsData === "undefined"
        ) return;

        const records = [...healthRecordsData];

        let high = 0;
        let atRisk = 0;
        let healthy = 0;

        records.forEach(record => {

            const status =
                String(record.healthStatus || "")
                    .toUpperCase();

            if (status === "HIGH RISK") {
                high++;
            } else if (
                status === "AT RISK" ||
                status === "MEDIUM RISK"
            ) {
                atRisk++;
            } else {
                healthy++;
            }
        });

        const total =
            high + atRisk + healthy;

        setText("trendHigh", high);
        setText("trendAtRisk", atRisk);
        setText("trendHealthy", healthy);
        setText("trendTotal", total);

        if (total === 0) {
            chart.innerHTML = `
                <div class="trend-empty">
                    No health records available yet.
                </div>
            `;
            return;
        }

        const values = [
            {
                label: "High Risk",
                value: high,
                className: "high"
            },
            {
                label: "At Risk",
                value: atRisk,
                className: "risk"
            },
            {
                label: "Healthy",
                value: healthy,
                className: "healthy"
            }
        ];

        const max =
            Math.max(...values.map(item => item.value), 1);

        chart.innerHTML =
            values.map(item => {

                const width =
                    Math.round(
                        (item.value / max) * 100
                    );

                return `
                    <div class="trend-row">

                        <div class="trend-label">
                            <span>${item.label}</span>
                            <strong>${item.value}</strong>
                        </div>

                        <div class="trend-bar">
                            <div
                                class="
                                trend-fill
                                ${item.className}
                                "
                                style="width:${width}%">
                            </div>
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

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(() => {
                createTrendSection();
                renderTrend();
            }, 1800);

            setInterval(
                renderTrend,
                3000
            );
        }
    );

})();