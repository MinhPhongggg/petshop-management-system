package com.petshop.service;

import com.petshop.dto.request.PetRequest;
import com.petshop.dto.response.PetDTO;

import java.util.List;

public interface PetService {
    
    // CRUD cho user's pets
    PetDTO createPet(PetRequest request);
    PetDTO updatePet(Long id, PetRequest request);
    void deletePet(Long id);
    PetDTO getPetById(Long id);
    
    // Danh sách pets của current user
    List<PetDTO> getMyPets();
}
