import {renderResults} from './dns-results.mjs';
const form=document.getElementById('lookup-form');
const input=document.getElementById('input');
const type=document.getElementById('record-type');
const run=document.getElementById('run');
const result=document.getElementById('result');
const status=document.getElementById('lookup-status');
const hint=document.getElementById('lookup-hint');
const mx=document.body.dataset.tool==='mx';
type?.addEventListener('change',()=>{
 const ptr=type.value==='PTR';
 input.placeholder=ptr?'1.1.1.1 or 2606:4700:4700::1111':'example.com';
 hint.textContent=ptr?'Enter an IPv4 or IPv6 address. This queries reverse DNS only.':'Enter a DNS name without a URL, path or port. TXT accepts service labels such as _dmarc.example.com.';
});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(run.disabled)return;
 result.replaceChildren();status.textContent='Looking up records…';run.disabled=true;result.setAttribute('aria-busy','true');
 try{
  const params=new URLSearchParams({host:input.value.trim()});
  if(!mx)params.set('type',type.value);
  const data=await TF.get('/'+(mx?'mx':'dns')+'?'+params);
  result.innerHTML=renderResults(data);
  status.textContent='Lookup complete.';
 }catch(error){status.textContent=error.message;}
 finally{run.disabled=false;result.setAttribute('aria-busy','false');}
});
