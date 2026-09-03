package com.sih.livestockhealthmonitor.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "outbreak_alerts")
public class OutbreakAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String village;
    private String block;
    private String district;
    private String commonSymptoms;
    private int affectedAnimals;
    private String riskLevel;
    private String recommendation;
    private LocalDateTime detectedAt;

    public OutbreakAlert() {
    }

    public Long getId() {
        return id;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public String getBlock() {
        return block;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCommonSymptoms() {
        return commonSymptoms;
    }

    public void setCommonSymptoms(String commonSymptoms) {
        this.commonSymptoms = commonSymptoms;
    }

    public int getAffectedAnimals() {
        return affectedAnimals;
    }

    public void setAffectedAnimals(int affectedAnimals) {
        this.affectedAnimals = affectedAnimals;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public LocalDateTime getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(LocalDateTime detectedAt) {
        this.detectedAt = detectedAt;
    }
}