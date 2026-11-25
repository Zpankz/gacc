# g1-acq

[![Telegram](https://img.shields.io/badge/Telegram-AI%20deals%20discussion%20group-26A5E4?logo=telegram&logoColor=white)](https://t.me/muihbb)

> 💬 **AI deals discussion group**: https://t.me/muihbb — Discuss AI deals and subscription bargains

A tool for rewriting and collecting product IDs on Google One (iOS) subscription entry points, for **Shadowrocket**.

**Just one G1 ACQ is all you need: it supports the Ultra 1-month free trial, the 2TB 12-month offer test, passive collection of original SKUs, and provides diagnostics for the most recent 10 responses, what was new in this response, and duplicates, plus JSON export.** The original iOS 2TB -> the user-screenshot-specified 12-month offer-test candidate `g1.2tb.ai.12months_ip_90p`; 20TB / 30TB default to the Ultra 1-month free trial SKUs `g1.20tb.1month_eft.acq` / `g1.ai.ultra.1month_eft.acq`, each independently falling back to its corresponding three-month 90p fallback SKU. The current installed version is `v7.6.0`, and the response script is `g1-acq-v7.6`; there is no need to install a separate scanner or repeatedly switch modules. Collection only reads matching responses actually received by the phone and **does not actively query the full SKU catalogue**; when an old ID appears again its count is incremented, and keeping the list as is still shows that duplicate data is being received. For full installation and on-device verification steps, see [Pro 12-month offer test and SKU scanning](docs/pro-annual-test.md).

This version integrates [GitHub PR #3](https://github.com/crhywun/g1-acq/pull/3), adding Ultra 1-month free trial support for the 20TB / 30TB tiers; whether the trial is shown to the current account, the actual subscription period, and the renewal amount are as recorded at the App Store checkout, and benefits are as shown in the actual state of the Google One account.

> A product ID appearing in a response only proves that the page carries that string; it does not amount to validation against the App Store product catalogue. A rewrite hit also does not mean the product can be purchased; the product name, period, initial and renewal amounts must be checked at the App Store checkout, and benefits are subject to the actual state of the Google One account.

## Main module installation URL

**G1 ACQ: Ultra 1-month free trial, 2TB 12-month offer test, passive collection and response activity diagnostics**

```text
https://cdn.jsdelivr.net/gh/Zpankz/gacc@v7.6.0-en.1/g1-acq-v7.sgmodule
```

For a first install, add the URL above in Shadowrocket's module management and enable it; when upgrading from an old version, replace the old **G1 ACQ** with this URL once. The module installation entry point and its internal response and report scripts all use the fixed `@v7.6.0-en.1` reference, so there is no need to add scripts separately; after installing or upgrading, reconnect, then re-enter the subscription page in the Google App. Releasing a new version requires updating both the script content and the fixed version pin; merging a PR does not automatically update or invalidate an old fixed CDN URL, and the old URL still references its original version. Upgrading preserves local history; response diagnostics do not guarantee new IDs will appear, and reinstalling will not prompt the server to issue new SKUs.

Enable only this one **G1 ACQ**. If the phone previously had the standalone **G1 SKU Scan**, **G1 Pro Annual Test**, or other rewrite copies installed, disable those old copies to avoid duplicate counting or rewriting; if only one main module is installed there are no extra steps to disable anything. The historical tags `v7.0.0` / `v7.1.0` / `v7.2.0` / `v7.3.0` / `v7.4.0` / `v7.5.0` and `pro-annual-test-v1` / `pro-annual-test-v2` remain unchanged.

Diagnostics for the most recent 10 responses are provided by the main script `g1-acq-v7.6`; the **G1 Pro Annual Test** compatibility entry point also uses that script, but still only matches `/ai?`. The standalone **G1 SKU Scan** compatibility entry point only updates the download pin, and its script continues to save the historical version `pro-annual-test-v2` with no new activity diagnostics; when the new report reads it, it shows **old collection records** and an empty response history.

## Three-tier mapping

The script first collects SKUs from the original text response from `one.google.com/`, then applies the following mapping by full source SKU only to responses matching `one.google.com/ai?`:

| Full source SKU in the body | Default target | Fallback target |
|---|---|---|
| Full SKU with the `g1.ios.2tb.` prefix | `g1.2tb.ai.12months_ip_90p` (user-specified candidate) | None |
| `g1.ios.20tb.m.v2` | `g1.20tb.1month_eft.acq` (Ultra 1-month free trial) | `g1.20tb.3months_ip_90p.acq` (three-month 90p offer) |
| `g1.ios.30tb.ai.pro.m` | `g1.ai.ultra.1month_eft.acq` (Ultra 1-month free trial) | `g1.ai.ultra.3months_ip_90p.acq` (three-month 90p offer) |

The source product for the 2TB 12-month offer test is the **original iOS 2TB**, the target is fixed, and there is no fallback tier. Each of the 20TB / 30TB tiers is chosen independently from the original response body: when that tier's `1month_eft` default target appears, the default target is preferred, even if the corresponding 90p fallback also appears; the 90p fallback is used only when the default target does not appear and the corresponding 90p fallback target does; when neither target appears, the `1month_eft` default target is still used. 75p is no longer a fallback target in this version; `g1.20tb.3months_ip_75p.acq` and `g1.ai.ultra.3months_ip_75p.acq` in historical records from old versions retain their original values. This is a judgement based on strings in the body, not a store product query. When none of the three tiers matches, the response is returned unchanged.

**The 2TB candidate is fixed as `g1.2tb.ai.12months_ip_90p`, with no `.acq` suffix.** The first item in the user's screenshot provides that candidate and the price tag `$1.99 × 12 months = $23.88/year`; the figure expresses a monthly offer over 12 consecutive months; `90p` means **90% off, roughly 10% of the original price**, not 10% off with 90% payable. `$23.88/year` is the 12-month total tag shown in the screenshot, not evidence of a single annual charge.

The screenshot is titled **Pro 5TB**, and the source product in this round remains the full original iOS 2TB SKU with the `g1.ios.2tb.` prefix, with no new 5TB source prefix added. The screenshot is the source of the candidate and price tag, not verified iOS store product information, and it does not prove the actual iOS price, billing period, or 5TB benefits. Check the actual name, period, initial and renewal amounts against the product returned by the App Store, and take benefits as shown in the Google One account. Offline tests verify string matching and report behaviour.

## Installation (Shadowrocket)

Go to **Configuration page -> the (i) icon to the right of the currently used configuration -> HTTPS Decryption**.

![Configuration page entry point: tap the (i) icon to the right of the currently used configuration to enter configuration editing, where you can see HTTPS Decryption](docs-config-entry-example.png)

The configuration name in the image is an example; the personal file list, modification times, file sizes, and device status bar have been removed.

1. In Shadowrocket's module management, enable the **G1 ACQ** installed from the `v7.6.0` URL above; users of old versions upgrade once as described earlier, and keep the VPN connected on the home page.
2. From the **(i)** entry point of the current configuration above, go to **HTTPS Decryption** and turn on the decryption switch. If you already have a usable and trusted Shadowrocket certificate, keep using it; if no certificate has been configured yet, generate and install a certificate on that page, then complete the next two steps.
3. When configuring a certificate for the first time, complete installation of the Shadowrocket profile in iOS **Settings -> General -> VPN & Device Management**.
4. When configuring a certificate for the first time, enable trust for the corresponding Shadowrocket root certificate in iOS **Settings -> General -> About -> Certificate Trust Settings**.
5. In the **HTTPS decryption hostname list** of the current configuration, check for `one.google.com`; the module appends that domain via `%APPEND%`. This is the HTTPS decryption list, not DNS Hosts.
6. After installing a module, changing a module switch, or changing decryption settings, reconnect Shadowrocket, then re-enter the subscription page in the Google App.

## Usage flow on the phone

1. Keep the new **G1 ACQ** enabled and Shadowrocket connected; after a matching response is received, collection and rewriting run automatically in sequence.
2. Open **Google App (colourful G icon) -> Google One management**, and go to the **2TB / Pro** plan for the 12-month offer test; when checking the Ultra 1-month free trial mapping, also open the actually offered **20TB / 30TB** plans separately.
3. After entering the subscription flow, check the product name, period, initial and renewal amounts shown at the App Store checkout; paste the full [local report URL](https://one.google.com/g1-sku-report) in the Safari address bar to view the original candidate SKUs and rewrite records, then tap the **Export JSON** button in the actions area.

![Google One Ultra plan selection panel: example 20TB plan entry point from the old module](docs-ultra-plans-example.png)

The screenshot shows the 20TB entry point; for the 2TB 12-month offer test you should open the **2TB / Pro** plan. The account, region, and version affect what the page shows; use the plans actually offered on the phone as the basis. The native StoreKit interface itself is outside the scope of web response rewriting.

When you browse plans and a matching response is received, the main module first reads `g1.*` and `com.google.one.*` from the original body, accumulates counts deduplicated by ID, retaining at most **300 IDs**, and only then performs the three-tier rewrite that matches the `/ai?` scope. A duplicate ID only updates its count and time; once capacity is reached, already-saved IDs continue to be updated, and the number of new IDs discarded due to capacity is recorded. Collection saves the original IDs from before rewriting and skips the local report page; there is no need to install a separate scanner. The phone stores candidate IDs, counts, times, scan status, and up to 10 path-redacted response events; it does not store the full response body, does not query the App Store, and does not send any network reports.

When looking for SKUs not shown on the page, browse in turn the monthly, annual, and offer entry points actually offered in the Google App: IDs carried in the original response are collected even if they are not shown in the interface. IDs not issued by the server do not enter the original list; after the module replaces the specified candidate, verify it in the native App Store subscription interface. For full iOS steps, see [Collecting and verifying hidden SKUs on iOS with Shadowrocket](docs/pro-annual-test.md#6-collecting-and-verifying-hidden-skus-on-ios-with-shadowrocket).

## Local report and troubleshooting

Keep **G1 ACQ** enabled and Shadowrocket connected, and paste the full [local report URL](https://one.google.com/g1-sku-report) in the Safari address bar. The top of the page should show the **Handled by local script** and **v7.6.0** badge, and the actions area should have an **Export JSON** button; you can also open the [JSON export URL](https://one.google.com/g1-sku-report?format=json) directly.

The address uses `one.google.com`, and the page is generated on the phone by Shadowrocket's `http-request` script; **it is not a report page provided by Google**. The interception scope is `/g1-sku-report`, the same path with a trailing `/`, and their queries; once handled locally, HTML or JSON is returned directly and the request is not passed to Google.

If you see a normal Google page, a 404, or none of the local badge and export button above, what is currently shown is not this version's local report. Check that the new module is enabled, Shadowrocket is connected, **current configuration (i) -> HTTPS Decryption**, the `one.google.com` hostname, and a trusted certificate, then paste the full URL into the Safari address bar and open it.

`reportVersion=v7.6.0` indicates the report script version; **it does not prove that the new collector has received a response**. The report separately shows the actually saved `scan.version`, the most recent response time, and history; the main collector in this version is `g1-acq-v7.6`. Records from old scripts show **Old collection records; no response records from the current collector have been saved yet.** When the version is unknown or there are no records yet, it is marked **No response records from the current collector have been saved yet.**; when old records have no saved `recentResponses`, no activity history is fabricated, and this is not used to judge a phone fault.

| Collection field | Meaning |
|---|---|
| `scan.scannedResponses` | Cumulative number of text responses processed, retaining its original counting meaning |
| `scan.matchedResponses` | Cumulative number of text responses in which at least one candidate ID was identified, including duplicate IDs; retaining its original meaning |
| `scan.nonTextResponses` | Cumulative number of non-text responses, not counted in `scannedResponses` |
| `scan.recentResponses` | Up to 10 response events; the JSON array is saved in arrival order old -> new, and the HTML table is shown new -> old; each entry contains `{at, path, bodyType, status, candidateCount, addedCount, omittedCount}` |

In a single event, `candidateCount` is the number of deduplicated candidates in that response, `addedCount` is the number of IDs newly added and actually retained this time, and `omittedCount` is the number of distinct IDs discarded this time due to capacity. Statuses include `new-skus` (new), `known-skus` (duplicate), `no-skus` (no IDs), `limit-reached` (no new IDs retained and capacity discards present), and `non-text` (non-text). When `addedCount>0`, `new-skus` takes precedence, even if `omittedCount>0` at the same time; `limit-reached` is used only when `addedCount=0` and `omittedCount>0`. The path retains only `/`, `/ai`, `/plans`, `/_/…/data/batchexecute`, or `[Other one.google.com path]`, and does not store the query, full URL, body, request headers, or response headers.

The top-level `configuredTarget=g1.2tb.ai.12months_ip_90p` indicates the current configuration; `test.version` and `test.target`, by contrast, come from the most recently saved execution record, and after an upgrade they still retain the old version and the actually saved old target until a new record is produced. The current response script is `g1-acq-v7.6`, and new candidate records have `test.targetOrigin=user-specified`. The 2TB target of old v7.5 records is also `g1.2tb.ai.12months_ip_90p` with origin `user-specified`, but their `test.version` remains `g1-acq-v7.5`; the same target does not mean an old record has been upgraded. Old v7.3 / v7.4 records retain `g1.2tb.ai.annual_ip_90p.acq` and `user-specified`; old v7.2 records retain `g1.2tb.ai.annual.3months_ip_90p.acq` and `pattern-derived`; old v1 / v7.1 regular annual records retain `g1.2tb.ai.annual` and `legacy`; when there is no record the origin is empty. An upgrade does not re-label historical IDs or target origins as the current candidate. `test.target` only indicates the 2TB target configured for that execution; for the actual 20TB / 30TB targets, see the `to` field on each row.

`test.hitCount` is the total number of rewrites across the three tiers; `test.annualHitCount` retains its compatibility field name and only counts 2TB / Pro offer rewrites, the log field `annualHits` has the same meaning, and the report displays it as "of which 2TB". The field name and count do not prove an annual charge. Each row of `test.matchedFrom` contains `{id, to, count, fallback}`: `to` is the actual target for that source in that run, and `fallback=true` means the fallback target of the version used for that execution was used. In this version, the 20TB / 30TB fallback targets are `g1.20tb.3months_ip_90p.acq` / `g1.ai.ultra.3months_ip_90p.acq` respectively; historical records from old versions may still retain 75p fallback targets. The HTML combines `fallback` with the actual `to` to show the 90p fallback, the historical 75p fallback, or "No"; when a row is marked as fallback but target information is insufficient, it shows only "Yes", and old rows retain their original values. When `fallback=false`, you should also check the default target against `test.version` and `to`.

`status=no-match` only means none of the three tiers matched, and the response is preserved unchanged in that case; if 2TB does not match but 20TB / 30TB do, the status is still `rewritten`, and you must look at `annualHitCount` to judge the 2TB offer rewrite. The report retains the most recent execution record; check it by time, confirm the full source IDs from the collection results, and do not speculate about new iOS SKUs. The report is compatible with old v1 records that only have 2TB: when an old row lacks `to`, it is filled in as the original regular annual target `g1.2tb.ai.annual`, and a missing `annualHitCount` is calculated from the counts of the old rows. Old v1 / v7.1 execution records continue to show `g1.2tb.ai.annual`; old v7.2 records continue to show the actually saved `g1.2tb.ai.annual.3months_ip_90p.acq`; old v7.3 / v7.4 records continue to show `g1.2tb.ai.annual_ip_90p.acq`; old v7.5 records continue to show `g1.2tb.ai.12months_ip_90p` and the old version `g1-acq-v7.5`. The actual targets, origins, and versions of these old records are all retained.

The current script log prefix is `[g1-acq]`; check execution results by the following fields:

| Output marker | Meaning |
|---|---|
| `g1-acq-v7.6 status=<status> addedCount=N candidates=N omittedCount=N occurrences=N saved=yes/no` | Collection status, number newly retained this time, deduplicated candidates in a single response, capacity discards, total string occurrences, and storage result; only `saved=yes` means this record was written |
| `saved=no` / `SKU collection unavailable` | This record write did not succeed, or the collection flow did not complete; the report can still show old counts and old times, so check for these logs |
| `g1-acq-v7.6 hits=N annualHits=N` | Current script version, total rewrites across the three tiers, and the number of 2TB / Pro offer rewrites among them (compatibility log name; does not prove an annual charge) |
| `Source SKU -> Actual target xN` | Records, row by row, the full source ID, the actual target this time, and the rewrite count for that source |
| `fallback=<actual full target ID>` | That row of 20TB / 30TB used the fallback tier; this version outputs `fallback=g1.20tb.3months_ip_90p.acq` or `fallback=g1.ai.ultra.3months_ip_90p.acq`, matching the actual `to` on that row; `fallback=75p` in old-version logs is only a historical format |

When the list still shows old SKUs, compare against a single actual activity in the order below:

1. In the report, note `reportVersion`, the actual `scan.version`, the three response counts, and the latest event time, and preserve the current list.
2. From the Google App, re-enter the actually offered 2TB / Pro plan, then browse the other actually offered plan pages and wait for loading to complete.
3. Return to Safari and refresh the report. If the text counts have grown and the latest event is `known-skus`, it means already-saved IDs were received; counts increase but the list does not. `no-skus` means that response carried no identifiable ID. If only `nonTextResponses` increases, view the `non-text` events.
4. If none of the three counts or the latest event time changed, you can only confirm that no new collection record was saved in this round; a failed storage write also preserves the old counts. First check whether the script logs show `saved=no` or `SKU collection unavailable`, then check item by item the page cache, the `one.google.com/` matching scope, the VPN connection, the module switch, the current configuration's HTTPS decryption, certificate trust, and hostname. A report version upgrade alone does not mean the collection script has run.

These diagnostics do not guarantee that new SKUs will appear; reinstalling the module or repeatedly clearing records will not make the server return new IDs. `?clear=1` remains a manual two-key clear, to be used only when you really want to reset history. For full fields, collection, and an on-device record template, see [Pro 12-month offer test and SKU scanning](docs/pro-annual-test.md).

## Scope of work and local storage

| Tool | Script matching scope | Behaviour |
|---|---|---|
| G1 ACQ passive collection | Responses from `^https://one\.google\.com/`, skipping the local report page | Collects candidate IDs from the original text body; counts non-text separately; saves diagnostics for the most recent 10 responses |
| G1 ACQ three-tier rewrite | Responses from `^https://one\.google\.com/ai\?` | After collection, performs the full SKU rewrite with independent fallback and saves the most recent execution record |
| Local result page | `/g1-sku-report`, the same path with a trailing `/`, and their queries | Displays collection results and the most recent rewrite record locally, or exports JSON |

- **Script processing scope**: G1 ACQ passively reads the response bodies of matching pages, first saving candidate IDs, counts, times, scan status, and up to 10 redacted response events, then checks the rewrite scope; it does not read request headers or request bodies, and does not save the full response body. Response events store only the time, fixed category path, body type, diagnostic status, and counts, and do not store the query or full URL. Rewriting only changes product IDs and does not change price fields; prices shown as page text are no substitute for amounts at the App Store checkout.
- **Actual outbound behaviour**: the current scripts have no network reporting calls; G1 ACQ writes script logs, and collection, rewriting, and the report share the phone's local `$persistentStore`. The Shadowrocket script host provides network and storage APIs; the fact that the current code does not call network reporting does not mean the host lacks outbound capability. Module and script downloads still use GitHub / jsDelivr URLs.
- **MITM scope**: the module only appends `one.google.com`, bringing that site's traffic into the decryption scope; page rewriting is limited by the script paths. Certificates are generated, installed, and trusted on the device, and HTTPS decryption settings belong to the current configuration.
- **System permissions**: the scripts make no calls requesting location, photo library, or notification permissions; usage involves the Shadowrocket VPN connection and iOS profile and root certificate trust configuration.
- **Global rule impact**: the module's `[Rule]` blocks global UDP 443, prompting QUIC requests that support fallback to use TCP instead; this also affects HTTP/3 use, speed, or connectivity in other apps.
- **Version and storage**: the module installation entry point in this release and all internal scripts uniformly use the fixed `@v7.6.0-en.1` reference; historical versions and the v1 / v2 tags are retained and not moved. The local keys remain `g1.sku.scan.v1` and `g1.pro.annual.test.v1`, `schemaVersion` remains `1`; collection, response event, and execution record times use UTC; the result page's `?clear=1` clears only these two keys.

## Files

| File | Purpose |
|---|---|
| [g1-acq-v7.sgmodule](g1-acq-v7.sgmodule) | The sole main module: passive collection, three-tier rewriting, and response activity diagnostics |
| [g1-acq.js](g1-acq.js) | The `g1-acq-v7.6` response script; first collects original SKUs and activity diagnostics, then rewrites and saves records |
| [g1-pro-annual-test.sgmodule](g1-pro-annual-test.sgmodule) | Legacy compatibility file, retaining the `/ai?` matching scope; no need to install or enable it in the main flow |
| [g1-sku-scan.sgmodule](g1-sku-scan.sgmodule) | Legacy standalone scanning compatibility file; no need to install or enable it in the main flow |
| [g1-sku-scan.js](g1-sku-scan.js) | Historical standalone scanning script, retaining candidate ID deduplication, counting, and time records; no response activity diagnostics added |
| [g1-sku-report.js](g1-sku-report.js) | Local HTML report, actual collection version and response history, JSON export, and manual two-key clear |
| [docs/pro-annual-test.md](docs/pro-annual-test.md) | Single-module use, passive collection diagnostics, 12-month offer on-device checks, and report fields |

## Offline verification

Using Node.js 18 or newer, run in the repository root:

```sh
node --test tests/sku-tools.test.cjs
```

The offline checks centre on the main script [g1-acq.js](g1-acq.js) and cover full ID matching for the three tiers, the fixed 2TB 12-month offer candidate, all 16 combinations of the `1month_eft` default preference and 90p independent fallback for 20TB / 30TB, still using `1month_eft` when both the default and fallback are absent, 75p not participating in this version's fallback, pages with only 20TB / 30TB, URL scope, zero matches across the three tiers, total rewrites versus 2TB rewrites, showing the 90p fallback and historical 75p fallback by actual `to`, distinguishing the current configuration from the most recent execution target, compatibility with old v1 / v7.1 / v7.2 / v7.3 / v7.4 / v7.5 reports, storage exceptions, collection deduplication and limits, the local report, export fields, and module script versions. Check the results against the actual execution output; the source IDs in the tests are synthetic samples and do not constitute evidence of store listing or on-device purchase.

## Acknowledgements

Thanks to [@cehomecambodia-lang](https://github.com/cehomecambodia-lang) for providing, via [PR #3](https://github.com/crhywun/g1-acq/pull/3), the 20TB / 30TB Ultra 1-month free trial SKU mappings and the three-month 90p fallback scheme.
