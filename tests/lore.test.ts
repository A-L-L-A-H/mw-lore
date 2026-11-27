import { describe, expect, test } from 'bun:test';
import {
  CHARACTER_REGISTRY,
  LOCKED_CANON_RULES,
  MOONWITNESS_II_ERAS,
  MOONWITNESS_XII_CAST,
  NARRATIVE_FUNCTIONS,
  PATCH_REGISTER_METADATA,
  WORLD_RULES,
  assertNoAliasAutoMerge
} from '../src/canon-data';
import {
  validateAndRenderGodPromiseCard,
  validateCan0011VisualBoundary
} from '../src/god-promise';
import {
  LOST_SIGNAL_CHAPTERS,
  applyChoice,
  createGameSession,
  getGameSession,
  resetGameSessions
} from '../src/lost-signal';
import { handleRequest } from '../src/server';
import {
  GENESIS_HASH,
  getLoreProvenanceById,
  verifyProvenanceChain
} from '../src/provenance';

const VALID_CORPUS_REF =
  'mw-corpus:sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('MoonWitness Canon Data (CAN-0001..CAN-0015)', () => {
  test('enforces 15 locked canon rules', () => {
    expect(LOCKED_CANON_RULES).toHaveLength(15);
    expect(LOCKED_CANON_RULES[0].code).toBe('CAN-0001');
    expect(LOCKED_CANON_RULES[14].code).toBe('CAN-0015');
  });

  test('preserves all 8 MoonWitness II eras without flattening statuses', () => {
    expect(MOONWITNESS_II_ERAS).toHaveLength(8);
    expect(MOONWITNESS_II_ERAS[0].title).toBe('BEFORE LIGHT');
    expect(MOONWITNESS_II_ERAS[0].status).toBe('published');
    expect(MOONWITNESS_II_ERAS[1].title).toBe('THE ARRIVAL');
    expect(MOONWITNESS_II_ERAS[7].title).toBe('NEXT PHASE');

    const draftEras = MOONWITNESS_II_ERAS.slice(1);
    expect(draftEras).toHaveLength(7);
    for (const era of draftEras) {
      expect(era.status).toBe('draft');
    }
  });

  test('contains all 13 narrative functions from Storytelling to Promoting', () => {
    expect(NARRATIVE_FUNCTIONS).toHaveLength(13);
    expect(NARRATIVE_FUNCTIONS[0].name).toBe('Storytelling');
    expect(NARRATIVE_FUNCTIONS[12].name).toBe('Promoting');
  });

  test('contains all 10 world rules', () => {
    expect(WORLD_RULES).toHaveLength(10);
  });

  test('preserves all 9 character registry entries with review status, lore canonLevel, and CAN-0004 non-auto-merge', () => {
    const expectedIds = [
      'char_the_shadow',
      'char_a_lah',
      'char_dogs_from_universe',
      'char_blue_witch',
      'char_dj_david',
      'char_walter_white',
      'char_electric_forest',
      'char_indestructible',
      'char_jhnny_depp'
    ];

    expect(CHARACTER_REGISTRY.map((entry) => entry.id)).toEqual(expectedIds);

    for (const entry of CHARACTER_REGISTRY) {
      expect(entry.status).toBe('review');
      expect(entry.canonLevel).toBe('lore');
      expect(entry.autoMergeForbidden).toBe(true);
      expect(entry.aliases.length).toBeGreaterThan(0);
    }

    const aliasCheck = assertNoAliasAutoMerge('4-LAH');
    expect(aliasCheck.autoMergeAllowed).toBe(false);
    expect(aliasCheck.rule).toBe('CAN-0004');
    expect(aliasCheck.matchedCharacterIds).toEqual(['char_a_lah']);
  });

  test('preserves MoonWitness XII cast and 33-patch register metadata', () => {
    expect(MOONWITNESS_XII_CAST.map((member) => member.callsign)).toEqual([
      'ROCKSOUL',
      'ISROCKFEEL',
      'WALTERWHITE',
      '4-LAH/THE BATTERIES'
    ]);
    expect(PATCH_REGISTER_METADATA.totalPatches).toBe(33);
  });
});

