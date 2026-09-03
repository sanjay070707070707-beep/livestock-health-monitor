package com.sih.livestockhealthmonitor.ml;

import org.springframework.stereotype.Service;
import smile.classification.LogisticRegression;

import java.util.ArrayList;
import java.util.List;

@Service
public class LivestockRiskModel {

    private final LogisticRegression.Multinomial model;

    public LivestockRiskModel() {
        TrainingData trainingData = createTrainingData();

        model = LogisticRegression.multinomial(
                trainingData.features(),
                trainingData.labels()
        );

        System.out.println("Livestock Risk ML Model trained successfully.");
        System.out.println("Training samples: " + trainingData.features().length);
        System.out.println("Classes: HEALTHY, AT RISK, HIGH RISK");
    }

    public LivestockPrediction predict(
            double temperature,
            int age,
            String animalType,
            String symptoms,
            String vaccinationStatus,
            boolean mortalityReported) {

        double[] features = createFeatures(
                temperature,
                age,
                animalType,
                symptoms,
                vaccinationStatus,
                mortalityReported
        );

        double[] posteriori = new double[3];

        int predictedClass = model.predict(features, posteriori);

        String riskLevel;

        if (predictedClass == 2) {
            riskLevel = "HIGH RISK";
        } else if (predictedClass == 1) {
            riskLevel = "AT RISK";
        } else {
            riskLevel = "HEALTHY";
        }

        double confidence = posteriori[predictedClass];

        String recommendation = createRecommendation(riskLevel);

        return new LivestockPrediction(
                riskLevel,
                confidence,
                recommendation
        );
    }

    private double[] createFeatures(
            double temperature,
            int age,
            String animalType,
            String symptoms,
            String vaccinationStatus,
            boolean mortalityReported) {

        double normalizedTemperature = (temperature - 38.0) / 2.0;
        double normalizedAge = (age - 4.0) / 4.0;

        int symptomScore = calculateSymptomScore(symptoms);
        double normalizedSymptoms = symptomScore / 5.0;

        int vaccinationScore = calculateVaccinationScore(vaccinationStatus);
        double normalizedVaccination = vaccinationScore / 2.0;

        double mortality = mortalityReported ? 1.0 : 0.0;

        double cattle = 0.0;
        double buffalo = 0.0;
        double goat = 0.0;
        double sheep = 0.0;

        if (animalType != null) {
            String type = animalType.trim().toLowerCase();

            switch (type) {
                case "cattle" -> cattle = 1.0;
                case "buffalo" -> buffalo = 1.0;
                case "goat" -> goat = 1.0;
                case "sheep" -> sheep = 1.0;
                default -> cattle = 1.0;
            }
        } else {
            cattle = 1.0;
        }

        return new double[]{
                normalizedTemperature,
                normalizedAge,
                normalizedSymptoms,
                normalizedVaccination,
                mortality,
                cattle,
                buffalo,
                goat,
                sheep
        };
    }

    private int calculateSymptomScore(String symptoms) {

        if (symptoms == null || symptoms.isBlank()) {
            return 0;
        }

        String text = symptoms.toLowerCase();

        if (text.equals("none")) {
            return 0;
        }

        int score = 0;

        if (containsAny(text,
                "cough",
                "coughing",
                "breathing",
                "respiratory")) {
            score += 1;
        }

        if (containsAny(text,
                "weakness",
                "weak",
                "lethargy",
                "tired")) {
            score += 1;
        }

        if (containsAny(text,
                "loss of appetite",
                "appetite",
                "not eating",
                "reduced feeding")) {
            score += 1;
        }

        if (containsAny(text,
                "diarrhea",
                "diarrhoea",
                "loose motion")) {
            score += 1;
        }

        if (containsAny(text,
                "severe",
                "high fever",
                "unable to stand",
                "collapse",
                "bleeding")) {
            score += 2;
        }

        return Math.min(score, 5);
    }

