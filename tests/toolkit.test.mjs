import {test} from 'node:test';import assert from 'node:assert/strict';import {cidr,password,base64,hash,cron,mikrotik,passphrase} from '../assets/toolkit.mjs';
test('CIDR boundaries include /0 /31 /32',()=>{assert.equal(cidr('192.168.1.42/24').network,'192.168.1.0/24');assert.equal(cidr('0.0.0.0/0').usable,4294967294);assert.equal(cidr('10.0.0.0/31').usable,2);assert.equal(cidr('10.0.0.1/32').last,'10.0.0.1');assert.throws(()=>cidr('256.0.0.1/24'));});
test('UTF-8 Base64 round-trip',()=>{assert.equal(base64(base64('Κύπρος 🔐'),true),'Κύπρος 🔐');assert.throws(()=>base64('!',true));});
test('SHA-256 known vector',async()=>{assert.equal(await hash('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');});
test('password lengths and boundaries',()=>{assert.equal(password(24).length,24);assert.throws(()=>password(0));assert.notEqual(password(),password());});
test('cron validates field ranges and steps',()=>{assert.match(cron('0 18 * * 1-5'),/hour: 18/);for(const s of ['60 18 * * *','*/0 * * * *','* * * *','* * * * 7-1'])assert.throws(()=>cron(s));});
test('RouterOS output cannot inject commands',()=>{assert.match(mikrotik('192.168.1.42/24'),/address=192.168.1.0\/24/);assert.throws(()=>mikrotik('1.2.3.4/24;reboot'));});

test('passphrases have minimum 72-bit word selection and exact length',()=>{assert.equal(passphrase().split('-').length,12);assert.throws(()=>passphrase(4));assert.notEqual(passphrase(),passphrase());});
