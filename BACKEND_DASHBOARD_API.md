# Store owner dashboard: Overview API changes

`GET /admin/overview` (already exists) needs two new fields for the new charts, and no longer needs any Meat Box data.

## Add

```jsonc
{
  "salesTrend": [
    // last 30 days, oldest first, one entry per day (include days with 0)
    { "date": "2026-10-09", "sales": 184500, "orders": 12 }
  ],
  "ordersByStatus": [
    // current calendar month; any order, any status
    { "status": "PENDING", "count": 4 },
    { "status": "PROCESSING", "count": 7 },
    { "status": "OUT_FOR_DELIVERY", "count": 3 },
    { "status": "DELIVERED", "count": 41 },
    { "status": "CANCELLED", "count": 2 }
  ]
}
```

- `sales` is NGN from orders with `paymentStatus = SUCCESS`, grouped by the store's local day (Africa/Lagos).
- Both fields are optional on the frontend: if missing, the charts show their empty state.

## Remove (frontend no longer reads them)

- `modules.meatBox`
- `attention[].kind = "MEAT_BOX"` and `attention[].status = "AWAITING_WEIGHT"`. If still sent, the list falls back to showing them as a plain order.
- Order type `MEAT_BOX` in `/admin/orders` (`type` filter and `tabCounts.MEAT_BOX`) and delivery type `meat_box` in `/admin/deliveries`.
