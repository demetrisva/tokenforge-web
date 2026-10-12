/* Shared helpers for tokenforge server-lookup tools. */
"use strict";
window.TF = (function () {
  var API = "https://api.tokenforge.eu";
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?"":s).replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c]}); }
  function cleanDomain(v){
    v=(v||"").trim().toLowerCase();
    v=v.replace(/^https?:\/\//,"").replace(/\/.*$/,"").replace(/:\d+$/,"");
    return v;
  }
  async function get(path){
    var r = await fetch(API+path, { method:"GET", headers:{ "Accept":"application/json" } });
    var body = await r.json().catch(function(){ return null; });
    if(!r.ok){ throw new Error((body && body.error) || ("Server returned "+r.status)); }
    return body;
  }
  function pill(state,label){
    var cls = state==="ok"?"ok":state==="warn"?"warn":state==="bad"?"bad":"";
    return '<span class="pill '+cls+'">'+esc(label)+'</span>';
  }
  return { $:$, esc:esc, cleanDomain:cleanDomain, get:get, pill:pill, API:API };
})();
