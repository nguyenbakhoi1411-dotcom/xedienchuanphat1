# Chuan Phat ERP Upgrade - Prompt 3, 4, 5

## Prompt 3 - Permission ERP

### Da xu ly
| Hang muc | Ket qua |
|---|---|
| Role ERP | Dong bo role frontend/backend: `ADMIN`, `BRANCH_MANAGER`, `SALES_STAFF`, `WAREHOUSE_STAFF`, `ACCOUNTANT`, `TECHNICIAN`, `MARKETING_STAFF`, `AUDITOR`. |
| Multi-role user | Backend da co `user_roles`; migration moi copy role cu sang role ERP moi neu database da co `SALES/WAREHOUSE/MARKETING`. |
| Branch access | Backend da co `user_branch_access` voi `VIEW/OPERATE/MANAGE`; service user audit thay doi branch access. |
| Permission matrix | Frontend matrix ho tro module/action; bo sung module `audit`, role `AUDITOR`. |
| Audit | Backend da audit create/update user, role, permission va branch access. |

### Migration/code
| File | Noi dung |
|---|---|
| `src/main/resources/db/migration/V5__erp_role_permission_alignment.sql` | Them role ERP moi, permission thieu, copy permission/user role tu role cu sang role moi. |
| `src/main/java/com/chuanphat/warranty/auth/config/AuthDataInitializer.java` | Seed role ERP moi va permission thieu. |
| `frontend/src/features/users/*` | Cap nhat role code, schema validate va permission matrix module. |

## Prompt 4 - Inventory ERP

### Da xu ly
| Hang muc | Ket qua |
|---|---|
| Ton kho theo branch + warehouse + product | API stocks nhan `warehouseId`, service thao tac theo kho chinh mac dinh hoac kho duoc truyen vao. |
| Reserved/available | DTO tra `reservedQuantity`, `availableQuantity`; xuat kho kiem tra available thay vi on-hand. |
| Min/max stock | DTO tra `minQuantity`, `maxQuantity`. |
| Average cost | Them repository va logic gia von binh quan gia quyen khi nhap/chuyen/xuat. |
| Transfer | Transfer ghi ca `TRANSFER_OUT` va `TRANSFER_IN`, co from/to warehouse. |
| Stocktake | Kiem kho tao `ADJUSTMENT_IN` hoac `ADJUSTMENT_OUT` theo chenhlech. |
| Frontend table | Bang ton kho hien thi chi nhanh, kho, ton, giu cho, kha dung, min stock, gia von TB. |

### Migration/code
| File | Noi dung |
|---|---|
| `src/main/resources/db/migration/V6__inventory_warehouse_cost_alignment.sql` | Them `available_quantity`, unique/index theo branch-warehouse-product, index giao dich/average cost. |
| `src/main/java/com/chuanphat/warranty/core/service/InventoryService.java` | Xu ly kho, available stock, average cost, transfer/stocktake. |
| `src/main/java/com/chuanphat/warranty/core/dto/*Inventory*` | Mo rong request/response cho warehouse va cost. |
| `frontend/src/features/inventory/*` | Cap nhat type/API/table theo du lieu moi. |

## Prompt 5 - Sales/POS Professional

### Da co va da bo sung
| Hang muc | Ket qua |
|---|---|
| Quotation | Backend co quotation, update status, convert quotation sang sales order. |
| Order status | Co `DRAFT`, `CONFIRMED`, `PARTIALLY_PAID`, `PAID`, `DELIVERED`, `CANCELLED`, `RETURNED`. |
| Reserve/release serial | Co reserve serial, release khi cancel/expire, chi SOLD khi xuat hang. |
| Multiple payment | Request co `payments`; validate khong vuot tong tien. |
| Installment | Co installment application/disbursement flow. |
| Return | Co sales return/refund va return serial disposition. |
| Voucher | Validate voucher truoc khi consume; khong dung qua han/khong hop le. |
| Invoice/warranty | Issue invoice tao warranty cho san pham can bao hanh. |
| Kho theo warehouse | Khi ban serial, ton kho bi tru dung warehouse cua serial/item thay vi mac dinh kho chinh. |
| Payment methods backend | Bo sung `CARD`, `E_WALLET` trong enum backend de san sang cho POS. |

