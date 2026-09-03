package com.sih.livestockhealthmonitor.repository;

import com.sih.livestockhealthmonitor.entity.OutbreakAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutbreakAlertRepository extends JpaRepository<OutbreakAlert, Long> {

    List<OutbreakAlert> findByVillageIgnoreCase(String village);

    List<OutbreakAlert> findByDistrictIgnoreCase(String district);

    List<OutbreakAlert> findByRiskLevelIgnoreCase(String riskLevel);
}