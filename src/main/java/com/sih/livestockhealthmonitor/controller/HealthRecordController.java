package com.sih.livestockhealthmonitor.controller;

import com.sih.livestockhealthmonitor.entity.HealthRecord;
import com.sih.livestockhealthmonitor.service.HealthRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-records")
@CrossOrigin(origins = "*")
public class HealthRecordController {

    private final HealthRecordService healthRecordService;

    public HealthRecordController(HealthRecordService healthRecordService) {
        this.healthRecordService = healthRecordService;
    }

    @PostMapping
    public ResponseEntity<HealthRecord> createRecord(
            @RequestBody HealthRecord healthRecord) {
        HealthRecord savedRecord =
                healthRecordService.createRecord(healthRecord);
        return ResponseEntity.ok(savedRecord);
    }

    @GetMapping
    public ResponseEntity<List<HealthRecord>> getAllRecords() {
        return ResponseEntity.ok(
                healthRecordService.getAllRecords()
        );
    }

    @GetMapping("/livestock/{livestockId}")
    public ResponseEntity<List<HealthRecord>> getRecordsByLivestockId(
            @PathVariable Long livestockId) {
        return ResponseEntity.ok(
                healthRecordService.getRecordsByLivestockId(livestockId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthRecord> getRecordById(
            @PathVariable Long id) {
        HealthRecord record =
                healthRecordService.getRecordById(id);

        if (record == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(record);
    }
}