---
name: update-tests-for-changes
description: 'Update Jest and Testing Library tests after component or behavior changes. Use when UI copy, routes, props, data dependencies, or interactions change and existing tests fail or become stale.'
argument-hint: 'What changed, and which component or module should tests be updated for?'
user-invocable: true
disable-model-invocation: false
---

# Update Tests For New Changes

## What This Skill Produces
- Updated test files that reflect the latest implementation behavior.
- Focused regression checks for changed UI, links, states, and interactions.
- A targeted test run summary with pass or fail outcome and next actions.

## When To Use
- A component, page, hook, or helper changed and tests are failing.
- Copy, routes, CTA labels, aria names, or link destinations changed.
- Conditional rendering changed (signed-in vs signed-out, loading vs loaded, empty vs populated).
- A new feature branch modified behavior and tests now mismatch reality.

## Inputs
- The changed file path(s).
- The expected new behavior.
- Optional scope: one test file, module tests, or all related tests.

## Procedure
1. Identify what changed.
- Read the modified implementation.
- List observable behavior differences, not internal refactors.
- Capture updated user-facing outputs: text, roles, labels, href values, visibility rules, and state transitions.

2. Map impact to tests.
- Find nearest existing tests first (same module folder, then broader module tests).
- Reuse existing test style, mocking strategy, and naming conventions.
- Decide whether to edit existing tests, add focused new tests, or both.

3. Apply minimal test updates.
- Update assertions to match new behavior.
- Prefer semantic queries (`getByRole`, `findByRole`, `queryByRole`) over brittle selectors.
- Keep mocks only as broad as needed for deterministic behavior.
- Add tests for new branches introduced by the change.

4. Cover decision branches.
- If only static copy or route changed: update expectations and snapshots if applicable.
- If conditional logic changed: add explicit tests for each branch.
- If async data behavior changed: assert loading, success, and fallback/error states as appropriate.
- If links changed: assert exact href targets and accessible link names.

5. Validate with targeted execution.
- Run the most specific test file first.
- If that passes, run related module tests if risk is medium or high.
- Capture failing output, patch quickly, and rerun.

6. Completion checks.
- Tests pass for the changed scope.
- Assertions validate behavior users can observe.
- No stale assertions tied to removed UI or old copy.
- Test names clearly describe intent and branch covered.

## Quality Criteria
- Accuracy: tests match current behavior, not historical behavior.
- Signal: failures point to meaningful regressions.
- Stability: minimal flaky timing assumptions.
- Maintainability: readable setup, focused assertions, limited mocking complexity.

## Example Prompt
- /update-tests-for-changes Updated Purpose component CTA now links to /gallery and copy changed. Update and run the related home module tests.

## Storefront Defaults (This Workspace)
- Test runner: Jest with jsdom via [jest.config.js](../../jest.config.js).
- Common command: `npm test -- <path-to-test-file>`.
- Coverage command: `npm test:coverage -- <path-or-folder>`.
- Existing home tests example: [src/modules/home/__tests__/hero.test.tsx](../../src/modules/home/__tests__/hero.test.tsx).
