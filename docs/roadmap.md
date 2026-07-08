# Roadmap

## Near term

- Rule configuration file for enabling, disabling, and changing severities.
- Inline suppression comments with required justification.
- Better YAML AST line mapping for nested keys and multi-line values.
- SARIF fingerprints for stable alert deduplication.
- Additional examples for reusable workflows and monorepos.

## Rule ideas

- Cache poisoning risks.
- Artifact poisoning risks.
- `pull_request_target` checkout of `github.event.pull_request.head.sha`.
- Shell injection through untrusted contexts.
- Overbroad package publishing permissions.
- Untrusted third-party composite actions.

## Packaging

- Prebuilt bundled GitHub Action artifact.
- Signed npm provenance workflow.
- Release automation with changelog generation.
