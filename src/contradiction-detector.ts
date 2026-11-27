import { createHash } from 'node:crypto';
import {
  CHARACTER_REGISTRY,
  MOONWITNESS_II_ERAS,
  WORLD_RULES,
  type CanonLevel,
  type CanonStatus,
} from './canon-data';
import { validateCan0011VisualBoundary } from './god-promise';

export interface ProposedTimelineEvent {
  readonly eventId: string;
  readonly eraId: string;
  readonly eraOrder?: number;
  readonly title?: string;
  readonly status: CanonStatus;
  readonly canonLevel?: CanonLevel;
  readonly precedesEraId?: string;
  readonly overwritesEraId?: string;
  readonly patchNumber?: number;
  readonly corpusRefs?: readonly string[];
  readonly characterId?: string;
  readonly autoMergeTarget?: string;
  readonly visualPrompt?: string;
  readonly violatedWorldRuleIds?: readonly string[];
  readonly claimsAbsoluteInvulnerability?: boolean;
  readonly claimsMatterBeforeSignal?: boolean;
  readonly claimsUncontestedMemoryWithoutHash?: boolean;
  readonly claimsHighOutputWithoutConduit?: boolean;
}

export interface ContradictionFinding {
  readonly eventId: string;
  readonly code: string;
  readonly worldRuleId?: string;
  readonly severity: 'hard-fail' | 'immutable';
  readonly field: string;
  readonly message: string;
}

export interface ContradictionAuditReport {
  readonly valid: boolean;
  readonly checkedEventCount: number;
  readonly contradictionCount: number;
  readonly checkedWorldRulesCount: number;
  readonly checkedErasCount: number;
  readonly reportSha256: string;
  readonly contradictions: readonly ContradictionFinding[];
}

const CORPUS_SHA256_REF_PATTERN = /^mw-corpus:sha256:[a-f0-9]{64}$/i;

