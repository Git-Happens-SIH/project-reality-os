# Dhairya-jindal — SIH working demo

## What the project does
Nirmaan Setu is a construction field-report / planner-review prototype. Engineers write unstructured site notes, propose WBS task links, and confirm them. Planners approve reported progress, retain risk flags, and inspect the audit history. The existing repo is static HTML/CSS/JS, with no backend or real authentication enforcement.

## Run
From the repository folder:

```sh
python -m http.server 8000
```

Open http://localhost:8000/nirmaan-setu-site-report.html in Chrome/Edge. Use localhost or HTTPS, not file://: the offline service worker requires a secure context. Load the page online first and let its service worker finish installing before disconnecting. The landing and onboarding pages are unchanged.

## Film a take
1. Click **Reset demo** (immediate: clears demo reports, draft, progress and audit; retains onboarding/preferences).
2. Open `nirmaan-setu-dashboard.html` in another tab in the same browser/profile/origin. Confirmed starts at **18**.
3. On Site Report, enter date, location and your own note. Example: “P7 pile cap concrete pour completed. Crane idle for two hours.” Watch the live matcher change with your words.
4. Disconnect Wi-Fi, or use browser offline emulation. Click **Save locally**; reload to demonstrate draft restoration.
5. Click **Submit for matching** offline. The badge reads **1 pending sync**. Reload also works offline after the app shell was cached.
6. Reconnect with the app open: the queue processes automatically, badge becomes **0 pending sync**, and scored task matches appear.
7. Select P7 and Crane, then send confirmed tasks to the planner.
8. Approve P7. The Confirmed counter becomes **19** on both the review screen and the already-open dashboard tab. Repeated approvals cannot duplicate the same progress entry.
9. Open the crane conflict card: Package C's seeded 14:00–18:00 booking is shown. Approve with flag or reject; an approval never claims to clear the conflict.
10. Open History for timestamps, report IDs and planner actions. Reset for another take.

## Implemented
- Versioned localStorage state, restored text drafts, errors shown instead of false “saved” success.
- Durable pending reports and idempotent reconnect processing; cached app pages for offline navigation.
- Live explainable matcher over six task categories. Scores depend on words in the actual report; unrelated input returns no match. Score = min(96, 48 + 12 × distinct matching terms). Terms and tasks are in `ns-demo-core.js`.
- Explicit engineer confirmation before queue entry; seeded crane fixture only enters the flow with a confirmed crane task.
- Approve/reject transitions, progress records, audit entries and live cross-tab counts.
- One-click isolated demo reset.

## Important limitations / presentation honesty
- **Local-only demo**, not server synchronization. Reconnect runs the matcher and updates browser storage. No reports are uploaded; different devices do not share state. The browser must be open, or processing resumes on its next online visit.
- **Keyword heuristic, not trained AI or an LLM.** Confidence is a match-strength score, not a calibrated probability. Negation, multilingual input and semantic understanding are not implemented. Show it as a mini matcher prototype, not production AI.
- The original four task IDs are reused; road surfacing and drainage are additional demo catalog entries, not imported plan tasks.
- Counts are a labelled seed baseline plus recorded progress/review/risk entries, not unique completed-task counts. Approval saves the reported note as progress; it does not infer a completion percentage or mark delayed work complete.
- Browser storage is not tamper-proof or a multi-user database. Actor is labelled `Dhairya-jindal (demo)`; no role-based authorization is implemented. Near-simultaneous writes from multiple tabs are not transactionally locked.
- Text-only persistence: photo upload is disabled rather than displaying fake stored photos. Storage deletion/private browsing can erase data.
- Static landing, weekly and other unrelated screens remain prototypes. Use the wired report/matches/review/dashboard/history/conflict screens for this take.
- Draft save is explicit, not autosave. Submit creates a new report. To revise, create a new report; do not assume editing an approved record.

## Tests
```sh
node --test tests/demo.test.cjs
# Optional real browser regression; keep the local server running:
npm install --no-save --package-lock=false playwright
npx playwright install --with-deps chromium
node tests/browser.cjs
```
Five domain tests and the Chromium end-to-end regression passed in the implementation workspace. The browser regression covers offline reload, reconnect, confirmation, cross-tab 18→19, conflict/rejection, audit and reset.

## Production next steps
Add an authenticated server API and transactional database; upload queue with server acknowledgments/retries/idempotency keys; IndexedDB attachments; plan catalog import; semantic model evaluated on site notes; immutable server audit and role permissions. Do not call the local demo production-ready.
