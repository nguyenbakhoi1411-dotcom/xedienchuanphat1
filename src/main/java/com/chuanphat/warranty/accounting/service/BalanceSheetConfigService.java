package com.chuanphat.warranty.accounting.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class BalanceSheetConfigService {

    public static class BalanceSheetItemConfig {
        public String ma;
        public String ten;
        public List<String> cong_tk_no = new ArrayList<>();
        public List<String> cong_tk_co = new ArrayList<>();
        public String chi_lay_du; // "NO" or "CO"
    }

    private List<BalanceSheetItemConfig> items = new ArrayList<>();

    @PostConstruct
    public void init() {
        try {
            Yaml yaml = new Yaml();
            InputStream inputStream = new ClassPathResource("balance_sheet_mapping.yml").getInputStream();
            Map<String, Object> data = yaml.load(inputStream);
            
            List<Map<String, Object>> list = (List<Map<String, Object>>) data.get("chỉ_tiêu");
            if (list != null) {
                for (Map<String, Object> map : list) {
                    BalanceSheetItemConfig config = new BalanceSheetItemConfig();
                    config.ma = (String) map.get("ma");
                    config.ten = (String) map.get("ten");
                    config.cong_tk_no = (List<String>) map.getOrDefault("cong_tk_no", new ArrayList<>());
                    config.cong_tk_co = (List<String>) map.getOrDefault("cong_tk_co", new ArrayList<>());
                    config.chi_lay_du = (String) map.get("chi_lay_du");
                    items.add(config);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<BalanceSheetItemConfig> getItems() {
        return items;
    }
}
