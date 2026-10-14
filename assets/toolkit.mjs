export function cidr(value){
 const m=/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/.exec(value.trim());
 if(!m || m.slice(1,5).some(x=>Number(x)>255) || Number(m[5])>32)throw Error('Use IPv4 CIDR, for example 192.168.1.42/24.');
 const prefix=Number(m[5]), n=m.slice(1,5).reduce((v,x)=>v*256+Number(x),0), size=2**(32-prefix), start=Math.floor(n/size)*size;
 const ip=x=>[24,16,8,0].map(s=>Math.floor(x/2**s)%256).join('.');
 return {network:ip(start)+'/'+prefix,mask:ip(2**32-size),first:ip(start+(prefix<31?1:0)),last:ip(start+size-(prefix<31?2:1)),broadcast:prefix<31?ip(start+size-1):'Not applicable (/31 or /32)',addresses:size,usable:prefix<31?size-2:size};
}
export function password(length=24,random=crypto.getRandomValues.bind(crypto)){
 if(!Number.isInteger(length)||length<12||length>128)throw Error('Choose 12–128 characters.');
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*-_';
 const limit=256-(256%alphabet.length);let out='';
 while(out.length<length){const bytes=random(new Uint8Array(128));for(const b of bytes){if(b<limit)out+=alphabet[b%alphabet.length];if(out.length===length)break;}}
 return out;
}
export function base64(value,decode=false){
 if(decode){const bytes=Uint8Array.from(atob(value.trim()),c=>c.charCodeAt(0));return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
 return btoa(Array.from(new TextEncoder().encode(value),c=>String.fromCharCode(c)).join(''));
}
export async function hash(value,algorithm='SHA-256'){
 if(!['SHA-256','SHA-384','SHA-512'].includes(algorithm))throw Error('Unsupported hash.');
 return Array.from(new Uint8Array(await crypto.subtle.digest(algorithm,new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
}
export function cron(value){
 const fields=value.trim().split(/\s+/);if(fields.length!==5)throw Error('Use five fields: minute hour day-of-month month day-of-week.');
 const bounds=[[0,59],[0,23],[1,31],[1,12],[0,7]],names=['minute','hour','day of month','month','day of week'];
 return fields.map((field,i)=>{
  if(!field.split(',').every(part=>{const match=/^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(part);if(!match||(match[2]!==undefined && (Number(match[2])<1 || Number(match[2])>bounds[i][1]-bounds[i][0]+1)))return false;if(match[1]==='*')return true;const ns=match[1].split('-').map(Number);return ns.every(n=>n>=bounds[i][0]&&n<=bounds[i][1])&&(ns.length===1||ns[0]<=ns[1]);}))throw Error('Invalid '+names[i]+' field. Names and macros are not supported.');
  return names[i]+': '+(field==='*'?'every value':field.startsWith('*/')?'every '+field.slice(2)+' values':field);
 }).join('\n')+'\n\nRuns in the scheduler’s timezone. Day-of-month and day-of-week use OR when both are restricted in traditional cron. This describes fields; it does not calculate DST transitions or next run times.';
}
export function mikrotik(network){
 const parsed=cidr(network);return '# Review interface lists and rule order before applying.\n# This only adds an address-list entry; it does not allow or block traffic.\n/ip firewall address-list add list=tokenforge-review address='+parsed.network+' comment="Generated locally; review before use"';
}
export function passphrase(count=12,random=crypto.getRandomValues.bind(crypto)){
 const words='acorn amber apple arch arrow atlas bamboo beach birch breeze bridge brook cabin cactus candle cedar cherry cloud coral crane dawn delta dune eagle earth ember fern field flame forest frost garden globe grain grove harbor hazel hill honey island jade lake leaf lemon light maple meadow moon moss ocean olive orbit peach pine plum pond quartz rain raven reed river stone silver sun'.split(' ');
 if(!Number.isInteger(count)||count<12||count>24)throw Error('Choose 12–24 words; this compact 64-word list provides 6 bits per word.');
 if(words.length!==64)throw Error('Word list error');
 const result=[];while(result.length<count){for(const b of random(new Uint8Array(32))){result.push(words[b%64]);if(result.length===count)break;}}return result.join('-');
}
