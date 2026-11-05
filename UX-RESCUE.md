# UI/UX Rescue submission

## User goal

Someone who lost an item should be able to quickly find a plausible matching notice. Someone who found an item should be able to report it and understand whether it is actually being held by campus staff.

## Three usability problems and fixes

1. **Filtering looked manual even though it was live.** The old `Apply` button suggested that a search or selection would not take effect until the button was pressed, while the cards changed immediately. I replaced it with “Updates as you type,” a live result count, and a clearly disabled/enabled “Clear filters” action.

2. **No-match and failed-submit states were vague.** A search with no matches left three generic “Nothing here yet” column messages, and invalid reports only said “Please review your entries.” I added a single no-results message with a clear recovery action, plus specific form validation text for short titles, missing categories/statuses, and duplicate title/location reports.

3. **Found-item recovery status was too easy to miss.** Collection-point details appeared as small plain text, which could make a user assume every found report was already in staff custody. Found cards now show a prominent status treatment: “Held at a collection point,” “Not at a collection point,” or “Claimed by verified owner,” with the collection point and ownership-verification guidance where relevant. The sidebar also explains the recovery sequence without inventing an ownership-claim workflow.

## AI suggestion refined

An initial design suggestion was to add a “Claim item” button to every found card. I rejected that because this demo has no ownership-verification workflow and the brief explicitly says a report is not confirmation that staff hold the item. I kept the existing safe behavior and made recovery status and next steps more visible instead.

## Demonstrated behavior

- Main action: open “+ Post a report” and publish a valid report; existing localStorage persistence and edit ownership rules remain intact.
- Unsuccessful action: submit the report form empty; the form now identifies the missing title requirement.
- Existing duplicate-title/location validation remains enforced, with a more actionable message.

## Screenshots

- [Before](./screenshots/before.png)
- [After](./screenshots/after.png)
- [After: no-results state](./screenshots/after-empty-state.png)
- [After: validation feedback](./screenshots/after-validation.png)

## Verification

`npm.cmd run build` completed successfully with Vite.
