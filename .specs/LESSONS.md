# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Plan/Checks)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Run a below-768px rule's audit at the widest covered width (767px) as well as at the phone width
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `e2e-mobile` · harmful: 0
- features: mobile-v1
- evidence: C2 / MOB-02 (e2e-mobile)
- last seen: 2026-11-08T23:28:28Z

### L-002 - A guard that names a set of pages must cover every page in the set
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `e2e` · harmful: 0
- features: mobile-v1
- evidence: C4 / MOB-04 (e2e)
- last seen: 2026-11-08T23:28:28Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
