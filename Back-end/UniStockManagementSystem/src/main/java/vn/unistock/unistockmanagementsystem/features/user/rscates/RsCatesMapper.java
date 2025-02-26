package vn.unistock.unistockmanagementsystem.features.user.rscates;

import org.mapstruct.Mapper;
import vn.unistock.unistockmanagementsystem.entities.ResourceCategory;

@Mapper(componentModel = "spring")
public interface RsCatesMapper {
    ResourceCategory toResourceCategory(ResourceCategory resourceCategory);
}
