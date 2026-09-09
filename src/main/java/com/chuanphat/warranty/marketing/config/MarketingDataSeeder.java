package com.chuanphat.warranty.marketing.config;

import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.marketing.entity.PriceList;
import com.chuanphat.warranty.marketing.entity.PriceListItem;
import com.chuanphat.warranty.marketing.enums.PriceListStatus;
import com.chuanphat.warranty.marketing.enums.PriceListType;
import com.chuanphat.warranty.marketing.repository.PriceListRepository;
import com.chuanphat.warranty.marketing.repository.PriceListItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("dev")
public class MarketingDataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final PriceListRepository priceListRepository;
    private final PriceListItemRepository priceListItemRepository;

    public MarketingDataSeeder(ProductRepository productRepository,
                               PriceListRepository priceListRepository,
                               PriceListItemRepository priceListItemRepository) {
        this.productRepository = productRepository;
        this.priceListRepository = priceListRepository;
        this.priceListItemRepository = priceListItemRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (productRepository.count() > 0) {
            return;
        }

        List<Product> products = new ArrayList<>();
        
        products.add(createProduct("ALLY A1", "XE ALLY A1", ProductCategory.ELECTRIC_MOTORBIKE, "ALLY", "18780000"));
        products.add(createProduct("ALLY A1S", "XE ALLY A1S", ProductCategory.ELECTRIC_MOTORBIKE, "ALLY", "19075000"));
        products.add(createProduct("ALLY GOLDEN", "XE ALLY GOLDEN", ProductCategory.ELECTRIC_MOTORBIKE, "ALLY", "18300000"));
        products.add(createProduct("ALLY NEWSEW", "XE ALLY NEW SEW", ProductCategory.ELECTRIC_MOTORBIKE, "ALLY", "21300000"));
        products.add(createProduct("ALLY WS50", "XE ALLY WS50", ProductCategory.ELECTRIC_MOTORBIKE, "ALLY", "14100000"));
        products.add(createProduct("AQ 60v23ah", "Ắc quy a-xít chì 60V/23Ah", ProductCategory.BATTERY, "TIENNANG", "450000"));
        products.add(createProduct("AQ60v27a", "Ắc quy Tiên Năng 60V27A", ProductCategory.BATTERY, "TIENNANG", "550000"));
        products.add(createProduct("BAT00000001AA", "Pin LFP 2.4kWh", ProductCategory.BATTERY, "LFP", "4000000"));
        products.add(createProduct("BFA BF26", "XE BEFORE ALL BF26", ProductCategory.ELECTRIC_MOTORBIKE, "BEFORE ALL", "22030000"));
        products.add(createProduct("Coc CP", "Cốc Chuẩn Phát", ProductCategory.ACCESSORY, "CHUANPHAT", "50000"));
        products.add(createProduct("Mu bh", "Mũ bảo hiểm trắng", ProductCategory.ACCESSORY, "CHUANPHAT", "51840"));
        products.add(createProduct("Orla", "Xe Yadea Orla Disney Pixar", ProductCategory.ELECTRIC_MOTORBIKE, "YADEA", "18000000"));
        products.add(createProduct("OSK0180", "Ắc quy Xupai", ProductCategory.BATTERY, "XUPAI", "300000"));
        products.add(createProduct("OSK CLASSISI", "XE OSAKAR CLASSI SI", ProductCategory.ELECTRIC_MOTORBIKE, "OSAKAR", "10444000"));
        products.add(createProduct("OSK GOGO", "XE OSAKAR GOGO", ProductCategory.ELECTRIC_MOTORBIKE, "OSAKAR", "12889000"));
        products.add(createProduct("OSK LIMITED", "XE OSAKAR LIMITED", ProductCategory.ELECTRIC_MOTORBIKE, "OSAKAR", "12266666"));
        products.add(createProduct("OSK LUMIA", "XE OSAKAR LUMIA", ProductCategory.ELECTRIC_MOTORBIKE, "OSAKAR", "13857000"));
        products.add(createProduct("OSK Mandi", "XE OSAKAR Mandi", ProductCategory.ELECTRIC_MOTORBIKE, "OSAKAR", "9500000"));
        products.add(createProduct("OSK ROVA", "XE OSAKAR ROVA", ProductCategory.ELECTRIC_MOTORBIKE, "OSAKAR", "12587000"));
        products.add(createProduct("OSK SUNOO", "XE OSAKAR SUNOO", ProductCategory.ELECTRIC_MOTORBIKE, "OSAKAR", "9500000"));

        productRepository.saveAll(products);

        // Create Default Price List
        PriceList priceList = PriceList.builder()
                .maBangGia("BG_CHUNG")
                .tenBangGia("Bảng Giá Bán Lẻ Chung")
                .loaiBangGia(PriceListType.RETAIL)
                .apDungTu(LocalDate.now().minusDays(10))
                .trangThai(PriceListStatus.ACTIVE)
                .laBangGiaMacDinh(true)
                .build();
        priceList = priceListRepository.save(priceList);

        // Add Items
        List<PriceListItem> items = new ArrayList<>();
        for (Product p : products) {
            PriceListItem item = new PriceListItem();
            item.setPriceList(priceList);
            item.setSanPham(p);
            item.setGiaBan(p.getSalePrice());
            items.add(item);
        }
        priceListItemRepository.saveAll(items);
    }

    private Product createProduct(String code, String name, ProductCategory cat, String brand, String importPriceStr) {
        BigDecimal importPrice = new BigDecimal(importPriceStr);
        // Sale price is roughly 25% higher
        BigDecimal salePrice = importPrice.multiply(new BigDecimal("1.25"));

        Product p = new Product();
        p.setProductCode(code);
        p.setProductName(name);
        p.setCategory(cat);
        p.setBrand(brand);
        p.setImportPrice(importPrice);
        p.setSalePrice(salePrice);
        p.setWarrantyMonths(12);
        return p;
    }
}

