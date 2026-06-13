package com.chuanphat.warranty.accounting.config;

import com.chuanphat.warranty.accounting.entity.ChartOfAccount;
import com.chuanphat.warranty.accounting.enums.AccountType;
import com.chuanphat.warranty.accounting.repository.ChartOfAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AccountingDataInitializer {
    @Bean
    CommandLineRunner initializeChartOfAccounts(ChartOfAccountRepository accountRepository) {
        return args -> {
            ensure(accountRepository, "111", "Tien mat", AccountType.ASSET, "Cash fund");
            ensure(accountRepository, "112", "Tien gui ngan hang", AccountType.ASSET, "Bank deposits");
            ensure(accountRepository, "131", "Phai thu khach hang", AccountType.ASSET, "Customer receivables");
            ensure(accountRepository, "1331", "Thue GTGT duoc khau tru", AccountType.ASSET, "Input VAT");
            ensure(accountRepository, "156", "Hang hoa", AccountType.ASSET, "Inventory goods");
            ensure(accountRepository, "331", "Phai tra nha cung cap", AccountType.LIABILITY, "Supplier payables");
            ensure(accountRepository, "3331", "Thue GTGT phai nop", AccountType.LIABILITY, "Output VAT");
            ensure(accountRepository, "411", "Von chu so huu", AccountType.EQUITY, "Owner equity");
            ensure(accountRepository, "511", "Doanh thu ban hang", AccountType.REVENUE, "Sales revenue");
            ensure(accountRepository, "632", "Gia von hang ban", AccountType.COST_OF_GOODS_SOLD, "Cost of goods sold");
            ensure(accountRepository, "641", "Chi phi ban hang", AccountType.EXPENSE, "Selling expenses");
            ensure(accountRepository, "642", "Chi phi quan ly", AccountType.EXPENSE, "Administrative expenses");
        };
    }

    private void ensure(ChartOfAccountRepository accountRepository, String code, String name, AccountType type, String description) {
        accountRepository.findByAccountCode(code).orElseGet(() -> {
            ChartOfAccount account = new ChartOfAccount();
            account.setAccountCode(code);
            account.setAccountName(name);
            account.setAccountType(type);
            account.setActive(true);
            account.setDescription(description);
            return accountRepository.save(account);
        });
    }
}
