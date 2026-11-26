export type CanonStatus = 'draft' | 'review' | 'published';
export type CanonLevel = 'lore' | 'editorial' | 'workbench';

export interface CanonRule {
  readonly code: string;
  readonly title: string;
  readonly enforcement: 'hard-fail' | 'immutable';
  readonly description: string;
}

export interface MoonWitnessEra {
  readonly id: string;
  readonly order: number;
  readonly title: string;
  readonly status: CanonStatus;
  readonly summary: string;
  readonly corpusRefs: readonly string[];
}

export interface NarrativeFunction {
  readonly order: number;
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly status: CanonStatus;
}

export interface WorldRule {
  readonly id: string;
  readonly order: number;
  readonly title: string;
  readonly invariant: string;
  readonly status: CanonStatus;
}

export interface CharacterRecord {
  readonly id: string;
  readonly displayName: string;
  readonly aliases: readonly string[];
  readonly status: 'review';
  readonly canonLevel: 'lore';
  readonly autoMergeForbidden: true;
  readonly archetype: string;
  readonly summary: string;
  readonly corpusRefs: readonly string[];
}

export interface XiiCastMember {
  readonly id: string;
  readonly callsign: string;
  readonly role: string;
  readonly status: CanonStatus;
  readonly canonLevel: 'lore';
}

export interface PatchRegisterMetadata {
  readonly totalPatches: 33;
  readonly versionLine: 'MW-XII / V10';
  readonly namingConvention: string;
  readonly activeRange: string;
  readonly status: CanonStatus;
}

export const LOCKED_CANON_RULES: readonly CanonRule[] = [
  {
    code: 'CAN-0001',
    title: 'Immutable Status Stratification',
    enforcement: 'immutable',
    description: 'Never flatten draft, review, and published statuses into a single tier.'
  },
  {
    code: 'CAN-0002',
    title: 'Creative Fiction Isolation',
    enforcement: 'hard-fail',
    description: 'Keep creative fiction strictly separate from scripture and tafsir.'
  },
  {
    code: 'CAN-0003',
    title: 'Corpus SHA-256 Citation Only',
    enforcement: 'hard-fail',
    description: 'Cite mw-corpus SHA-256 references rather than copying raw scripture text.'
  },
  {
    code: 'CAN-0004',
    title: 'Character Alias Non-Auto-Merge',
    enforcement: 'hard-fail',
    description: 'Never auto-merge character aliases into real-world or religious figures.'
  },
  {
    code: 'CAN-0005',
    title: 'Lore Canon Level Tagging',
    enforcement: 'immutable',
    description: 'All fictional character registry entries remain tagged with canonLevel: lore.'
  },
  {
    code: 'CAN-0006',
    title: 'Era Sequence Continuity',
    enforcement: 'immutable',
    description: 'MoonWitness II maintains 8 ordered eras starting with BEFORE LIGHT (published).'
  },
  {
    code: 'CAN-0007',
    title: 'Narrative Function Completeness',
    enforcement: 'immutable',
    description: 'Maintain all 13 narrative functions from Storytelling through Promoting.'
  },
  {
    code: 'CAN-0008',
    title: 'World Rule Determinism',
    enforcement: 'immutable',
    description: 'Enforce the 10 foundational world rules across all creative scenes.'
  },
  {
    code: 'CAN-0009',
    title: 'Editorial Attribution Boundary',
    enforcement: 'hard-fail',
    description: 'Separate translationAttribution from personalReflection in editorial cards.'
  },
  {
    code: 'CAN-0010',
    title: 'Closing Dua Separation',
    enforcement: 'hard-fail',
    description: 'Keep closingDua in its dedicated field distinct from reflection and citation.'
  },
  {
    code: 'CAN-0011',
    title: 'Visual Boundary Guard',
    enforcement: 'hard-fail',
    description: 'Reject any visual depiction request of Allah, Prophet Muhammad, or Isa/Yesus.'
  },
  {
    code: 'CAN-0012',
    title: 'MW XII Cast Integrity',
    enforcement: 'immutable',
    description: 'Preserve ROCKSOUL, ISROCKFEEL, WALTERWHITE, and 4-LAH/THE BATTERIES cast records.'
  },
  {
    code: 'CAN-0013',
    title: '33-Patch Register Accountability',
    enforcement: 'immutable',
    description: 'Track MoonWitness XII 33-patch register metadata without silent truncation.'
  },
  {
    code: 'CAN-0014',
    title: 'Zero Implicit Canonicalization',
    enforcement: 'hard-fail',
    description: 'Draft and review records never self-promote to published without explicit governance.'
  },
  {
    code: 'CAN-0015',
    title: 'Audit Trail Determinism',
    enforcement: 'immutable',
    description: 'All canon endpoints return structured, deterministic JSON without mutating source state.'
  }
] as const;