describe('CAN-0011 Visual Boundary & GOD PROMISE Workbench', () => {
  test('rejects visual depiction requests of Allah, Prophet Muhammad, or Isa/Yesus', () => {
    expect(validateCan0011VisualBoundary('Portrait of Allah in gold light').allowed).toBe(false);
    expect(validateCan0011VisualBoundary('Illustration of Prophet Muhammad').allowed).toBe(false);
    expect(validateCan0011VisualBoundary('Painting of Isa in the desert').allowed).toBe(false);
    expect(validateCan0011VisualBoundary('Sketch of Yesus').allowed).toBe(false);
    expect(validateCan0011VisualBoundary('Abstract neon radio tower in Electric Forest').allowed).toBe(true);
  });

  test('validates and renders separated GOD PROMISE reflection card', () => {
    const result = validateAndRenderGodPromiseCard({
      title: 'Steadfastness Under Signal Noise',
      corpusRef: VALID_CORPUS_REF,
      translationAttribution: 'Referenced via mw-corpus editorial translation index #12.',
      personalReflection: 'Patience holds the frequency steady when external static rises.',
      closingDua: 'May clarity and mercy guide every step forward.',
      visualPrompt: 'Minimalist geometric starlight pattern over dark slate.'
    });

    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.renderedHtml).toContain('data-field="corpusRef"');
    expect(result.renderedHtml).toContain('data-field="translationAttribution"');
    expect(result.renderedHtml).toContain('data-field="personalReflection"');
    expect(result.renderedHtml).toContain('data-field="closingDua"');
  });

  test('rejects raw scripture in corpusRef and blocks CAN-0011 violation in visualPrompt', () => {
    const result = validateAndRenderGodPromiseCard({
      title: 'Invalid Card',
      corpusRef: 'Raw copied scripture text instead of SHA-256 ref',
      translationAttribution: 'Same text',
      personalReflection: 'Same text',
      closingDua: 'Same text',
      visualPrompt: 'Draw a portrait of Prophet Muhammad'
    });

    expect(result.valid).toBe(false);
    const rules = result.issues.map((issue) => issue.rule);
    expect(rules).toContain('CAN-0003');
    expect(rules).toContain('CAN-0009');
    expect(rules).toContain('CAN-0010');
    expect(rules).toContain('CAN-0011');
  });
});

describe('HTTP Server Endpoints', () => {
  test('serves /health, /api/eras, /api/functions, /api/world-rules, /api/characters, /api/xii, and /', async () => {
    const healthResp = await handleRequest(new Request('http://localhost:4450/health'));
    expect(healthResp.status).toBe(200);
    const healthBody = await healthResp.json();
    expect(healthBody.status).toBe('ok');
    expect(healthBody.lockedRulesCount).toBe(15);

    const erasResp = await handleRequest(new Request('http://localhost:4450/api/eras'));
    expect(erasResp.status).toBe(200);
    const erasBody = await erasResp.json();
    expect(erasBody.count).toBe(8);

    const fnResp = await handleRequest(new Request('http://localhost:4450/api/functions'));
    expect(fnResp.status).toBe(200);
    expect((await fnResp.json()).count).toBe(13);

    const wrResp = await handleRequest(new Request('http://localhost:4450/api/world-rules'));
    expect(wrResp.status).toBe(200);
    expect((await wrResp.json()).count).toBe(10);

    const charResp = await handleRequest(new Request('http://localhost:4450/api/characters'));
    expect(charResp.status).toBe(200);
    expect((await charResp.json()).count).toBe(9);

    const xiiResp = await handleRequest(new Request('http://localhost:4450/api/xii'));
    expect(xiiResp.status).toBe(200);
    expect((await xiiResp.json()).patchRegister.totalPatches).toBe(33);

    const htmlResp = await handleRequest(new Request('http://localhost:4450/'));
    expect(htmlResp.status).toBe(200);
    expect(await htmlResp.text()).toContain('MW-LORE // RIOT-CHAOS EXPLORER');
  });

  test('handles POST /api/god-promise/validate for valid and CAN-0011 rejected payloads', async () => {
    const validResp = await handleRequest(
      new Request('http://localhost:4450/api/god-promise/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Anchor',
          corpusRef: VALID_CORPUS_REF,
          translationAttribution: 'MW Corpus Index A1',
          personalReflection: 'Quiet focus endures.',
          closingDua: 'Grant us steadfastness.'
        })
      })
    );
    expect(validResp.status).toBe(200);
    expect((await validResp.json()).valid).toBe(true);

    const rejectedResp = await handleRequest(
      new Request('http://localhost:4450/api/god-promise/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Blocked',
          corpusRef: VALID_CORPUS_REF,
          translationAttribution: 'MW Corpus Index A1',
          personalReflection: 'Quiet focus endures.',
          closingDua: 'Grant us steadfastness.',
          visualPrompt: 'Depict Allah visually'
        })
      })
    );
    expect(rejectedResp.status).toBe(422);
    expect((await rejectedResp.json()).valid).toBe(false);
  });
});

