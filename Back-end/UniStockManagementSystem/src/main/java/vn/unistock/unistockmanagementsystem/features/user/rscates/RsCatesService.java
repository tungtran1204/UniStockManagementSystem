package vn.unistock.unistockmanagementsystem.features.user.rscates;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.ResourceCategory;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RsCatesService {
    @Autowired
    private RsCatesRepository rsCatesRepository;

    @Autowired
    private RsCatesMapper rsCatesMapper;

    //add the resource category
    public ResourceCategory createRsCates(RsCatesDTO rsCate){
        if(rsCatesRepository.existsByName(rsCate.getName())){
            throw new RuntimeException("Category already exists.");
        }
        ResourceCategory resourceCategory = rsCatesMapper.toResourceCategory(rsCate);
        return rsCatesRepository.save(resourceCategory);
    }

    //get all resource categories
    public List<ResourceCategory> getResourcesCategory(){
        return  rsCatesRepository.findAll();
    }

    //get resource category by id
    public ResourceCategory getRsCatesById(String rsCateId){
        try {
            Long id = Long.parseLong(rsCateId);
            ResourceCategory rs = rsCatesRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Not found."));
            return rs;
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Invalid ID");
        }
    }

    //update the resource category by id
    public ResourceCategory updateRsCates(Long id, RsCatesDTO request){
        ResourceCategory rsCates = rsCatesRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found."));
        rsCates.setDescription(request.getDescription());
        rsCates.setUpdateAt(LocalDateTime.now());
        return rsCatesRepository.save(rsCates);
    }

    //delete the resource category by id
    public void deleteRsCates(Long id){
        rsCatesRepository.deleteById(id);
    }

    //deactivate the resource category by id
    public ResourceCategory deactiveRsCates(Long id, RsCatesDTO request){
        ResourceCategory rsCates = rsCatesRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found."));
        rsCates.setIsActive(false);
        rsCates.setUpdateAt(LocalDateTime.now());
        return rsCatesRepository.save(rsCates);
    }
}
