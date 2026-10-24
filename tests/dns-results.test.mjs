import test from 'node:test';
import assert from 'node:assert/strict';
import {renderResults} from '../assets/dns-results.mjs';
const base={host:'example.com',type:'MX',status:'ok',null_mx:false,queried_at:'2026-10-24T12:00:00Z',note:'Single resolver',records:[]};
test('MX output escapes DNS-controlled content and keeps partial failures visible',()=>{
 const html=renderResults({...base,records:[{priority:10,exchange:'<script>alert(1)</script>',addresses:{A:{status:'ok',records:[{address:'1.1.1.1',ttl:60}]},AAAA:{status:'error',records:[]}}}]});
 assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('AAAA: Lookup failed'));assert.ok(html.includes('TTL 60s'));
});
test('missing MX, NXDOMAIN and Null MX have distinct messages',()=>{
 assert.match(renderResults({...base,status:'no-records'}),/No records of this type/);
 assert.match(renderResults({...base,status:'nxdomain'}),/NXDOMAIN/);
 assert.match(renderResults({...base,null_mx:true,records:[{priority:0,exchange:''}]}),/does not accept incoming email/);
});
test('structured SOA, CAA and TXT answers render as data',()=>{
 assert.match(renderResults({...base,type:'SOA',records:[{nsname:'ns.example.com',serial:123}]}),/123/);
 assert.match(renderResults({...base,type:'CAA',records:[{critical:0,issue:'ca.example'}]}),/ca.example/);
 assert.match(renderResults({...base,type:'TXT',records:['<svg onload=alert(1)>']}),/&lt;svg/);
});
