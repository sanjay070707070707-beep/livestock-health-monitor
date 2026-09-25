// =========================================================
// LIVESTOCK HEALTH MONITOR
// GEOSPATIAL SURVEILLANCE MAP
// =========================================================

let livestockMap = null;
let livestockMarkers = [];

// =========================================================
// INITIALIZE MAP
// =========================================================

function initializeLivestockMap() {

    const mapElement =
        document.getElementById("livestockMap");

    if (!mapElement) {
        console.error("Map container not found.");
        return;
    }

    if (typeof L === "undefined") {
        console.error("Leaflet library not loaded.");
        return;
    }

    // Prevent duplicate map initialization
    if (livestockMap) {
        livestockMap.remove();
        livestockMap = null;
    }

    livestockMap = L.map("livestockMap", {
        zoomControl: true
    });

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(livestockMap);

    // Initial India/Maharashtra view
    livestockMap.setView(
        [20.5937, 78.9629],
        5
    );
}


// =========================================================
// CREATE RISK ICON
// =========================================================

function createRiskIcon(status) {

    let color = "#22c55e";

    if (status === "AT RISK") {
        color = "#f59e0b";
    }

    if (status === "HIGH RISK") {
        color = "#ef4444";
    }

    return L.divIcon({

        className: "livestock-risk-marker",

        html: `
            <div style="
                width:18px;
                height:18px;
                background:${color};
                border:3px solid white;
                border-radius:50%;
                box-shadow:0 0 0 3px ${color}55,
                           0 3px 10px rgba(0,0,0,0.35);
            "></div>
        `,

        iconSize: [18, 18],

        iconAnchor: [9, 9],

        popupAnchor: [0, -10]
    });
}


// =========================================================
// FIND HEALTH RECORD
// =========================================================

function getHealthRecord(livestockId, healthRecords) {

    if (!Array.isArray(healthRecords)) {
        return null;
    }

    return healthRecords.find(
        record =>
            Number(record.livestockId) === Number(livestockId)
    );
}


// =========================================================
// UPDATE MAP
// =========================================================

