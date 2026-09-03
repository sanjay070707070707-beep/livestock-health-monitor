package com.sih.livestockhealthmonitor.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_records")
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long livestockId;
    private double temperature;
    private String symptoms;
    private String healthStatus;
    private String recommendation;
    private String vaccinationStatus;
    private String treatment;
    private String reportedBy;
    private LocalDateTime reportDate;
    private boolean mortalityReported;
    private String mortalityReason;

    public HealthRecord() {
    }

    public Long getId() {
        return id;
    }

    public Long getLivestockId() {
        return livestockId;
    }

    public void setLivestockId(Long livestockId) {
        this.livestockId = livestockId;
    }

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public String getVaccinationStatus() {
        return vaccinationStatus;
    }

    public void setVaccinationStatus(String vaccinationStatus) {
        this.vaccinationStatus = vaccinationStatus;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public String getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(String reportedBy) {
        this.reportedBy = reportedBy;
    }

    public LocalDateTime getReportDate() {
        return reportDate;
    }

    public void setReportDate(LocalDateTime reportDate) {
        this.reportDate = reportDate;
    }

    public boolean isMortalityReported() {
        return mortalityReported;
    }

    public void setMortalityReported(boolean mortalityReported) {
        this.mortalityReported = mortalityReported;
    }

    public String getMortalityReason() {
        return mortalityReason;
    }

    public void setMortalityReason(String mortalityReason) {
        this.mortalityReason = mortalityReason;
    }
}