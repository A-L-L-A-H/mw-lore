import { createHash } from 'node:crypto';
import {
  CHARACTER_REGISTRY,
  MOONWITNESS_II_ERAS,
  MOONWITNESS_XII_CAST,
  NARRATIVE_FUNCTIONS,
  WORLD_RULES,
  type CanonStatus,
} from './canon-data';

export interface ProvenanceChainLink {
  readonly index: number;
  readonly step: string;
  readonly rule: string;
  readonly payloadHash: string;
  readonly previousHash: string;
  readonly chainHash: string;
}

export interface LoreProvenanceRecord {
  readonly id: string;
  readonly kind: 'era' | 'character' | 'world_rule' | 'narrative_function' | 'xii_cast';
  readonly title: string;
  readonly status: CanonStatus;
  readonly canonLevel: 'lore';
  readonly autoMergeForbidden: true;
  readonly corpusRefs: readonly string[];
  readonly rootGenesisHash: string;
  readonly leafChainHash: string;
  readonly verified: boolean;
  readonly citationChain: readonly ProvenanceChainLink[];
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

const GENESIS_SEED = 'mw-lore:genesis:CAN-0001..CAN-0015';
export const GENESIS_HASH = sha256Hex(GENESIS_SEED);

function buildCitationChain(params: {
  id: string;
  kind: LoreProvenanceRecord['kind'];
  title: string;
  status: CanonStatus;
  summary: string;
  corpusRefs: readonly string[];
}): LoreProvenanceRecord {
  const steps: Array<{ step: string; rule: string; payload: string }> = [
    {
      step: 'canon_identity_anchor',
      rule: 'CAN-0001,CAN-0005',
      payload: JSON.stringify({
        id: params.id,
        kind: params.kind,
        title: params.title,
        status: params.status,
        canonLevel: 'lore',
      }),
    },
    {
      step: 'fiction_isolation_and_alias_guard',
      rule: 'CAN-0002,CAN-0004',
      payload: JSON.stringify({
        id: params.id,
        autoMergeForbidden: true,
        summary: params.summary,
      }),
    },
    {
      step: 'corpus_citation_binding',
      rule: 'CAN-0003,CAN-0015',
      payload: JSON.stringify({
        id: params.id,
        corpusRefs: params.corpusRefs,
      }),
    },
  ];

  const chain: ProvenanceChainLink[] = [];
  let prevHash = GENESIS_HASH;

  for (let i = 0; i < steps.length; i++) {
    const current = steps[i]!;
    const payloadHash = sha256Hex(current.payload);
    const chainHash = sha256Hex(`${prevHash}:${current.step}:${current.rule}:${payloadHash}`);
    chain.push({
      index: i,
      step: current.step,
      rule: current.rule,
      payloadHash,
      previousHash: prevHash,
      chainHash,
    });
    prevHash = chainHash;
  }

  return {
    id: params.id,
    kind: params.kind,
    title: params.title,
    status: params.status,
    canonLevel: 'lore',
    autoMergeForbidden: true,
    corpusRefs: params.corpusRefs,
    rootGenesisHash: GENESIS_HASH,
    leafChainHash: prevHash,
    verified: verifyProvenanceChain(chain, GENESIS_HASH),
    citationChain: chain,
  };
}

export function verifyProvenanceChain(
  chain: readonly ProvenanceChainLink[],
  genesisHash = GENESIS_HASH
): boolean {
  if (chain.length === 0) return false;
  let expectedPrev = genesisHash;
  for (let i = 0; i < chain.length; i++) {
    const link = chain[i]!;
    if (link.index !== i) return false;
    if (link.previousHash !== expectedPrev) return false;
    const recomputed = sha256Hex(
      `${link.previousHash}:${link.step}:${link.rule}:${link.payloadHash}`
    );
    if (recomputed !== link.chainHash) return false;
    expectedPrev = link.chainHash;
  }
  return true;
}

export function getLoreProvenanceById(rawId: string): LoreProvenanceRecord | undefined {
  const id = rawId.trim();
  if (!id) return undefined;

  const era = MOONWITNESS_II_ERAS.find((item) => item.id === id);
  if (era) {
    return buildCitationChain({
      id: era.id,
      kind: 'era',
      title: era.title,
      status: era.status,
      summary: era.summary,
      corpusRefs: era.corpusRefs,
    });
  }

  const character = CHARACTER_REGISTRY.find((item) => item.id === id);
  if (character) {
    return buildCitationChain({
      id: character.id,
      kind: 'character',
      title: character.displayName,
      status: character.status,
      summary: character.summary,
      corpusRefs: character.corpusRefs,
    });
  }

  const worldRule = WORLD_RULES.find((item) => item.id === id);
  if (worldRule) {
    return buildCitationChain({
      id: worldRule.id,
      kind: 'world_rule',
      title: worldRule.title,
      status: worldRule.status,
      summary: worldRule.invariant,
      corpusRefs: [],
    });
  }

  const narrativeFn = NARRATIVE_FUNCTIONS.find((item) => item.id === id);
  if (narrativeFn) {
    return buildCitationChain({
      id: narrativeFn.id,
      kind: 'narrative_function',
      title: narrativeFn.name,
      status: narrativeFn.status,
      summary: narrativeFn.role,
      corpusRefs: [],
    });
  }

  const xiiMember = MOONWITNESS_XII_CAST.find((item) => item.id === id);
  if (xiiMember) {
    return buildCitationChain({
      id: xiiMember.id,
      kind: 'xii_cast',
      title: xiiMember.callsign,
      status: xiiMember.status,
      summary: xiiMember.role,
      corpusRefs: [],
    });
  }

  return undefined;
}