export const MOONWITNESS_II_ERAS: readonly MoonWitnessEra[] = [
  {
    id: 'era_01_before_light',
    order: 1,
    title: 'BEFORE LIGHT',
    status: 'published',
    summary: 'Primordial stillness prior to the first signal fracture across the RockSoul horizon.',
    corpusRefs: []
  },
  {
    id: 'era_02_the_arrival',
    order: 2,
    title: 'THE ARRIVAL',
    status: 'draft',
    summary: 'First contact waves enter the dormant frequency lattice.',
    corpusRefs: []
  },
  {
    id: 'era_03_first_echo',
    order: 3,
    title: 'FIRST ECHO',
    status: 'draft',
    summary: 'Resonance patterns split into distinct factions and memory vaults.',
    corpusRefs: []
  },
  {
    id: 'era_04_electric_drift',
    order: 4,
    title: 'ELECTRIC DRIFT',
    status: 'draft',
    summary: 'Industrial static and forest harmonics collide across borderland relays.',
    corpusRefs: []
  },
  {
    id: 'era_05_shadow_circuit',
    order: 5,
    title: 'SHADOW CIRCUIT',
    status: 'draft',
    summary: 'Hidden broadcast channels rewrite local myths and alliances.',
    corpusRefs: []
  },
  {
    id: 'era_06_blue_inversion',
    order: 6,
    title: 'BLUE INVERSION',
    status: 'draft',
    summary: 'Signal polarity flips, forcing every witness to audit their own archive.',
    corpusRefs: []
  },
  {
    id: 'era_07_riot_convergence',
    order: 7,
    title: 'RIOT CONVERGENCE',
    status: 'draft',
    summary: 'Fragmented ensembles converge on the central transmitter spire.',
    corpusRefs: []
  },
  {
    id: 'era_08_next_phase',
    order: 8,
    title: 'NEXT PHASE',
    status: 'draft',
    summary: 'Post-convergence horizon opening into the MoonWitness XII cycle.',
    corpusRefs: []
  }
] as const;

export const NARRATIVE_FUNCTIONS: readonly NarrativeFunction[] = [
  { order: 1, id: 'fn_01_storytelling', name: 'Storytelling', role: 'Core mythic narrative progression and dramatic arc.', status: 'published' },
  { order: 2, id: 'fn_02_worldbuilding', name: 'Worldbuilding', role: 'Establishing spatial, sonic, and infrastructural rules of RockSoul.', status: 'published' },
  { order: 3, id: 'fn_03_character_study', name: 'Character Study', role: 'Exploring psychological tension and alias boundaries.', status: 'review' },
  { order: 4, id: 'fn_04_symbolism', name: 'Symbolism', role: 'Encoding recurring motifs without collapsing into literal dogma.', status: 'review' },
  { order: 5, id: 'fn_05_sound_design', name: 'Sound Design', role: 'Translating lore tension into rhythmic and acoustic identity.', status: 'draft' },
  { order: 6, id: 'fn_06_visual_direction', name: 'Visual Direction', role: 'Defining aesthetic framing strictly inside CAN-0011 boundaries.', status: 'review' },
  { order: 7, id: 'fn_07_archiving', name: 'Archiving', role: 'Indexing drafts, patch registers, and corpus reference pointers.', status: 'published' },
  { order: 8, id: 'fn_08_editorial_reflection', name: 'Editorial Reflection', role: 'Structuring GOD PROMISE cards with strict field separation.', status: 'published' },
  { order: 9, id: 'fn_09_continuity_audit', name: 'Continuity Audit', role: 'Verifying canon invariants across MW II, MW XII, and V10.', status: 'review' },
  { order: 10, id: 'fn_10_interactive_exploration', name: 'Interactive Exploration', role: 'Exposing browsable workbench views for canon inspection.', status: 'draft' },
  { order: 11, id: 'fn_11_community_dialogue', name: 'Community Dialogue', role: 'Framing open creative interpretation without altering locked canon.', status: 'draft' },
  { order: 12, id: 'fn_12_serialization', name: 'Serialization', role: 'Sequencing chapters and 33-patch releases across seasons.', status: 'draft' },
  { order: 13, id: 'fn_13_promoting', name: 'Promoting', role: 'Presenting curated published artifacts while shielding draft/review layers.', status: 'draft' }
] as const;

