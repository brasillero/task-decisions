# Decisions — ABC-123

### D1 · Active · The two address forms stay separate until the checkout redesign
- date: 2026-01-11
- decided by: alex-m, sam-k
- origin: reports/2026-01-11-checkout-review.md
- area: checkout
- revisit if: the checkout redesign (ABC-200) starts

**Decision.** The duplicated address forms are kept as they are; the debt is tracked in #3.

**Why.** Merging them now touches both checkout steps, and the redesign replaces them anyway.

**Rejected.** Merging them in this task (too much risk for a coupon change).

### D2 · Provisional · Coupons are validated in the browser before the order is confirmed
- date: 2026-01-12
- decided by: alex-m
- origin: #1
- area: checkout
- revisit if: the coupon service confirms it can answer in under 200 ms

**Decision.** The browser asks the coupon service before the confirmation step; the payment service still checks again.

**Why.** Customers see the problem before they confirm, without waiting for the payment step.

**Rejected.** Only the server-side check (the customer finds out too late).