    private boolean containsAny(String text, String... keywords) {

        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    private int calculateVaccinationScore(String vaccinationStatus) {

        if (vaccinationStatus == null) {
            return 0;
        }

        String status = vaccinationStatus.trim().toLowerCase();

        if (status.contains("up to date") ||
                status.contains("fully vaccinated")) {
            return 2;
        }

        if (status.contains("partially")) {
            return 1;
        }

        return 0;
    }

    private String createRecommendation(String riskLevel) {

        return switch (riskLevel) {
            case "HIGH RISK" ->
                    "Veterinary examination recommended";

            case "AT RISK" ->
                    "Monitor closely and consult a veterinary professional";

            default ->
                    "Continue routine health monitoring";
        };
    }

    private TrainingData createTrainingData() {

        List<double[]> features = new ArrayList<>();
        List<Integer> labels = new ArrayList<>();

        addHealthySamples(features, labels);
        addAtRiskSamples(features, labels);
        addHighRiskSamples(features, labels);

        double[][] featureArray =
                features.toArray(new double[0][]);

        int[] labelArray =
                labels.stream()
                        .mapToInt(Integer::intValue)
                        .toArray();

        return new TrainingData(featureArray, labelArray);
    }

    private void addHealthySamples(
            List<double[]> features,
            List<Integer> labels) {

        addSample(features, labels,
                37.2, 2, "Cattle", 0, 2, false, 0);

        addSample(features, labels,
                37.5, 3, "Cattle", 0, 2, false, 0);

        addSample(features, labels,
                37.8, 4, "Cattle", 1, 2, false, 0);

        addSample(features, labels,
                38.0, 5, "Buffalo", 0, 2, false, 0);

        addSample(features, labels,
                38.2, 6, "Buffalo", 1, 2, false, 0);

        addSample(features, labels,
                37.6, 3, "Goat", 0, 2, false, 0);

        addSample(features, labels,
                38.1, 2, "Goat", 0, 2, false, 0);

        addSample(features, labels,
                37.4, 4, "Sheep", 0, 2, false, 0);

        addSample(features, labels,
                38.3, 7, "Cattle", 0, 2, false, 0);

        addSample(features, labels,
                37.9, 5, "Cattle", 1, 2, false, 0);

        addSample(features, labels,
                38.0, 6, "Buffalo", 0, 2, false, 0);

        addSample(features, labels,
                37.7, 3, "Goat", 1, 2, false, 0);

        addSample(features, labels,
                38.2, 4, "Sheep", 0, 2, false, 0);

        addSample(features, labels,
                37.3, 2, "Cattle", 0, 1, false, 0);

        addSample(features, labels,
                38.1, 8, "Buffalo", 0, 2, false, 0);

        addSample(features, labels,
                37.8, 5, "Goat", 0, 2, false, 0);

        addSample(features, labels,
                38.0, 4, "Sheep", 0, 2, false, 0);

        addSample(features, labels,
                37.5, 6, "Cattle", 0, 2, false, 0);

        addSample(features, labels,
                38.3, 3, "Buffalo", 1, 2, false, 0);

        addSample(features, labels,
                37.9, 5, "Goat", 0, 2, false, 0);

        addSample(features, labels,
                38.1, 7, "Sheep", 1, 2, false, 0);

        addSample(features, labels,
                37.6, 4, "Cattle", 0, 2, false, 0);

        addSample(features, labels,
                38.2, 5, "Buffalo", 0, 2, false, 0);

        addSample(features, labels,
                37.7, 3, "Goat", 0, 2, false, 0);

        addSample(features, labels,
                38.0, 6, "Cattle", 0, 2, false, 0);

        addSample(features, labels,
                37.8, 4, "Sheep", 0, 2, false, 0);

        addSample(features, labels,
                38.2, 8, "Buffalo", 1, 2, false, 0);

        addSample(features, labels,
                37.5, 2, "Goat", 0, 2, false, 0);

        addSample(features, labels,
                38.1, 5, "Cattle", 1, 2, false, 0);

        addSample(features, labels,
                37.9, 6, "Sheep", 0, 2, false, 0);
    }

    private void addAtRiskSamples(
            List<double[]> features,
            List<Integer> labels) {

        addSample(features, labels,
                38.8, 3, "Cattle", 1, 1, false, 1);

        addSample(features, labels,
                39.0, 4, "Cattle", 2, 2, false, 1);

        addSample(features, labels,
                39.2, 5, "Buffalo", 1, 1, false, 1);

        addSample(features, labels,
                38.9, 6, "Buffalo", 2, 1, false, 1);

        addSample(features, labels,
                39.1, 3, "Goat", 2, 1, false, 1);

        addSample(features, labels,
                39.0, 4, "Sheep", 1, 1, false, 1);

        addSample(features, labels,
                39.3, 5, "Cattle", 2, 2, false, 1);

        addSample(features, labels,
                38.7, 7, "Buffalo", 2, 1, false, 1);

        addSample(features, labels,
                39.2, 2, "Goat", 1, 1, false, 1);

        addSample(features, labels,
                38.8, 4, "Sheep", 2, 2, false, 1);

        addSample(features, labels,
                39.1, 6, "Cattle", 2, 1, false, 1);

        addSample(features, labels,
                38.9, 5, "Buffalo", 1, 2, false, 1);

        addSample(features, labels,
                39.3, 4, "Goat", 2, 1, false, 1);

        addSample(features, labels,
                38.8, 3, "Cattle", 2, 1, false, 1);

        addSample(features, labels,
                39.0, 7, "Sheep", 1, 1, false, 1);

        addSample(features, labels,
                39.2, 5, "Buffalo", 2, 2, false, 1);

        addSample(features, labels,
                38.7, 4, "Goat", 1, 1, false, 1);

        addSample(features, labels,
                39.1, 6, "Cattle", 2, 1, false, 1);

        addSample(features, labels,
                38.9, 5, "Sheep", 2, 2, false, 1);

        addSample(features, labels,
                39.3, 3, "Buffalo", 1, 1, false, 1);

        addSample(features, labels,
                38.8, 6, "Cattle", 1, 1, false, 1);

        addSample(features, labels,
                39.0, 4, "Goat", 2, 2, false, 1);

        addSample(features, labels,
                39.2, 5, "Sheep", 2, 1, false, 1);

        addSample(features, labels,
                38.9, 7, "Buffalo", 1, 1, false, 1);

        addSample(features, labels,
                39.1, 3, "Cattle", 2, 2, false, 1);

        addSample(features, labels,
                38.7, 5, "Goat", 1, 1, false, 1);

        addSample(features, labels,
                39.3, 6, "Sheep", 2, 1, false, 1);

        addSample(features, labels,
                39.0, 4, "Buffalo", 2, 2, false, 1);

        addSample(features, labels,
                38.8, 3, "Cattle", 1, 1, false, 1);

        addSample(features, labels,
                39.2, 6, "Goat", 2, 1, false, 1);
    }

    private void addHighRiskSamples(
            List<double[]> features,
            List<Integer> labels) {

        addSample(features, labels,
                40.0, 4, "Cattle", 3, 1, false, 2);

        addSample(features, labels,
                40.5, 5, "Cattle", 4, 1, false, 2);

        addSample(features, labels,
                40.2, 6, "Buffalo", 3, 0, false, 2);

        addSample(features, labels,
                40.7, 4, "Buffalo", 5, 0, true, 2);

        addSample(features, labels,
                40.1, 3, "Goat", 4, 0, false, 2);

        addSample(features, labels,
                40.3, 5, "Sheep", 4, 1, false, 2);

        addSample(features, labels,
                41.0, 6, "Cattle", 5, 0, true, 2);

        addSample(features, labels,
                40.4, 7, "Buffalo", 4, 0, false, 2);

        addSample(features, labels,
                40.2, 4, "Goat", 3, 0, false, 2);

        addSample(features, labels,
                40.6, 5, "Sheep", 5, 0, true, 2);

        addSample(features, labels,
                40.1, 6, "Cattle", 4, 1, false, 2);

        addSample(features, labels,
                40.8, 4, "Buffalo", 5, 0, true, 2);

        addSample(features, labels,
                40.3, 3, "Goat", 4, 0, false, 2);

        addSample(features, labels,
                40.5, 5, "Cattle", 5, 1, false, 2);

        addSample(features, labels,
                40.2, 7, "Sheep", 4, 0, false, 2);

        addSample(features, labels,
                40.9, 6, "Buffalo", 5, 0, true, 2);

        addSample(features, labels,
                40.0, 4, "Goat", 3, 0, false, 2);

        addSample(features, labels,
                40.4, 5, "Cattle", 4, 0, false, 2);

        addSample(features, labels,
                40.7, 6, "Sheep", 5, 0, true, 2);

        addSample(features, labels,
                40.2, 3, "Buffalo", 4, 1, false, 2);

        addSample(features, labels,
                40.5, 7, "Cattle", 5, 0, true, 2);

        addSample(features, labels,
                40.3, 4, "Goat", 4, 0, false, 2);

        addSample(features, labels,
                40.8, 5, "Sheep", 5, 0, true, 2);

        addSample(features, labels,
                40.1, 6, "Buffalo", 3, 0, false, 2);

        addSample(features, labels,
                40.6, 4, "Cattle", 4, 1, false, 2);

        addSample(features, labels,
                40.4, 5, "Goat", 5, 0, true, 2);

        addSample(features, labels,
                40.9, 7, "Sheep", 5, 0, true, 2);

        addSample(features, labels,
                40.2, 3, "Cattle", 4, 0, false, 2);

        addSample(features, labels,
                40.7, 6, "Buffalo", 5, 0, true, 2);

        addSample(features, labels,
                40.3, 4, "Goat", 4, 1, false, 2);
    }

    private void addSample(
            List<double[]> features,
            List<Integer> labels,
            double temperature,
            int age,
            String animalType,
            int symptomScore,
            int vaccinationScore,
            boolean mortality,
            int riskClass) {

        features.add(createTrainingFeatures(
                temperature,
                age,
                animalType,
                symptomScore,
                vaccinationScore,
                mortality
        ));

        labels.add(riskClass);
    }

    private double[] createTrainingFeatures(
            double temperature,
            int age,
            String animalType,
            int symptomScore,
            int vaccinationScore,
            boolean mortality) {

        double normalizedTemperature = (temperature - 38.0) / 2.0;
        double normalizedAge = (age - 4.0) / 4.0;
        double normalizedSymptoms = symptomScore / 5.0;
        double normalizedVaccination = vaccinationScore / 2.0;
        double mortalityValue = mortality ? 1.0 : 0.0;

        double cattle = 0.0;
        double buffalo = 0.0;
        double goat = 0.0;
        double sheep = 0.0;

        switch (animalType.toLowerCase()) {
            case "cattle" -> cattle = 1.0;
            case "buffalo" -> buffalo = 1.0;
            case "goat" -> goat = 1.0;
            case "sheep" -> sheep = 1.0;
            default -> cattle = 1.0;
        }

        return new double[]{
                normalizedTemperature,
                normalizedAge,
                normalizedSymptoms,
                normalizedVaccination,
                mortalityValue,
                cattle,
                buffalo,
                goat,
                sheep
        };
    }

    private record TrainingData(
            double[][] features,
            int[] labels) {
    }
}