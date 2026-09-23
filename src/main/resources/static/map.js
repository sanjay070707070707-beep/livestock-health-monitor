let livestockMap = null;
let mapMarkers = [];

function initializeLivestockMap() {
    const mapElement =
        document.getElementById("livestockMap");

    if (!mapElement) {
        return;
    }

    if (livestockMap) {
        return;
    }

    livestockMap = L.map("livestockMap").setView(
        [20.5937, 78.9629],
        5
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19
        }
    ).addTo(livestockMap);
}

function getAnimalRiskStatus(
    livestockId,
    healthRecords
) {
    const records =
        healthRecords
            .filter(
                record =>
                    record.livestockId === livestockId
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

    if (records.length === 0) {
        return "HEALTHY";
    }

    return (
        records[0].healthStatus ||
        "HEALTHY"
    ).toUpperCase();
}

function getMarkerColor(status) {
    if (status === "HIGH RISK") {
        return "#ef4444";
    }

    if (
        status === "AT RISK" ||
        status === "MEDIUM RISK"
    ) {
        return "#f59e0b";
    }

    return "#16a34a";
}

function createAnimalMarker(
    animal,
    status
) {
    const color =
        getMarkerColor(status);

    const marker =
        L.circleMarker(
            [
                Number(animal.latitude),
                Number(animal.longitude)
            ],
            {
                radius: 9,
                fillColor: color,
                color: "#ffffff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            }
        );

    const riskClass =
        status === "HIGH RISK"
            ? "map-risk-high"
            : status === "AT RISK" ||
            status === "MEDIUM RISK"
                ? "map-risk-at-risk"
                : "map-risk-healthy";

    marker.bindPopup(`
        <div class="map-popup">
            <div class="map-popup-header">
                <strong>
                    ${escapeHtml(animal.tagNumber)}
                </strong>

                <span class="map-popup-risk ${riskClass}">
                    ${escapeHtml(status)}
                </span>
            </div>

            <div class="map-popup-body">
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
            </div>
        </div>
    `);

    return marker;
}

function updateSurveillanceMap(
    livestock,
    healthRecords
) {
    initializeLivestockMap();

    if (!livestockMap) {
        return;
    }

    mapMarkers.forEach(marker => {
        livestockMap.removeLayer(marker);
    });

    mapMarkers = [];

    const mappedAnimals =
        livestock.filter(
            animal =>
                animal.latitude !== null &&
                animal.latitude !== undefined &&
                animal.longitude !== null &&
                animal.longitude !== undefined &&
                !Number.isNaN(
                    Number(animal.latitude)
                ) &&
                !Number.isNaN(
                    Number(animal.longitude)
                )
        );

    const highRiskAnimals =
        mappedAnimals.filter(
            animal =>
                getAnimalRiskStatus(
                    animal.id,
                    healthRecords
                ) === "HIGH RISK"
        );

    const atRiskAnimals =
        mappedAnimals.filter(
            animal => {
                const status =
                    getAnimalRiskStatus(
                        animal.id,
                        healthRecords
                    );

                return (
                    status === "AT RISK" ||
                    status === "MEDIUM RISK"
                );
            }
        );

    const villages =
        new Set(
            mappedAnimals
                .map(
                    animal =>
                        animal.village
                )
                .filter(Boolean)
        );

    const mappedAnimalsElement =
        document.getElementById(
            "mappedAnimals"
        );

    const mappedHighRiskElement =
        document.getElementById(
            "mappedHighRisk"
        );

    const mappedAtRiskElement =
        document.getElementById(
            "mappedAtRisk"
        );

    const mappedVillagesElement =
        document.getElementById(
            "mappedVillages"
        );

    if (mappedAnimalsElement) {
        mappedAnimalsElement.textContent =
            mappedAnimals.length;
    }

    if (mappedHighRiskElement) {
        mappedHighRiskElement.textContent =
            highRiskAnimals.length;
    }

    if (mappedAtRiskElement) {
        mappedAtRiskElement.textContent =
            atRiskAnimals.length;
    }

    if (mappedVillagesElement) {
        mappedVillagesElement.textContent =
            villages.size;
    }

    if (mappedAnimals.length === 0) {
        livestockMap.setView(
            [20.5937, 78.9629],
            5
        );

        const mapMessage =
            document.getElementById(
                "mapMessage"
            );

        if (mapMessage) {
            mapMessage.textContent =
                "No livestock with valid GPS coordinates available.";
        }

        return;
    }

    const bounds = [];

    mappedAnimals.forEach(animal => {
        const status =
            getAnimalRiskStatus(
                animal.id,
                healthRecords
            );

        const marker =
            createAnimalMarker(
                animal,
                status
            );

        marker.addTo(livestockMap);

        mapMarkers.push(marker);

        bounds.push([
            Number(animal.latitude),
            Number(animal.longitude)
        ]);
    });

    if (bounds.length === 1) {
        livestockMap.setView(
            bounds[0],
            14
        );
    } else {
        livestockMap.fitBounds(
            bounds,
            {
                padding: [40, 40]
            }
        );
    }

    const mapMessage =
        document.getElementById(
            "mapMessage"
        );

    if (mapMessage) {
        mapMessage.textContent =
            `${mappedAnimals.length} animal(s) mapped across ${villages.size} village(s).`;
    }

    setTimeout(() => {
        livestockMap.invalidateSize();
    }, 200);
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeLivestockMap();
    }
);