export const WORLD_RULES: readonly WorldRule[] = [
  { id: 'wr_01', order: 1, title: 'Signal Precedes Matter', invariant: 'Every major event in RockSoul leaves an acoustic or electromagnetic trace before physical change.', status: 'published' },
  { id: 'wr_02', order: 2, title: 'Memory Is Contested', invariant: 'No single faction holds an uncorrupted historical record outside verified archive hashes.', status: 'published' },
  { id: 'wr_03', order: 3, title: 'Aliases Are Masks, Not Identities', invariant: 'In-world callsigns never auto-resolve to external real-world or religious figures (CAN-0004).', status: 'published' },
  { id: 'wr_04', order: 4, title: 'Energy Demands Conduit', invariant: 'High-output manifestations require physical battery arrays or resonant relays.', status: 'review' },
  { id: 'wr_05', order: 5, title: 'The Forest Remembers Voltage', invariant: 'Electric Forest corridors retain residual charge from past transmissions.', status: 'review' },
  { id: 'wr_06', order: 6, title: 'No Absolute Invulnerability', invariant: 'Even figures dubbed Indestructible carry structural or temporal costs.', status: 'review' },
  { id: 'wr_07', order: 7, title: 'Broadcasts Carry Consequence', invariant: 'Public transmissions alter faction alignment across all listening districts.', status: 'draft' },
  { id: 'wr_08', order: 8, title: 'Draft Realities Remain Quarantined', invariant: 'Unpublished timeline branches cannot overwrite BEFORE LIGHT continuity.', status: 'published' },
  { id: 'wr_09', order: 9, title: 'Sacred Visual Boundary', invariant: 'In-world and workbench visual pipelines enforce CAN-0011 without exception.', status: 'published' },
  { id: 'wr_10', order: 10, title: 'Patch Register Continuity', invariant: 'MW XII narrative state transitions map deterministically to the 33-patch register.', status: 'draft' }
] as const;

