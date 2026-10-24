export function escape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const statuses={ok:'Records found','no-records':'No records of this type',nxdomain:'Name does not exist (NXDOMAIN)',error:'Lookup failed'};
function table(headings,rows){return '<div class="lookup-scroll"><table class="kv"><thead><tr>'+headings.map(h=>'<th scope="col">'+escape(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(cell=>'<td>'+escape(cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function addressText(answer){
 if(!answer)return 'Not expanded (lookup limit or root MX)';
 return ['A','AAAA'].map(type=>{
  const result=answer[type];
  return type+': '+(result.status==='ok'?result.records.map(r=>r.address+' (TTL '+r.ttl+'s)').join(', '):(statuses[result.status]||'Unknown result'));
 }).join('\n');
}
export function renderResults(data){
 let html='<h2>'+escape(data.type)+' results for '+escape(data.host)+'</h2><p><strong>'+escape(statuses[data.status]||'Unknown result')+'</strong></p>';
 if(data.null_mx)html+='<p class="note">This domain explicitly declares that it does not accept incoming email (Null MX).</p>';
 if(data.records.length){
  if(data.type==='MX')html+=('null_mx' in data)?table(['Priority','Mail server','Addresses / address TTL'],data.records.map(r=>[r.priority,r.exchange||'.',addressText(r.addresses)])):table(['Priority','Mail server'],data.records.map(r=>[r.priority,r.exchange||'.']));
  else if(['A','AAAA'].includes(data.type))html+=table(['Address','TTL (seconds)'],data.records.map(r=>[r.address,r.ttl]));
  else if(data.type==='SOA')html+=table(['Primary server','Responsible mailbox','Serial','Refresh','Retry','Expire','Minimum'],data.records.map(r=>[r.nsname,r.hostmaster,r.serial,r.refresh,r.retry,r.expire,r.minttl]));
  else if(data.type==='CAA')html+=table(['Flags','Tag','Value'],data.records.flatMap(r=>Object.entries(r).filter(([k])=>k!=='critical').map(([key,value])=>[r.critical,key,value])));
  else html+=table(['Record'],data.records.map(r=>[r]));
 }
 return html+'<p class="muted">Queried at '+escape(data.queried_at)+' (UTC)</p><p class="note">'+escape(data.note)+'</p>';
}
