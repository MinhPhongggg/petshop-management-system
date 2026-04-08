package com.petshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierRequest {

    @NotBlank(message = "Tên nhà cung cấp là bắt buộc")
    private String name;

    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String taxCode;
    private String notes;
}
