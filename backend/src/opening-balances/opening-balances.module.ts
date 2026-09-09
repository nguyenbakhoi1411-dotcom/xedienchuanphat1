import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpeningBalancesController } from './opening-balances.controller';
import { OpeningBalancesService } from './opening-balances.service';

// Import all entities
import { OpeningBalanceConfig } from './entities/opening-balance-config.entity';
import { ObAccount } from './entities/ob-account.entity';
import { ObBankAccount } from './entities/ob-bank-account.entity';
import { ObCustomerDebt } from './entities/ob-customer-debt.entity';
import { ObSupplierDebt } from './entities/ob-supplier-debt.entity';
import { ObEmployeeDebt } from './entities/ob-employee-debt.entity';
import { ObInventory } from './entities/ob-inventory.entity';
import { ObToolsInUse } from './entities/ob-tools.entity';
import { ObFixedAsset } from './entities/ob-fixed-asset.entity';
import { ObPrepaidExpense } from './entities/ob-prepaid-expense.entity';
import { ObWip } from './entities/ob-wip.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OpeningBalanceConfig,
      ObAccount,
      ObBankAccount,
      ObCustomerDebt,
      ObSupplierDebt,
      ObEmployeeDebt,
      ObInventory,
      ObToolsInUse,
      ObFixedAsset,
      ObPrepaidExpense,
      ObWip,
    ]),
  ],
  controllers: [OpeningBalancesController],
  providers: [OpeningBalancesService],
})
export class OpeningBalancesModule {}
