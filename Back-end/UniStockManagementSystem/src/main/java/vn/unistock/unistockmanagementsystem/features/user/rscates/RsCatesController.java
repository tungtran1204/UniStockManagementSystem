package vn.unistock.unistockmanagementsystem.features.user.rscates;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.unistock.unistockmanagementsystem.entities.ResourceCategory;

import java.util.List;

@RestController
@RequestMapping("/api/unistock/user/rscates")
@RequiredArgsConstructor
public class RsCatesController {

    private final RsCatesService rsCatesService;

    //create new category
    @PostMapping
    public ResourceCategory createResourceCategory(@RequestBody @Valid RsCatesDTO request) {
        return rsCatesService.createRsCates(request);
    }

    //get all category
    @GetMapping
    public List<ResourceCategory> getResourceCategories() {
        return rsCatesService.getResourcesCategory();
    }

    //get category by id
    @GetMapping("/{rsCateId}")
    public ResourceCategory getResourceCategoryById(@PathVariable String rsCateId) {
        return rsCatesService.getRsCatesById(rsCateId);
    }

    //update category by id
    @PatchMapping("/{rsCateId}")
    public ResourceCategory updateResourceCategory(@Valid @PathVariable Long rsCateId, @RequestBody RsCatesDTO request) {
        return rsCatesService.updateRsCates(rsCateId, request);
    }

    //delete category by id
    @DeleteMapping("/{rsCateId}")
    public String deleteResourceCategory(@PathVariable Long rsCateId) {
        rsCatesService.deleteRsCates(rsCateId);
        return "Resource deleted successfully";
    }

    //deactivate category by id
    @PatchMapping("/{rsCateId}/deactivate")
    public ResourceCategory deactivateResourceCategory(@PathVariable Long rsCateId, @RequestBody RsCatesDTO request) {
        return rsCatesService.deactiveRsCates(rsCateId, request);
    }
}
