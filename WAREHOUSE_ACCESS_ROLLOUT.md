# Warehouse Access Rollout

`V64__employee_warehouse_access.sql` intentionally does not backfill `employee_warehouses`
from branch access. After deployment, warehouse-scoped operations are fail-closed until an
admin grants explicit warehouse assignments.

## Pre-Merge Admin Prep

Use this query before deploying to prepare the assignment checklist:

```sql
select
    e.id as employee_id,
    e.employee_code,
    e.full_name,
    coalesce(uba.branch_id, u.branch_id, e.branch_id) as candidate_branch_id,
    w.id as warehouse_id,
    w.warehouse_code,
    w.warehouse_name
from employees e
left join app_users u on u.id = e.user_id
left join user_branch_access uba on uba.user_id = e.user_id
left join warehouses w on w.branch_id = coalesce(uba.branch_id, u.branch_id, e.branch_id)
where e.user_id is not null
order by e.full_name, w.warehouse_name;
```

Treat this output as a candidate list only. Admin must choose the real warehouses and access
levels per employee.

## Grant Access

Grant access through the warehouse assignment API:

```http
POST /api/inventory/warehouse-access
Content-Type: application/json

{
  "employeeId": 123,
  "warehouseId": 456,
  "accessLevel": "VIEW"
}
```

Access levels:

- `VIEW`: read-only warehouse visibility.
- `OPERATE`: stock import/export and normal warehouse operations.
- `MANAGE`: approval and assignment-level warehouse control where allowed by service policy.

## Post-Deploy Check

Run this query after Admin finishes assignments:

```sql
select e.id, e.employee_code, e.full_name, count(ew.id) as active_warehouse_count
from employees e
left join employee_warehouses ew on ew.employee_id = e.id and ew.active = true
where e.user_id is not null
group by e.id, e.employee_code, e.full_name
order by active_warehouse_count, e.full_name;
```
