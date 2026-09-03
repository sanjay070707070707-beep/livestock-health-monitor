
package com.sih.livestockhealthmonitor.service;

import com.sih.livestockhealthmonitor.entity.HealthRecord;
import com.sih.livestockhealthmonitor.entity.Livestock;
import com.sih.livestockhealthmonitor.entity.OutbreakAlert;
import com.sih.livestockhealthmonitor.repository.HealthRecordRepository;
import com.sih.livestockhealthmonitor.repository.LivestockRepository;
import com.sih.livestockhealthmonitor.repository.OutbreakAlertRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OutbreakAlertService {

    private final OutbreakAlertRepository outbreakAlertRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final LivestockRepository livestockRepository;

    public OutbreakAlertService(
            OutbreakAlertRepository outbreakAlertRepository,
            HealthRecordRepository healthRecordRepository,
            LivestockRepository livestockRepository) {
        this.outbreakAlertRepository = outbreakAlertRepository;
        this.healthRecordRepository = healthRecordRepository;
        this.livestockRepository = livestockRepository;
    }

    public List<OutbreakAlert> detectOutbreaks() {
        List<Livestock> livestock = livestockRepository.findAll();
        List<HealthRecord> allRecords = healthRecordRepository.findAll();

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        List<HealthRecord> recentRecords = allRecords.stream()
                .filter(record -> record.getReportDate() != null)
                .filter(record -> record.getReportDate().isAfter(sevenDaysAgo))
                .collect(Collectors.toList());

        Map<String, List<HealthRecord>> villageRecords = new HashMap<>();

        for (HealthRecord record : recentRecords) {
            if (record.getLivestockId() == null) {
                continue;
            }

            Livestock animal = livestock.stream()
                    .filter(item -> Objects.equals(item.getId(), record.getLivestockId()))
                    .findFirst()
                    .orElse(null);

            if (animal == null || animal.getVillage() == null || animal.getVillage().trim().isEmpty()) {
                continue;
            }

            String villageKey = animal.getVillage().trim().toLowerCase();

            villageRecords
                    .computeIfAbsent(villageKey, key -> new ArrayList<>())
                    .add(record);
        }

        List<OutbreakAlert> alerts = new ArrayList<>();

        for (Map.Entry<String, List<HealthRecord>> entry : villageRecords.entrySet()) {
            String village = entry.getKey();
            List<HealthRecord> records = entry.getValue();

            List<HealthRecord> riskyRecords = records.stream()
                    .filter(record ->
                            "HIGH RISK".equalsIgnoreCase(record.getHealthStatus()) ||
                                    "AT RISK".equalsIgnoreCase(record.getHealthStatus()) ||
                                    "MEDIUM RISK".equalsIgnoreCase(record.getHealthStatus()))
                    .collect(Collectors.toList());

            int affectedAnimals = (int) riskyRecords.stream()
                    .map(HealthRecord::getLivestockId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();

            int deaths = (int) riskyRecords.stream()
                    .filter(HealthRecord::isMortalityReported)
                    .map(HealthRecord::getLivestockId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();

            if (affectedAnimals < 2 && deaths == 0) {
                continue;
            }

            Map<String, Integer> symptomCount = new HashMap<>();

            for (HealthRecord record : riskyRecords) {
                String symptoms = record.getSymptoms();

                if (symptoms == null || symptoms.trim().isEmpty()) {
                    continue;
                }

                String[] symptomList = symptoms
                        .toLowerCase()
                        .split("[,;]");

                for (String symptom : symptomList) {
                    String cleaned = symptom.trim();

                    if (!cleaned.isEmpty()) {
                        symptomCount.merge(cleaned, 1, Integer::sum);
                    }
                }
            }

            String commonSymptoms = symptomCount.entrySet()
                    .stream()
                    .filter(item -> item.getValue() >= 2)
                    .sorted(
                            Map.Entry.<String, Integer>comparingByValue().reversed()
                    )
                    .map(Map.Entry::getKey)
                    .limit(3)
                    .collect(Collectors.joining(", "));

            int riskScore = affectedAnimals + (deaths * 3);

            String riskLevel;
            String recommendation;

            if (riskScore >= 5 || (deaths >= 1 && affectedAnimals >= 3)) {
                riskLevel = "HIGH";
                recommendation = "Immediate veterinary inspection recommended. " +
                        "Mortality has been reported. Notify the responsible " +
                        "veterinary authority, inspect nearby livestock and " +
                        "consider sample collection.";
            } else if (riskScore >= 3 || deaths >= 1) {
                riskLevel = "MEDIUM";
                recommendation = "Veterinary field inspection recommended. " +
                        "Monitor nearby livestock, review vaccination status " +
                        "and investigate the reported cases.";
            } else {
                riskLevel = "LOW";
                recommendation = "Continue monitoring animals in the village " +
                        "and report additional suspected cases.";
            }

            Livestock firstAnimal = livestock.stream()
                    .filter(animal ->
                            animal.getVillage() != null &&
                                    animal.getVillage().equalsIgnoreCase(village))
                    .findFirst()
                    .orElse(null);

            String block = firstAnimal != null ? firstAnimal.getBlock() : null;
            String district = firstAnimal != null ? firstAnimal.getDistrict() : null;

            OutbreakAlert alert = new OutbreakAlert();

            alert.setVillage(
                    firstAnimal != null ? firstAnimal.getVillage() : village
            );
            alert.setBlock(block);
            alert.setDistrict(district);

            String displaySymptoms = commonSymptoms;

            if (deaths > 0) {
                if (displaySymptoms == null || displaySymptoms.isBlank()) {
                    displaySymptoms = "Mortality reported";
                } else {
                    displaySymptoms += " | Mortality reported";
                }
            }

            if (displaySymptoms == null || displaySymptoms.isBlank()) {
                displaySymptoms = "Multiple risky cases reported";
            }

            alert.setCommonSymptoms(displaySymptoms);
            alert.setAffectedAnimals(affectedAnimals);
            alert.setRiskLevel(riskLevel);
            alert.setRecommendation(recommendation);
            alert.setDetectedAt(LocalDateTime.now());

            alerts.add(alert);
        }

        if (!alerts.isEmpty()) {
            outbreakAlertRepository.saveAll(alerts);
        }

        return alerts;
    }

    public List<OutbreakAlert> getAllAlerts() {
        return outbreakAlertRepository.findAll();
    }

    public List<OutbreakAlert> getVillageAlerts(String village) {
        return outbreakAlertRepository.findByVillageIgnoreCase(village);
    }

    public List<OutbreakAlert> getDistrictAlerts(String district) {
        return outbreakAlertRepository.findByDistrictIgnoreCase(district);
    }

    public List<OutbreakAlert> getHighRiskAlerts() {
        return outbreakAlertRepository.findByRiskLevelIgnoreCase("HIGH");
    }
}