export const CHARACTER_REGISTRY: readonly CharacterRecord[] = [
  {
    id: 'char_the_shadow',
    displayName: 'The Shadow',
    aliases: ['Shadow Signal', 'Zero-Phase'],
    status: 'review',
    canonLevel: 'lore',
    autoMergeForbidden: true,
    archetype: 'Clandestine Signal Observer',
    summary: 'Operates in the blind spots of the RockSoul relay grid, cataloguing erased transmissions.',
    corpusRefs: []
  },
  {
    id: 'char_a_lah',
    displayName: 'A-LAH',
    aliases: ['4-LAH', 'Circuit-Four'],
    status: 'review',
    canonLevel: 'lore',
    autoMergeForbidden: true,
    archetype: 'Fictional Lore Construct',
    summary: 'Strictly fictional narrative construct within the MoonWitness lore registry; CAN-0004 forbids any auto-merge with real or religious figures.',
    corpusRefs: []
  },
  {
    id: 'char_dogs_from_universe',
    displayName: 'Dogs From Universe',
    aliases: ['Cosmic Pack', 'Orbital Hounds'],
    status: 'review',
    canonLevel: 'lore',
    autoMergeForbidden: true,
    archetype: 'Nomadic Void Trackers',
    summary: 'Interstellar scouts drawn to high-amplitude resonance anomalies.',
    corpusRefs: []
  },
  {
    id: 'char_blue_witch',
    displayName: 'Blue Witch',
    aliases: ['Cobalt Weaver', 'Frequency Hex'],
    status: 'review',
    canonLevel: 'lore',
    autoMergeForbidden: true,
    archetype: 'Harmonic Inversion Specialist',
    summary: 'Manipulates cobalt-band interference to shield hidden enclaves.',
    corpusRefs: []
  },
  {
    id: 'char_dj_david',
    displayName: 'DJ David',
    aliases: ['Selector-D', 'Turntable Architect'],
    status: 'review',
    canonLevel: 'lore',
    autoMergeForbidden: true,
    archetype: 'Broadcast Curatorial Operator',
    summary: 'Fictional pirate-radio strategist orchestrating citywide tempo shifts; never auto-merged with historical or religious figures.',
    corpusRefs: []
  },
  {
    id: 'char_walter_white',
    displayName: 'Walter White',
    aliases: ['WALTERWHITE', 'Alchemist-99'],
    status: 'review',
    canonLevel: 'lore',
    autoMergeForbidden: true,
    archetype: 'Synthetic Compound Tactician',
    summary: 'Fictional MoonWitness lore persona focused on volatile energy synthesis; isolated from external franchises.',
    corpusRefs: []
  },
  {
    id: 'char_electric_forest',
    displayName: 'Electric Forest',
    aliases: ['Volt Canopy', 'Static Woods'],
    status: 'review',
    canonLevel: 'lore',
    autoMergeForbidden: true,
    archetype: 'Living Electromagnetic Biome',
    summary: 'Sentient conductive woodland acting as both sanctuary and natural amplifier.',
    corpusRefs: []
  },
  {
    id: 'char_indestructible',
    displayName: 'Indestructible',
    aliases: ['Iron-Hull', 'Unbroken'],
    status: 'review',
    canonLevel: 'lore',
    autoMergeForbidden: true,
    archetype: 'Endurance Vanguard',
    summary: 'Frontline sentinel engineered to survive high-voltage convergence storms.',
    corpusRefs: []
  },
  {
    id: 'char_jhnny_depp',
    displayName: 'Jhnny Depp',
    aliases: ['J-Mask', 'Drifter-Zero'],
    status: 'review',
    canonLevel: 'lore',
    autoMergeForbidden: true,
    archetype: 'Chameleon Stage Persona',
    summary: 'Fictional stage-craft drifter in the RockSoul underground; CAN-0004 forbids auto-merging with real-world actors.',
    corpusRefs: []
  }
] as const;

export const MOONWITNESS_XII_CAST: readonly XiiCastMember[] = [
  { id: 'xii_rocksoul', callsign: 'ROCKSOUL', role: 'Primary Resonance Catalyst', status: 'review', canonLevel: 'lore' },
  { id: 'xii_isrockfeel', callsign: 'ISROCKFEEL', role: 'Empathic Frequency Mirror', status: 'review', canonLevel: 'lore' },
  { id: 'xii_walterwhite', callsign: 'WALTERWHITE', role: 'Volatility & Synthesis Strategist', status: 'review', canonLevel: 'lore' },
  { id: 'xii_4lah_batteries', callsign: '4-LAH/THE BATTERIES', role: 'Distributed Power Conduit Ensemble', status: 'review', canonLevel: 'lore' }
] as const;

export const PATCH_REGISTER_METADATA: PatchRegisterMetadata = {
  totalPatches: 33,
  versionLine: 'MW-XII / V10',
  namingConvention: 'PATCH-01 .. PATCH-33',
  activeRange: '01-33',
  status: 'draft'
} as const;

export function getCharacterById(characterId: string): CharacterRecord | undefined {
  return CHARACTER_REGISTRY.find((record) => record.id === characterId);
}

export function assertNoAliasAutoMerge(alias: string): {
  readonly alias: string;
  readonly matchedCharacterIds: readonly string[];
  readonly autoMergeAllowed: false;
  readonly rule: 'CAN-0004';
} {
  const normalized = alias.trim().toLowerCase();
  const matchedCharacterIds = CHARACTER_REGISTRY.filter((record) =>
    record.aliases.some((candidate) => candidate.toLowerCase() === normalized) ||
    record.displayName.toLowerCase() === normalized
  ).map((record) => record.id);

  return {
    alias,
    matchedCharacterIds,
    autoMergeAllowed: false,
    rule: 'CAN-0004'
  };
}
