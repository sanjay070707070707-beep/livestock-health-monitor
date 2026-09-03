package com.sih.livestockhealthmonitor.ml;

public class LivestockPrediction {

    private String riskLevel;
    private double confidence;
    private String recommendation;

    public LivestockPrediction() {
    }

    public LivestockPrediction(
            String riskLevel,
            double confidence,
            String recommendation) {

        this.riskLevel = riskLevel;
        this.confidence = confidence;
        this.recommendation = recommendation;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}