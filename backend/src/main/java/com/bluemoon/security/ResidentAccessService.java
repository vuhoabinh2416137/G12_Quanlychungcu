package com.bluemoon.security;

import com.bluemoon.model.Fee;

import com.bluemoon.model.Resident;
import com.bluemoon.repository.ResidentRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResidentAccessService {

    private final ResidentRepository residentRepository;

    public ResidentAccessService(ResidentRepository residentRepository) {
        this.residentRepository = residentRepository;
    }

    public boolean isResident(Authentication auth) {
        return auth != null
                && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_RESIDENT"));
    }

    @Transactional(readOnly = true)
    public Long getResidentApartmentId(Authentication auth) {
        if (auth == null) {
            throw new AccessDeniedException("Access Denied");
        }
        return getResidentApartmentId(auth.getName());
    }

    @Transactional(readOnly = true)
    public Long getResidentApartmentId(String username) {
        Resident resident = residentRepository.findByUser_Username(username)
                .orElseThrow(() -> new AccessDeniedException("Resident account is not linked to a resident profile"));
        if (resident.getApartment() == null || resident.getApartment().getId() == null) {
            throw new AccessDeniedException("Resident account is not linked to any apartment");
        }
        return resident.getApartment().getId();
    }

    public void ensureResidentApartmentAccess(Authentication auth, Long apartmentId) {
        if (!isResident(auth)) {
            return;
        }
        Long residentApartmentId = getResidentApartmentId(auth);
        if (!residentApartmentId.equals(apartmentId)) {
            throw new AccessDeniedException("Access Denied");
        }
    }

    public void ensureResidentFeeAccess(Authentication auth, Fee fee) {
        if (!isResident(auth)) {
            return;
        }
        if (fee == null || fee.getApartment() == null || fee.getApartment().getId() == null) {
            throw new AccessDeniedException("Access Denied");
        }
        ensureResidentApartmentAccess(auth, fee.getApartment().getId());
    }

}
