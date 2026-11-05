# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

University students on one campus, in two equal roles: people who lost an item and want to find a matching found notice, and people who found an item and need to report it and hand it over. The current signed-in user is assumed to be "You".

## Product Purpose

A campus lost-and-found board where students browse, search and filter item reports, create reports, and edit only their own. Reports are sorted by category (electronics, clothing, documents, accessories, other) and carry a status (lost, found, claimed). Success: an owner recognises their item and recovers it at a collection point after ownership is verified.

## Positioning

Found items are tied to real campus collection points, and the product distinguishes an item merely reported as found from one confirmed received by staff. A generic classifieds board could not truthfully make that claim.

## Operating Context

Handover and recovery happen at designated campus collection points (fictional in this demo: Campus Security Desk, Student Services Office, Library Reception), after ownership is verified in person. Data is demo-only, stored in browser localStorage, with a Reset demo action restoring example records.

## Capabilities and Constraints

- Fields: title (min 2 characters, required), status (lost/found/claimed, required), category (required), location (optional), description (optional).
- Search across title, location and description; filter by category and status.
- Create reports; edit only own reports.
- The same title at the same location cannot be reported twice.
- Handover states: reported (not confirmed held), received (at a collection point), released (collected by owner).
- A reported item is never presented as confirmed held by staff.
- No backend; no MongoDB or API connection.

## Brand Commitments

No institutional branding exists. Do not invent a university name, logo or colours. Working name in code: "FOUND on campus" / Campus Lost & Found.

## Evidence on Hand

13 fictional seed reports in `src/App.jsx`. No real photos, testimonials, statistics or university assets exist; do not fabricate them.

## Product Principles

1. Finding a match comes first: search and filters by category and status must be fast and obvious.
2. Be honest about item custody: never imply an item is safe with staff unless it is confirmed received.
3. Reporting a found item should be quick and end with clear handover guidance.
4. Protect privacy: publish no personal details; verify ownership in person.
5. Preserve all existing functionality and validation.
