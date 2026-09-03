package com.sih.livestockhealthmonitor.ml;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = "*")
public class MLController {

    private final LivestockRiskModel livestockRiskModel;

    public MLController(LivestockRiskModel livestockRiskModel) {
        this.livestockRiskModel = livestockRiskModel;
    }

    @PostMapping("/predict")
    public ResponseEntity<LivestockPrediction> predict(
            @RequestBody PredictionRequest request) {

        LivestockPrediction prediction =
                livestockRiskModel.predict(
                        request.temperature(),
                        request.age(),
                        request.animalType(),
                        request.symptoms(),
                        request.vaccinationStatus(),
                        request.mortalityReported()
                );

        return ResponseEntity.ok(prediction);
    }

    public record PredictionRequest(
            double temperature,
            int age,
            String animalType,
            String symptoms,
            String vaccinationStatus,
            boolean mortalityReported
    ) {
    }
}