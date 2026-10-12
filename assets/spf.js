"use strict";
(function () {
  var $ = TF.$, esc = TF.esc;
  function section(title, found, record, issues, note) {
    var h = '<div class="tool"><h3 style="margin:.1rem 0 .4rem">' + esc(title) + ' ';
    h += found ? TF.pill("ok", "found") : TF.pill("bad", "missing");
    h += '</h3>';
    if (record) h += '<pre>' + esc(record) + '</pre>';
    if (issues && issues.length) {
      h += '<table class="kv">';
      issues.forEach(function (i) {
        var p = i.level === "error" ? TF.pill("bad", "fix") : i.level === "warn" ? TF.pill("warn", "note") : TF.pill("ok", "ok");
        h += '<tr><th style="width:4rem">' + p + '</th><td>' + esc(i.message) + '</td></tr>';
      });
      h += '</table>';
    }
    if (note) h += '<p class="note">' + esc(note) + '</p>';
    return h + '</div>';
  }
  async function run() {
    var d = TF.cleanDomain($("domain").value);
    $("error").style.display = "none";
    $("result").innerHTML = "";
    if (!d) { return; }
    $("run").disabled = true; $("run").textContent = "Checking…";
    try {
      var r = await TF.get("/email-auth?domain=" + encodeURIComponent(d));
      var out = '<p class="muted">Results for <strong>' + esc(r.domain) + '</strong></p>';
      out += section("SPF", r.spf && r.spf.found, r.spf && r.spf.record, r.spf && r.spf.issues);
      out += section("DMARC", r.dmarc && r.dmarc.found, r.dmarc && r.dmarc.record, r.dmarc && r.dmarc.issues);
      out += section("MTA-STS", r.mta_sts && r.mta_sts.found, r.mta_sts && r.mta_sts.record, r.mta_sts && r.mta_sts.issues);
      if (r.dkim && r.dkim.note) {
        out += '<div class="tool"><h3 style="margin:.1rem 0 .4rem">DKIM</h3><p class="note">' + esc(r.dkim.note) + '</p></div>';
      }
      if (r.mx && r.mx.length) {
        out += '<div class="tool"><h3 style="margin:.1rem 0 .4rem">MX</h3><pre>' + esc(r.mx.join("\n")) + '</pre></div>';
      }
      $("result").innerHTML = out;
    } catch (e) {
      $("error").textContent = e.message + " — if this persists the lookup service may be starting up; try again shortly.";
      $("error").style.display = "block";
    } finally {
      $("run").disabled = false; $("run").textContent = "Check";
    }
  }
  $("run").addEventListener("click", run);
  $("domain").addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
})();
