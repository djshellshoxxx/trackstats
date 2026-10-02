import {AUDIO_EXTENSIONS,extensionOf,formatBytes,formatDuration,bitrateBucket,parseID3,parseWav,parseFlac,summarize,countsBy,csvEscape} from './core.js';

const $=s=>document.querySelector(s);
const els={folder:$('#folder'),files:$('#files'),cancel:$('#cancel'),status:$('#status'),progressText:$('#progressText'),progressBar:$('#progressBar'),warnings:$('#warnings'),overview:$('#overview'),search:$('#search'),formatFilter:$('#formatFilter'),qualityFilter:$('#qualityFilter'),clearFilters:$('#clearFilters'),exportCsv:$('#exportCsv'),exportJson:$('#exportJson'),rows:$('#rows'),rowCount:$('#rowCount'),healthGrid:$('#healthGrid')};
let tracks=[],filtered=[],cancelled=false;

function mediaMetadata(file){
  return new Promise(resolve=>{
    const url=URL.createObjectURL(file); const a=document.createElement('audio'); let done=false;
    const finish=(o={})=>{if(done)return;done=true;URL.revokeObjectURL(url);a.remove();resolve(o)};
    a.preload='metadata'; a.src=url; a.onloadedmetadata=()=>finish({duration:Number.isFinite(a.duration)?a.duration:0}); a.onerror=()=>finish({}); setTimeout(()=>finish({}),6000);
  });
}

async function readHead(file,bytes=512*1024){ return file.slice(0,Math.min(file.size,bytes)).arrayBuffer(); }
async function scanOne(file){
  const ext=extensionOf(file.name), base={name:file.name,path:file.webkitRelativePath||file.name,size:file.size,ext,format:ext.toUpperCase(),modified:file.lastModified||0,artwork:false};
  let parsed={};
  try{
    const head=await readHead(file);
    if(ext==='mp3') parsed=parseID3(head);
    else if(ext==='wav'||ext==='wave') parsed=parseWav(head);
    else if(ext==='flac') parsed=parseFlac(head);
  }catch(e){ base.warning=`Header parse: ${e.message}`; }
  let media={}; if(!parsed.duration) media=await mediaMetadata(file);
  const duration=parsed.duration||media.duration||0;
  const bitrate=parsed.bitrate || (duration?Math.round(file.size*8/duration/1000):0);
  const lossless=parsed.lossless ?? ['wav','wave','flac','aif','aiff'].includes(ext);
  const title=parsed.title||file.name.replace(/\.[^.]+$/,'');
  return {...base,...parsed,title,duration,bitrate,lossless};
}

async function runScan(list){
  cancelled=false; tracks=[]; filtered=[]; els.cancel.disabled=false; els.warnings.textContent='';
  const files=[...list].filter(f=>AUDIO_EXTENSIONS.has(extensionOf(f.name)));
  const ignored=list.length-files.length;
  els.status.textContent=`Scanning ${files.length.toLocaleString()} audio files…`;
  if(ignored) els.warnings.textContent=`Ignored ${ignored} unsupported/non-audio file${ignored===1?'':'s'}.`;
  const failures=[];
  for(let i=0;i<files.length;i++){
    if(cancelled) break;
    try{ tracks.push(await scanOne(files[i])); }catch(e){ failures.push(`${files[i].name}: ${e.message}`); }
    const pct=((i+1)/files.length)*100; els.progressBar.style.width=`${pct}%`; els.progressText.textContent=`${i+1} / ${files.length}`;
    if(i%10===0) render();
  }
  els.cancel.disabled=true;
  els.status.textContent=cancelled?`Scan cancelled — ${tracks.length.toLocaleString()} tracks kept.`:`Scan complete — ${tracks.length.toLocaleString()} tracks.`;
  if(failures.length) els.warnings.textContent += ` ${failures.length} files could not be analyzed.`;
  render(true);
}

function currentRows(){
  const q=els.search.value.trim().toLowerCase(), f=els.formatFilter.value, quality=els.qualityFilter.value;
  return tracks.filter(t=>{
    if(q && ![t.name,t.title,t.artist,t.album,t.genre,t.path].some(v=>String(v||'').toLowerCase().includes(q))) return false;
    if(f && t.ext!==f) return false;
    if(quality==='lossless'&&!t.lossless)return false;
    if(quality==='lossy'&&t.lossless)return false;
    if(quality==='low'&&(!t.bitrate||t.bitrate>=192))return false;
    if(quality==='missing'&&t.artist&&t.genre&&t.year&&t.bpm&&t.key)return false;
    return true;
  });
}

