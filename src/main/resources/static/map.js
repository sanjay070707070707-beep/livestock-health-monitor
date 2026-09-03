// =========================================================
// LIVESTOCK HEALTH MONITOR
// GEOSPATIAL SURVEILLANCE MAP
// =========================================================

let livestockMap = null;
let livestockMapMarkers = [];

// =========================================================
// INITIALIZE MAP
// =========================================================

function initializeLivestockMap() {
    const mapContainer =
        document.getElementById("livestockMap");

    if (!mapContainer) {
        console.error(
            "livestockMap container was not found."
        );
        return;
    }

    if (typeof L === "undefined") {
        console.error(
            "Leaflet library was not loaded."
        );

        const message =
            document.getElementById("mapMessage");

        if (message) {
            message.textContent =
                "Map library could not be loaded.";
        }

        return;
    }

    if (livestockMap) {
        livestockMap.remove();
        livestockMap = null;
    }

    livestockMap = L.map(
        "livestockMap",
        {
            center: [20.5937, 78.9629],
            zoom: 5,
            minZoom: 4,
            maxZoom: 18,
            zoomControl: true
        }
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(livestockMap);

    setTimeout(() => {
        if (livestockMap) {
            livestockMap.invalidateSize();
        }
    }, 300);
}

// =========================================================
// GET LATEST HEALTH RECORD
// =========================================================

function getLatestHealthRecord(
    livestockId,
    records
) {
    const animalRecords =
        records.filter(
            record =>
                Number(record.livestockId) ===
                Number(livestockId)
        );

    if (animalRecords.length === 0) {
        return null;
    }

    animalRecords.sort(
        (a, b) => {
            const dateA =
                a.reportDate
                    ? new Date(
                        a.reportDate
                    ).getTime()
                    : 0;

            const dateB =
                b.reportDate
                    ? new Date(
                        b.reportDate
                    ).getTime()
                    : 0;

            if (dateA !== dateB) {
                return dateB - dateA;
            }

            return (
                Number(b.id || 0) -
                Number(a.id || 0)
            );
        }
    );

    return animalRecords[0];
}

// =========================================================
// RISK INFORMATION
// =========================================================

function getMapRiskInfo(status) {
    const normalized =
        String(
            status || "HEALTHY"
        )
            .toUpperCase()
            .trim();

    if (normalized === "HIGH RISK") {
        return {
            label: "HIGH RISK",
            color: "#ef4444",
            icon: "🚨"
        };
    }

    if (
        normalized === "AT RISK" ||
        normalized === "MEDIUM RISK"
    ) {
        return {
            label: "AT RISK",
            color: "#f59e0b",
            icon: "⚠️"
        };
    }

    return {
        label: "HEALTHY",
        color: "#16a34a",
        icon: "🟢"
    };
}

// =========================================================
// CREATE POPUP
// =========================================================

function createAnimalPopup(
    animal,
    healthRecord
) {
    const status =
        healthRecord
            ? healthRecord.healthStatus
            : "HEALTHY";

    const risk =
        getMapRiskInfo(status);

    const temperature =
        healthRecord &&
        healthRecord.temperature !== undefined
            ? `${healthRecord.temperature} °C`
            : "No health record";

    const symptoms =
        healthRecord &&
        healthRecord.symptoms
            ? healthRecord.symptoms
            : "No symptoms reported";

    const vaccination =
        healthRecord &&
        healthRecord.vaccinationStatus
            ? healthRecord.vaccinationStatus
            : "Not provided";

    const mortality =
        healthRecord &&
        healthRecord.mortalityReported
            ? "☠️ Reported"
            : "No";

    return `
        <div class="map-popup">

            <div class="map-popup-header">

                <strong>
                    🐄 ${escapeHtml(
        animal.tagNumber ||
        "Unknown Animal"
    )}
                </strong>

                <span class="map-popup-risk">
                    ${risk.icon}
                    ${escapeHtml(risk.label)}
                </span>

            </div>

            <div class="map-popup-body">

                <p>
                    <strong>Animal:</strong>
                    ${escapeHtml(
        animal.animalType ||
        "Not provided"
    )}
                </p>

                <p>
                    <strong>Breed:</strong>
                    ${escapeHtml(
        animal.breed ||
        "Not provided"
    )}
                </p>

                <p>
                    <strong>Village:</strong>
                    ${escapeHtml(
        animal.village ||
        "Not provided"
    )}
                </p>

                <p>
                    <strong>Block:</strong>
                    ${escapeHtml(
        animal.block ||
        "Not provided"
    )}
                </p>

                <p>
                    <strong>District:</strong>
                    ${escapeHtml(
        animal.district ||
        "Not provided"
    )}
                </p>

                <p>
                    <strong>Temperature:</strong>
                    ${escapeHtml(
        temperature
    )}
                </p>

                <p>
                    <strong>Symptoms:</strong>
                    ${escapeHtml(
        symptoms
    )}
                </p>

                <p>
                    <strong>Vaccination:</strong>
                    ${escapeHtml(
        vaccination
    )}
                </p>

                <p>
                    <strong>Mortality:</strong>
                    ${escapeHtml(
        mortality
    )}
                </p>

            </div>
        </div>
    `;
}

// =========================================================
// CREATE LIVESTOCK MARKER
// =========================================================

function createLivestockMarker(
    animal,
    healthRecord
) {
    if (
        animal.latitude === null ||
        animal.latitude === undefined ||
        animal.longitude === null ||
        animal.longitude === undefined
    ) {
        return null;
    }

    const latitude =
        Number(animal.latitude);

    const longitude =
        Number(animal.longitude);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        return null;
    }

    if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return null;
    }

    const status =
        healthRecord
            ? healthRecord.healthStatus
            : "HEALTHY";

    const risk =
        getMapRiskInfo(status);

    const marker =
        L.circleMarker(
            [
                latitude,
                longitude
            ],
            {
                radius: 10,
                color: "#ffffff",
                weight: 2,
                fillColor: risk.color,
                fillOpacity: 0.9
            }
        );

    marker.bindPopup(
        createAnimalPopup(
            animal,
            healthRecord
        ),
        {
            maxWidth: 340
        }
    );

    marker.addTo(
        livestockMap
    );

    return marker;
}

