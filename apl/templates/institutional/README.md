# Institutional Templates (APL-FS Draft)

This directory contains APL-FS draft specimens for institutional issuers.

## Status

These templates use APL-FS primitives that extend beyond what the v0.1 parser accepts. The parser will likely return errors for unknown primitives. This is expected behavior — APL-FS is a post-v1 design targeting institutional tokenized fund operations.

## Primitives

APL-FS adds 20 new primitives for:
- Fund structure (fund_mandate, fund_type, domicile, investor_class)
- Identity & risk (kyc_status, sanctions_screen, risk_profile, country_restrictions)
- Operations (redemption_gate, liquidity_floor, nav_calculation_window)
- Attestation & audit (attestation_required, attestation_chain, regulator_reporting)
- Rails & settlement (settlement_rails, settlement_currencies, custodian)

## Regulatory Compatibility

APL-FS primitives map to:
- 1940 Investment Company Act (US)
- MiCA Title V (EU)
- FINMA Circular 2026/1 (Switzerland)

## Files

- `01-tokenized-mmf-solana.apl` — Tokenized Money Market Fund policy specimen

## Implementation

The Axon Engine parser will be extended in the v0.2 development cycle to support APL-FS primitives. These templates exist as forward-looking specimens to guide design partner conversations.