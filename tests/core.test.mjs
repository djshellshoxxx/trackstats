import assert from 'node:assert/strict';
import {extensionOf,formatBytes,formatDuration,bitrateBucket,parseWav,summarize,countsBy} from '../core.js';

assert.equal(extensionOf('Track.MP3'),'mp3');
assert.equal(formatBytes(1024),'1.00 KB');
assert.equal(formatDuration(65),'1:05');
assert.equal(formatDuration(3661),'1:01:01');
assert.equal(bitrateBucket(318),'320 kbps');

const wav=new ArrayBuffer(44+4); const v=new DataView(wav); const te=new TextEncoder();
const put=(off,s)=>new Uint8Array(wav,off,s.length).set(te.encode(s));
put(0,'RIFF');v.setUint32(4,40,true);put(8,'WAVE');put(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,44100,true);v.setUint32(28,176400,true);v.setUint16(32,4,true);v.setUint16(34,16,true);put(36,'data');v.setUint32(40,4,true);
const parsed=parseWav(wav); assert.equal(parsed.sampleRate,44100);assert.equal(parsed.channels,2);assert.equal(parsed.bitDepth,16);assert.equal(parsed.lossless,true);

const s=summarize([{size:100,duration:10,artist:'A',album:'X',genre:'G',lossless:true,artwork:true},{size:200,duration:20,artist:'B',album:'X',lossless:false}]);
assert.equal(s.tracks,2);assert.equal(s.totalBytes,300);assert.equal(s.artists,2);assert.equal(s.albums,1);assert.equal(s.missingGenre,1);assert.equal(s.lossless,1);
assert.deepEqual(countsBy([{ext:'mp3'},{ext:'wav'},{ext:'mp3'}],'ext'),[['mp3',2],['wav',1]]);
console.log('TrackStats core tests: PASS');
