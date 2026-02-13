package com.petshop.controller;

import com.petshop.dto.request.PetRequest;
import com.petshop.dto.response.PetDTO;
import com.petshop.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
public class PetController {
    
    private final PetService petService;
    
    @GetMapping
    public ResponseEntity<List<PetDTO>> getMyPets() {
        return ResponseEntity.ok(petService.getMyPets());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getPetById(@PathVariable Long id) {
        return ResponseEntity.ok(petService.getPetById(id));
    }
    
    @PostMapping
    public ResponseEntity<PetDTO> createPet(@Valid @RequestBody PetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(petService.createPet(request));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PetDTO> updatePet(@PathVariable Long id, 
                                             @Valid @RequestBody PetRequest request) {
        return ResponseEntity.ok(petService.updatePet(id, request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable Long id) {
        petService.deletePet(id);
        return ResponseEntity.noContent().build();
    }
}
