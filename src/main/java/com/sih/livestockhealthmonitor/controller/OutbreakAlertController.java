package com.sih.livestockhealthmonitor.controller;

import com.sih.livestockhealthmonitor.entity.OutbreakAlert;
import com.sih.livestockhealthmonitor.service.OutbreakAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/outbreaks")
@CrossOrigin(origins = "*")
public class OutbreakAlertController {

    private final OutbreakAlertService outbreakAlertService;

    public OutbreakAlertController(OutbreakAlertService outbreakAlertService) {
        this.outbreakAlertService = outbreakAlertService;
    }

    @GetMapping("/detect")
    public ResponseEntity<List<OutbreakAlert>> detectOutbreaks() {
        return ResponseEntity.ok(outbreakAlertService.detectOutbreaks());
    }

    @GetMapping
    public ResponseEntity<List<OutbreakAlert>> getAllAlerts() {
        return ResponseEntity.ok(outbreakAlertService.getAllAlerts());
    }

    @GetMapping("/village/{village}")
    public ResponseEntity<List<OutbreakAlert>> getVillageAlerts(
            @PathVariable String village) {
        return ResponseEntity.ok(outbreakAlertService.getVillageAlerts(village));
    }

    @GetMapping("/district/{district}")
    public ResponseEntity<List<OutbreakAlert>> getDistrictAlerts(
            @PathVariable String district) {
        return ResponseEntity.ok(outbreakAlertService.getDistrictAlerts(district));
    }

    @GetMapping("/high-risk")
    public ResponseEntity<List<OutbreakAlert>> getHighRiskAlerts() {
        return ResponseEntity.ok(outbreakAlertService.getHighRiskAlerts());
    }
}