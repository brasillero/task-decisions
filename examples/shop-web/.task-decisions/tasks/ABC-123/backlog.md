# Backlog — ABC-123

## Active

### #1 · In progress · Validate the coupon before closing the order
- type: Bug
- area: checkout
- origin: reports/2026-01-11-checkout-review.md
- ticket: ABC-123
- created: 2026-01-11

**Context.** An expired coupon is only rejected by the payment service, after the customer confirms the order. The review found it.

**To do.**
- [x] Ask the coupon service before showing the confirmation step.
- [ ] Show the reason when a coupon is rejected.

**Acceptance criteria.**
- An expired coupon is rejected before the confirmation step, with its reason.

**Where in the code.**
- `src/checkout/coupon.ts` (`applyCoupon`)

## Deferred

### #3 · Deferred · Merge the two address forms
- type: Tech debt
- area: checkout
- origin: D1
- ticket: —
- created: 2026-01-11
- reason: accepted as debt in D1; until the checkout redesign (ABC-200) starts

**Context.** Shipping and billing addresses use two copies of the same form, so a fix in one is easily missed in the other.

**To do.**
- [ ] Extract one address form and use it in both steps.

## Closed

### #2 · Done · Fix the total with free shipping
- type: Bug
- area: checkout
- origin: conversation
- ticket: ABC-123
- created: 2026-01-11
- closed: 2026-01-12
- outcome: fixed in `a1b2c3d`

**Context.** With free shipping and a coupon, the total subtracted the shipping cost twice.

**To do.**
- [x] Apply the coupon after the shipping rule.
