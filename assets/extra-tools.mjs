export function jsonFormat(value, compact=false) {
 return JSON.stringify(JSON.parse(value), null, compact ? undefined : 2);
}
export function urlCode(value, decode=false) {
 return decode ? decodeURIComponent(value) : encodeURIComponent(value);
}
export function uuids(value) {
 const count=Number(value);
 if(!Number.isInteger(count)||count<1||count>100)throw Error('Choose 1–100 UUIDs.');
 return Array.from({length:count},()=>crypto.randomUUID()).join('\n');
}
export function timestamp(value, mode='seconds') {
 if(mode==='iso') {
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value.trim()))throw Error('Use an ISO timestamp with timezone, for example 2026-01-01T00:00:00Z.');
  const [year,month,day]=value.slice(0,10).split('-').map(Number);
  const leap=year%4===0&&(year%100!==0||year%400===0);
  const days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  if(month<1||month>12||day<1||day>days[month-1]||Number(value.slice(11,13))>23||Number(value.slice(14,16))>59||Number(value.slice(17,19))>59)throw Error('Invalid calendar date or time.');
  const ms=Date.parse(value);
  if(!Number.isFinite(ms))throw Error('Invalid date.');
  return JSON.stringify({seconds:Math.floor(ms/1000),milliseconds:ms,utc:new Date(ms).toISOString()},null,2);
 }
 if(!/^-?\d+$/.test(value.trim()))throw Error('Use an integer timestamp.');
 const n=Number(value),ms=mode==='milliseconds'?n:n*1000;
 if(!Number.isSafeInteger(ms)||!Number.isFinite(new Date(ms).getTime()))throw Error('Timestamp outside the supported date range.');
 return new Date(ms).toISOString();
}
export function textHex(value,decode=false) {
 if(!decode)return Array.from(new TextEncoder().encode(value),b=>b.toString(16).padStart(2,'0')).join('');
 const clean=value.replace(/\s/g,'');
 if(!/^(?:[0-9a-fA-F]{2})*$/.test(clean))throw Error('Use complete hexadecimal byte pairs.');
 return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(clean.match(/../g)||[],s=>parseInt(s,16)));
}
export function rangeCidr(value) {
 const parts=value.trim().split(/\s*-\s*/);
 const number=s=>{const a=s.split('.');if(a.length!==4||a.some(x=>!/^\d{1,3}$/.test(x)||Number(x)>255))throw Error('Use two IPv4 addresses separated by a hyphen.');return a.reduce((n,x)=>n*256+Number(x),0);};
 if(parts.length!==2)throw Error('Use two IPv4 addresses separated by a hyphen.');
 let start=number(parts[0]);const end=number(parts[1]);if(start>end)throw Error('Start must not exceed end.');
 const rows=[];
 while(start<=end){let bits=0;while(bits<32&&start%(2**(bits+1))===0&&start+2**(bits+1)-1<=end)bits++;
 const ip=[24,16,8,0].map(s=>Math.floor(start/2**s)%256).join('.');rows.push(ip+'/'+(32-bits));start+=2**bits;}
 return rows.join('\n');
}
