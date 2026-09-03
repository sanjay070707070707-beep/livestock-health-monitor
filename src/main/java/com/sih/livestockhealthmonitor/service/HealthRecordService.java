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

        String animalType = livestock != null
                ? livestock.getAnimalType()
                : "Cattle";

        int age = livestock != null
                ? livestock.getAge()
                : 0;

        String symptoms = healthRecord.getSymptoms() == null
                ? ""
                : healthRecord.getSymptoms();

        String vaccinationStatus =
                healthRecord.getVaccinationStatus();

        boolean mortalityReported =
                healthRecord.isMortalityReported();

        // =========================================================
        // ML PREDICTION
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
        // SAFETY OVERRIDE
        // =========================================================
        // The ML model assists the decision.
        // Clearly severe cases must never be classified as healthy.

        String lowerSymptoms =
                symptoms.toLowerCase();

        boolean severeSymptom =
                lowerSymptoms.contains("cough")
                        || lowerSymptoms.contains("diarrhea")
                        || lowerSymptoms.contains("loose motion")
                        || lowerSymptoms.contains("weakness")
                        || lowerSymptoms.contains("weak")
                        || lowerSymptoms.contains("lethargy")
                        || lowerSymptoms.contains("loss of appetite")
                        || lowerSymptoms.contains("appetite");

        if (mortalityReported) {

            riskLevel = "HIGH RISK";

            recommendation =
                    "Veterinary examination recommended immediately";

        } else if (healthRecord.getTemperature() >= 40.0) {

            riskLevel = "HIGH RISK";

            recommendation =
                    "Veterinary examination recommended immediately";

        } else if (healthRecord.getTemperature() >= 39.5
                && severeSymptom) {

            riskLevel = "HIGH RISK";

            recommendation =
                    "Veterinary examination recommended";

        } else if (healthRecord.getTemperature() >= 39.0
                || severeSymptom) {

            if (!"HIGH RISK".equals(riskLevel)) {

                riskLevel = "AT RISK";

                recommendation =
                        "Monitor animal closely and consult a veterinarian if symptoms persist";
            }
        }

        // =========================================================
        // SAVE ML-BASED HEALTH STATUS
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