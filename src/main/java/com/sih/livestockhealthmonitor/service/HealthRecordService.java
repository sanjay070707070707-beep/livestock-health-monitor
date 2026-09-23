package com.sih.livestockhealthmonitor.service;

import com.sih.livestockhealthmonitor.entity.HealthRecord;
import com.sih.livestockhealthmonitor.entity.Livestock;
import com.sih.livestockhealthmonitor.ml.LivestockPrediction;
import com.sih.livestockhealthmonitor.ml.LivestockRiskModel;
import com.sih.livestockhealthmonitor.repository.HealthRecordRepository;
import com.sih.livestockhealthmonitor.repository.LivestockRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;
    private final LivestockRepository livestockRepository;
    private final LivestockRiskModel livestockRiskModel;

    public HealthRecordService(
            HealthRecordRepository healthRecordRepository,
            LivestockRepository livestockRepository,
            LivestockRiskModel livestockRiskModel) {

        this.healthRecordRepository = healthRecordRepository;
        this.livestockRepository = livestockRepository;
        this.livestockRiskModel = livestockRiskModel;
    }

    public HealthRecord createRecord(HealthRecord healthRecord) {

        Livestock livestock =
                livestockRepository.findById(
                        healthRecord.getLivestockId()
                ).orElse(null);

        String animalType =
                livestock != null
                        ? livestock.getAnimalType()
                        : "Cattle";

        int age =
                livestock != null
                        ? livestock.getAge()
                        : 0;

        String symptoms =
                healthRecord.getSymptoms() == null
                        ? ""
                        : healthRecord.getSymptoms();

        String vaccinationStatus =
                healthRecord.getVaccinationStatus();

        boolean mortalityReported =
                healthRecord.isMortalityReported();

        // =========================================================
        // AI / ML PREDICTION
        // =========================================================

        LivestockPrediction prediction =
                livestockRiskModel.predict(
                        healthRecord.getTemperature(),
                        age,
                        animalType,
                        symptoms,
                        vaccinationStatus,
                        mortalityReported
                );

        String riskLevel =
                prediction.getRiskLevel();

        String recommendation =
                prediction.getRecommendation();

        // =========================================================
        // VETERINARY DECISION SUPPORT
        // =========================================================

        String lowerSymptoms =
                symptoms.toLowerCase();

        boolean respiratorySymptoms =
                containsAny(
                        lowerSymptoms,
                        "cough",
                        "coughing",
                        "breathing",
                        "respiratory",
                        "nasal discharge",
                        "runny nose"
                );

        boolean digestiveSymptoms =
                containsAny(
                        lowerSymptoms,
                        "diarrhea",
                        "diarrhoea",
                        "loose motion",
                        "watery stool",
                        "dehydration"
                );

        boolean severeSymptoms =
                containsAny(
                        lowerSymptoms,
                        "severe",
                        "collapse",
                        "unable to stand",
                        "bleeding",
                        "convulsion"
                );

        boolean generalSymptoms =
                containsAny(
                        lowerSymptoms,
                        "weakness",
                        "weak",
                        "lethargy",
                        "loss of appetite",
                        "not eating",
                        "reduced feeding"
                );

        // =========================================================
        // RISK OVERRIDES
        // =========================================================

        if (mortalityReported) {

            riskLevel = "HIGH RISK";

            recommendation =
                    "URGENT: Mortality reported. " +
                            "Isolate affected animal(s), " +
                            "notify a veterinary professional, " +
                            "and initiate field investigation.";

        } else if (healthRecord.getTemperature() >= 40.0) {

            riskLevel = "HIGH RISK";

            recommendation =
                    "URGENT veterinary examination recommended. " +
                            "Consider isolation and immediate clinical assessment.";

        } else if (
                healthRecord.getTemperature() >= 39.5
                        && (severeSymptoms
                        || respiratorySymptoms
                        || digestiveSymptoms)
        ) {

            riskLevel = "HIGH RISK";

            recommendation =
                    "Veterinary examination recommended. " +
                            "Consider isolation and diagnostic assessment.";

        } else if (
                healthRecord.getTemperature() >= 39.0
                        || respiratorySymptoms
                        || digestiveSymptoms
                        || generalSymptoms
        ) {

            if (!"HIGH RISK".equals(riskLevel)) {

                riskLevel = "AT RISK";

                recommendation =
                        "Monitor animal closely, " +
                                "repeat health assessment, " +
                                "and consult a veterinary professional " +
                                "if symptoms persist or worsen.";
            }
        }

        // =========================================================
        // SAVE HEALTH STATUS
        // =========================================================

        healthRecord.setHealthStatus(riskLevel);
        healthRecord.setRecommendation(recommendation);

        // =========================================================
        // REPORT DATE
        // =========================================================

        if (healthRecord.getReportDate() == null) {

            healthRecord.setReportDate(
                    LocalDateTime.now()
            );
        }

        // =========================================================
        // DEFAULT VALUES
        // =========================================================

        if (healthRecord.getVaccinationStatus() == null
                || healthRecord.getVaccinationStatus()
                .trim()
                .isEmpty()) {

            healthRecord.setVaccinationStatus(
                    "NOT PROVIDED"
            );
        }

        if (healthRecord.getTreatment() == null
                || healthRecord.getTreatment()
                .trim()
                .isEmpty()) {

            healthRecord.setTreatment(
                    "NOT PROVIDED"
            );
        }

        if (healthRecord.getReportedBy() == null
                || healthRecord.getReportedBy()
                .trim()
                .isEmpty()) {

            healthRecord.setReportedBy(
                    "Field User"
            );
        }

        return healthRecordRepository.save(
                healthRecord
        );
    }

    private boolean containsAny(
            String text,
            String... keywords) {

        for (String keyword : keywords) {

            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    public List<HealthRecord> getAllRecords() {

        return healthRecordRepository.findAll();
    }

    public List<HealthRecord> getRecordsByLivestockId(
            Long livestockId) {

        return healthRecordRepository
                .findByLivestockId(livestockId);
    }

    public HealthRecord getRecordById(Long id) {

        return healthRecordRepository
                .findById(id)
                .orElse(null);
    }
}