function sha256Hex(payload: string): string {
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

export function detectLoreContradictions(
  events: readonly ProposedTimelineEvent[]
): ContradictionAuditReport {
  const contradictions: ContradictionFinding[] = [];
  const eraById = new Map(MOONWITNESS_II_ERAS.map((era) => [era.id, era]));
  const worldRuleById = new Map(WORLD_RULES.map((wr) => [wr.id, wr]));
  const characterById = new Map(CHARACTER_REGISTRY.map((ch) => [ch.id, ch]));

  for (const event of events) {
    const eventId = event.eventId?.trim() || 'unnamed_event';
    const era = eraById.get(event.eraId);

    // 1. Era existence & order continuity (CAN-0006)
    if (!era) {
      contradictions.push({
        eventId,
        code: 'CAN-0006',
        severity: 'immutable',
        field: 'eraId',
        message: `Unknown timeline era '${event.eraId}'. Must reference one of the 8 canonical MoonWitness II eras.`,
      });
    } else {
      if (event.eraOrder !== undefined && event.eraOrder !== era.order) {
        contradictions.push({
          eventId,
          code: 'CAN-0006',
          severity: 'immutable',
          field: 'eraOrder',
          message: `Era order contradiction for '${era.id}': expected order ${era.order} (${era.title}), received ${event.eraOrder}.`,
        });
      }

      // 2. Status stratification & Zero Implicit Canonicalization (CAN-0001, CAN-0014)
      if (era.status !== 'published' && event.status === 'published') {
        contradictions.push({
          eventId,
          code: 'CAN-0014',
          worldRuleId: 'wr_08',
          severity: 'hard-fail',
          field: 'status',
          message: `Era '${era.id}' (${era.title}) has canonical status '${era.status}'; event cannot self-promote to 'published' (CAN-0001 / CAN-0014).`,
        });
      }
    }

    // 3. Chronological ordering inversion check (CAN-0006)
    if (era && event.precedesEraId) {
      const targetEra = eraById.get(event.precedesEraId);
      if (!targetEra) {
        contradictions.push({
          eventId,
          code: 'CAN-0006',
          severity: 'immutable',
          field: 'precedesEraId',
          message: `precedesEraId '${event.precedesEraId}' is not a valid canonical era.`,
        });
      } else if (era.order >= targetEra.order) {
        contradictions.push({
          eventId,
          code: 'CAN-0006',
          severity: 'immutable',
          field: 'precedesEraId',
          message: `Timeline inversion: '${era.id}' (order ${era.order}) cannot precede '${targetEra.id}' (order ${targetEra.order}).`,
        });
      }
    }

    // 4. Draft Realities Remain Quarantined (wr_08 / CAN-0008 / CAN-0001)
    if (event.overwritesEraId) {
      const overwrittenEra = eraById.get(event.overwritesEraId);
      if (
        event.status !== 'published' &&
        (event.overwritesEraId === 'era_01_before_light' || overwrittenEra?.status === 'published')
      ) {
        contradictions.push({
          eventId,
          code: 'CAN-0008',
          worldRuleId: 'wr_08',
          severity: 'immutable',
          field: 'overwritesEraId',
          message: `World rule wr_08 violation (Draft Realities Remain Quarantined): unpublished branch (${event.status}) cannot overwrite published '${event.overwritesEraId}' continuity.`,
        });
      }
    }

    // 5. Explicit world rule violations & domain invariants (wr_01..wr_10 / CAN-0008)
    for (const ruleId of event.violatedWorldRuleIds ?? []) {
      const rule = worldRuleById.get(ruleId);
      contradictions.push({
        eventId,
        code: 'CAN-0008',
        worldRuleId: ruleId,
        severity: 'immutable',
        field: 'violatedWorldRuleIds',
        message: rule
          ? `World rule ${rule.id} (${rule.title}) contradiction: ${rule.invariant}`
          : `Unknown world rule '${ruleId}' referenced in violation check.`,
      });
    }

    if (event.claimsMatterBeforeSignal) {
      contradictions.push({
        eventId,
        code: 'CAN-0008',
        worldRuleId: 'wr_01',
        severity: 'immutable',
        field: 'claimsMatterBeforeSignal',
        message: `World rule wr_01 (Signal Precedes Matter) contradiction: physical change cannot occur without preceding acoustic or electromagnetic trace.`,
      });
    }

    if (event.claimsUncontestedMemoryWithoutHash) {
      contradictions.push({
        eventId,
        code: 'CAN-0008',
        worldRuleId: 'wr_02',
        severity: 'immutable',
        field: 'claimsUncontestedMemoryWithoutHash',
        message: `World rule wr_02 (Memory Is Contested) contradiction: historical record claimed uncorrupted without verified archive SHA-256 hash.`,
      });
    }

    if (event.claimsHighOutputWithoutConduit) {
      contradictions.push({
        eventId,
        code: 'CAN-0008',
        worldRuleId: 'wr_04',
        severity: 'immutable',
        field: 'claimsHighOutputWithoutConduit',
        message: `World rule wr_04 (Energy Demands Conduit) contradiction: high-output manifestation requires physical battery arrays or resonant relays.`,
      });
    }

    if (event.claimsAbsoluteInvulnerability) {
      contradictions.push({
        eventId,
        code: 'CAN-0008',
        worldRuleId: 'wr_06',
        severity: 'immutable',
        field: 'claimsAbsoluteInvulnerability',
        message: `World rule wr_06 (No Absolute Invulnerability) contradiction: even figures dubbed Indestructible carry structural or temporal costs.`,
      });
    }

    // 6. 33-Patch Register Accountability (wr_10 / CAN-0013)
    if (event.patchNumber !== undefined) {
      if (!Number.isInteger(event.patchNumber) || event.patchNumber < 1 || event.patchNumber > 33) {
        contradictions.push({
          eventId,
          code: 'CAN-0013',
          worldRuleId: 'wr_10',
          severity: 'immutable',
          field: 'patchNumber',
          message: `Patch register contradiction: patchNumber ${event.patchNumber} is outside canonical PATCH-01..PATCH-33 range (1..33).`,
        });
      }
    }

    // 7. Character alias non-auto-merge & canonLevel tagging (CAN-0004, CAN-0005, wr_03)
    if (event.autoMergeTarget && event.autoMergeTarget.trim().length > 0) {
      contradictions.push({
        eventId,
        code: 'CAN-0004',
        worldRuleId: 'wr_03',
        severity: 'hard-fail',
        field: 'autoMergeTarget',
        message: `Character alias auto-merge contradiction: cannot auto-merge '${event.characterId ?? 'character'}' into '${event.autoMergeTarget}' (CAN-0004 / wr_03).`,
      });
    }

    if (event.characterId) {
      const character = characterById.get(event.characterId);
      if (!character) {
        contradictions.push({
          eventId,
          code: 'CAN-0005',
          severity: 'hard-fail',
          field: 'characterId',
          message: `Unknown characterId '${event.characterId}' in lore registry.`,
        });
      } else if (event.canonLevel && event.canonLevel !== 'lore') {
        contradictions.push({
          eventId,
          code: 'CAN-0005',
          severity: 'immutable',
          field: 'canonLevel',
          message: `Character '${character.id}' must preserve canonLevel 'lore', received '${event.canonLevel}'.`,
        });
      }
    }

    // 8. Corpus SHA-256 citation format (CAN-0003)
    for (const ref of event.corpusRefs ?? []) {
      if (!CORPUS_SHA256_REF_PATTERN.test(ref.trim())) {
        contradictions.push({
          eventId,
          code: 'CAN-0003',
          severity: 'hard-fail',
          field: 'corpusRefs',
          message: `Invalid corpusRef '${ref}': must use mw-corpus:sha256:<64-hex> citation format without raw scripture copying.`,
        });
      }
    }

    // 9. Sacred Visual Boundary (CAN-0011 / wr_09)
    if (event.visualPrompt && event.visualPrompt.trim().length > 0) {
      const visualCheck = validateCan0011VisualBoundary(event.visualPrompt);
      if (!visualCheck.allowed) {
        contradictions.push({
          eventId,
          code: 'CAN-0011',
          worldRuleId: 'wr_09',
          severity: 'hard-fail',
          field: 'visualPrompt',
          message: visualCheck.reason ?? 'Blocked by CAN-0011 / wr_09 Sacred Visual Boundary.',
        });
      }
    }
  }

  const reportSha256 = sha256Hex(
    JSON.stringify({
      checkedEventCount: events.length,
      contradictions,
    })
  );

  return {
    valid: contradictions.length === 0,
    checkedEventCount: events.length,
    contradictionCount: contradictions.length,
    checkedWorldRulesCount: WORLD_RULES.length,
    checkedErasCount: MOONWITNESS_II_ERAS.length,
    reportSha256,
    contradictions,
  };
}

export function runContradictionCli(args: readonly string[]): {
  readonly exitCode: number;
  readonly stdout: string;
} {
  let rawJson: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--events' && typeof args[i + 1] === 'string') {
      rawJson = args[i + 1];
      break;
    }
    if (args[i]?.startsWith('--events=')) {
      rawJson = args[i]!.slice('--events='.length);
      break;
    }
  }

  if (!rawJson) {
    // Default self-check over canonical eras when invoked with no arguments
    const defaultEvents: ProposedTimelineEvent[] = MOONWITNESS_II_ERAS.map((era) => ({
      eventId: `canonical_${era.id}`,
      eraId: era.id,
      eraOrder: era.order,
      status: era.status,
      corpusRefs: era.corpusRefs,
    }));
    const report = detectLoreContradictions(defaultEvents);
    return {
      exitCode: report.valid ? 0 : 1,
      stdout: JSON.stringify(report, null, 2),
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    const errPayload = {
      valid: false,
      error: 'Invalid JSON passed to --events',
    };
    return { exitCode: 2, stdout: JSON.stringify(errPayload, null, 2) };
  }

  const events: ProposedTimelineEvent[] = Array.isArray(parsed)
    ? (parsed as ProposedTimelineEvent[])
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { events?: unknown }).events)
      ? ((parsed as { events: ProposedTimelineEvent[] }).events)
      : [parsed as ProposedTimelineEvent];

  const report = detectLoreContradictions(events);
  return {
    exitCode: report.valid ? 0 : 1,
    stdout: JSON.stringify(report, null, 2),
  };
}

if (import.meta.main) {
  const outcome = runContradictionCli(process.argv.slice(2));
  console.log(outcome.stdout);
  process.exit(outcome.exitCode);
}
