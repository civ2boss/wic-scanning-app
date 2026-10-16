# WIC Scanner

A mobile-first, offline-capable web application that lets New York State WIC shoppers verify whether grocery items are WIC-approved and eligible for their household's participant categories.

## Language

**APL (Approved Product List)**:
The authoritative catalog of WIC-approved food items published by New York State, distributed as a periodic spreadsheet snapshot across 18 canonical food categories and 104 subcategories.
_Avoid_: Product database, master list, food list

**Product**:
A single entry on the APL identified by a canonical UPC or PLU, categorized by an APL Category and Sub-Category, brand, description, package size, and unit of measure.
_Avoid_: Item, food, SKU

**UPC / PLU**:
The canonical numeric identifier for a Product: a 12-digit UPC-A (expanded from 8-digit UPC-E, left-padded from 6–11 digit Excel numbers, or stripped of EAN-13's leading zero), a 13-digit non-North-American EAN-13, or a 4-to-5-digit produce PLU code.
_Avoid_: Barcode string, product ID, code

**Participant Category**:
One of the eight official WIC recipient classifications (`INFANT_0_6`, `INFANT_6_12`, `CHILD_1_2`, `CHILD_2_5`, `PREGNANT`, `PARTIALLY_BREASTFEEDING`, `BREASTFEEDING`, `POSTPARTUM`) that determines which APL categories and subcategories a person may redeem.
_Avoid_: User type, role, profile type, package

**Household**:
The device-local set of active Participant Categories (`ParticipantType[]`) that a shopper is buying groceries for on a single trip or eWIC card.
_Avoid_: User profile, account, family account

**Eligibility**:
Whether an APL-approved Product is permitted for a specific Participant Category—or for at least one member of a Household—under NYS WIC food package rules, including conditional medical or breastfeeding notes.
_Avoid_: Approval (which refers strictly to presence in the APL), validity

**Cash Value Benefit (CVB)**:
A monthly dollar allowance ($22 for Infants 6–12m, $27 for Children 1–5y, $48 for Pregnant/Postpartum, $53 for Breastfeeding) for purchasing fresh, frozen, or canned fruits and vegetables.
_Avoid_: Produce ounces, cash value ounces, voucher

**Medical Nutritional (`Exempt Formula` / `WIC Nutritionals`)**:
Specialized infant formulas and medical foods present on the APL that are conditionally eligible only when explicitly prescribed on a participant's WIC Shopping List.
_Avoid_: Restricted formula, special food

**Snapshot Sync**:
The periodic ingestion of the NYS APL spreadsheet where all current products are upserted with a run timestamp, omitted products are purged as delisted, and sync metadata is published last.
_Avoid_: Incremental sync, append sync
