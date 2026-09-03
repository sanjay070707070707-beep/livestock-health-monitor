package com.sih.livestockhealthmonitor.controller;

import com.sih.livestockhealthmonitor.entity.Livestock;
import com.sih.livestockhealthmonitor.service.LivestockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/livestock")
@CrossOrigin(origins = "*")
public class LivestockController {

    private final LivestockService livestockService;

    public LivestockController(LivestockService livestockService) {
        this.livestockService = livestockService;
    }

    @PostMapping
    public ResponseEntity<Livestock> addLivestock(
            @RequestBody Livestock livestock) {
        return ResponseEntity.ok(
                livestockService.addLivestock(livestock)
        );
    }

    @GetMapping
    public ResponseEntity<List<Livestock>> getAllLivestock() {
        return ResponseEntity.ok(
                livestockService.getAllLivestock()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livestock> getLivestockById(
            @PathVariable Long id) {

        Livestock livestock =
                livestockService.getLivestockById(id);

        if (livestock == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(livestock);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Livestock> updateLivestock(
            @PathVariable Long id,
            @RequestBody Livestock livestock) {

        Livestock updated =
                livestockService.updateLivestock(id, livestock);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLivestock(
            @PathVariable Long id) {

        boolean deleted =
                livestockService.deleteLivestock(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}