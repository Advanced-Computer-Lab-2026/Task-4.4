# Design decisions — before implementation

The README asks for functional usability improvements to the existing React demo. The design options below were generated and compared with AI before changing the interface. These are proposals, rather than a claim that a student independently selected them.

| User goal and observed problem | Alternatives and trade-offs | Selected approach |
| --- | --- | --- |
| Publish a report and recover from mistakes. The validator calculates a specific reason but the form only displays “Please review your entries.” The user cannot locate or correct the mistake. | A single detailed banner is quick to add but still requires searching. Inline errors plus a focused summary require more markup but connect each problem to its control. | Show all relevant field errors, explain duplicates, focus the first invalid control, and preserve typed values. |
| Find a matching notice quickly. Filters already update immediately, yet an Apply button implies a second step. A selected status still leaves three columns, and no matches only says “Nothing here yet.” | Keep Apply and delay filtering until submission, or remove Apply and explain immediate updates. Delayed filtering adds an unnecessary action for thirteen demo records. | Use immediate filtering with visible result counts, a single column for a selected status, and a useful no-results state with Clear filters. |
| Recover found property. Receipt information is small and there is no clear next step. Reported property can be confused with property held by staff. | A one-click Claim button is convenient but incorrectly suggests ownership is verified and staff has the item. A static explanation is safe but easy to overlook. | Show explicit receipt state on each card and a “How to recover” disclosure with the collection point when received, or instructions to wait for confirmed handover when only reported. |

## Refined / rejected AI suggestion

Rejected a one-click “Claim this item” action. The demo has no identity verification or staff workflow, and a found report does not establish custody. Refined the idea into contextual recovery guidance that preserves the existing lost/found/claimed states and does not simulate verification. Only authors can edit their reports; collection-point receipt metadata is never invented.

## Planned demonstration

Capture the unmodified board and failed form first. After implementation, demonstrate search and filtering, a no-results recovery, received-versus-reported guidance, a successful new report, specific validation failure, author-only editing, duplicate prevention, persistence, and resetting the demo. Include desktop and narrow-screen screenshots.
