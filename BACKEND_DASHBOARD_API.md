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

## Freezer Planner and Membership removed from the dashboard

The store owner dashboard no longer has Freezer Planner or Membership. The frontend no longer calls or reads any of these, so the backend can stop serving them for the dashboard (the customer-facing `/membership/*` routes are untouched).

### Stop sending

- `GET /admin/overview`
  - `stats.activeMemberships`
  - `modules.freezerPlanner`, `modules.membership` (only `modules.inventory` is read now)
  - `attention[]` entries with `kind` of `FREEZER_PLANNER` or `MEMBERSHIP` (the only kind is `SHOP`)
- `/admin/membership/*`: stats, plans, subscribers, proteins (nothing calls them any more)
- `GET /admin/customers`: the `membership` string on each row
- `GET /admin/customers/:id`: the `membership` object, and activity types `membership_subscribed` / `membership_cancelled`
- `/admin/orders`: the `type` filter and `tabCounts` in the stats response. Order `type` is always `"SHOP"`.

### Decision needed: Delivery & Schedule

That page was fed only by membership, Meat Box and Freezer Planner deliveries. With those gone I kept the page and re-typed every delivery as `"shop"` (shown as "Order Delivery"), and removed the type filter. For it to show anything, `/admin/deliveries` and `/admin/deliveries/calendar` must return deliveries for ordinary customer orders with `type: "shop"`. If the store owner has no use for a delivery calendar, the page and its nav item can be removed instead.
