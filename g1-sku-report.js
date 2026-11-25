/* Local-only report served by a Shadowrocket http-request script. */
"use strict";

(function () {
  var ROOT = "https://one.google.com/g1-sku-report";
  var VERSION = "v7.6.0";
  var COLLECTOR_VERSION = "g1-acq-v7.6";
  var CONFIGURED_TARGET = "g1.2tb.ai.12months_ip_90p";
  var LEGACY_TARGET = "g1.2tb.ai.annual";
  var SCAN_KEY = "g1.sku.scan.v1";
  var TEST_KEY = "g1.pro.annual.test.v1";
  var url = typeof $request === "object" && $request ? $request.url : "";
  if (typeof url !== "string" || !/^https:\/\/one\.google\.com\/g1-sku-report\/?(?:\?|$)/.test(url)) {
    $done({});
    return;
  }

  var storageAvailable = typeof $persistentStore !== "undefined" &&
    typeof $persistentStore.read === "function";
  var clearMessage = "";
  if (/(?:\?|&)clear=1(?:&|$)/.test(url)) {
    try {
      var scanCleared = $persistentStore.write("{}", SCAN_KEY);
      var testCleared = $persistentStore.write("{}", TEST_KEY);
      clearMessage = scanCleared && testCleared ? "Both local records for this tool have been cleared." : "Local records were not fully cleared.";
    } catch (error) {
      clearMessage = "The local storage interface is not ready yet.";
    }
  }

  function load(key) {
    if (!storageAvailable) return {};
    try {
      var value = JSON.parse($persistentStore.read(key) || "{}");
      return value && value.schemaVersion === 1 ? value : {};
    } catch (error) {
      return {};
    }
  }
  function text(value, length) {
    return typeof value === "string" ? value.slice(0, length || 180) : "";
  }
  function count(value) {
    var number = Number(value);
    return isFinite(number) && number > 0 ? Math.floor(number) : 0;
  }
  function sku(value) {
    return typeof value === "string" && /^g1\.[A-Za-z0-9._-]{1,160}$/.test(value) ? value : "";
  }
  function rows(value, withTime, defaultTarget) {
    if (!Array.isArray(value)) return [];
    return value.slice(0, 300).filter(function (row) {
      return row && typeof row.id === "string" &&
        /^(?:g1\.|com\.google\.one\.)[A-Za-z0-9._-]{1,160}$/.test(row.id);
    }).map(function (row) {
      var out = { id: row.id, count: count(row.count) };
      if (withTime) {
        out.lastSeen = text(row.lastSeen, 32);
      } else {
        out.to = sku(row.to) || (row.id.indexOf("g1.ios.2tb.") === 0 ? defaultTarget || "" : "");
        out.fallback = row.fallback === true;
      }
      return out;
    }).sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
  }

  var scanStatuses = {
    "new-skus": "New IDs found and recorded",
    "known-skus": "Response received; IDs already recorded",
    "no-skus": "Text response received; no product IDs in this response",
    "limit-reached": "New IDs received; collection capacity limit reached",
    "non-text": "Response received; body is not scannable text"
  };
  var scanPaths = ["/", "/ai", "/plans", "/_/…/data/batchexecute", "[Other one.google.com path]"];
  function recent(value) {
    if (!Array.isArray(value)) return [];
    return value.slice(-10).filter(function (event) {
      return event && typeof event.at === "string" &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(event.at) &&
        (event.bodyType === "text" || event.bodyType === "non-text") &&
        Object.prototype.hasOwnProperty.call(scanStatuses, event.status);
    }).map(function (event) {
      return {
        at: event.at,
        path: scanPaths.indexOf(event.path) !== -1 ? event.path : "[Other one.google.com path]",
        bodyType: event.bodyType,
        status: event.status,
        candidateCount: count(event.candidateCount),
        addedCount: count(event.addedCount),
        omittedCount: count(event.omittedCount)
      };
    });
  }

  var scanRaw = load(SCAN_KEY);
  var testRaw = load(TEST_KEY);
  var recordedTarget = sku(testRaw.target);
  if (!recordedTarget && /^(?:pro-annual-test-v[12]|g1-acq-v7(?:\.0|\.1)?)$/.test(testRaw.version || "")) {
    recordedTarget = LEGACY_TARGET;
  }
  var matchedFrom = rows(testRaw.matchedFrom, false, recordedTarget);
  if (!recordedTarget) {
    matchedFrom.some(function (row) {
      if (row.id.indexOf("g1.ios.2tb.") === 0 && row.to) {
        recordedTarget = row.to;
        return true;
      }
      return false;
    });
  }
  var annualHitCount = typeof testRaw.annualHitCount === "number" ? count(testRaw.annualHitCount) :
    matchedFrom.reduce(function (total, row) {
      return total + (row.id.indexOf("g1.ios.2tb.") === 0 ? row.count : 0);
    }, 0);
  var storedOrigin = text(testRaw.targetOrigin, 32);
  var targetOrigin = recordedTarget && /^(?:user-specified|pattern-derived|legacy)$/.test(storedOrigin) ?
    storedOrigin : recordedTarget === CONFIGURED_TARGET ? "user-specified" :
      recordedTarget === LEGACY_TARGET ? "legacy" : "";
  var report = {
    schemaVersion: 1,
    reportVersion: VERSION,
    configuredTarget: CONFIGURED_TARGET,
    storageAvailable: storageAvailable,
    scan: {
      version: text(scanRaw.version, 32),
      updatedAt: text(scanRaw.updatedAt, 32),
      scannedResponses: count(scanRaw.scannedResponses),
      matchedResponses: count(scanRaw.matchedResponses),
      nonTextResponses: count(scanRaw.nonTextResponses),
      recentResponses: recent(scanRaw.recentResponses),
      truncated: scanRaw.truncated === true,
      limit: 300,
      skus: rows(scanRaw.skus, true)
    },
    test: {
      version: text(testRaw.version, 32),
      updatedAt: text(testRaw.updatedAt, 32),
      sourcePrefix: "g1.ios.2tb.",
      target: recordedTarget,
      targetOrigin: targetOrigin,
      status: text(testRaw.status, 32),
      hitCount: count(testRaw.hitCount),
      annualHitCount: annualHitCount,
      matchedFrom: matchedFrom
    }
  };

  var headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-G1-Report-Version": VERSION,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"
  };
  var exportJSON = /(?:\?|&)format=json(?:&|$)/.test(url);
  console.log("[g1-sku-report] " + VERSION + " " + (exportJSON ? "json" : "html") +
    " storage=" + (storageAvailable ? "ready" : "unavailable") + " candidates=" + report.scan.skus.length);
  if (exportJSON) {
    headers["Content-Type"] = "application/json; charset=utf-8";
    headers["Content-Disposition"] = 'attachment; filename="g1-sku-report.json"';
    $done({ response: { status: 200, headers: headers, body: JSON.stringify(report, null, 2) } });
    return;
  }

  function escape(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }
  function fallbackName(row) {
    if (!row.fallback) return "No";
    var discount = /_ip_(\d+p)\.acq$/.exec(row.to || "");
    return discount ? discount[1] : "Yes";
  }
  function table(items, withTime) {
    if (!items.length) return "<p>No records yet.</p>";
    return "<div class=scroll><table><thead><tr><th>Full product ID</th><th>Count</th>" +
      (withTime ? "<th>Last seen (UTC)</th>" : "<th>Actual target SKU</th><th>Fallback</th>") + "</tr></thead><tbody>" +
      items.map(function (row) {
        return "<tr><td><code>" + escape(row.id) + "</code></td><td>" + row.count + "</td>" +
          (withTime ? "<td>" + escape(row.lastSeen) + "</td>" :
            "<td><code>" + escape(row.to || "Not recorded") + "</code></td><td>" + fallbackName(row) + "</td>") + "</tr>";
      }).join("") + "</tbody></table></div>";
  }
  function recentTable(events) {
    if (!events.length) return "<p>No per-response records yet; older collection data does not include this diagnostic.</p>";
    return "<div class=scroll><table><thead><tr><th>Time (UTC)</th><th>Path category</th><th>Result</th><th>IDs identified</th><th>Newly recorded</th><th>IDs over capacity</th></tr></thead><tbody>" +
      events.slice().reverse().map(function (event) {
        return "<tr><td>" + escape(event.at) + "</td><td>" + escape(event.path) +
          "</td><td>" + scanStatuses[event.status] + "</td><td>" + event.candidateCount +
          "</td><td>" + event.addedCount + "</td><td>" + event.omittedCount + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }
  var latestScan = report.scan.recentResponses.length ?
    report.scan.recentResponses[report.scan.recentResponses.length - 1] : null;
  var scanVersionStatus = report.scan.version === COLLECTOR_VERSION ?
    "Records come from the current collection script; use response times and counts to tell whether a new record was created." :
    report.scan.version ? "Old collection records; no response records from the current collector have been saved yet." : "No response records from the current collector have been saved yet.";
  var statuses = {
    "rewritten": "String replacement performed",
    "no-match": "This response did not match any source product in the three-tier mapping",
    "non-text": "This response has no text body to process"
  };
  var status = Object.prototype.hasOwnProperty.call(statuses, report.test.status) ?
    statuses[report.test.status] : "No test execution record yet";
  if (report.test.version === "pro-annual-test-v1" && report.test.status === "no-match") {
    status = "Old v1 record: this response did not match the iOS 2TB prefix";
  }
  var html = [
    "<!doctype html><html lang=en><meta charset=utf-8>",
    "<meta name=viewport content=\"width=device-width,initial-scale=1\"><title>Google One SKU Local Report</title>",
    "<style>body{font:16px/1.6 -apple-system,BlinkMacSystemFont,sans-serif;max-width:960px;margin:24px auto;padding:0 18px;color:#1c2737;background:#f5f7fa}section{background:white;border:1px solid #dde3ec;border-radius:12px;padding:18px;margin:18px 0}h1{font-size:24px;margin-bottom:10px}h2{font-size:20px}code{overflow-wrap:anywhere}a{color:#1259be}table{border-collapse:collapse;width:100%;font-size:14px}td,th{padding:9px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}.scroll{overflow:auto}.note{color:#46556b}.badge{display:inline-block;background:#e0f4e8;color:#176238;padding:4px 10px;border-radius:8px}.actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:20px 0}.actions form{margin:0}button,.actions a{font:inherit;padding:10px 16px;border:0;border-radius:8px;cursor:pointer;text-decoration:none}.actions a{background:#e4eaf3}.actions button{background:#1259be;color:white}button{background:#e4eaf3;color:#1c2737}</style>",
    "<h1>Google One SKU Local Report</h1>",
    "<p class=badge>Handled by local script · " + VERSION + "</p>",
    "<nav class=actions aria-label=Report-actions><form method=get action=\"" + ROOT + "\"><button type=submit name=format value=json>Export JSON</button></form><a href=\"" + ROOT + "\">Refresh report</a></nav>",
    "<p class=note>This page is generated by Shadowrocket on the current device; the address bar still shows one.google.com, and collection records are stored on the current device.</p>",
    "<p class=note>Keep just one G1 ACQ module enabled: IDs are first collected from the original response, then the three-tier rewrite is applied.</p>",
    clearMessage ? "<p>" + escape(clearMessage) + "</p>" : "",
    storageAvailable ? "" : "<p>The local storage interface is not ready yet; this page has not read any collection records.</p>",
    "<section><h2>Collection run records</h2>",
    "<p>Actual collection script: <code>" + escape(report.scan.version || "No record yet") + "</code><br>" + scanVersionStatus + "</p>",
    "<p>Text responses scanned: " + report.scan.scannedResponses + "; non-text responses recorded: " + report.scan.nonTextResponses +
      "; responses containing product IDs: " + report.scan.matchedResponses + "; total IDs: " + report.scan.skus.length + "</p>",
    "<p>Last saved (UTC): " + escape(report.scan.updatedAt || "None yet") + "</p>",
    latestScan ? "<p><strong>Most recent: " + scanStatuses[latestScan.status] + "</strong><br>Identified " +
      latestScan.candidateCount + " distinct IDs, newly recorded " + latestScan.addedCount + ", over capacity " + latestScan.omittedCount + ".</p>" : "",
    "<p class=note>The cumulative list is deduplicated by ID; receiving the same ID updates its count and the number of list entries stays the same. Note the counts and times first, reopen the plan page in the Google App, then refresh this report to compare.</p>",
    "<h3>Most recent 10 responses</h3>", recentTable(report.scan.recentResponses),
    "<p class=note>An increased count with duplicate IDs shown means a response was received; unchanged times and counts mean there is no new matching response record yet - check the page cache, module switch, HTTPS decryption, request domain, and saved=no in the script logs. Only the path category is stored.</p></section>",
    "<section><h2>Most recent three-tier mapping</h2>",
    "<p>Currently configured 2TB candidate target: <code>" + CONFIGURED_TARGET + "</code></p>",
    "<p class=note>This version tests with the specified 12months_ip_90p ID; the full target ends in _ip_90p. Check the App Store purchase panel for the actual product, price, and billing period.</p>",
    "<p>Version: " + escape(report.test.version || "None yet") + "<br>Status: " + escape(status) + "; total replacements: " + report.test.hitCount + "; of which 2TB: " + report.test.annualHitCount + "</p>",
    "<p>2TB source prefix: <code>g1.ios.2tb.</code><br>2TB target recorded this time: <code>" + escape(report.test.target || "Not recorded") + "</code><br>Currently, 20TB / 30TB support the Ultra 1-month free trial (1month_eft), with the three-month 90p offer as fallback; the table below preserves the actual target and fallback from that record, and historical 75p records are shown as recorded.<br>Execution time (UTC): " + escape(report.test.updatedAt || "None yet") + "</p>",
    "<p class=note>This records the script execution result; check the purchase panel for whether the product is recognised by the App Store, and for its price and period.</p>",
    table(report.test.matchedFrom, false), "</section>",
    "<section><h2>Candidate SKUs collected while browsing pages</h2>",
    "<p>Total IDs: " + report.scan.skus.length + "; counts for the same ID are merged - see the collection run records above for new versus duplicate IDs in each response.</p>",
    "<p class=note>IDs are extracted from the original response before rewriting and are not the store's complete product catalogue; replacement targets generated by the script are not automatically added to this list.</p>",
    report.scan.truncated ? "<p>Records have reached the 300-ID limit; after clearing, you can collect the target pages again.</p>" : "",
    table(report.scan.skus, true),
    "<p>Updated (UTC): " + escape(report.scan.updatedAt || "None yet") + "</p></section>",
    "<form method=get action=\"" + ROOT + "\"><button name=clear value=1>Clear this tool's collection and test records</button></form>",
    "<p class=note>Refresh this page after browsing plans to view records; keep the standalone collector and historical rewrite copies disabled to avoid duplicate records.</p></html>"
  ].join("");
  $done({ response: { status: 200, headers: headers, body: html } });
})();
