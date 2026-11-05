# UX Rescue Notes — Campus Lost & Found

## User goal

A student wants to match a lost item to a found notice, while another student wants to report a found item accurately. They need to tell whether the item is only reported or has reached a staffed collection point.

## Three usability problems and fixes

1. **Filters looked like a staged form.** Search and select controls updated the board immediately, but an “Apply” button implied an extra step. This makes users uncertain whether their choices took effect. The button is removed; a live result count and “Results update as you type” clarify the behavior. Clear filters remains available.
2. **Invalid submissions gave one generic message.** Users had to guess which required value was missing or how to resolve a duplicate. Validation now points to the title, status, or category field, marks it invalid for assistive technology, and gives a specific correction. The duplicate title-and-location rule remains enforced.
3. **Collection handover state was easy to miss.** A found report could be mistaken for an item already held by staff. The card now presents a prominent state label: “Held at [collection point],” “Not yet handed to a collection point,” or “Collected by owner.” This keeps the important distinction visible without suggesting the app itself verifies custody.

## Alternatives considered with AI

- **Filters:** keep “Apply” and add an active-filter summary, or remove “Apply” and make the live behavior explicit. Chose live feedback because results already update immediately; the first option would preserve a misleading control.
- **Validation:** use a toast at the top, disable publishing until every field is valid, or show field-level errors after submission. Chose field-level errors so the user can locate and fix the problem while keeping the form’s current submit flow.
- **Handover:** add a workflow that lets users choose a collection point, or make existing custody data clearer. Chose clearer state labels because this demo’s report fields do not represent a verified staff handoff; letting reporters set a location could imply confirmation the app cannot provide.

## Demonstration checklist

- Main action: publish a found item, then see it in the Found column.
- Unsuccessful action: submit an incomplete form or duplicate title at the same location and follow the field-level correction.
- Improvements: live filtering and result count; precise validation; prominent handover state.

Screenshots and a completed browser demonstration are pending because the browser connection to the local development server could not be established in this session.
