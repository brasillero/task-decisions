# Checkout review — 2026-01-11

A walk through the checkout with a coupon applied.

## Findings

1. An expired coupon is only rejected by the payment service, after the customer confirms. → `#1`
2. The shipping and billing address forms are two copies of the same component. → `D1`, `#3`

## Not checked

The coupon service's response times under load.
