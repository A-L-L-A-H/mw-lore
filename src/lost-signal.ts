import {
  CHARACTER_REGISTRY,
  LOCKED_CANON_RULES,
  MOONWITNESS_II_ERAS,
  NARRATIVE_FUNCTIONS,
  WORLD_RULES,
  assertNoAliasAutoMerge,
  type CanonStatus,
  type MoonWitnessEra,
  type NarrativeFunction
} from './canon-data';
import { validateCan0011VisualBoundary } from './god-promise';

export type EraSlot =
  | 'era_00'
  | 'era_01'
  | 'era_02'
  | 'era_03'
  | 'era_04'
  | 'era_05'
  | 'era_06'
  | 'era_07';

export type MysteryState = 'unknown';

export interface SignalChoice {
  readonly id: string;
  readonly label: string;
  readonly prompt: string;
  readonly nextEraSlot: EraSlot | null;
  readonly narrativeFunctionId: string;
  readonly fragmentId: string;
  readonly fragmentSummary: string;
  readonly faultLine: string;
  readonly worldRuleRef: string;
  readonly characterRef?: string;
}

export interface SignalChapter {
  readonly eraSlot: EraSlot;
  readonly eraId: string;
  readonly eraOrder: number;
  readonly eraTitle: string;
  readonly sourceStatus: CanonStatus;
  readonly chapterTitle: string;
  readonly transmission: string;
  readonly defaultFunctionId: string;
  readonly mysteryState: MysteryState;
  readonly choices: readonly SignalChoice[];
}

export interface UnlockedEraRecord {
  readonly eraSlot: EraSlot;
  readonly eraId: string;
  readonly title: string;
  readonly sourceStatus: CanonStatus;
}

export interface WitnessedFragment {
  readonly id: string;
  readonly eraSlot: EraSlot;
  readonly narrativeFunctionId: string;
  readonly summary: string;
  readonly worldRuleRef: string;
}

export interface ChoiceHistoryEntry {
  readonly step: number;
  readonly eraSlot: EraSlot;
  readonly choiceId: string;
  readonly label: string;
  readonly narrativeFunctionId: string;
  readonly faultLine: string;
  readonly fragmentId: string;
  readonly timestamp: string;
}

export interface AliasCoexistenceAudit {
  readonly playerAlias: string;
  readonly matchedCharacterIds: readonly string[];
  readonly autoMergeAllowed: false;
  readonly rule: 'CAN-0004';
}

