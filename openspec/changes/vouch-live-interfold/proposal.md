# Live Interfold endorsements in apps/vouch

## Why

`apps/vouch` runs only on practice data. Interfold asks evaluators three Yes/No questions about each candidate node operator, and needs those answers real and signed, and a way to read them back, as the shared [interfold-endorsements](https://github.com/BrightID/shared-specs/blob/main/openspec/changes/interfold-live-endorsements/specs/interfold-endorsements/spec.md) contract describes.

## What Changes

- A live adapter in `apps/vouch` that signs and tracks Interfold answers and reads them back, behind two build-time switches, one for writes and one for reads.
