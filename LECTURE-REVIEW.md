# Lecture review and design decisions

Reviewed all 34 PDF pages of the supplied ACL UI/UX workshop, including the rendered examples. References below use PDF page numbers. The travel, booking and event screens are teaching examples; they do not add travel or booking requirements to this lost-and-found assignment. The lecture does not specify a new GitHub submission destination.

## Mapping the six concepts to this project

| Lecture concept | Relevant pages | Project assessment and decision |
| --- | --- | --- |
| Think like a user | 3-6 | Support finding a matching notice, assessing custody, understanding collection, and reporting an item. Keep factual receipt metadata and clear next steps; do not invent a staff verification workflow. |
| Visual hierarchy | 7-11 | Keep one card for each independent report. Related metadata stays within that report. Keep useful empty-state recovery and one primary action per area. Remove the extra Post action while the reporting form is open. |
| Design systems | 12-17 | Replace the layered ad hoc styling with named colour, spacing, typography and radius tokens shared by the board and form. Retain the existing yellow brand. The slide's Atlassian radii and blue source colour are examples, not compulsory brand values. |
| Usability | 18-27 | Search stays immediately available. Put category, status and owner filters in an inline disclosure on mobile; keep the desktop sidebar. Show active filters with individual remove actions. Keep direct Edit actions and the full-page form. Use a short confirmation for resetting demo data. |
| Real-world behaviour | 28-30 | Retain tested errors, success, conflicts and responsive layouts. Catch localStorage failures, explain temporary session-only changes, and offer Retry saving. Keep essential public-report guidance visible on mobile. Make the form's primary action full width on narrow screens. No artificial loading state is needed for synchronous local demo writes. |
| Guiding AI | 31-34 | Compare alternatives before implementation, justify the selected option, retain all capabilities, and test real scenarios. Existing notes already document rejection of one-click claiming. This review adds the alternatives below. |

## Alternatives compared before the lecture follow-up changes

| Decision | Alternatives and trade-offs | Selected approach |
| --- | --- | --- |
| Small-screen filters | An overlay drawer saves vertical space but needs extra focus/close handling and temporarily hides the results. An inline disclosure is simpler, preserves context and is sufficient for three secondary controls. | Inline disclosure below the always-visible search, with an active-filter count and removable filter chips. All options remain available. |
| Consistent styling | Continue appending CSS overrides, or consolidate the stylesheet around named tokens. More overrides are faster initially but leave conflicting sizes and colours. | A readable shared stylesheet with a small spacing scale, consistent control/card radii and semantic state colours. |
| Reset protection | Keep immediate reset, or use a short confirmation. Immediate reset is fast but can erase reports accidentally. A confirmation adds one step only to a destructive action. | A native accessible dialog explaining what will be removed, with Keep reports and Reset demo actions. |
| Storage failure | Show success unconditionally, block the entire app, or retain in-memory work and explain that persistence failed. Blocking loses the useful session; unconditional success misleads the user. | Keep the current session, show a visible storage warning and provide Retry saving. |

## Deliberate limits

The lecture is guidance for defensible decisions, not a requirement to copy each example. This small five-field form does not need a multi-step wizard. Independent item notices still benefit from cards. No map, timetable, server, real staff handover system or automatic ownership verification is introduced. The required fields, all categories, all three statuses, duplicate prevention, author-only editing and browser persistence remain supported.

The implementation and comparison were produced with AI assistance. They are not a claim that a student completed an independent user study or personally selected every option. The student can review and defend the recorded choices during the demonstration.
