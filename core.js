export const AUDIO_EXTENSIONS = new Set(['mp3','wav','wave','flac','aif','aiff','ogg','oga','opus','m4a','aac']);

export function extensionOf(name='') {
  const i = name.lastIndexOf('.');
  return i < 0 ? '' : name.slice(i + 1).toLowerCase();
}

export function formatBytes(bytes=0) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units=['B','KB','MB','GB','TB'];
  let n=bytes, i=0;
  while(n>=1024 && i<units.length-1){ n/=1024; i++; }
  return `${n.toFixed(i===0?0:n>=100?0:n>=10?1:2)} ${units[i]}`;
}

export function formatDuration(seconds=0) {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const s=Math.round(seconds), h=Math.floor(s/3600), m=Math.floor((s%3600)/60), r=s%60;
  return h ? `${h}:${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}` : `${m}:${String(r).padStart(2,'0')}`;
}

export function bitrateBucket(kbps) {
  if (!Number.isFinite(kbps) || kbps <= 0) return 'Unknown';
  const common=[64,96,128,160,192,224,256,320];
  let best=common[0];
  for (const v of common) if (Math.abs(kbps-v) < Math.abs(kbps-best)) best=v;
  return `${best} kbps`;
}

export function decodeSyncSafe(b0,b1,b2,b3){ return (b0<<21)|(b1<<14)|(b2<<7)|b3; }
function cleanText(s){ return String(s||'').replace(/\0/g,'').trim(); }
function decodeText(bytes, enc=3){
  if (!bytes?.length) return '';
  try {
    if (enc===0) return cleanText(new TextDecoder('latin1').decode(bytes));
    if (enc===1) {
      if (bytes[0]===0xff && bytes[1]===0xfe) return cleanText(new TextDecoder('utf-16le').decode(bytes.slice(2)));
      if (bytes[0]===0xfe && bytes[1]===0xff) {
        const swapped=new Uint8Array(bytes.length-2); for(let i=2;i+1<bytes.length;i+=2){swapped[i-2]=bytes[i+1];swapped[i-1]=bytes[i];}
        return cleanText(new TextDecoder('utf-16le').decode(swapped));
      }
      return cleanText(new TextDecoder('utf-16le').decode(bytes));
    }
    if (enc===2) {
      const swapped=new Uint8Array(bytes.length); for(let i=0;i+1<bytes.length;i+=2){swapped[i]=bytes[i+1];swapped[i+1]=bytes[i];}
      return cleanText(new TextDecoder('utf-16le').decode(swapped));
    }
    return cleanText(new TextDecoder('utf-8').decode(bytes));
  } catch { return ''; }
}

export function parseID3(buffer) {
  const b=new Uint8Array(buffer); const out={};
  if (b.length<10 || String.fromCharCode(...b.slice(0,3))!=='ID3') return out;
  const ver=b[3], tagSize=decodeSyncSafe(b[6],b[7],b[8],b[9]); let p=10, end=Math.min(b.length,10+tagSize);
  const map={TIT2:'title',TPE1:'artist',TALB:'album',TCON:'genre',TYER:'year',TDRC:'year',TBPM:'bpm',TKEY:'key',TPE2:'albumArtist',TCOM:'composer',TPUB:'label'};
  while(p+10<=end){
    const id=String.fromCharCode(...b.slice(p,p+4)); if(!/^[A-Z0-9]{4}$/.test(id)) break;
    const size=ver===4?decodeSyncSafe(b[p+4],b[p+5],b[p+6],b[p+7]):((b[p+4]<<24)>>>0)|(b[p+5]<<16)|(b[p+6]<<8)|b[p+7];
    if(size<=0 || p+10+size>end) break;
    if(map[id]) { const enc=b[p+10]; const value=decodeText(b.slice(p+11,p+10+size),enc); if(value) out[map[id]]=value; }
    if(id==='APIC') out.artwork=true;
    p += 10+size;
  }
  if (out.bpm) out.bpm=Number.parseFloat(out.bpm)||null;
  if (out.year) { const m=String(out.year).match(/\d{4}/); out.year=m?Number(m[0]):null; }
  return out;
}

