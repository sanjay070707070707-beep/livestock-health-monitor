(function () {

    const translations = {

        en: {
            title: "Multilingual Alert Center",
            subtitle: "Risk notifications for field workers and livestock owners",

            high: "HIGH RISK",
            atRisk: "AT RISK",
            healthy: "HEALTHY",

            temperature: "Temperature",
            symptoms: "Symptoms",
            action: "Recommended Action",

            urgent: "Immediate veterinary attention required.",
            monitor: "Monitor the animal and arrange veterinary assessment.",
            normal: "Continue routine monitoring and vaccination."
        },

        mr: {
            title: "बहुभाषिक इशारा केंद्र",
            subtitle: "क्षेत्रीय कर्मचारी आणि पशुपालकांसाठी आरोग्यविषयक सूचना",

            high: "उच्च धोका",
            atRisk: "धोका",
            healthy: "निरोगी",

            temperature: "तापमान",
            symptoms: "लक्षणे",
            action: "शिफारस केलेली कृती",

            urgent: "तात्काळ पशुवैद्यकीय मदत आवश्यक आहे.",
            monitor: "प्राण्याचे निरीक्षण करा आणि पशुवैद्यकाकडून तपासणी करून घ्या.",
            normal: "नियमित निरीक्षण आणि लसीकरण सुरू ठेवा."
        },

        ta: {
            title: "பல்மொழி எச்சரிக்கை மையம்",
            subtitle: "களப்பணியாளர்கள் மற்றும் கால்நடை உரிமையாளர்களுக்கான சுகாதார அறிவிப்புகள்",

            high: "அதிக ஆபத்து",
            atRisk: "ஆபத்து",
            healthy: "ஆரோக்கியமானது",

            temperature: "வெப்பநிலை",
            symptoms: "அறிகுறிகள்",
            action: "பரிந்துரைக்கப்படும் நடவடிக்கை",

            urgent: "உடனடியாக கால்நடை மருத்துவரின் உதவி தேவை.",
            monitor: "விலங்கைக் கண்காணித்து கால்நடை மருத்துவரிடம் பரிசோதனை செய்யவும்.",
            normal: "வழக்கமான கண்காணிப்பு மற்றும் தடுப்பூசியைத் தொடரவும்."
        }
    };

    // English is the default language
    let currentLanguage =
        localStorage.getItem("livestock-language") || "en";


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


    function getText(key) {

        return (
            translations[currentLanguage]?.[key] ||
            translations.en[key] ||
            key
        );
    }


    function getRisk(record) {

        const status =
            String(record.healthStatus || "").toUpperCase();

        if (status.includes("HIGH")) {
            return "high";
        }

        if (
            status.includes("RISK") ||
            status.includes("MEDIUM")
        ) {
            return "atRisk";
        }

        return "healthy";
    }


    function getRiskLabel(record) {

        const risk = getRisk(record);

        if (risk === "high") {
            return getText("high");
        }

        if (risk === "atRisk") {
            return getText("atRisk");
        }

        return getText("healthy");
    }


    function getRecommendation(record) {

        const risk = getRisk(record);

        if (risk === "high") {
            return getText("urgent");
        }

        if (risk === "atRisk") {
            return getText("monitor");
        }

        return getText("normal");
    }


    function createSection() {

        if (
            document.getElementById(
                "multilingualAlertSection"
            )
        ) {
            return;
        }

        const riskSection =
            document.querySelector(".risk-section");

        if (!riskSection) {
            return;
        }

        const section =
            document.createElement("section");

        section.id =
            "multilingualAlertSection";

        section.className =
            "multilingual-alert-section";


        section.innerHTML = `

            <div class="multilingual-header">

                <div>

                    <span class="section-label">
                        FIELD COMMUNICATION
                    </span>

                    <h2 id="multilingualTitle">
                        ${escapeHtml(getText("title"))}
                    </h2>

                    <p id="multilingualSubtitle">
                        ${escapeHtml(getText("subtitle"))}
                    </p>

                </div>


                <div class="language-selector">

                    <button
                        class="language-button"
                        data-language="en">
                        English
                    </button>

                    <button
                        class="language-button"
                        data-language="mr">
                        मराठी
                    </button>

                    <button
                        class="language-button"
                        data-language="ta">
                        தமிழ்
                    </button>

                </div>

            </div>


            <div
                id="multilingualAlertList"
                class="multilingual-alert-list">
            </div>

        `;


        riskSection.insertAdjacentElement(
            "afterend",
            section
        );


        document
            .querySelectorAll(".language-button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        currentLanguage =
                            button.dataset.language;

                        localStorage.setItem(
                            "livestock-language",
                            currentLanguage
                        );

                        updateLanguageButtons();

                        renderAlerts();
                    }
                );

            });


        updateLanguageButtons();
    }


    function updateLanguageButtons() {

        document
            .querySelectorAll(".language-button")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.language ===
                    currentLanguage
                );

            });


        const title =
            document.getElementById(
                "multilingualTitle"
            );

        const subtitle =
            document.getElementById(
                "multilingualSubtitle"
            );


        if (title) {
            title.textContent =
                getText("title");
        }


        if (subtitle) {
            subtitle.textContent =
                getText("subtitle");
        }
    }


    function renderAlerts() {

        const container =
            document.getElementById(
                "multilingualAlertList"
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
                .filter(record => {

                    const risk =
                        getRisk(record);

                    return (
                        risk === "high" ||
                        risk === "atRisk"
                    );

                })
                .sort(
                    (a, b) =>
                        new Date(
                            b.reportDate || 0
                        ) -
                        new Date(
                            a.reportDate || 0
                        )
                )
                .slice(0, 6);


        if (records.length === 0) {

            container.innerHTML = `

                <div class="multilingual-empty">

                    ✓ ${escapeHtml(
                getText("normal")
            )}

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


                const tag =
                    animal
                        ? animal.tagNumber
                        : `Livestock #${record.livestockId}`;


                const risk =
                    getRisk(record);


                return `

                    <div
                        class="
                        multilingual-alert-card
                        ${risk}
                        ">

                        <div
                            class="
                            multilingual-card-top
                            ">

                            <div>

                                <span
                                    class="
                                    multilingual-risk
                                    ${risk}
                                    ">

                                    ${escapeHtml(
                    getRiskLabel(
                        record
                    )
                )}

                                </span>


                                <h3>
                                    ${escapeHtml(tag)}
                                </h3>

                            </div>


                            <div
                                class="
                                multilingual-icon">

                                ${
                    risk === "high"
                        ? "🚨"
                        : "⚠️"
                }

                            </div>

                        </div>


                        <div
                            class="
                            multilingual-details">

                            <div>

                                <span>
                                    ${escapeHtml(
                    getText(
                        "temperature"
                    )
                )}
                                </span>

                                <strong>
                                    ${escapeHtml(
                    record.temperature
                )} °C
                                </strong>

                            </div>


                            <div>

                                <span>
                                    ${escapeHtml(
                    getText(
                        "symptoms"
                    )
                )}
                                </span>

                                <strong>
                                    ${escapeHtml(
                    record.symptoms ||
                    "-"
                )}
                                </strong>

                            </div>

                        </div>


                        <div
                            class="
                            multilingual-recommendation">

                            <span>
                                ${escapeHtml(
                    getText(
                        "action"
                    )
                )}
                            </span>

                            <p>
                                ${escapeHtml(
                    getRecommendation(
                        record
                    )
                )}
                            </p>

                        </div>

                    </div>

                `;

            }).join("");
    }


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(() => {

                createSection();

                renderAlerts();

            }, 1400);


            setInterval(
                renderAlerts,
                3000
            );

        }
    );

})();