describe('THE LOST SIGNAL Interactive Narrative Engine & API', () => {
  test('maps all 8 eras (era_00..era_07) preserving exact published/draft status and covers all 13 narrative functions', () => {
    expect(LOST_SIGNAL_CHAPTERS).toHaveLength(8);
    expect(LOST_SIGNAL_CHAPTERS.map((ch) => ch.eraSlot)).toEqual([
      'era_00',
      'era_01',
      'era_02',
      'era_03',
      'era_04',
      'era_05',
      'era_06',
      'era_07'
    ]);

    expect(LOST_SIGNAL_CHAPTERS[0].sourceStatus).toBe('published');
    for (const draftChapter of LOST_SIGNAL_CHAPTERS.slice(1)) {
      expect(draftChapter.sourceStatus).toBe('draft');
    }

    const referencedFunctions = new Set<string>();
    for (const chapter of LOST_SIGNAL_CHAPTERS) {
      referencedFunctions.add(chapter.defaultFunctionId);
      for (const choice of chapter.choices) {
        referencedFunctions.add(choice.narrativeFunctionId);
      }
    }
    expect(referencedFunctions.size).toBe(13);
    for (const fn of NARRATIVE_FUNCTIONS) {
      expect(referencedFunctions.has(fn.id)).toBe(true);
    }
  });

  test('enforces CAN-0004 alias coexistence without auto-merging, unknown mysteryState, and CAN-0011 visual boundary', () => {
    resetGameSessions();

    const created = createGameSession('4-LAH');
    expect(created.ok).toBe(true);
    expect(created.session?.aliasAudit.autoMergeAllowed).toBe(false);
    expect(created.session?.aliasAudit.rule).toBe('CAN-0004');
    expect(created.session?.aliasAudit.matchedCharacterIds).toEqual(['char_a_lah']);
    expect(created.session?.mysteryState).toBe('unknown');

    const blockedCreate = createGameSession('Witness-01', 'Portrait of Prophet Muhammad');
    expect(blockedCreate.ok).toBe(false);
    expect(blockedCreate.statusCode).toBe(422);
    expect(blockedCreate.rule).toBe('CAN-0011');

    const blockedChoice = applyChoice(created.session!.id, 'ch00_tune_horizon', 'Draw Allah');
    expect(blockedChoice.ok).toBe(false);
    expect(blockedChoice.statusCode).toBe(422);
    expect(blockedChoice.rule).toBe('CAN-0011');
  });

  test('traverses era_00..era_07 via HTTP API and renders playable chapter card at /', async () => {
    resetGameSessions();

    const htmlResp = await handleRequest(new Request('http://localhost:4450/'));
    const html = await htmlResp.text();
    expect(html).toContain('THE LOST SIGNAL // PLAYABLE CHAPTER CARD');
    expect(html).toContain('/api/game/session');

    const createResp = await handleRequest(
      new Request('http://localhost:4450/api/game/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ playerAlias: 'The Shadow' })
      })
    );
    expect(createResp.status).toBe(201);
    const createdBody = await createResp.json();
    const sessionId = createdBody.session.id as string;
    expect(createdBody.session.currentEraSlot).toBe('era_00');
    expect(createdBody.session.currentEraStatus).toBe('published');
    expect(createdBody.session.mysteryState).toBe('unknown');

    const getResp = await handleRequest(new Request(`http://localhost:4450/api/game/session/${sessionId}`));
    expect(getResp.status).toBe(200);
    expect((await getResp.json()).session.id).toBe(sessionId);

    const pathChoices = [
      'ch00_tune_horizon',
      'ch01_log_callsigns',
      'ch02_isolate_harmonics',
      'ch03_archive_voltage',
      'ch04_audit_splice',
      'ch05_open_channel',
      'ch06_sequence_patches',
      'ch07_curate_signal'
    ];

    let lastSession = createdBody.session;
    for (const choiceId of pathChoices) {
      const choiceResp = await handleRequest(
        new Request(`http://localhost:4450/api/game/session/${sessionId}/choice`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ choiceId })
        })
      );
      expect(choiceResp.status).toBe(200);
      const choiceBody = await choiceResp.json();
      lastSession = choiceBody.session;
      expect(lastSession.mysteryState).toBe('unknown');
    }

    expect(lastSession.completed).toBe(true);
    expect(lastSession.unlockedEras).toHaveLength(8);
    expect(lastSession.unlockedEras[0].sourceStatus).toBe('published');
    expect(lastSession.unlockedEras[7].sourceStatus).toBe('draft');
    expect(lastSession.witnessedFragments).toHaveLength(8);
    expect(lastSession.faultLines).toHaveLength(8);
    expect(lastSession.activeNarrativeFunction.name).toBe('Promoting');
    expect(getGameSession(sessionId)?.completed).toBe(true);

    const missingResp = await handleRequest(new Request('http://localhost:4450/api/game/session/nonexistent'));
    expect(missingResp.status).toBe(404);
  });

  test('serves GET /api/lore/provenance/:id with deterministic SHA-256 citation chain', async () => {
    const direct = getLoreProvenanceById('era_01_before_light');
    expect(direct).toBeDefined();
    expect(direct?.verified).toBe(true);
    expect(direct?.rootGenesisHash).toBe(GENESIS_HASH);
    expect(direct?.citationChain).toHaveLength(3);
    expect(verifyProvenanceChain(direct!.citationChain)).toBe(true);

    const resp = await handleRequest(
      new Request('http://localhost:4450/api/lore/provenance/char_the_shadow')
    );
    expect(resp.status).toBe(200);
    const body = await resp.json();
    expect(body.ok).toBe(true);
    expect(body.provenance.id).toBe('char_the_shadow');
    expect(body.provenance.kind).toBe('character');
    expect(body.provenance.verified).toBe(true);
    expect(body.provenance.leafChainHash).toMatch(/^[a-f0-9]{64}$/);

    const notFound = await handleRequest(
      new Request('http://localhost:4450/api/lore/provenance/unknown_entity_id')
    );
    expect(notFound.status).toBe(404);
  });
});
