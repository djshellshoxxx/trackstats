# TrackStats Design Specification

Date: 2026-10-01
Brand: Circuit Drift Labs
Primary site: https://circuitdriftlabs.djshellshoxxx.github.io

## Purpose
TrackStats is a client-side GitHub Pages application that scans a user-selected music library locally and presents interactive statistics, charts, filters, quality findings, and exports without uploading audio files.

## Core V1
- Folder and multi-file selection
- Local metadata/header parsing
- Support target formats: MP3, WAV, FLAC, AIFF/AIF, OGG, Opus, AAC/M4A where practical
- Normalized track model
- IndexedDB persistence
- Incremental scan with cancel/progress
- Web Workers where useful
- No full audio decoding during normal scan
- Searchable/sortable track explorer
- CSV/JSON export

## Statistics and charts
TrackStats should calculate and graph:
- file format distribution
- storage by format
- bitrate distribution and CBR/VBR where detectable
- sample-rate distribution
- bit-depth distribution
- mono/stereo/multichannel
- file-size distribution
- duration distribution
- total tracks, storage, playback time, days of playback
- artists, albums, genres, composers, labels
- release year and decade
- BPM distribution and buckets
- musical key distribution
- major/minor split
- Camelot distribution where conversion is reliable
- lossless vs lossy
- high-resolution vs standard-resolution using documented thresholds
- metadata completeness
- artwork presence
- low-bitrate files using configurable threshold
- unreadable/unsupported files
- exact duplicates by optional hash
- metadata duplicate candidates

## Interactive filtering
All compatible charts and overview metrics should cross-filter from selections such as genre, format, bitrate, decade, artist, BPM range, key, lossless only, or missing-metadata only. Active filters must remain visible and individually removable.

## Derived insights
Examples:
- continuous listening time
- most represented artist/album/genre
- artist with most playback hours
- genre using most storage
- most common BPM/key
- lossless percentage
- one-track artists
- artists with 50+/100+/500+ tracks
- oldest/newest tagged releases

## Relationship views
Where data coverage is sufficient:
- BPM vs year
- bitrate vs year
- duration vs file size
- genre vs average BPM
- artist vs playback hours

## Track explorer fields
Title, artist, album, genre, year, BPM, key, format, codec, bitrate, sample rate, bit depth, channels, duration, size, relative path, warnings.

## Deep Scan later
Opt-in audio decoding subsystem for peak, true peak where feasible, RMS, LUFS, crest factor/dynamic range indicators, clipping, DC offset, leading/trailing silence, stereo correlation, spectral centroid, band energy, detected BPM, and detected key.

## Circuit Drift Labs integration
TrackStats must use the shared dark navy/black/gray visual language and a small unobtrusive Circuit Drift Labs mark. Header/footer must link to https://circuitdriftlabs.djshellshoxxx.github.io.

Related tools should appear after scan results and/or in a tools area:
1. Transposition Calculator — contextually near BPM/key results, with source key/BPM prefill via URL parameters when supported.
2. MIDItest — MIDI controller diagnostics and monitoring.

Separate lower-priority `Experiments` section, below the main music-production utilities:
1. Binaural Web Beats
2. BabbleForge

The experiments section must remain visually separated because those tools serve a different purpose.

## Privacy
Use language such as `Scan Library`, not `Upload Library`. Clearly state that files remain on-device. Do not transmit filenames, metadata, hashes, or library-derived values.

## Performance
Design for 100, 1,000, and 10,000+ file workloads. Malformed files must not terminate the scan.

## Testing
Cover format detection, metadata normalization, audio header extraction, statistics, filters, duplicate grouping, key/Camelot conversion, exports, persistence, malformed files, cancellation, and large synthetic libraries.

## Deployment
GitHub Pages from djshellshoxxx/trackstats. Must work under repository subpath. README links prominently to Circuit Drift Labs, Transposition Calculator, MIDItest, and the experiments section.

## Success criteria
A user can scan thousands of tracks locally, explore useful charts and quality findings, filter results, inspect tracks, export the scan, and navigate naturally to the related Circuit Drift Labs tools without any backend.