function stat(label,value){return `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`}
function renderOverview(rows){
  const s=summarize(rows); els.overview.innerHTML=[stat('Tracks',s.tracks.toLocaleString()),stat('Storage',formatBytes(s.totalBytes)),stat('Playback',formatDuration(s.totalDuration)),stat('Artists',s.artists.toLocaleString()),stat('Albums',s.albums.toLocaleString()),stat('Lossless',s.tracks?`${Math.round(s.lossless/s.tracks*100)}%`:'—')].join('');
}
function renderBars(id,pairs,valueFormatter=v=>v){
  const root=$(id); if(!root)return; const use=pairs.slice(0,10), max=Math.max(1,...use.map(x=>x[1])); root.innerHTML=use.length?use.map(([k,v])=>`<div class="barrow"><div class="barlabel" title="${String(k).replaceAll('"','&quot;')}">${k}</div><div class="bartrack"><div class="barfill" style="width:${Math.max(2,v/max*100)}%"></div></div><div class="barvalue">${valueFormatter(v)}</div></div>`).join(''):'<p class="muted">No data yet.</p>';
}
function renderCharts(rows){
  renderBars('#chartFormat',countsBy(rows,'ext',v=>(v||'unknown').toUpperCase()));
  const storage=new Map(); for(const t of rows) storage.set((t.ext||'unknown').toUpperCase(),(storage.get((t.ext||'unknown').toUpperCase())||0)+t.size); renderBars('#chartStorage',[...storage.entries()].sort((a,b)=>b[1]-a[1]),formatBytes);
  renderBars('#chartBitrate',countsBy(rows,'bitrate',v=>bitrateBucket(v)));
  renderBars('#chartSample',countsBy(rows,'sampleRate',v=>v?`${(v/1000).toFixed(v%1000?1:0)} kHz`:'Unknown'));
  renderBars('#chartBpm',countsBy(rows,'bpm',v=>v?`${Math.round(v/10)*10}-${Math.round(v/10)*10+9}`:'Unknown'));
  renderBars('#chartKey',countsBy(rows,'key',v=>v||'Unknown'));
}
function renderHealth(rows){
  const s=summarize(rows), items=[['Missing artist',s.missingArtist],['Missing genre',s.missingGenre],['Missing year',s.missingYear],['Missing BPM',s.missingBpm],['Missing key',s.missingKey],['Missing artwork',s.missingArtwork],['Low bitrate',rows.filter(t=>t.bitrate&&t.bitrate<192).length],['Unreadable warnings',rows.filter(t=>t.warning).length]];
  els.healthGrid.innerHTML=items.map(([l,v])=>`<div class="health-item"><strong>${v.toLocaleString()}</strong><span>${l}</span></div>`).join('');
}
function td(v){return `<td>${v??'—'}</td>`}
function renderTable(rows){
  els.rowCount.textContent=`${rows.length.toLocaleString()} of ${tracks.length.toLocaleString()} tracks`;
  els.rows.innerHTML=rows.slice(0,1000).map(t=>`<tr title="${t.path.replaceAll('"','&quot;')}">${td(t.title||t.name)}${td(t.artist)}${td((t.ext||'').toUpperCase())}${td(t.bitrate?`${Math.round(t.bitrate)} kbps`:'—')}${td(t.sampleRate?`${t.sampleRate} Hz`:'—')}${td(t.bitDepth||'—')}${td(formatDuration(t.duration))}${td(t.bpm||'—')}${td(t.key||'—')}${td(formatBytes(t.size))}</tr>`).join('');
}
function syncFormatOptions(){
  const val=els.formatFilter.value, exts=[...new Set(tracks.map(t=>t.ext).filter(Boolean))].sort(); els.formatFilter.innerHTML='<option value="">All formats</option>'+exts.map(x=>`<option value="${x}">${x.toUpperCase()}</option>`).join(''); els.formatFilter.value=exts.includes(val)?val:'';
}
function render(full=false){ filtered=currentRows(); if(full)syncFormatOptions(); renderOverview(filtered);renderCharts(filtered);renderHealth(filtered);renderTable(filtered); }

function download(name,type,text){const blob=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function exportCsv(){ const headers=['name','path','title','artist','album','genre','year','bpm','key','format','bitrate','sampleRate','bitDepth','channels','duration','size','lossless']; const lines=[headers.join(','),...filtered.map(t=>headers.map(h=>csvEscape(t[h]??(h==='format'?t.ext:''))).join(','))]; download('trackstats.csv','text/csv;charset=utf-8',lines.join('\n')); }
function exportJson(){download('trackstats.json','application/json',JSON.stringify({schema:1,created:new Date().toISOString(),summary:summarize(filtered),tracks:filtered},null,2));}

els.folder.onchange=e=>runScan(e.target.files); els.files.onchange=e=>runScan(e.target.files); els.cancel.onclick=()=>cancelled=true;
for(const e of [els.search,els.formatFilter,els.qualityFilter]) e.addEventListener(e.tagName==='INPUT'?'input':'change',()=>render());
els.clearFilters.onclick=()=>{els.search.value='';els.formatFilter.value='';els.qualityFilter.value='';render()}; els.exportCsv.onclick=exportCsv; els.exportJson.onclick=exportJson;
render(true);
