/**
 * g1-acq.js - Google One subscription page product ID mapping (Shadowrocket http-response script)
 *
 * Design principles:
 *   1. Single responsibility - only maps original monthly IDs to offer-tier IDs as strings; no diagnostics, no reporting;
 *   2. Catalogue-aware - first collects offer tiers that actually exist in the response (ending in acq); when the target tier
 *      is not in the catalogue but the fallback tier is, automatically uses the fallback tier to avoid pointing checkout at an empty product;
 *   3. Externalised data - all mappings are centralised in the SKU_MAP / FALLBACK tables; adding or removing tiers only requires editing the tables.
 *
 * Version: v6
 */
"use strict";

console.log("[g1-acq] v6 loaded");

/* Original iOS in-app purchase ID -> target offer tier */
var SKU_MAP = {
  "g1.ios.20tb.m.v2":     "g1.20tb.3months_ip_90p.acq",
  "g1.ios.30tb.ai.pro.m": "g1.ai.ultra.3months_ip_90p.acq"
};

/* Fallback tier when the target tier is not in the catalogue (community testing found the 75p tier in both Play/iOS catalogues) */
var FALLBACK = {
  "g1.20tb.3months_ip_90p.acq":     "g1.20tb.3months_ip_75p.acq",
  "g1.ai.ultra.3months_ip_90p.acq": "g1.ai.ultra.3months_ip_75p.acq"
};

function occurrences(s, needle) {
  return needle ? s.split(needle).length - 1 : 0;
}

function run() {
  var body = $response && $response.body;
  if (typeof body !== "string" || body === "") {
    $done({});
    return;
  }

  /* Offer-tier catalogue actually present in the response */
  var raw = body.match(/g1\.[a-z0-9._]{2,60}acq/g) || [];
  var seen = {};
  var catalog = [];
  for (var r = 0; r < raw.length; r++) {
    if (!seen[raw[r]]) { seen[raw[r]] = 1; catalog.push(raw[r]); }
  }
  console.log("[g1-acq] Catalogue offer tiers: " + (catalog.join(", ") || "none"));

  var out = body, total = 0;
  var froms = Object.keys(SKU_MAP);
  for (var k = 0; k < froms.length; k++) {
    var from = froms[k];
    var n = occurrences(out, from);
    if (n === 0) continue;

    var to = SKU_MAP[from];
    if (catalog.indexOf(to) === -1 && FALLBACK[to] && catalog.indexOf(FALLBACK[to]) !== -1) {
      console.log("[g1-acq] Primary tier not in catalogue, downgrading " + to + " -> " + FALLBACK[to]);
      to = FALLBACK[to];
    }

    out = out.split(from).join(to);
    total += n;
    console.log("[g1-acq] " + from + " -> " + to + " x" + n);
  }

  console.log(total ? "[g1-acq] Rewrote " + total + " occurrences" : "[g1-acq] No match");
  $done(total ? { body: out } : {});
}

run();
