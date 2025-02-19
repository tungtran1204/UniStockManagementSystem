package vn.unistock.unistockmanagementsystem.features.partner.partnerType;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerTypeDTO {
    private Long typeId;
    private String typeCode;
    private String typeName;
    private Boolean status;
    private String description;
}