## SQL Index Chinh

```sql
CREATE INDEX IF NOT EXISTS idx_inventory_stocks_branch_warehouse_product ON inventory_stocks(branch_id, warehouse_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stocks_low_stock ON inventory_stocks(branch_id, warehouse_id, available_quantity, min_quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_warehouse ON inventory_transactions(from_warehouse_id, to_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_average_costs_lookup ON inventory_average_costs(branch_id, warehouse_id, product_id);
```

## Test Case Trong Yeu

| ID | Module | Pre-condition | Test data | Steps | Expected | Priority | Type |
|---|---|---|---|---|---|---|---|
| P3-SEC-001 | Permission/Branch | User chi nhanh A chi co branch access A | branchId A/B | Login user A, goi API list sales/inventory branch B | API tra 403 hoac khong co du lieu B | High | Security |
| P3-SEC-002 | Role | User co 2 role | `SALES_STAFF` + `WAREHOUSE_STAFF` | Login va xem menu/API | Quyen la union cua 2 role, khong co quyen ngoai role | High | Positive |
| P3-SEC-003 | Audit | Admin sua role permission | Remove `SALES_RETURN` | Luu permission matrix | Co audit log `UPDATE_PERMISSION` | High | Security |
| P4-INV-001 | Inventory | Co kho chinh branch A | import 10 qty, unitCost 100 | POST `/api/inventory/import` | Ton tang 10, averageCost = 100 | High | Positive |
| P4-INV-002 | Inventory | Ton 10, reserved 3 | export 8 | POST `/api/inventory/export` | Bi tu choi vi available = 7 | High | Negative |
| P4-INV-003 | Inventory | Ton kho A = 10 | transfer 4 A->B | POST `/api/inventory/transfer` | A giam 4, B tang 4, co TRANSFER_OUT/IN | High | Positive |
| P4-INV-004 | Inventory | Ton 10 | stocktake counted 7 | POST `/api/inventory/stocktake` | Ton = 7, tao `ADJUSTMENT_OUT` qty 3 | High | Edge case |
| P4-INV-005 | Inventory | Product o warehouse B | list warehouse B | GET stocks `warehouseId=B` | Chi tra ton cua warehouse B | Medium | Positive |
| P5-POS-001 | Sales/POS | Serial status SOLD | order item serial SOLD | Tao don | API tu choi `Serial is not available for sale` | High | Negative |
| P5-POS-002 | Sales/POS | Available stock = 1 | ban qty 2 | Tao/confirm don | API tu choi `Not enough stock` | High | Negative |
| P5-POS-003 | Sales/POS | Voucher expired | voucherCode expired | Tao don | API tu choi voucher khong hop le | High | Negative |
| P5-POS-004 | Accounting | Don 10tr, paid 3tr | partial payment | Tao don | Status PARTIALLY_PAID, cong no/receivable duoc ghi | High | Positive |
| P5-POS-005 | Warranty | Ban xe can serial | paid full + issue invoice | Tao don | Serial SOLD, invoice ISSUED, warranty duoc tao | High | Positive |
| P5-POS-006 | Return | Don da paid | return 1 item | Tao return/refund | Ton tang lai, serial disposition dung, audit return/refund | High | Positive |

## Checklist Test Hieu Nang/Nghiep Vu

- Chay migration Flyway tren PostgreSQL rong va database da co seed cu.
- Goi list users/roles/inventory/sales voi pageSize 20/50/100, xac nhan khong tra entity lon.
- Kiem tra API branch scope voi user khong phai admin.
- Kiem tra import/export/transfer/stocktake trong cung transaction va rollback khi loi.
- Kiem tra ban serial theo warehouse khac kho chinh.
- Kiem tra paid partial tao cong no va full paid moi xuat stock.
- Kiem tra invoice issue tu dong tao warranty.
- Kiem tra frontend typecheck va build production.
