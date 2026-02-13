package com.petshop.service.impl;

import com.petshop.dto.request.PetRequest;
import com.petshop.dto.response.PetDTO;
import com.petshop.entity.Pet;
import com.petshop.entity.User;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.PetRepository;
import com.petshop.repository.UserRepository;
import com.petshop.security.UserPrincipal;
import com.petshop.service.PetService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PetServiceImpl implements PetService {
    
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    
    @Override
    @Transactional
    public PetDTO createPet(PetRequest request) {
        User owner = getCurrentUser();
        
        Pet pet = Pet.builder()
            .owner(owner)
            .name(request.getName())
            .type(request.getType())
            .breed(request.getBreed())
            .weight(request.getWeight())
            .age(request.getAge())
            .notes(request.getNotes())
            .image(request.getImage())
            .build();
        
        pet = petRepository.save(pet);
        return mapToDTO(pet);
    }
    
    @Override
    @Transactional
    public PetDTO updatePet(Long id, PetRequest request) {
        User owner = getCurrentUser();
        Pet pet = petRepository.findByIdAndOwnerId(id, owner.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Thú cưng không tồn tại"));
        
        pet.setName(request.getName());
        pet.setType(request.getType());
        pet.setBreed(request.getBreed());
        pet.setWeight(request.getWeight());
        pet.setAge(request.getAge());
        pet.setNotes(request.getNotes());
        pet.setImage(request.getImage());
        
        pet = petRepository.save(pet);
        return mapToDTO(pet);
    }
    
    @Override
    @Transactional
    public void deletePet(Long id) {
        User owner = getCurrentUser();
        Pet pet = petRepository.findByIdAndOwnerId(id, owner.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Thú cưng không tồn tại"));
        
        petRepository.delete(pet);
    }
    
    @Override
    public PetDTO getPetById(Long id) {
        User owner = getCurrentUser();
        Pet pet = petRepository.findByIdAndOwnerId(id, owner.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Thú cưng không tồn tại"));
        return mapToDTO(pet);
    }
    
    @Override
    public List<PetDTO> getMyPets() {
        User owner = getCurrentUser();
        return petRepository.findByOwnerId(owner.getId()).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Chưa đăng nhập");
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    private PetDTO mapToDTO(Pet pet) {
        return PetDTO.builder()
            .id(pet.getId())
            .name(pet.getName())
            .petType(com.petshop.entity.Category.PetType.valueOf(pet.getType().name()))
            .breed(pet.getBreed())
            .weight(pet.getWeight())
            .age(pet.getAge())
            .notes(pet.getNotes())
            .avatarUrl(pet.getImage())
            .ownerId(pet.getOwner().getId())
            .ownerName(pet.getOwner().getFullName())
            .createdAt(pet.getCreatedAt())
            .build();
    }
}
