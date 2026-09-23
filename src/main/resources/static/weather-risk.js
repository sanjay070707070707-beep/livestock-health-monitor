(function () {

    function createSection() {

        if (document.getElementById("weatherRiskSection")) return;

        const trendSection =
            document.getElementById("diseaseTrendSection");

        if (!trendSection) return;

        const section = document.createElement("section");

        section.id = "weatherRiskSection";
        section.className = "weather-risk-section";

        section.innerHTML = `
            <div class="section-heading">
                <div>
                    <span class="section-label">
                        ENVIRONMENTAL SURVEILLANCE
                    </span>

                    <h2>🌦️ Weather & Livestock Risk</h2>

                    <p>
                        Environmental conditions that may require
                        additional livestock health monitoring.
                    </p>
                </div>

                <div class="weather-status">
                    <span class="status-dot"></span>
                    RISK MONITORING
                </div>
            </div>

            <div class="weather-grid">

                <div class="weather-card">
                    <span class="weather-icon">🌡️</span>
                    <small>Temperature Risk</small>
                    <strong id="weatherTemperatureRisk">
                        Normal
                    </strong>
                </div>

                <div class="weather-card">
                    <span class="weather-icon">💧</span>
                    <small>Humidity Risk</small>
                    <strong id="weatherHumidityRisk">
                        Normal
                    </strong>
                </div>

                <div class="weather-card">
                    <span class="weather-icon">🌧️</span>
                    <small>Rainfall Risk</small>
                    <strong id="weatherRainfallRisk">
                        Normal
                    </strong>
                </div>

                <div class="weather-card">
                    <span class="weather-icon">⚠️</span>
                    <small>Overall Environmental Risk</small>
                    <strong id="weatherOverallRisk">
                        LOW
                    </strong>
                </div>

            </div>

            <div class="weather-recommendation"
                 id="weatherRecommendation">

                <strong>Field Recommendation</strong>

                <p>
                    Continue routine animal health monitoring.
                </p>

            </div>
        `;

        trendSection.insertAdjacentElement(
            "afterend",
            section
        );
    }


    function calculateRisk() {

        if (
            typeof healthRecordsData ===
            "undefined"
        ) {
            return;
        }

        const records =
            healthRecordsData || [];

        if (records.length === 0) {
            updateDisplay(
                "NORMAL",
                "NORMAL",
                "NORMAL",
                "LOW",
                "Continue routine animal health monitoring."
            );
            return;
        }

        let highTemperatureCases = 0;

        records.forEach(record => {

            const temperature =
                Number(record.temperature || 0);

            if (temperature >= 39.5) {
                highTemperatureCases++;
            }

        });


        let temperatureRisk = "NORMAL";
        let humidityRisk = "NORMAL";
        let rainfallRisk = "NORMAL";
        let overallRisk = "LOW";
        let recommendation =
            "Continue routine animal health monitoring.";


        if (highTemperatureCases >= 3) {

            temperatureRisk = "HIGH";
            overallRisk = "HIGH";

            recommendation =
                "Multiple animals show elevated temperature. Increase field surveillance and arrange veterinary assessment for affected animals.";

        } else if (highTemperatureCases >= 1) {

            temperatureRisk = "MODERATE";
            overallRisk = "MODERATE";

            recommendation =
                "Elevated temperature cases detected. Closely monitor affected animals and check for additional symptoms.";

        }


        updateDisplay(
            temperatureRisk,
            humidityRisk,
            rainfallRisk,
            overallRisk,
            recommendation
        );
    }


    function updateDisplay(
        temperature,
        humidity,
        rainfall,
        overall,
        recommendation
    ) {

        setText(
            "weatherTemperatureRisk",
            temperature
        );

        setText(
            "weatherHumidityRisk",
            humidity
        );

        setText(
            "weatherRainfallRisk",
            rainfall
        );

        setText(
            "weatherOverallRisk",
            overall
        );

        const recommendationBox =
            document.getElementById(
                "weatherRecommendation"
            );

        if (recommendationBox) {

            recommendationBox.innerHTML = `
                <strong>
                    Field Recommendation
                </strong>

                <p>
                    ${escapeHtml(recommendation)}
                </p>
            `;
        }

        const overallElement =
            document.getElementById(
                "weatherOverallRisk"
            );

        if (overallElement) {

            overallElement.className =
                "weather-risk-value " +
                overall.toLowerCase();
        }
    }


    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }


    function escapeHtml(value) {

        return String(value || "")
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
                calculateRisk();

            }, 2000);

            setInterval(
                calculateRisk,
                3000
            );

        }
    );

})();