// =========================================================
// UPDATE MAP
// =========================================================

function updateSurveillanceMap(
    livestock,
    healthRecords
) {
    if (!Array.isArray(livestock)) {
        livestock = [];
    }

    if (!Array.isArray(healthRecords)) {
        healthRecords = [];
    }

    if (!livestockMap) {
        initializeLivestockMap();
    }

    if (!livestockMap) {
        return;
    }

    livestockMapMarkers.forEach(
        marker => {
            marker.remove();
        }
    );

    livestockMapMarkers = [];

    const mappedAnimals = [];
    const villages = new Set();

    let highRiskCount = 0;
    let atRiskCount = 0;

    livestock.forEach(
        animal => {
            const healthRecord =
                getLatestHealthRecord(
                    animal.id,
                    healthRecords
                );

            const marker =
                createLivestockMarker(
                    animal,
                    healthRecord
                );

            if (!marker) {
                return;
            }

            livestockMapMarkers.push(
                marker
            );

            mappedAnimals.push({
                animal: animal,
                healthRecord: healthRecord
            });

            if (animal.village) {
                villages.add(
                    animal.village
                        .trim()
                        .toLowerCase()
                );
            }

            const status =
                healthRecord
                    ? String(
                        healthRecord.healthStatus ||
                        "HEALTHY"
                    )
                        .toUpperCase()
                        .trim()
                    : "HEALTHY";

            if (
                status === "HIGH RISK"
            ) {
                highRiskCount++;
            }

            if (
                status === "AT RISK" ||
                status === "MEDIUM RISK"
            ) {
                atRiskCount++;
            }
        }
    );

    updateMapStatistics(
        mappedAnimals.length,
        highRiskCount,
        atRiskCount,
        villages.size
    );

    const message =
        document.getElementById(
            "mapMessage"
        );

    if (
        mappedAnimals.length === 0
    ) {
        if (message) {
            message.textContent =
                "No livestock with valid GPS coordinates is available for mapping.";
        }

        livestockMap.setView(
            [20.5937, 78.9629],
            5
        );

        return;
    }

    if (message) {
        message.textContent =
            `${mappedAnimals.length} livestock location(s) displayed on the surveillance map.`;
    }

    const bounds =
        L.latLngBounds(
            mappedAnimals.map(
                item => [
                    Number(
                        item.animal.latitude
                    ),
                    Number(
                        item.animal.longitude
                    )
                ]
            )
        );

    if (bounds.isValid()) {
        if (
            mappedAnimals.length === 1
        ) {
            livestockMap.setView(
                bounds.getCenter(),
                14
            );
        } else {
            livestockMap.fitBounds(
                bounds,
                {
                    padding: [
                        40,
                        40
                    ],
                    maxZoom: 15
                }
            );
        }
    }

    setTimeout(() => {
        if (livestockMap) {
            livestockMap.invalidateSize();
        }
    }, 300);
}

// =========================================================
// MAP STATISTICS
// =========================================================

function updateMapStatistics(
    mappedAnimals,
    highRisk,
    atRisk,
    villages
) {
    const mappedAnimalsElement =
        document.getElementById(
            "mappedAnimals"
        );

    const highRiskElement =
        document.getElementById(
            "mappedHighRisk"
        );

    const atRiskElement =
        document.getElementById(
            "mappedAtRisk"
        );

    const villagesElement =
        document.getElementById(
            "mappedVillages"
        );

    if (mappedAnimalsElement) {
        mappedAnimalsElement.textContent =
            mappedAnimals;
    }

    if (highRiskElement) {
        highRiskElement.textContent =
            highRisk;
    }

    if (atRiskElement) {
        atRiskElement.textContent =
            atRisk;
    }

    if (villagesElement) {
        villagesElement.textContent =
            villages;
    }
}

// =========================================================
// START MAP
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeLivestockMap();

        setTimeout(() => {
            if (
                typeof livestockData !==
                "undefined" &&
                typeof healthRecordsData !==
                "undefined"
            ) {
                updateSurveillanceMap(
                    livestockData,
                    healthRecordsData
                );
            }
        }, 1000);
    }
);