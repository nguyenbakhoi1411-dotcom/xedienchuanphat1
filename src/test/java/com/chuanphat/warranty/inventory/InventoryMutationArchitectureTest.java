package com.chuanphat.warranty.inventory;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.chuanphat.warranty.core.service.InventoryMutationService;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.base.DescribedPredicate;
import org.junit.jupiter.api.Test;

class InventoryMutationArchitectureTest {
    @Test
    void inventoryStockCanOnlyBeMutatedThroughMutationService() {
        noClasses()
                .that(DescribedPredicate.describe("classes other than InventoryMutationService",
                        javaClass -> !javaClass.getName().equals(InventoryMutationService.class.getName())))
                .should().dependOnClassesThat().areAssignableTo(InventoryStockRepository.class)
                .check(new ClassFileImporter()
                        .withImportOption(new ImportOption.DoNotIncludeTests())
                        .importPackages("com.chuanphat.warranty"));
    }
}