export interface LostSignalSession {
  readonly id: string;
  readonly gameTitle: 'THE LOST SIGNAL';
  readonly playerAlias: string;
  readonly aliasAudit: AliasCoexistenceAudit;
  readonly mysteryState: MysteryState;
  readonly canonGovernance: 'CAN-0001..CAN-0015';
  readonly currentEraSlot: EraSlot;
  readonly currentEraId: string;
  readonly currentEraStatus: CanonStatus;
  readonly activeNarrativeFunction: NarrativeFunction;
  readonly unlockedEras: readonly UnlockedEraRecord[];
  readonly witnessedFragments: readonly WitnessedFragment[];
  readonly faultLines: readonly string[];
  readonly visitedNarrativeFunctionIds: readonly string[];
  readonly history: readonly ChoiceHistoryEntry[];
  readonly completed: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface LostSignalSessionView extends LostSignalSession {
  readonly currentChapter: SignalChapter;
  readonly availableChoices: readonly SignalChoice[];
}

export interface SessionActionResult {
  readonly ok: boolean;
  readonly statusCode: number;
  readonly rule?: string;
  readonly error?: string;
  readonly session?: LostSignalSessionView;
  readonly appliedChoice?: ChoiceHistoryEntry;
}

const ERA_SLOTS: readonly EraSlot[] = [
  'era_00',
  'era_01',
  'era_02',
  'era_03',
  'era_04',
  'era_05',
  'era_06',
  'era_07'
] as const;

function getEraBySlot(slot: EraSlot): MoonWitnessEra {
  const index = ERA_SLOTS.indexOf(slot);
  const era = MOONWITNESS_II_ERAS[index];
  if (!era) {
    throw new Error(`Invalid era slot: ${slot}`);
  }
  return era;
}

function getFunctionById(functionId: string): NarrativeFunction {
  const fn = NARRATIVE_FUNCTIONS.find((entry) => entry.id === functionId);
  if (!fn) {
    throw new Error(`Invalid narrative function: ${functionId}`);
  }
  return fn;
}

function buildChapter(
  eraSlot: EraSlot,
  chapterTitle: string,
  transmission: string,
  defaultFunctionId: string,
  choices: readonly SignalChoice[]
): SignalChapter {
  const era = getEraBySlot(eraSlot);
  return {
    eraSlot,
    eraId: era.id,
    eraOrder: era.order,
    eraTitle: era.title,
    sourceStatus: era.status,
    chapterTitle,
    transmission,
    defaultFunctionId,
    mysteryState: 'unknown',
    choices
  };
}

export const LOST_SIGNAL_CHAPTERS: readonly SignalChapter[] = [
  buildChapter(
    'era_00',
    'SIGNAL ZERO // BEFORE LIGHT',
    'Stillness holds across the RockSoul horizon. An unattributed carrier wave hums beneath the static—its origin remains unknown.',
    'fn_01_storytelling',
    [
      {
        id: 'ch00_tune_horizon',
        label: 'Tune the horizon relay',
        prompt: 'Trace the primordial carrier wave without assigning a creator.',
        nextEraSlot: 'era_01',
        narrativeFunctionId: 'fn_01_storytelling',
        fragmentId: 'frag_00_horizon_hum',
        fragmentSummary: 'Recorded pre-fracture carrier hum in BEFORE LIGHT (published).',
        faultLine: 'silence_vs_transmission',
        worldRuleRef: 'wr_01',
        characterRef: 'char_the_shadow'
      },
      {
        id: 'ch00_map_lattice',
        label: 'Map the dormant lattice',
        prompt: 'Catalog the spatial grid before the first arrival wave hits.',
        nextEraSlot: 'era_01',
        narrativeFunctionId: 'fn_02_worldbuilding',
        fragmentId: 'frag_00_dormant_grid',
        fragmentSummary: 'Mapped dormant RockSoul acoustic towers prior to arrival.',
        faultLine: 'order_vs_fracture',
        worldRuleRef: 'wr_08'
      }
    ]
  ),
  buildChapter(
    'era_01',
    'FIRST CONTACT // THE ARRIVAL',
    'Draft-tier telemetry flares across the dormant lattice. Unverified callsigns echo in the upper bands while source status remains draft.',
    'fn_03_character_study',
    [
      {
        id: 'ch01_log_callsigns',
        label: 'Log the incoming callsigns',
        prompt: 'Record alias echoes separately without merging any identity.',
        nextEraSlot: 'era_02',
        narrativeFunctionId: 'fn_03_character_study',
        fragmentId: 'frag_01_alias_echo',
        fragmentSummary: 'Preserved coexisting aliases under CAN-0004 non-auto-merge.',
        faultLine: 'mask_vs_identity',
        worldRuleRef: 'wr_03',
        characterRef: 'char_a_lah'
      },
      {
        id: 'ch01_decode_motif',
        label: 'Decode the orbital motif',
        prompt: 'Read the repeating triple-pulse as open symbolism, not dogma.',
        nextEraSlot: 'era_02',
        narrativeFunctionId: 'fn_04_symbolism',
        fragmentId: 'frag_01_triple_pulse',
        fragmentSummary: 'Catalogued symbolic triple-pulse from Dogs From Universe scouts.',
        faultLine: 'motif_vs_literalism',
        worldRuleRef: 'wr_02',
        characterRef: 'char_dogs_from_universe'
      }
    ]
  ),
  buildChapter(
    'era_02',
    'RESONANCE SPLIT // FIRST ECHO',
    'The first echo fractures into competing memory vaults. Acoustic signatures diverge across districts.',
    'fn_05_sound_design',
    [
      {
        id: 'ch02_isolate_harmonics',
        label: 'Isolate the split harmonics',
        prompt: 'Sample the diverging frequency bands before they decay.',
        nextEraSlot: 'era_03',
        narrativeFunctionId: 'fn_05_sound_design',
        fragmentId: 'frag_02_split_harmonics',
        fragmentSummary: 'Captured twin harmonic stems from the FIRST ECHO vault.',
        faultLine: 'harmony_vs_dissonance',
        worldRuleRef: 'wr_01',
        characterRef: 'char_dj_david'
      },
      {
        id: 'ch02_frame_silhouette',
        label: 'Frame the abstract skyline',
        prompt: 'Render geometric relay silhouettes strictly inside CAN-0011 boundaries.',
        nextEraSlot: 'era_03',
        narrativeFunctionId: 'fn_06_visual_direction',
        fragmentId: 'frag_02_geometric_frame',
        fragmentSummary: 'Generated abstract relay framing compliant with CAN-0011.',
        faultLine: 'signal_vs_spectacle',
        worldRuleRef: 'wr_09'
      }
    ]
  ),
  buildChapter(
    'era_03',
    'BORDERLAND STATIC // ELECTRIC DRIFT',
    'Industrial static collides with the Electric Forest canopy. Residual voltage hums through every trunk and relay.',
    'fn_07_archiving',
    [
      {
        id: 'ch03_archive_voltage',
        label: 'Archive the canopy charge',
        prompt: 'Index residual Electric Forest telemetry with deterministic pointers.',
        nextEraSlot: 'era_04',
        narrativeFunctionId: 'fn_07_archiving',
        fragmentId: 'frag_03_canopy_charge',
        fragmentSummary: 'Archived Electric Forest residual charge logs.',
        faultLine: 'archive_vs_erasure',
        worldRuleRef: 'wr_05',
        characterRef: 'char_electric_forest'
      },
      {
        id: 'ch03_separate_reflection',
        label: 'Record an editorial reflection',
        prompt: 'Keep personal reflection strictly separate from corpus attribution.',
        nextEraSlot: 'era_04',
        narrativeFunctionId: 'fn_08_editorial_reflection',
        fragmentId: 'frag_03_editorial_note',
        fragmentSummary: 'Logged separated reflection note under CAN-0009/CAN-0010.',
        faultLine: 'witness_vs_commentary',
        worldRuleRef: 'wr_04',
        characterRef: 'char_walter_white'
      }
    ]
  ),
  buildChapter(
    'era_04',
    'COVERT BANDS // SHADOW CIRCUIT',
    'Hidden broadcast channels splice local myths across the underground. Unverified transmissions compete for control.',
    'fn_09_continuity_audit',
    [
      {
        id: 'ch04_audit_splice',
        label: 'Audit the spliced broadcast',
        prompt: 'Verify that draft branches never overwrite BEFORE LIGHT continuity.',
        nextEraSlot: 'era_05',
        narrativeFunctionId: 'fn_09_continuity_audit',
        fragmentId: 'frag_04_continuity_audit',
        fragmentSummary: 'Verified quarantine of draft branches against BEFORE LIGHT.',
        faultLine: 'canon_vs_apocrypha',
        worldRuleRef: 'wr_08',
        characterRef: 'char_the_shadow'
      },
      {
        id: 'ch04_probe_workbench',
        label: 'Probe the covert relay map',
        prompt: 'Expose the shadow frequency grid for interactive inspection.',
        nextEraSlot: 'era_05',
        narrativeFunctionId: 'fn_10_interactive_exploration',
        fragmentId: 'frag_04_relay_probe',
        fragmentSummary: 'Mapped covert Shadow Circuit relay nodes.',
        faultLine: 'secrecy_vs_transparency',
        worldRuleRef: 'wr_07',
        characterRef: 'char_jhnny_depp'
      }
    ]
  ),
  buildChapter(
    'era_05',
    'POLARITY FLIP // BLUE INVERSION',
    'Cobalt-band interference flips signal polarity across every listening district. Every witness must audit their own archive.',
    'fn_11_community_dialogue',
    [
      {
        id: 'ch05_open_channel',
        label: 'Open a listening channel',
        prompt: 'Invite open interpretation while keeping locked canon immutable.',
        nextEraSlot: 'era_06',
        narrativeFunctionId: 'fn_11_community_dialogue',
        fragmentId: 'frag_05_cobalt_dialogue',
        fragmentSummary: 'Opened cobalt-band listening dialogue during BLUE INVERSION.',
        faultLine: 'consensus_vs_plurality',
        worldRuleRef: 'wr_02',
        characterRef: 'char_blue_witch'
      },
      {
        id: 'ch05_hold_polarity',
        label: 'Hold the inverted polarity',
        prompt: 'Endure the polarity storm and measure its structural cost.',
        nextEraSlot: 'era_06',
        narrativeFunctionId: 'fn_09_continuity_audit',
        fragmentId: 'frag_05_polarity_cost',
        fragmentSummary: 'Measured temporal strain under inverted cobalt polarity.',
        faultLine: 'endurance_vs_collapse',
        worldRuleRef: 'wr_06',
        characterRef: 'char_indestructible'
      }
    ]
  ),
  buildChapter(
    'era_06',
    'SPIRE CONVERGENCE // RIOT CONVERGENCE',
    'Fragmented ensembles converge on the central transmitter spire as the 33-patch register aligns for broadcast.',
    'fn_12_serialization',
    [
      {
        id: 'ch06_sequence_patches',
        label: 'Sequence the 33-patch register',
        prompt: 'Align PATCH-01..PATCH-33 transitions deterministically without truncation.',
        nextEraSlot: 'era_07',
        narrativeFunctionId: 'fn_12_serialization',
        fragmentId: 'frag_06_patch_sequence',
        fragmentSummary: 'Sequenced 33-patch register alignment at RIOT CONVERGENCE.',
        faultLine: 'improvisation_vs_register',
        worldRuleRef: 'wr_10',
        characterRef: 'char_a_lah'
      },
      {
        id: 'ch06_broadcast_convergence',
        label: 'Broadcast the convergence pulse',
        prompt: 'Transmit across all districts and accept the shift in faction alignment.',
        nextEraSlot: 'era_07',
        narrativeFunctionId: 'fn_05_sound_design',
        fragmentId: 'frag_06_spire_pulse',
        fragmentSummary: 'Broadcasted convergence pulse from the central spire.',
        faultLine: 'signal_vs_consequence',
        worldRuleRef: 'wr_07',
        characterRef: 'char_dj_david'
      }
    ]
  ),
  buildChapter(
    'era_07',
    'HORIZON OPEN // NEXT PHASE',
    'Beyond the convergence spire, the MoonWitness XII cycle opens. The core mystery remains unknown; published and draft tiers stay stratified.',
    'fn_13_promoting',
    [
      {
        id: 'ch07_curate_signal',
        label: 'Curate the published signal',
        prompt: 'Present curated published artifacts while shielding draft and review layers.',
        nextEraSlot: null,
        narrativeFunctionId: 'fn_13_promoting',
        fragmentId: 'frag_07_curated_horizon',
        fragmentSummary: 'Curated published BEFORE LIGHT signal while quarantining draft eras.',
        faultLine: 'curation_vs_exposure',
        worldRuleRef: 'wr_08'
      },
      {
        id: 'ch07_seal_unknown',
        label: 'Seal the unknown dossier',
        prompt: 'Close the transmission loop while preserving the unknown mystery state.',
        nextEraSlot: null,
        narrativeFunctionId: 'fn_07_archiving',
        fragmentId: 'frag_07_unknown_seal',
        fragmentSummary: 'Sealed NEXT PHASE dossier with mysteryState preserved as unknown.',
        faultLine: 'closure_vs_mystery',
        worldRuleRef: 'wr_02'
      }
    ]
  )
] as const;

const CHAPTER_BY_SLOT = new Map<EraSlot, SignalChapter>(
  LOST_SIGNAL_CHAPTERS.map((chapter) => [chapter.eraSlot, chapter])
);

const sessionStore = new Map<string, LostSignalSession>();
let sessionCounter = 0;

function toSessionView(session: LostSignalSession): LostSignalSessionView {
  const currentChapter = CHAPTER_BY_SLOT.get(session.currentEraSlot);
  if (!currentChapter) {
    throw new Error(`Missing chapter for era slot ${session.currentEraSlot}`);
  }
  return {
    ...session,
    currentChapter,
    availableChoices: session.completed ? [] : currentChapter.choices
  };
}

export function getLostSignalManifest() {
  return {
    gameTitle: 'THE LOST SIGNAL',
    canonGovernance: 'CAN-0001..CAN-0015',
    lockedRulesCount: LOCKED_CANON_RULES.length,
    erasCount: LOST_SIGNAL_CHAPTERS.length,
    narrativeFunctionsCount: NARRATIVE_FUNCTIONS.length,
    worldRulesCount: WORLD_RULES.length,
    charactersCount: CHARACTER_REGISTRY.length,
    mysteryState: 'unknown' as const,
    chapters: LOST_SIGNAL_CHAPTERS
  };
}

export function createGameSession(
  playerAlias = 'Witness-00',
  visualPrompt?: string
): SessionActionResult {
  const normalizedAlias = playerAlias.trim().length > 0 ? playerAlias.trim() : 'Witness-00';

  const aliasVisualCheck = validateCan0011VisualBoundary(normalizedAlias);
  if (!aliasVisualCheck.allowed) {
    return {
      ok: false,
      statusCode: 422,
      rule: 'CAN-0011',
      error: aliasVisualCheck.reason ?? 'Blocked by CAN-0011 visual boundary.'
    };
  }

  if (visualPrompt && visualPrompt.trim().length > 0) {
    const promptCheck = validateCan0011VisualBoundary(visualPrompt);
    if (!promptCheck.allowed) {
      return {
        ok: false,
        statusCode: 422,
        rule: 'CAN-0011',
        error: promptCheck.reason ?? 'Blocked by CAN-0011 visual boundary.'
      };
    }
  }

  const aliasCheck = assertNoAliasAutoMerge(normalizedAlias);
  const startChapter = CHAPTER_BY_SLOT.get('era_00')!;
  const startFunction = getFunctionById(startChapter.defaultFunctionId);
  const now = new Date().toISOString();

  sessionCounter += 1;
  const id = `ls_${Date.now().toString(36)}_${sessionCounter.toString(36)}`;

  const session: LostSignalSession = {
    id,
    gameTitle: 'THE LOST SIGNAL',
    playerAlias: normalizedAlias,
    aliasAudit: {
      playerAlias: aliasCheck.alias,
      matchedCharacterIds: aliasCheck.matchedCharacterIds,
      autoMergeAllowed: false,
      rule: 'CAN-0004'
    },
    mysteryState: 'unknown',
    canonGovernance: 'CAN-0001..CAN-0015',
    currentEraSlot: startChapter.eraSlot,
    currentEraId: startChapter.eraId,
    currentEraStatus: startChapter.sourceStatus,
    activeNarrativeFunction: startFunction,
    unlockedEras: [
      {
        eraSlot: startChapter.eraSlot,
        eraId: startChapter.eraId,
        title: startChapter.eraTitle,
        sourceStatus: startChapter.sourceStatus
      }
    ],
    witnessedFragments: [],
    faultLines: [],
    visitedNarrativeFunctionIds: [startFunction.id],
    history: [],
    completed: false,
    createdAt: now,
    updatedAt: now
  };

  sessionStore.set(id, session);

  return {
    ok: true,
    statusCode: 201,
    session: toSessionView(session)
  };
}

export function getGameSession(id: string): LostSignalSessionView | null {
  const session = sessionStore.get(id);
  if (!session) {
    return null;
  }
  return toSessionView(session);
}

export function applyChoice(
  id: string,
  choiceId: string,
  visualPrompt?: string
): SessionActionResult {
  const existing = sessionStore.get(id);
  if (!existing) {
    return {
      ok: false,
      statusCode: 404,
      rule: 'CAN-0015',
      error: `Game session not found: ${id}`
    };
  }

  if (visualPrompt && visualPrompt.trim().length > 0) {
    const visualCheck = validateCan0011VisualBoundary(visualPrompt);
    if (!visualCheck.allowed) {
      return {
        ok: false,
        statusCode: 422,
        rule: 'CAN-0011',
        error: visualCheck.reason ?? 'Blocked by CAN-0011 visual boundary.'
      };
    }
  }

  if (existing.completed) {
    return {
      ok: false,
      statusCode: 422,
      rule: 'CAN-0015',
      error: 'Game session is already completed.'
    };
  }

  const currentChapter = CHAPTER_BY_SLOT.get(existing.currentEraSlot)!;
  const choice = currentChapter.choices.find((candidate) => candidate.id === choiceId);
  if (!choice) {
    return {
      ok: false,
      statusCode: 422,
      rule: 'CAN-0015',
      error: `Invalid choice '${choiceId}' for chapter ${existing.currentEraSlot}.`
    };
  }

  const now = new Date().toISOString();
  const nextFunction = getFunctionById(choice.narrativeFunctionId);
  const nextChapter = choice.nextEraSlot ? CHAPTER_BY_SLOT.get(choice.nextEraSlot)! : currentChapter;
  const isCompleted = choice.nextEraSlot === null;

  const unlockedEras = existing.unlockedEras.some((entry) => entry.eraSlot === nextChapter.eraSlot)
    ? existing.unlockedEras
    : [
        ...existing.unlockedEras,
        {
          eraSlot: nextChapter.eraSlot,
          eraId: nextChapter.eraId,
          title: nextChapter.eraTitle,
          sourceStatus: nextChapter.sourceStatus
        }
      ];

  const witnessedFragments = existing.witnessedFragments.some((frag) => frag.id === choice.fragmentId)
    ? existing.witnessedFragments
    : [
        ...existing.witnessedFragments,
        {
          id: choice.fragmentId,
          eraSlot: existing.currentEraSlot,
          narrativeFunctionId: choice.narrativeFunctionId,
          summary: choice.fragmentSummary,
          worldRuleRef: choice.worldRuleRef
        }
      ];

  const faultLines = existing.faultLines.includes(choice.faultLine)
    ? existing.faultLines
    : [...existing.faultLines, choice.faultLine];

  const visitedNarrativeFunctionIds = existing.visitedNarrativeFunctionIds.includes(nextFunction.id)
    ? existing.visitedNarrativeFunctionIds
    : [...existing.visitedNarrativeFunctionIds, nextFunction.id];

  const historyEntry: ChoiceHistoryEntry = {
    step: existing.history.length + 1,
    eraSlot: existing.currentEraSlot,
    choiceId: choice.id,
    label: choice.label,
    narrativeFunctionId: choice.narrativeFunctionId,
    faultLine: choice.faultLine,
    fragmentId: choice.fragmentId,
    timestamp: now
  };

  const updated: LostSignalSession = {
    ...existing,
    mysteryState: 'unknown',
    currentEraSlot: nextChapter.eraSlot,
    currentEraId: nextChapter.eraId,
    currentEraStatus: nextChapter.sourceStatus,
    activeNarrativeFunction: nextFunction,
    unlockedEras,
    witnessedFragments,
    faultLines,
    visitedNarrativeFunctionIds,
    history: [...existing.history, historyEntry],
    completed: isCompleted,
    updatedAt: now
  };

  sessionStore.set(id, updated);

  return {
    ok: true,
    statusCode: 200,
    session: toSessionView(updated),
    appliedChoice: historyEntry
  };
}

export function resetGameSessions(): void {
  sessionStore.clear();
  sessionCounter = 0;
}
