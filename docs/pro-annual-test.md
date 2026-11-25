# Pro 12-month offer test and SKU scanning

**Install and enable just one G1 ACQ to support the Ultra 1-month free trial and the 2TB 12-month offer test**, while also passively collecting original SKUs, performing the three-tier rewrite, and viewing the local report; `v7.6.0` continues to provide diagnostics for the most recent 10 responses, what was new in this response, and duplicates. The script first collects product IDs from the original text responses from `one.google.com/`, then, only in `/ai?` responses, changes the full original iOS 2TB SKU with the `g1.ios.2tb.` prefix to `g1.2tb.ai.12months_ip_90p`; 20TB / 30TB default to the Ultra 1-month free trial SKUs `g1.20tb.1month_eft.acq` / `g1.ai.ultra.1month_eft.acq`, each independently falling back to its corresponding three-month 90p fallback SKU. The 2TB tier uses the user-specified fixed candidate with no fallback tier; see Section 4 for the full mapping. The current response script version is `g1-acq-v7.6`.

This version integrates [GitHub PR #3](https://github.com/crhywun/g1-acq/pull/3), adding Ultra 1-month free trial support for the 20TB / 30TB tiers; whether the trial is shown to the current account, the actual subscription period, and the renewal amount are as recorded at the App Store checkout, and benefits are as shown in the actual state of the Google One account.

The collector only reads matching responses actually received by the phone and **does not actively query the full SKU catalogue**. An old ID appearing again increases its count but does not become a new ID; seeing the old list alone is not enough to judge that the phone script has failed, and this round has no verified on-device fault conclusion.

**The full candidate for this round's 12-month offer test is `g1.2tb.ai.12months_ip_90p`, with no `.acq` suffix.** The first item in the user's screenshot provides that candidate and the price tag `$1.99 × 12 months = $23.88/year`; the figure expresses a monthly offer over 12 consecutive months; `90p` means **90% off, roughly 10% of the original price**, not 10% off with 90% payable. `$23.88/year` is the 12-month total tag shown in the screenshot, not evidence of a single annual charge.

The screenshot is titled **Pro 5TB**, and the source product in this round remains the full original iOS 2TB SKU with the `g1.ios.2tb.` prefix, with no new 5TB source prefix added. The screenshot is the source of the candidate and price tag, not verified iOS store product information, and it does not prove the actual iOS price, billing period, or 5TB benefits. The operating environment is Shadowrocket and the Google App on an iPhone; check the candidate name, period, initial and renewal amounts after the App Store actually returns the product, and take benefits as shown in the Google One account. Offline tests verify string matching and report behaviour.

## 1. Install or upgrade the main module

**G1 ACQ — Ultra 1-month free trial, 2TB 12-month offer test, passive collection, most recent 10 responses diagnostics, and JSON export**

```text
https://cdn.jsdelivr.net/gh/Zpankz/gacc@v7.6.0-en.1/g1-acq-v7.sgmodule
```

For a first install, add the URL above in Shadowrocket's module management and enable it; when upgrading from an old version, replace the old **G1 ACQ** with this URL once. The module name remains **G1 ACQ**, and the installation entry point and all internal scripts use the fixed `@v7.6.0` reference, so there is no need to add scripts separately. After installing or upgrading, reconnect, then reopen the plan page in the Google App. Releasing a new version requires updating both the script content and the fixed version pin; merging a PR does not automatically update or invalidate an old fixed CDN URL, and the old URL still references its original version. Upgrading preserves history; reinstalling repeatedly will not prompt the server to issue new SKUs, so when diagnosing, first compare version, counts, and response times.

Collection and rewriting run in sequence in the same main module, with no need to install or switch to **G1 SKU Scan** separately. If only one main module is installed, there are no extra steps to disable anything; if you previously installed the standalone scanner, **G1 Pro Annual Test**, or other rewrite copies, disable those old copies to avoid duplicate counting or rewriting. The historical tags `v7.0.0` / `v7.1.0` / `v7.2.0` / `v7.3.0` / `v7.4.0` / `v7.5.0` and `pro-annual-test-v1` / `pro-annual-test-v2` remain unchanged.

This version's response activity diagnostics come from the main script `g1-acq-v7.6`. The **G1 Pro Annual Test** compatibility entry point references the same new script but still only matches `/ai?`; the **G1 SKU Scan** standalone compatibility entry point only updates the download pin, its scanning script retains the historical implementation, its collection record version remains `pro-annual-test-v2`, and it has no new response activity fields. When the new report reads records from that standalone scanner it shows the real old version and **old collection records**, with `recentResponses` empty and no activity fabricated.

The main module includes the local report script, only appends the MITM hostname `one.google.com`, and retains the original global UDP 443 blocking rule; the latter also affects HTTP/3, speed, or connectivity in other apps.

## 2. Configure HTTPS decryption

For the module to handle HTTPS responses, decryption must be enabled and the certificate trusted in the currently used configuration.

1. Enable the **G1 ACQ** installed from the `v7.6.0` URL in Section 1; users of old versions upgrade once as in Section 1, and keep the Shadowrocket VPN connected.
2. Go to **Configuration page -> the (i) icon to the right of the currently used configuration -> HTTPS Decryption**, and turn on the decryption switch.
3. If you already have a usable and trusted Shadowrocket certificate, keep using it; if no certificate has been configured yet, generate and install a certificate on that page, then go to iOS **Settings -> General -> VPN & Device Management** to complete profile installation.
4. When configuring a certificate for the first time, go to iOS **Settings -> General -> About -> Certificate Trust Settings** and enable trust for the corresponding Shadowrocket root certificate.
5. In the **HTTPS decryption hostname list** of the current configuration, check for `one.google.com`. The module appends that domain using `%APPEND%`; this is the HTTPS decryption list, not DNS Hosts.
6. After changing a module switch or decryption settings, reconnect Shadowrocket, then re-enter the plan page in the Google App.

[The configuration entry screenshot in the README](../README.md#installation-shadowrocket) shows the `(i)` entry point to the right of the current configuration. The MITM hostname covers the whole `one.google.com` domain, and the scope of script reads and rewrites is limited by the URL matching described below.

## 3. Browse plans and passively collect original SKUs

Just keep the same **G1 ACQ** enabled. Each time a text response from `one.google.com/` is processed, the main script first collects the original body, then checks whether that response needs the three-tier rewrite; the candidate IDs recorded are not replaced by the subsequent rewriting in that same run; matching non-text responses only count toward the non-text diagnostics.

1. Keep Shadowrocket connected, paste the full [local report URL](https://one.google.com/g1-sku-report) in the address bar of Safari on the same phone, and check the **Handled by local script** badge and report version **v7.6.0**; first note the actual `scan.version`, `scannedResponses`, `matchedResponses`, `nonTextResponses`, and the most recent response time.
2. Open **Google App (colourful G icon) -> Google One management**, and re-enter the **2TB / Pro** plan actually offered on the page; when checking the Ultra 1-month free trial mapping, also browse the actually offered **20TB / 30TB** plans.
3. When the page offers monthly/annual switching, browse each in turn and wait for loading to complete. Only newly received matching responses produce collection activity, and there is no need to complete a purchase; the account, region, and App version determine the plans and controls actually shown, and the page cache also affects whether new requests are issued.
4. Return to Safari, refresh the report, compare the counts and the most recent response, and view the number added this time and its status. Growing counts with `known-skus` indicate duplicate data; a list with no additions does not mean collection has stopped. If neither the counts nor the most recent response time changed, you can only confirm that no new collection record was saved in this round; a failed storage write also preserves the old counts, so check the `saved=no` / `SKU collection unavailable` logs, cache, matching scope, and module configuration as in Section 7.
5. View "Candidate SKUs collected while browsing pages" and note the full IDs, counts, and most recent discovery times. Look for full IDs that actually appear with the `g1.ios.2tb.` prefix; for 20TB / 30TB, compare against the two full source IDs in Section 4, and do not complete or guess suffixes yourself.
6. Tap the **Export JSON** button in the report actions area to save the result, or open the [JSON export URL](https://one.google.com/g1-sku-report?format=json) directly.

Passive collection covers text responses under `https://one.google.com/`, skipping `/g1-sku-report`, the same path with a trailing `/`, and their queries. It identifies `g1.*` and `com.google.one.*` strings and accumulates occurrence counts deduplicated by ID; the same ID appearing repeatedly in one response, or appearing again in a later response, increases its count, and the count is not a purchase count.

At most **300 distinct IDs** are retained. After the limit is reached, counts and times for already-saved IDs continue to be updated; new IDs over the limit are no longer added to the list, and `omittedCount` records the number of distinct IDs discarded in that run due to capacity. When `addedCount>0`, `new-skus` takes precedence, even if capacity discards also occurred; `limit-reached` is used only when `addedCount=0` and `omittedCount>0`. Keeping the old list lets you compare new versus duplicate; only when you explicitly want to reset history should you, after exporting, manually perform the two-key clear in Section 5 — day-to-day diagnostics require no clearing.

During collection, `\u002e`, `\x2e`, and HTML dot entities are restored in the text copy used for identification; that restoration step does not modify the response. After collection completes, only responses matching `/ai?` enter the three-tier rewrite, and other responses are returned unchanged. The script does not read request headers or request bodies, does not save the full response body, does not query the App Store, and does not send collection data out.

## 4. Test the 2TB 12-month offer and the Ultra 1-month free trial

Collection and rewriting are performed automatically in sequence by the main module; keep the same **G1 ACQ** enabled while checking the checkout.

1. Confirm that the new **G1 ACQ** is enabled and Shadowrocket is connected; there is no need to switch collection modules.
2. Check the switch under **(i) -> HTTPS Decryption** for the current configuration, the `one.google.com` hostname, and iOS certificate trust, then reconnect Shadowrocket.
3. Leave the current plan page, then re-enter the **2TB / Pro** plan from **Google App (colourful G) -> Google One management**. The source product for the 12-month offer test is the original iOS 2TB; when checking the Ultra 1-month free trial mapping, open the actually offered 20TB / 30TB plans separately.
4. Enter the subscription flow from a plan actually offered on the page, and check the **product name, subscription period, currency, initial amount, and renewal amount** at the App Store checkout. If the checkout is not opened, note the actual prompt shown on screen; record the results for 2TB, 20TB, and 30TB separately.
5. Open the [local report](https://one.google.com/g1-sku-report) in Safari and view the version, execution time, and status of the "Most recent three-tier mapping"; "total replacements" is the total across the three tiers, "of which 2TB" is the number of 2TB / Pro offer rewrites, and the rows below show the full source IDs, actual targets, and fallback status.
6. Tap the **Export JSON** button in the report actions area, or open the [JSON export URL](https://one.google.com/g1-sku-report?format=json), and retain `reportVersion`, `configuredTarget`, `test.version`, `test.matchedFrom`, `test.target`, `test.targetOrigin`, `test.hitCount`, `test.annualHitCount`, `test.status`, and `test.updatedAt`, recording them together with the App Store results shown this time.

The main script first collects SKUs from original text responses matching `^https://one\.google\.com/`, then identifies full plain-text IDs only in responses matching `^https://one\.google\.com/ai\?` and applies the following mapping:

| Full source SKU in the body | Default target | Fallback target |
|---|---|---|
| Full SKU with the `g1.ios.2tb.` prefix | `g1.2tb.ai.12months_ip_90p` (user-specified candidate) | None |
| `g1.ios.20tb.m.v2` | `g1.20tb.1month_eft.acq` (Ultra 1-month free trial) | `g1.20tb.3months_ip_90p.acq` (three-month 90p offer) |
| `g1.ios.30tb.ai.pro.m` | `g1.ai.ultra.1month_eft.acq` (Ultra 1-month free trial) | `g1.ai.ultra.3months_ip_90p.acq` (three-month 90p offer) |

A matched full 2TB source ID is fixed-replaced with the candidate `g1.2tb.ai.12months_ip_90p`, with no fallback target, and the target is not required to appear in the body first. 20TB / 30TB must match the full source IDs in the table, and each tier independently decides its target from the original response body:

- When that tier's `1month_eft` default target appears in the body, the default target is preferred; even if the corresponding 90p fallback also appears, the default target is still used, recording `fallback=false`.
- When that tier's `1month_eft` default target does not appear and the corresponding 90p fallback target does, that tier's 90p target is used, recording `fallback=true`.
- When neither that tier's default target nor its corresponding 90p fallback appears, the `1month_eft` default target is still used for the replacement, recording `fallback=false`.

The 20TB fallback judgement uses only the 20TB targets, and the 30TB fallback judgement uses only the 30TB targets. 75p is no longer a fallback target in this version; only historical records from old versions retain `g1.20tb.3months_ip_75p.acq` or `g1.ai.ultra.3months_ip_75p.acq` as actual fallback targets. This is a judgement based on target strings in the response body, not a query of the App Store product catalogue. Other IDs are left unchanged; when none of the three tiers matches, the response is returned unchanged. The two `1month_eft` default targets provide entry to the Ultra 1-month free trial; the three-month 90p offer is each tier's fallback offer, and reports and on-device records must distinguish trial from fallback offer by the actual `to` in that run.

| Report field | Meaning |
|---|---|
| `reportVersion` | Current report script version `v7.6.0`, shown separately from the version of the saved execution record |
| `configuredTarget` | Currently configured 2TB candidate `g1.2tb.ai.12months_ip_90p` |
| `test.version` | Script version that generated that execution record; the current main script is `g1-acq-v7.6`, and retained old records still show their original version |
| `test.matchedFrom` | Full source IDs actually matched in that response, row by row in the format `{id, to, count, fallback}`; `to` is the actual target for that source in that run, `count` is the rewrite count for that source; `fallback=true` means the fallback tier of the version used for that execution was used — 90p in this version, possibly 75p in historical records from old versions — and the report distinguishes them by the actual `to` |
| `test.target` | The 2TB target actually saved at the most recent execution; new records and old v7.5 records are both `g1.2tb.ai.12months_ip_90p`, but old v7.5 records still retain `g1-acq-v7.5` as `test.version`; old v7.3 / v7.4 records retain `g1.2tb.ai.annual_ip_90p.acq`, old v7.2 records retain `g1.2tb.ai.annual.3months_ip_90p.acq`, and old v1 / v7.1 records remain `g1.2tb.ai.annual`; for the actual 20TB / 30TB targets, see the `to` on each row |
| `test.targetOrigin` | `user-specified` for new candidate records and old v7.3 / v7.4 / v7.5 records, `pattern-derived` retained for old v7.2 records, `legacy` for old v1 / v7.1 regular annual records, and empty when there is no execution record |
| `test.hitCount` | Total rewrites across the three tiers in that response; `hits=N` in the script output corresponds to this value |
| `test.annualHitCount` | Retains its compatibility field name and only counts 2TB / Pro offer rewrites in that response; `annualHits=N` in the script output corresponds to this value, and the report displays it as "of which 2TB"; the field name and count do not prove an annual charge |
| `test.updatedAt` | Time of the most recent execution, UTC |
| `test.status = rewritten` | At least one of the three tiers performed a string replacement; this status also applies when only 20TB / 30TB matched |
| `test.status = no-match` | None of the three tiers' full source IDs matched in this text response; the response is returned unchanged |
| `test.status = non-text` | This response has no processable text body; the response is returned unchanged |

Current logs use the `[g1-acq]` prefix, with the summary format `g1-acq-v7.6 hits=N annualHits=N` and per-row output `Source SKU -> Actual target xN`; when a 20TB / 30TB row selects the fallback tier, that row appends `fallback=<actual full target ID>`, which in this version is `fallback=g1.20tb.3months_ip_90p.acq` or `fallback=g1.ai.ultra.3months_ip_90p.acq` respectively. `fallback=75p` in old-version logs is only a historical format. The `to` in the report corresponds to the per-row logs, the HTML shows the 90p fallback or historical 75p fallback by the actual `to`, and `hits` and `annualHits` in the main summary correspond to `hitCount` and `annualHitCount` respectively.

What is saved here is the **most recent execution record entering the three-tier rewrite check**, not a cumulative test history; within that scope, a later zero-match response also updates the record. `configuredTarget` indicates the current configuration, and `test.target` indicates the target actually saved at the most recent execution; old v7.5 records still have `g1.2tb.ai.12months_ip_90p` as their 2TB target with origin `user-specified`, and their `test.version` remains `g1-acq-v7.5`; old v7.3 / v7.4 records still retain `g1.2tb.ai.annual_ip_90p.acq` and `user-specified`, old v7.2 records retain `g1.2tb.ai.annual.3months_ip_90p.acq` and `pattern-derived`, and old v1 / v7.1 records retain `g1.2tb.ai.annual` and `legacy`. The upgrade itself preserves historical IDs, actual targets, old versions, and the old `test.targetOrigin`, and does not re-label them as the current candidate or as `user-specified`. Even when targets are the same, check `test.version` and the execution time; the same 2TB target alone does not mean an old v7.5 record has been updated. A hit count only proves text replacement; it does not prove the App Store accepts the target product or that a subscription was completed.

`hitCount=0` with `status=no-match` means none of the three tiers matched in this text response; it does not mean the account has no 2TB product, nor that the target product does not exist. If `annualHitCount=0` and `hitCount>0`, only 20TB / 30TB matched, the status is still `rewritten`; to judge the 2TB 12-month offer test you must look at `annualHitCount`, then compare the `id` and `to` on each row.

The same main module's collection scope covers all of `one.google.com/` and can recognise escaped dots; the three-tier rewrite only handles full plain-text IDs in the original text of `/ai?`. So a candidate ID appearing in the report does not guarantee that another `/ai?` response will match. When a target tier does not match, continue browsing the plans actually offered, view the full IDs passively collected as in Section 3, do not switch modules, and do not speculate about new iOS SKUs.

## 5. Local result page, export, and clearing

Keep Shadowrocket connected and the new **G1 ACQ** enabled, and paste the full [local report URL](https://one.google.com/g1-sku-report) in the Safari address bar. The top of the page should show the **Handled by local script** badge and the **v7.6.0** badge, and the actions area should have an **Export JSON** button; tap the button to export, or use the direct URL below:

| URL | Action |
|---|---|
| [Local report](https://one.google.com/g1-sku-report) | Shows cumulative collection results and the most recent combined three-tier test record |
| [Export JSON](https://one.google.com/g1-sku-report?format=json) | Returns a `g1-sku-report.json` download response |
| [Clear this tool's records](https://one.google.com/g1-sku-report?clear=1) | Clears this tool's collection records and most recent test record |

**The address uses a Google domain, and the report page is provided by a script locally on the phone.** Shadowrocket's `http-request` script takes over `https://one.google.com/g1-sku-report`, also supporting a trailing `/` and queries, generates HTML or JSON locally, returns it directly, and does not pass the request to Google. The HTML loads no external resources, and the report and export scripts have no network reporting calls.

If you see a normal Google page or a 404, it means the local report was not shown this time. Check that the new **G1 ACQ** is enabled, Shadowrocket is connected, **current configuration (i) -> HTTPS Decryption**, the `one.google.com` hostname, and a trusted certificate in iOS, then paste the full report URL into the Safari address bar and open it.

Data is saved in the phone's `$persistentStore`, collection, response event, and execution record times use UTC, and both key names and `schemaVersion: 1` remain unchanged:

| Key | Contents |
|---|---|
| `g1.sku.scan.v1` | Candidate IDs, cumulative counts, most recent discovery times, actual collection version, text/matched/non-text response counts, limit status, and up to 10 redacted response events |
| `g1.pro.annual.test.v1` | Script version of the most recent execution, 2TB source prefix, matched source IDs for the three tiers with per-row actual targets and fallback status, 2TB target, total rewrites, 2TB rewrites, time, and status |

The HTML shows, by matched row, the full source ID, actual target, count, and fallback status, to avoid misreading `test.target` as the 20TB / 30TB target. The default targets in this version are `g1.20tb.1month_eft.acq` / `g1.ai.ultra.1month_eft.acq` respectively; the fallback targets are `g1.20tb.3months_ip_90p.acq` / `g1.ai.ultra.3months_ip_90p.acq` respectively. The HTML combines `fallback` with the actual `to` to show the 90p fallback, the historical 75p fallback, or "No"; when a row is marked as fallback but target information is insufficient it shows only "Yes", and 20TB / 30TB rows from old versions retain their original targets and fallback status. The new result page is compatible with old v1 records that only have 2TB: when an old row lacks `to`, it is filled in as the original regular annual target `g1.2tb.ai.annual`, a missing `annualHitCount` is calculated from the counts of the old 2TB rows, and old rows are shown as not using the fallback tier. For old v1 / v7.1 records, `test.target` retains the original regular annual target and `test.targetOrigin` shows `legacy`; old v7.2 records retain the actually saved `g1.2tb.ai.annual.3months_ip_90p.acq` and `pattern-derived`; old v7.3 / v7.4 records retain `g1.2tb.ai.annual_ip_90p.acq` and `user-specified`; old v7.5 records retain `g1.2tb.ai.12months_ip_90p` — the same as the current configuration — plus `user-specified` and the old version `g1-acq-v7.5`. An upgrade does not re-label old IDs, old origins, or old versions. There is no need to clear these two keys first in order to preserve old records.

The core collection field in the JSON is `scan.skus`, each entry containing `id`, `count`, and `lastSeen`; for test fields, see Section 4. The report displays the **report version `reportVersion=v7.6.0`** and the **actual collection record version `scan.version`** separately; the latter comes from the saved records, and the main collector in this version is `g1-acq-v7.6`. Records from old scripts show **Old collection records; no response records from the current collector have been saved yet.** When the version is unknown or there are no records, it is marked **No response records from the current collector have been saved yet.** Updating only the report script does not mean the new collector has received a response, and these labels do not constitute an on-device fault conclusion.

| Collection field | Meaning |
|---|---|
| `scan.version` | Script version that generated the actual collection records, retaining the original value of old records |
| `scan.scannedResponses` | Cumulative number of text responses; its original meaning is unchanged, and non-text is not counted in it |
| `scan.matchedResponses` | Cumulative number of text responses in which at least one candidate ID was identified; duplicate IDs also count as matched, and its original meaning is unchanged |
| `scan.nonTextResponses` | Cumulative number of non-text responses, kept separate from text responses |
| `scan.recentResponses` | Up to 10 events; the JSON array is saved in arrival order old -> new, the oldest event is dropped once there are more than 10, and the HTML table is shown new -> old |

Each response event contains the following fields:

| Event field | Meaning |
|---|---|
| `at` | Time at which this response was processed, UTC |
| `path` | Fixed category path, taking only `/`, `/ai`, `/plans`, `/_/…/data/batchexecute`, or `[Other one.google.com path]` |
| `bodyType` | Response body type, not including body content |
| `status` | Collection diagnostic status for this response, see the table below |
| `candidateCount` | Number of distinct candidate IDs identified in this response; the same ID appearing multiple times counts as 1 candidate |
| `addedCount` | Number of distinct IDs newly added and actually retained this time |
| `omittedCount` | Number of distinct IDs discarded this time due to the 300-ID capacity limit; the same unretained ID appearing multiple times counts as 1 discard |

| `status` | Meaning |
|---|---|
| `new-skus` | `addedCount>0`: new IDs were retained this time; even if `omittedCount>0`, this status still takes precedence |
| `known-skus` | The IDs identified this time were already saved; only cumulative counts and discovery times were updated |
| `no-skus` | No candidate ID was identified in this text response |
| `limit-reached` | Used only when `addedCount=0` and `omittedCount>0`: no new IDs retained, with capacity discards present |
| `non-text` | This response is not collectable text; increments `nonTextResponses` |

`candidateCount`, `addedCount`, and `omittedCount` count distinct IDs in each response; `scan.skus[].count` still accumulates string occurrence counts, and the two have different meanings. When existing records lack `recentResponses`, the report does not fabricate a response history from old times or cumulative counts; only responses actually processed later produce new events. Old counts and original candidates continue to be retained, and the most recent 10 responses do not represent the full history either.

Response paths are fixed-redacted: the `…` in `/_/…/data/batchexecute` is fixed display text; all other paths are uniformly grouped under `[Other one.google.com path]`. Events and exports do not save the query, full URL, request headers, response headers, request body, or response body. The report shows the last response time and the most recent response history; use them to compare against the time you opened the plan page this time.

`?clear=1` is still a manual operation; it only clears the contents of the two keys above and does not perform Shadowrocket's "clear all data"; reading the report and refreshing the normal report address do not clear records. Only when you explicitly want to reset history should you export first and then clear; when the list has no additions, first compare counts, version, and events to preserve the diagnostic basis. After clearing, return to the [local report URL](https://one.google.com/g1-sku-report) without `clear=1`, to avoid clearing new records again when refreshing the clear address.

## 6. Collecting and verifying hidden SKUs on iOS with Shadowrocket

This project currently runs on **iPhone + Shadowrocket + Google App**. Collection reads the entire matching original text response: even if a plan containing a given ID is not shown on the page, as long as the ID has already appeared in that response it is extracted. A page showing only a few plans does not mean the response contains only a few IDs.

1. Keep the same **G1 ACQ** enabled, and in the Google App open in turn the actually offered 2TB / Pro, monthly, annual, and offer entry points; each time, wait for the page to finish loading so the module can collect the original responses issued under different entry points.
2. Open the [local report](https://one.google.com/g1-sku-report) in Safari and view "Candidate SKUs collected while browsing pages"; this part saves full IDs obtained before rewriting, up to 300.
3. For this round's specified candidate `g1.2tb.ai.12months_ip_90p`, re-enter the original 2TB / Pro plan and let the module replace the source ID at that entry point; in the report, check `test.version=g1-acq-v7.6`, `test.target`, and the `to` on the corresponding row.
4. From that plan, enter the native subscription flow and view the product, period, initial and renewal amounts actually shown by the App Store; save the actual results shown, then export the JSON to compare against the script execution record.

The original collection list and the configured replacement candidate are saved separately. A new target written by the module itself does not automatically become a "collected hidden SKU"; IDs not issued by the server are not in this collection result either. The current Shadowrocket script processes network responses and makes no direct calls to StoreKit interfaces inside the Google App, and "replacement succeeded" in the report describes only the text rewrite.

Native iOS product queries use StoreKit's `Product.products(for:)` or `SKProductsRequest`, submitted by the corresponding App context with known IDs; such queries return product details and are not a catalogue interface that lists all products. This project's on-phone operating flow is: collect original IDs, replace the specified candidate, view the native subscription response, then save the report.

## 7. Judging common results

| Observation | Next step |
|---|---|
| The report page shows "No records yet" or "No response records from the current collector have been saved yet." | First save the actual `scan.version` and counts, then re-enter the 2TB / Pro page actually offered in the Google App and refresh the report; an unknown version or no records does not directly equal an on-device fault |
| The report is `v7.6.0`, and the collection area is marked "Old collection records" | The report has been upgraded, but the saved collection records still come from an old script; compare the actual `scan.version`, counts, and most recent response time, then reopen a plan and check again |
| Old records have no `recentResponses` | Retain the original candidates and cumulative counts, and wait for actual new responses to fill in the history; the report does not fake old counts as recent activity |
| Safari shows a normal Google page or a 404 | The local report is not currently shown; check the new G1 ACQ, the connection, the current configuration's HTTPS decryption, `one.google.com`, and a trusted certificate as in Section 5, and paste the full report URL into the Safari address bar to open it |
| The page has no "Handled by local script" badge, `v7.6.0` badge, or "Export JSON" button | Check that you have upgraded to the new main module as in Section 1, then reopen the local report in Section 5; the direct JSON export URL is also listed in Section 5 |
| The report page shows that the local storage interface is not ready yet | The page script did not obtain the `$persistentStore` read interface, and the current page is not evidence of successful collection; note the result shown and the Shadowrocket version |
| The list still shows old IDs, but the text response count has increased and the status is `known-skus` | Duplicate data was received this time; cumulative counts and discovery times will update; keep the existing records and compare the candidate and added counts for each response |
| `scannedResponses`, `matchedResponses`, `nonTextResponses`, and the most recent response time are all unchanged | You can only confirm that no new collection record was saved in this round; a failed storage write also preserves the old counts; first check the script logs for `saved=no` / `SKU collection unavailable`, then check item by item the cache, the `one.google.com/` matching scope, the module switch, the VPN, the current configuration's HTTPS decryption, certificate trust, and hostname, then reopen an actual plan and refresh the report |
| The text response count has increased, and the most recent status is `no-skus` | The body processed this time contained no matching strings; continue checking the actually offered 2TB / Pro and monthly/annual pages, and do not generate IDs out of thin air |
| Only `nonTextResponses` increased, and the most recent status is `non-text` | A non-text response was received, and the text counts retain their original meaning; record this run's type and redacted path, then check other actually offered plan pages |
| The most recent status is `new-skus` | `addedCount>0`: new IDs were actually retained this time; even if `omittedCount>0` at the same time, the status is still `new-skus`; `count` in the candidate list is still the cumulative occurrence count |
| A 2TB ID has been collected, but `annualHitCount` is 0 | Compare the execution time, the full source ID, the `g1.ios.2tb.` prefix, and the `/ai?` matching scope; collect again as in Section 3 |
| `status=rewritten`, `hitCount>0`, but `annualHitCount=0` | Only 20TB / 30TB were rewritten this time; view the `id`, `to`, and `fallback` on each row — this status does not represent a 2TB offer rewrite hit |
| `status=no-match`, `hitCount=0` | None of the three tiers matched in this text response; compare against the full source IDs and URL scope in Section 4, then collect again as in Section 3 |
| `fallback=false` for 20TB / 30TB in this version | The actual `to` is that tier's `1month_eft` default trial SKU; the default target is chosen both when the default target already appeared and when neither the default nor the 90p fallback appeared — check against the full IDs in Section 4 |
| `fallback=true` for 20TB / 30TB in this version | The corresponding `1month_eft` default target was not seen in the original body, and that tier's three-month 90p fallback found in the body was selected; the actual `to` is `g1.20tb.3months_ip_90p.acq` or `g1.ai.ultra.3months_ip_90p.acq`, and that row is not a 1-month free trial target |
| A historical 20TB / 30TB row shows the 75p fallback | This is the actual `to` and `fallback` saved by an old version; retain the old values and check against `test.version`, the execution time, and the original checkout result — 75p does not participate in this version's fallback |
| The 2TB `test.target` is the same as the current configuration, but `test.version=g1-acq-v7.5` | It is still an old v7.5 execution record; the target is likewise `g1.2tb.ai.12months_ip_90p`, and the same target does not mean `g1-acq-v7.6` has already run |
| `hitCount` is greater than 0, but the checkout errors or does not appear | Record the actual prompt and that tier's actual target `to`; record text replacement success and store acceptance of the target product separately |
| The App Store product, period, or amount differs from expectations | Record by the product returned by the App Store this time and what the checkout shows; first check whether `to` is the `1month_eft` trial, the three-month 90p fallback, or the 2TB target — `1month_eft`, `12months`, and `90p` in the SKU and the screenshot price tag do not substitute for the actual result this time |
| `addedCount=0` and `omittedCount>0`, with status `limit-reached` | No new IDs were retained this time, with capacity discards present; already-saved IDs still update; only when you explicitly want to free capacity for a new collection round should you export first, then manually clear the two keys with `?clear=1` |

Performing the single diagnostic in Section 3 — "note first -> reopen the actual plan -> refresh and compare" — preserves the before-and-after evidence; new IDs are determined by the actual response content, and repeatedly reinstalling or clearing records will not prompt the server to issue new SKUs.

## 8. On-device record template

```text
Collection / test time (with time zone): [fill in]
iOS / Google App / Shadowrocket versions: [fill in]
Main module name: G1 ACQ
Main module URL: https://cdn.jsdelivr.net/gh/Zpankz/gacc@v7.6.0-en.1/g1-acq-v7.sgmodule
Main module release version: v7.6.0
Main module script version: g1-acq-v7.6
Run method: single-module passive collection of original SKUs and the most recent 10 responses, then three-tier rewriting (Ultra 1-month free trial / three-month 90p fallback, 2TB 12-month offer candidate)
Currently enabled main module: G1 ACQ
Local badge and version at the top of the report: [fill in what was actually shown]
Report script version reportVersion: [fill in what was actually shown; currently v7.6.0]
Actual collection script version scan.version: [fill in the actually saved value; the main collector in this version is g1-acq-v7.6]
Collection version note: [fill in what was actually shown; Old collection records / No response records from the current collector have been saved yet. / current-version status]
Text count before opening a plan, scan.scannedResponses: [fill in]
Text count after opening a plan, scan.scannedResponses: [fill in]
Matched count before opening a plan, scan.matchedResponses: [fill in]
Matched count after opening a plan, scan.matchedResponses: [fill in]
Non-text count before opening a plan, scan.nonTextResponses: [fill in; if missing in old records, record "Not recorded"]
Non-text count after opening a plan, scan.nonTextResponses: [fill in]
Most recent response time before opening a plan: [fill in; if old records lack history, record "Not recorded"]
Most recent response time after opening a plan: [fill in]
Most recent responses scan.recentResponses: [fill in up to 10 in JSON arrival order old->new; HTML table is new->old; if history is missing, record "Not recorded"]
Latest response at / path / bodyType: [fill in actually saved values; at is UTC, and for path fill in only the redacted category]
Latest response status: [fill in new-skus / known-skus / no-skus / limit-reached / non-text]
Latest response candidateCount / addedCount / omittedCount: [fill in the distinct candidate count / newly retained count / capacity discard count]
Currently configured target configuredTarget: g1.2tb.ai.12months_ip_90p
Candidate origin: user-specified in the user screenshot (user-specified), literal value g1.2tb.ai.12months_ip_90p, no .acq suffix
Screenshot price tag: $1.99 × 12 months = $23.88/year; a monthly offer tag over 12 consecutive months, not a verified iOS price or billing period
Screenshot discount meaning: 90p = 90% off, roughly 10% of the original price, not 10% off with 90% payable
Screenshot title: Pro 5TB; the source product in this round remains the original iOS 2TB, and the screenshot does not prove 5TB benefits
2TB candidate verification status: pending the product actually returned by the App Store; fill in by this round's product name, period, initial and renewal amounts
Ultra 1-month free trial: supported in this version; shown to the current account: [fill in from this checkout]
20TB source SKU: g1.ios.20tb.m.v2
20TB default trial SKU: g1.20tb.1month_eft.acq
20TB three-month 90p fallback SKU: g1.20tb.3months_ip_90p.acq
30TB source SKU: g1.ios.30tb.ai.pro.m
30TB default trial SKU: g1.ai.ultra.1month_eft.acq
30TB three-month 90p fallback SKU: g1.ai.ultra.3months_ip_90p.acq
Independent selection rule in this version: when a tier's default appears, the default is preferred; when the default is absent and the 90p fallback appears, fall back to 90p; when both are absent, still select the 1month_eft default; 75p does not participate in this version's fallback
Whether the default / 90p fallback appeared in the original 20TB body: [fill in evidence from the original response this time; if not checked, record "Not checked"]
Whether the default / 90p fallback appeared in the original 30TB body: [fill in evidence from the original response this time; if not checked, record "Not checked"]
Whether the "Export JSON" button was seen and tapped: [fill in]
Plan name actually opened in the Google App: [fill in the actual name of 2TB / Pro, 20TB, or 30TB]
Collected original iOS 2TB full SKU: [fill in the original text; if it did not appear, record "Not collected"]
Collected original iOS 20TB / 30TB full SKUs: [fill in the original text; if they did not appear, record "Not collected"]
Execution script version test.version: [fill in the actually saved value; g1-acq-v7.6 in this version, still g1-acq-v7.5 for old v7.5]
Most recent test time test.updatedAt (UTC): [fill in]
Per-row source ID, actual target, count, fallback status test.matchedFrom: [fill in {id, to, count, fallback}]
20TB actual target to / fallback: [fill in actually saved values; in this version, default g1.20tb.1month_eft.acq / false, fallback g1.20tb.3months_ip_90p.acq / true]
30TB actual target to / fallback: [fill in actually saved values; in this version, default g1.ai.ultra.1month_eft.acq / false, fallback g1.ai.ultra.3months_ip_90p.acq / true]
Historical 75p fallback: [for old-version records only, fill in the original to and fallback; retain g1.20tb.3months_ip_75p.acq or g1.ai.ultra.3months_ip_75p.acq]
Log fallback: [fill in this run's full target ID; if no fallback was used, record "None"]
Most recently executed 2TB target test.target: [fill in the actually saved value; old records retain their original target ID; old v7.5 is likewise g1.2tb.ai.12months_ip_90p, but its version retains the old value]
Most recent execution target origin test.targetOrigin: [fill in user-specified / pattern-derived / legacy / empty; retain old origins]
Total rewrites across the three tiers test.hitCount: [fill in]
2TB / Pro offer rewrites only test.annualHitCount: [fill in; compatibility field name, does not prove an annual charge]
Execution status test.status: [fill in]
Whether the App Store checkout was opened: [fill in]
App Store product name: [fill in what was actually shown]
Subscription period: [fill in what was actually shown]
Currency / initial amount / renewal amount: [fill in what was actually shown]
Actual error prompt: [fill in the original text; if none appeared, record "None"]
Whether a purchase was actually completed: [fill in]
Benefits shown in the Google One account after purchase: [fill in only after an actual purchase]
This round's JSON export file: [fill in]
```
