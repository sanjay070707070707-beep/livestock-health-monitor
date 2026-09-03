package com.sih.livestockhealthmonitor.repository;

import com.sih.livestockhealthmonitor.entity.Livestock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LivestockRepository extends JpaRepository<Livestock, Long> {
}