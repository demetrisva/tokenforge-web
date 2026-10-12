(function(){
  "use strict";
  var $=function(id){return document.getElementById(id)};
  function b64urlToStr(s){
    s=s.replace(/-/g,'+').replace(/_/g,'/');
    while(s.length%4)s+='=';
    var bin=atob(s);
    // handle UTF-8
    try{
      var bytes=Uint8Array.from(bin,function(c){return c.charCodeAt(0)});
      return new TextDecoder('utf-8').decode(bytes);
    }catch(e){return bin}
  }
  function pretty(s){ try{return JSON.stringify(JSON.parse(s),null,2)}catch(e){return s} }
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function tsRow(label,v){
    if(v===undefined)return '';
    var d=new Date(v*1000), now=Date.now(), rel;
    var diff=Math.round((d.getTime()-now)/1000);
    var a=Math.abs(diff), unit;
    if(a<60){unit=a+'s'}else if(a<3600){unit=Math.round(a/60)+'m'}
    else if(a<86400){unit=Math.round(a/3600)+'h'}else{unit=Math.round(a/86400)+'d'}
    rel = diff<0 ? unit+' ago' : 'in '+unit;
    var cls = (label==='exp') ? (diff<0?'bad':'ok') : '';
    var state = (label==='exp') ? (diff<0?' <span class="pill bad">expired</span>':' <span class="pill ok">valid</span>') : '';
    return '<tr><th>'+label+'</th><td>'+esc(d.toISOString())+' <span class="muted">('+rel+')</span>'+state+'</td></tr>';
  }
  function decode(){
    $('error').style.display='none';
    $('result').style.display='none';
    var t=$('jwt').value.trim();
    if(!t)return;
    var parts=t.split('.');
    if(parts.length!==3){
      $('error').textContent='That does not look like a JWT (expected three dot-separated parts).';
      $('error').style.display='block';return;
    }
    var h,p;
    try{ h=b64urlToStr(parts[0]); p=b64urlToStr(parts[1]); }
    catch(e){ $('error').textContent='Could not base64url-decode the token.'; $('error').style.display='block'; return; }
    $('header').textContent=pretty(h);
    $('payload').textContent=pretty(p);
    $('signature').textContent=parts[2];
    // claims table with friendly timestamps
    var claims='';
    try{
      var o=JSON.parse(p);
      ['iss','sub','aud','jti'].forEach(function(k){
        if(o[k]!==undefined)claims+='<tr><th>'+k+'</th><td>'+esc(typeof o[k]==='object'?JSON.stringify(o[k]):o[k])+'</td></tr>';
      });
      claims+=tsRow('iat',o.iat)+tsRow('nbf',o.nbf)+tsRow('exp',o.exp);
    }catch(e){}
    $('claims').innerHTML=claims;
    $('result').style.display='block';
  }
  $('decode').addEventListener('click',decode);
  $('clear').addEventListener('click',function(){$('jwt').value='';$('result').style.display='none';$('error').style.display='none';$('jwt').focus()});
  $('jwt').addEventListener('keydown',function(e){if((e.metaKey||e.ctrlKey)&&e.key==='Enter')decode()});
})();
