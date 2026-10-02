# TrackStats

**TrackStats by Circuit Drift Labs** is a privacy-first browser tool for understanding a music library without uploading the library anywhere.

Live site: https://djshellshoxxx.github.io/trackstats/

Circuit Drift Labs: https://circuitdriftlabs.djshellshoxxx.github.io/

## What it does

Choose a music folder or a group of audio files and TrackStats scans them locally in the browser. It summarizes track count, storage, playback time, file formats, bitrate, sample rate, lossless/lossy mix, BPM/key metadata and common metadata gaps. The Track Explorer lets you search/filter the current scan and export CSV or JSON.

Current V1 supports fast browser-side inspection of MP3, WAV, FLAC, AIFF, OGG/Opus, AAC/M4A and related audio files. WAV/FLAC/ID3 headers are parsed directly where practical; browser media metadata is used as a fallback for duration.

## Privacy

Files remain on your device. TrackStats has no account system or server upload path for library contents.

## Related Circuit Drift Labs tools

- Transposition Calculator: https://djshellshoxxx.github.io/TranspositionCalc/
- MIDItest: https://djshellshoxxx.github.io/Miditest/
- LoudnessBatch: https://djshellshoxxx.github.io/loudnessbatch/

Experiments:

- Binaural Web Beats: https://djshellshoxxx.github.io/binerualwebeats/
- BabbleForge: https://djshellshoxxx.github.io/babbleforge/

## Development

The app is static HTML/CSS/JavaScript. Run the core tests with:

```bash
node tests/core.test.mjs
```

Serve the repository root with any static HTTP server for local browser testing.

## Design/spec

See `docs/superpowers/specs/` and `docs/superpowers/plans/`.
