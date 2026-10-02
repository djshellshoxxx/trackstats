# TrackStats Contextual Cross-Linking Addendum

Date: 2026-10-01

This addendum is part of the TrackStats specification and overrides any weaker generic-linking language in the main design spec.

## Principle

Cross-links to other Circuit Drift Labs projects must appear when they are a natural next step for the user. They should read like helpful workflow continuations, not advertisements.

## Required contextual links

### After library scan completes

Show a compact `Related tools` area after the primary results, not before them.

### BPM / musical key results -> Transposition Calculator

Place a contextual link adjacent to BPM/key charts or selected-track details.

Suggested copy:

`Need to move a track or sample to another key or tempo? Open Transposition Calculator.`

When TrackStats has a currently selected track or filtered source key/BPM and Transposition Calculator supports URL parameters, prefill those source values.

### Quality / loudness / file-health results -> LoudnessBatch

When the library scan shows audio-quality or loudness-related information, surface LoudnessBatch as the deeper analysis tool.

Suggested copy:

`Want a deeper loudness, dynamics, tonal-balance and stereo analysis? Check the selected tracks in LoudnessBatch.`

If a future browser workflow allows passing a non-sensitive exported selection without uploading audio, provide a convenient handoff. Do not transmit local file contents or paths automatically.

### MIDI-related workflow -> MIDItest

Keep MIDItest available in the related-tools directory, but do not force it into every TrackStats result screen because it is not directly related to library statistics.

## Shared tool ordering

Primary Circuit Drift Labs tools:

1. TrackStats
2. Transposition Calculator
3. MIDItest
4. LoudnessBatch

Experiments, visually separated below the production tools:

1. Binaural Web Beats
2. BabbleForge

## Footer and main-site link

The footer must link to `https://circuitdriftlabs.djshellshoxxx.github.io` and may include the compact primary-tools list. Contextual result links remain separate from this generic navigation.

## Testing

UI tests should verify:

- Transposition Calculator prompt appears when BPM/key result data exists.
- LoudnessBatch prompt appears in quality/loudness-related result contexts.
- Contextual prompts do not appear before a scan has produced relevant results.
- Experiment links remain below and visually separate from production tools.
- Cross-link URL parameters never include local paths, filenames unless explicitly user-visible/shareable by design, or other private library data.
