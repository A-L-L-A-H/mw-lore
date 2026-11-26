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
import { handleRequest } from '../src/server';

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