function updateSurveillanceMap(
    livestockData,
    healthRecordsData
) {

    if (!livestockMap) {
        initializeLivestockMap();
    }

    if (!livestockMap) {
        return;
    }

    // Remove old markers
    livestockMarkers.forEach(marker => {

        livestockMap.removeLayer(marker);

    });

    livestockMarkers = [];

    // Clear message
    const mapMessage =
        document.getElementById("mapMessage");

    if (mapMessage) {
        mapMessage.textContent = "";
    }

    if (!Array.isArray(livestockData)) {
        livestockData = [];
    }

    if (!Array.isArray(healthRecordsData)) {
        healthRecordsData = [];
    }

    // =====================================================
    // VALID COORDINATE DATA
    // =====================================================

    const mappedAnimals =
        livestockData.filter(animal => {

            const latitude =
                Number(animal.latitude);

            const longitude =
                Number(animal.longitude);

            return (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude) &&
                latitude >= -90 &&
                latitude <= 90 &&
                longitude >= -180 &&
                longitude <= 180
            );

        });


    // =====================================================
    // UPDATE SUMMARY
    // =====================================================

    const mappedAnimalsElement =
        document.getElementById("mappedAnimals");

    if (mappedAnimalsElement) {

        mappedAnimalsElement.textContent =
            mappedAnimals.length;

    }


    const highRiskCount =
        mappedAnimals.filter(animal => {

            const record =
                getHealthRecord(
                    animal.id,
                    healthRecordsData
                );

            return (
                record &&
                record.healthStatus === "HIGH RISK"
            );

        }).length;


    const atRiskCount =
        mappedAnimals.filter(animal => {

            const record =
                getHealthRecord(
                    animal.id,
                    healthRecordsData
                );

            return (
                record &&
                record.healthStatus === "AT RISK"
            );

        }).length;


    const mappedHighRiskElement =
        document.getElementById(
            "mappedHighRisk"
        );

    if (mappedHighRiskElement) {

        mappedHighRiskElement.textContent =
            highRiskCount;

    }


    const mappedAtRiskElement =
        document.getElementById(
            "mappedAtRisk"
        );

    if (mappedAtRiskElement) {

        mappedAtRiskElement.textContent =
            atRiskCount;

    }


    // =====================================================
    // VILLAGE COUNT
    // =====================================================

    const villages =
        new Set(
            mappedAnimals
                .map(animal => animal.village)
                .filter(Boolean)
        );


    const mappedVillagesElement =
        document.getElementById(
            "mappedVillages"
        );

    if (mappedVillagesElement) {

        mappedVillagesElement.textContent =
            villages.size;

    }


    // =====================================================
    // NO LOCATION DATA
    // =====================================================

    if (mappedAnimals.length === 0) {

        if (mapMessage) {

            mapMessage.textContent =
                "No valid latitude/longitude data available.";

        }

        livestockMap.setView(
            [20.5937, 78.9629],
            5
        );

        return;
    }


    // =====================================================
    // ADD MARKERS
    // =====================================================

    const markerCoordinates = [];


    mappedAnimals.forEach(animal => {

        const latitude =
            Number(animal.latitude);

        const longitude =
            Number(animal.longitude);

        const healthRecord =
            getHealthRecord(
                animal.id,
                healthRecordsData
            );


        const status =
            healthRecord &&
            healthRecord.healthStatus
                ? healthRecord.healthStatus
                : "HEALTHY";


        const marker =
            L.marker(
                [latitude, longitude],
                {
                    icon: createRiskIcon(status)
                }
            );


        // =================================================
        // POPUP
        // =================================================

        marker.bindPopup(`
            <div style="
                min-width:220px;
                font-family:Arial,sans-serif;
                line-height:1.5;
            ">

                <h3 style="
                    margin:0 0 8px 0;
                    color:#14532d;
                ">
                    🐄 ${escapeHtmlMap(animal.tagNumber)}
                </h3>

                <p style="margin:3px 0;">
                    <strong>Animal:</strong>
                    ${escapeHtmlMap(animal.animalType)}
                </p>

                <p style="margin:3px 0;">
                    <strong>Breed:</strong>
                    ${escapeHtmlMap(animal.breed)}
                </p>

                <p style="margin:3px 0;">
                    <strong>Village:</strong>
                    ${escapeHtmlMap(animal.village)}
                </p>

                <p style="margin:3px 0;">
                    <strong>District:</strong>
                    ${escapeHtmlMap(animal.district)}
                </p>

                <p style="margin:3px 0;">
                    <strong>Risk:</strong>
                    <span style="
                        font-weight:700;
                    ">
                        ${escapeHtmlMap(status)}
                    </span>
                </p>

                ${
            healthRecord
                ? `
                            <p style="margin:3px 0;">
                                <strong>Temperature:</strong>
                                ${healthRecord.temperature} °C
                            </p>

                            <p style="margin:3px 0;">
                                <strong>Symptoms:</strong>
                                ${escapeHtmlMap(
                    healthRecord.symptoms
                )}
                            </p>
                          `
                : `
                            <p style="
                                margin:6px 0 0;
                                color:#666;
                            ">
                                No health record available.
                            </p>
                          `
        }

                <p style="
                    margin:8px 0 0;
                    font-size:12px;
                    color:#666;
                ">
                    📍 ${latitude.toFixed(4)},
                    ${longitude.toFixed(4)}
                </p>

            </div>
        `);


        marker.addTo(livestockMap);

        livestockMarkers.push(marker);

        markerCoordinates.push([
            latitude,
            longitude
        ]);

    });


    // =====================================================
    // FIT MAP TO ALL MARKERS
    // =====================================================

    if (markerCoordinates.length === 1) {

        livestockMap.setView(
            markerCoordinates[0],
            15
        );

    } else {

        const bounds =
            L.latLngBounds(markerCoordinates);

        livestockMap.fitBounds(
            bounds,
            {
                padding: [50, 50],
                maxZoom: 15
            }
        );

    }


    // =====================================================
    // MAP SIZE FIX
    // =====================================================

    setTimeout(() => {

        if (livestockMap) {
            livestockMap.invalidateSize();
        }

    }, 300);
}


// =========================================================
// LOAD DATA DIRECTLY ON MAP PAGE
// =========================================================

async function loadMapData() {

    try {

        const [
            livestockResponse,
            healthResponse
        ] = await Promise.all([

            fetch("/api/livestock"),

            fetch("/api/health-records")

        ]);


        if (!livestockResponse.ok) {

            throw new Error(
                "Failed to load livestock data."
            );

        }


        if (!healthResponse.ok) {

            throw new Error(
                "Failed to load health records."
            );

        }


        const livestockData =
            await livestockResponse.json();


        const healthRecordsData =
            await healthResponse.json();


        console.log(
            "Livestock map data:",
            livestockData
        );


        console.log(
            "Health map data:",
            healthRecordsData
        );


        updateSurveillanceMap(
            livestockData,
            healthRecordsData
        );


    } catch (error) {

        console.error(
            "Map loading error:",
            error
        );


        const mapMessage =
            document.getElementById(
                "mapMessage"
            );


        if (mapMessage) {

            mapMessage.textContent =
                "Unable to load map data. Check Spring Boot connection.";

        }

    }
}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHtmlMap(value) {

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


// =========================================================
// START MAP
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeLivestockMap();

        loadMapData();

    }
);