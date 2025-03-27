package vn.unistock.unistockmanagementsystem.features.user.partner;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import vn.unistock.unistockmanagementsystem.features.user.partner.partnerByType.PartnerByTypeDTO;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerDTO {
    private Long partnerId;
    private String partnerName;
    private String contactName;
    private String address;
    private String phone;
    private String email;
    private Set<PartnerByTypeDTO> partnerTypes;
    private List<String> partnerCodes;
}