function ascii(view,off,len){ let s=''; for(let i=0;i<len;i++) s+=String.fromCharCode(view.getUint8(off+i)); return s; }
export function parseWav(buffer) {
  const v=new DataView(buffer); if(v.byteLength<44 || ascii(v,0,4)!=='RIFF' || ascii(v,8,4)!=='WAVE') return {};
  let p=12, fmt=null, dataSize=0;
  while(p+8<=v.byteLength){ const id=ascii(v,p,4), size=v.getUint32(p+4,true); if(id==='fmt ' && size>=16){ fmt={audioFormat:v.getUint16(p+8,true),channels:v.getUint16(p+10,true),sampleRate:v.getUint32(p+12,true),byteRate:v.getUint32(p+16,true),bitDepth:v.getUint16(p+22,true)}; } if(id==='data'){dataSize=size; break;} p+=8+size+(size%2); }
  if(!fmt) return {};
  return {...fmt,duration:fmt.byteRate?dataSize/fmt.byteRate:0,bitrate:fmt.byteRate?Math.round(fmt.byteRate*8/1000):0,lossless:true};
}

export function parseFlac(buffer) {
  const b=new Uint8Array(buffer); if(b.length<42 || String.fromCharCode(...b.slice(0,4))!=='fLaC') return {};
  let p=4, out={lossless:true};
  while(p+4<=b.length){ const last=!!(b[p]&0x80), type=b[p]&0x7f, len=(b[p+1]<<16)|(b[p+2]<<8)|b[p+3]; const start=p+4; if(start+len>b.length) break;
    if(type===0 && len>=34){ const x=b.slice(start,start+34); const sr=(x[10]<<12)|(x[11]<<4)|(x[12]>>4); const channels=((x[12]>>1)&7)+1; const bitDepth=(((x[12]&1)<<4)|(x[13]>>4))+1; const totalSamples=((x[13]&0x0f)*2**32)+(x[14]*2**24)+(x[15]*2**16)+(x[16]*2**8)+x[17]; out={...out,sampleRate:sr,channels,bitDepth,duration:sr?totalSamples/sr:0}; }
    if(type===6) out.artwork=true;
    p=start+len; if(last) break;
  }
  return out;
}

export function normalizeKey(key='') {
  return String(key).trim().replace('♯','#').replace('♭','b');
}

export function summarize(tracks=[]) {
  const totalBytes=tracks.reduce((a,t)=>a+(t.size||0),0); const totalDuration=tracks.reduce((a,t)=>a+(t.duration||0),0);
  const uniq=k=>new Set(tracks.map(t=>t[k]).filter(Boolean)).size;
  const missing=k=>tracks.filter(t=>!t[k]).length;
  const lossless=tracks.filter(t=>t.lossless).length;
  return {tracks:tracks.length,totalBytes,totalDuration,artists:uniq('artist'),albums:uniq('album'),genres:uniq('genre'),lossless,lossy:tracks.length-lossless,missingArtist:missing('artist'),missingTitle:missing('title'),missingGenre:missing('genre'),missingYear:missing('year'),missingBpm:missing('bpm'),missingKey:missing('key'),missingArtwork:tracks.filter(t=>!t.artwork).length};
}

export function countsBy(tracks,key,mapper=v=>v||'Unknown') {
  const m=new Map(); for(const t of tracks){ const k=mapper(t[key],t); m.set(k,(m.get(k)||0)+1); } return [...m.entries()].sort((a,b)=>b[1]-a[1]);
}

export function csvEscape(v){ const s=String(v??''); return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s; }

// Sort raw metadata before the explorer's display limit; keep unknown values last.
export function sortTracks(rows, key, direction = 'ascending') {
  const numeric = new Set(['bitrate', 'sampleRate', 'bitDepth', 'channels', 'duration', 'bpm', 'size']);
  const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
  const value = t => {
    const raw = key === 'title' ? t.title || t.name : t[key];
    if (numeric.has(key)) {
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return raw == null || String(raw).trim() === '' ? null : String(raw).trim();
  };
  return [...rows].sort((a, b) => {
    const av = value(a), bv = value(b);
    if (av === null || bv === null) return av === bv ? 0 : av === null ? 1 : -1;
    const comparison = numeric.has(key) ? av - bv : collator.compare(av, bv);
    return direction === 'descending' ? -comparison : comparison;
  });
}
