'use strict';
(function(){var $=TF.$;var kind=document.body.dataset.tool;
$('run').addEventListener('click',async function(){var host=TF.cleanDomain($('input').value);if(!host)return;$('run').disabled=true;try{var result=await TF.get('/'+kind+'?host='+encodeURIComponent(host));
if(kind==='dns')$('output').textContent=result.host+'\n\n'+result.addresses.join('\n')+'\n\n'+result.note;
else $('output').textContent=result.host+' — HTTP '+result.status+'\n\n'+result.checks.map(function(c){return(c.present?'PRESENT':'MISSING')+'  '+c.name+(c.value?'\n'+c.value:'');}).join('\n\n')+'\n\n'+result.note;
}catch(e){$('output').textContent=e.message;}finally{$('run').disabled=false;}});
})();
