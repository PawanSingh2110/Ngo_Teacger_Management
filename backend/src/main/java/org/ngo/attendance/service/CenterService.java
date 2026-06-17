package org.ngo.attendance.service;

import lombok.RequiredArgsConstructor;
import org.ngo.attendance.dto.request.CreateCenterRequest;
import org.ngo.attendance.dto.response.CenterResponse;
import org.ngo.attendance.entity.Center;
import org.ngo.attendance.exception.BusinessException;
import org.ngo.attendance.exception.ResourceNotFoundException;
import org.ngo.attendance.repository.CenterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CenterService {

    private final CenterRepository centerRepository;

    public List<CenterResponse> getAllCenters() {
        return centerRepository.findAll()
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<CenterResponse> getActiveCenters() {
        return centerRepository.findAllByActiveTrue()
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CenterResponse getCenterById(UUID id) {
        return toResponse(findById(id));
    }

    @Transactional
    public CenterResponse createCenter(CreateCenterRequest request) {
        if (centerRepository.existsByCenterName(request.getCenterName().trim())) {
            throw new BusinessException("Center name already exists");
        }
        Center center = Center.builder()
            .centerName(request.getCenterName().trim())
            .address(request.getAddress())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .radiusInMeters(request.getRadiusInMeters())
            .build();
        return toResponse(centerRepository.save(center));
    }

    @Transactional
    public CenterResponse updateCenter(UUID id, CreateCenterRequest request) {
        Center center = findById(id);
        String centerName = request.getCenterName().trim();
        if (!center.getCenterName().equalsIgnoreCase(centerName)
            && centerRepository.existsByCenterName(centerName)) {
            throw new BusinessException("Center name already exists");
        }
        center.setCenterName(centerName);
        center.setAddress(request.getAddress());
        center.setLatitude(request.getLatitude());
        center.setLongitude(request.getLongitude());
        center.setRadiusInMeters(request.getRadiusInMeters());
        return toResponse(centerRepository.save(center));
    }

    @Transactional
    public void toggleCenterStatus(UUID id) {
        Center center = findById(id);
        center.setActive(!center.getActive());
        centerRepository.save(center);
    }

    public Center findById(UUID id) {
        return centerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Center not found with id: " + id));
    }

    private CenterResponse toResponse(Center center) {
        return CenterResponse.builder()
            .id(center.getId())
            .centerName(center.getCenterName())
            .address(center.getAddress())
            .latitude(center.getLatitude())
            .longitude(center.getLongitude())
            .radiusInMeters(center.getRadiusInMeters())
            .active(center.getActive())
            .createdAt(center.getCreatedAt())
            .updatedAt(center.getUpdatedAt())
            .build();
    }

    @Transactional
    public void deleteCenter(UUID id) {
        if (!centerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Center not found with id: " + id);
        }
        centerRepository.deleteById(id);
    }
}
