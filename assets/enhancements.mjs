import {resultBlob} from './result-export.mjs';
import {categories,matches} from './tool-discovery.mjs';
const cards=[...document.querySelectorAll('.grid a.card[href^="/tools/"]')];
if(cards.length){
 const controls=document.createElement('section');controls.className='tool-filters';controls.setAttribute('aria-label','Find a tool');
 const label=document.createElement('label');label.textContent='Search tools';label.htmlFor='tool-search';
 const search=document.createElement('input');search.id='tool-search';search.type='search';search.placeholder='Name, task or keyword';
 const cl=document.createElement('label');cl.textContent='Category';cl.htmlFor='tool-category';
 const select=document.createElement('select');select.id='tool-category';
 for(const name of ['All categories','Network','Security','Developer']){const o=document.createElement('option');o.value=name==='All categories'?'':name;o.textContent=name;select.append(o);}
 const count=document.createElement('p');count.setAttribute('role','status');
 controls.append(label,search,cl,select,count);cards[0].closest('.grid').before(controls);
 const update=()=>{let n=0;for(const card of cards){const slug=card.getAttribute('href').split('/')[2];card.hidden=!matches(card.textContent,search.value,select.value,categories[slug]);if(!card.hidden)n++;}count.textContent=n?`${n} of ${cards.length} tools`:'No tools match. Try another term or category.';};
 search.addEventListener('input',update);select.addEventListener('change',update);update();
}
const slug=location.pathname.split('/')[2];
const input=document.querySelector('#input,#jwt,#domain,#host');
const examples={cidr:'192.168.10.42/24',password:'24',base64:'Hello TokenForge',hash:'Hello TokenForge',cron:'0 18 * * 1-5',mikrotik:'192.168.10.0/24',mx:'example.com',dns:'example.com',headers:'example.com','spf-dmarc':'example.com',ssl:'example.com',json:'{"project":"TokenForge","tools":17}',url:'hello world & friends',uuid:'3',timestamp:'1728864000',hex:'Hello TokenForge',range:'192.168.1.10 - 192.168.1.30',jwt:'eyJhbGciOiJub25lIn0.eyJzdWIiOiJleGFtcGxlIn0.'};
if(input && slug in examples){
 const bar=document.createElement('div');bar.className='tool-actions';
 const status=document.createElement('span');status.setAttribute('role','status');
 const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=text;b.addEventListener('click',fn);bar.append(b);};
 button('Load example',()=>{input.value=examples[slug];const mode=document.getElementById('mode');if(mode)mode.selectedIndex=0;const recordType=document.getElementById('record-type');if(recordType){recordType.value='A';recordType.dispatchEvent(new Event('change'));}input.dispatchEvent(new Event('input',{bubbles:true}));status.textContent='Example loaded. Run the tool when ready.';input.focus();});
 const output=()=>{const plain=document.getElementById('output');if(plain)return plain.textContent;const result=document.getElementById('result');return result?.checkVisibility()?result.innerText:'';};
 button('Copy result',async()=>{const text=output();if(!text){status.textContent='Run the tool first.';return;}try{await Promise.race([navigator.clipboard.writeText(text),new Promise((_,reject)=>setTimeout(()=>reject(Error('Clipboard timed out')),2000))]);status.textContent='Result copied.';}catch{status.textContent='Clipboard unavailable. Select and copy the result manually.';}});
 button('Download result',()=>{const text=output();if(!text){status.textContent='Run the tool first.';return;}const url=URL.createObjectURL(resultBlob(text));const a=document.createElement('a');a.href=url;a.download=`tokenforge-${slug}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Result downloaded.';});
 bar.append(status);input.closest('.tool')?.append(bar);
}
