package com.sih.livestockhealthmonitor.service;

import com.sih.livestockhealthmonitor.entity.Livestock;
import com.sih.livestockhealthmonitor.repository.HealthRecordRepository;
import com.sih.livestockhealthmonitor.repository.LivestockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LivestockService {

    private final LivestockRepository livestockRepository;
    private final HealthRecordRepository healthRecordRepository;

    public LivestockService(
            LivestockRepository livestockRepository,
            HealthRecordRepository healthRecordRepository) {

        this.livestockRepository = livestockRepository;
        this.healthRecordRepository = healthRecordRepository;
    }

    public Livestock addLivestock(Livestock livestock) {
        return livestockRepository.save(livestock);
    }

    public List<Livestock> getAllLivestock() {
        return livestockRepository.findAll();
    }

    public Livestock getLivestockById(Long id) {
        return livestockRepository.findById(id).orElse(null);
    }

    public Livestock updateLivestock(Long id, Livestock livestock) {
        Livestock existing = livestockRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setTagNumber(livestock.getTagNumber());
        existing.setAnimalType(livestock.getAnimalType());
        existing.setBreed(livestock.getBreed());
        existing.setAge(livestock.getAge());
        existing.setGender(livestock.getGender());
        existing.setVillage(livestock.getVillage());
        existing.setBlock(livestock.getBlock());
        existing.setDistrict(livestock.getDistrict());
        existing.setLatitude(livestock.getLatitude());
        existing.setLongitude(livestock.getLongitude());

        return livestockRepository.save(existing);
    }

    @Transactional
    public boolean deleteLivestock(Long id) {
        if (!livestockRepository.existsById(id)) {
            return false;
        }

        healthRecordRepository.deleteByLivestockId(id);
        livestockRepository.deleteById(id);

        return true;
    }
}