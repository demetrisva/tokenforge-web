"use strict";
(function () {
  var $ = TF.$, esc = TF.esc;
  function daysPill(days) {
    if (days == null) return "";
    if (days < 0) return TF.pill("bad", "expired");
    if (days < 14) return TF.pill("bad", days + "d left");
    if (days < 30) return TF.pill("warn", days + "d left");
    return TF.pill("ok", days + "d left");
  }
  async function run() {
    var h = TF.cleanDomain($("host").value);
    $("error").style.display = "none";
    $("result").innerHTML = "";
    if (!h) return;
    $("run").disabled = true; $("run").textContent = "Inspecting…";
    try {
      var r = await TF.get("/tls?host=" + encodeURIComponent(h));
      var c = r.cert || {};
      var out = '<div class="tool"><h3 style="margin:.1rem 0 .4rem">' + esc(r.host) + ':' + esc(r.port) + '</h3>';
      out += '<table class="kv">';
      out += '<tr><th>Protocol</th><td>' + esc(r.protocol || "—") + '</td></tr>';
      if (r.cipher) out += '<tr><th>Cipher</th><td>' + esc(r.cipher) + '</td></tr>';
      out += '<tr><th>Subject</th><td>' + esc(c.subject || "—") + '</td></tr>';
      out += '<tr><th>Issuer</th><td>' + esc(c.issuer || "—") + '</td></tr>';
      out += '<tr><th>Valid from</th><td>' + esc(c.not_before || "—") + '</td></tr>';
      out += '<tr><th>Valid to</th><td>' + esc(c.not_after || "—") + ' ' + daysPill(c.days_left) + '</td></tr>';
      out += '</table>';
      if (c.san && c.san.length) {
        out += '<h3 style="margin:1rem 0 .3rem;font-size:1rem">Alternate names</h3><pre>' + esc(c.san.join("\n")) + '</pre>';
      }
      if (r.chain && r.chain.length) {
        out += '<h3 style="margin:1rem 0 .3rem;font-size:1rem">Chain</h3><pre>' + esc(r.chain.join("\n")) + '</pre>';
      }
      out += '</div>';
      $("result").innerHTML = out;
    } catch (e) {
      $("error").textContent = e.message + " — if this persists the lookup service may be starting up; try again shortly.";
      $("error").style.display = "block";
    } finally {
      $("run").disabled = false; $("run").textContent = "Inspect";
    }
  }
  $("run").addEventListener("click", run);
  $("host").addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
})();
