# Agent notes

- OpenSpec lives in `openspec/`; `openspec/config.yaml` says which changes need an OpenSpec change.
- A test names the OpenSpec scenario it checks with a `@scenario <capability>: <Scenario name>` tag, and CI fails on an untagged scenario or a tag naming none. See the [spec-trace skill](https://github.com/adamstallard/shared-skills/tree/main/.agents/skills/spec-trace).
