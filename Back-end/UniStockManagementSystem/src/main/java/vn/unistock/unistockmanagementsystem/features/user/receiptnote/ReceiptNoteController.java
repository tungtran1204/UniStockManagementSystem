package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.unistock.unistockmanagementsystem.entities.GoodReceiptNote;

@RestController
@RequestMapping("/api/unistock/user/receiptnote")
@RequiredArgsConstructor
public class ReceiptNoteController {
    @Autowired
    private final ReceiptNoteService goodReceiptService;

    @PostMapping
    public ResponseEntity<GoodReceiptNote> createGoodReceipt(@RequestBody ReceiptNoteDTO grnDto) {
        return ResponseEntity.ok(goodReceiptService.createGoodReceipt(grnDto));
    }
}
