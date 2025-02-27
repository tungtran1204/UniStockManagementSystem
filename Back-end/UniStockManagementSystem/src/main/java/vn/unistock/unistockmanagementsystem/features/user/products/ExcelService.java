package vn.unistock.unistockmanagementsystem.features.user.products;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.ProductType;
import vn.unistock.unistockmanagementsystem.entities.Unit;
import vn.unistock.unistockmanagementsystem.features.user.productTypes.ProductTypeRepository;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExcelService {
    private final UnitRepository unitRepository;
    private final ProductTypeRepository productTypeRepository;
    private final ProductsRepository productsRepository;

    public void importProducts(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("📛 File Excel bị trống!");
        }

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
        List<Product> products = new ArrayList<>();
        DataFormatter formatter = new DataFormatter(); // 🔹 Đọc dữ liệu dưới dạng String

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            try {
                String productName = formatter.formatCellValue(row.getCell(0)).trim();
                String description = formatter.formatCellValue(row.getCell(1)).trim();
                String priceStr = formatter.formatCellValue(row.getCell(2)).trim();
                String unitName = formatter.formatCellValue(row.getCell(3)).trim();
                String typeName = formatter.formatCellValue(row.getCell(4)).trim();
                String createdBy = formatter.formatCellValue(row.getCell(5)).trim();

                // 🔹 Chuyển đổi giá từ String -> Double
                double price = 0;
                if (!priceStr.isEmpty()) {
                    try {
                        price = Double.parseDouble(priceStr);
                    } catch (NumberFormatException e) {
                        System.err.println("⚠ Lỗi chuyển đổi giá ở dòng " + (i + 1) + ": " + priceStr);
                        continue;
                    }
                }

                // 🔹 Kiểm tra hoặc tạo đơn vị mới
                Unit unit = unitRepository.findByUnitName(unitName)
                        .orElseGet(() -> {
                            Unit newUnit = new Unit();
                            newUnit.setUnitName(unitName);
                            return unitRepository.save(newUnit);
                        });

                // 🔹 Kiểm tra hoặc tạo loại sản phẩm mới
                ProductType type = productTypeRepository.findByTypeName(typeName)
                        .orElseGet(() -> {
                            ProductType newType = new ProductType();
                            newType.setTypeName(typeName);
                            return productTypeRepository.save(newType);
                        });

                // 🔹 Tạo sản phẩm mới
                Product product = new Product();
                product.setProductName(productName);
                product.setDescription(description);
                product.setUnit(unit);
                product.setProductType(type);
                product.setCreatedBy(createdBy);
                product.setUpdatedBy(createdBy);

                products.add(product);
            } catch (Exception e) {
                System.err.println("❌ Lỗi khi xử lý dòng " + (i + 1) + ": " + e.getMessage());
            }
        }

        workbook.close();

        // 🔹 Kiểm tra danh sách trước khi lưu vào DB
        if (!products.isEmpty()) {
            productsRepository.saveAll(products);
            System.out.println("✅ Nhập thành công " + products.size() + " sản phẩm!");
        } else {
            throw new IllegalArgumentException("📛 Không có sản phẩm hợp lệ để nhập!");
        }
    }
}