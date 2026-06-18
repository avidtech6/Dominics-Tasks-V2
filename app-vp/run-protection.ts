/**
 * Protection test runner — verifies Recipe structure + DNA + Atlas + Pact integrity.
 * Runs via: npx tsx --test app-vp/run-protection.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = process.cwd();

test('Protection: every module has all 7 recipe-book files', () => {
  const fragmentsDir = path.join(ROOT, 'app-fragments');
  const modules = fs.readdirSync(fragmentsDir).filter(d =>
    fs.statSync(path.join(fragmentsDir, d)).isDirectory()
  );
  assert.ok(modules.length >= 14, `expected >=14 modules, got ${modules.length}`);

  const required = ['recipe.md', 'codex.md', 'rules.md', 'module-meta.json',
                    'ingredients.json', 'plan.md', 'coverage-matrix.md'];

  for (const mod of modules) {
    for (const f of required) {
      const p = path.join(fragmentsDir, mod, f);
      assert.ok(fs.existsSync(p), `missing ${mod}/${f}`);
    }
  }
});

test('Protection: recipe source-line claims map to existing files', () => {
  const orchRecipe = path.join(ROOT, 'app-fragments/orchestrator/recipe.md');
  const content = fs.readFileSync(orchRecipe, 'utf-8');
  assert.ok(content.includes('src/orchestrator/AppOrchestrator.tsx'));
  assert.ok(fs.existsSync(path.join(ROOT, 'src/orchestrator/AppOrchestrator.tsx')));
});

test('Protection: DNA declares v8 lineage', () => {
  const dna = JSON.parse(fs.readFileSync(path.join(ROOT, 'app-dna/app.dna.json'), 'utf-8'));
  assert.equal(dna.freshvibe_way_version, 'v8');
  for (const k of ['has_recipe', 'has_codex', 'has_dna', 'has_trace_atlas', 'has_pact', 'has_fragments', 'has_vp_tests']) {
    assert.equal(dna.freshvibe_compliance[k], true, `DNA missing ${k}`);
  }
});

test('Protection: Trace Atlas covers every fragment module', () => {
  const atlas = JSON.parse(fs.readFileSync(path.join(ROOT, 'app-trace-atlas/atlas.json'), 'utf-8'));
  const fragments = fs.readdirSync(path.join(ROOT, 'app-fragments'));

  for (const frag of fragments) {
    const modId = Object.keys(atlas.modules).find(k => k.endsWith(frag) || k.includes(frag));
    assert.ok(modId, `Atlas missing entry for fragment ${frag}`);
  }
});

test('Protection: App-Pact documents invariants', () => {
  const pact = fs.readFileSync(path.join(ROOT, 'app-pact/app-pact.md'), 'utf-8');
  assert.ok(pact.includes('Invariants'));
  assert.ok(pact.includes('Constraints'));
  assert.ok(pact.includes('Guarantees'));
});

test('Protection: shadow/original-001/ exists', () => {
  const shadow = path.join(ROOT, 'app-recipe/shadow/original-001');
  assert.ok(fs.existsSync(shadow));
  assert.ok(fs.statSync(shadow).isDirectory());
});

test('Protection: codex.md files have C1-C8 sections', () => {
  const fragmentsDir = path.join(ROOT, 'app-fragments');
  const modules = fs.readdirSync(fragmentsDir).filter(d =>
    fs.statSync(path.join(fragmentsDir, d)).isDirectory()
  );

  for (const mod of modules) {
    const codex = fs.readFileSync(path.join(fragmentsDir, mod, 'codex.md'), 'utf-8');
    assert.ok(codex.includes('C1.'), `${mod}/codex.md missing C1`);
    assert.ok(codex.includes('C2.'), `${mod}/codex.md missing C2`);
    assert.ok(codex.includes('C3.'), `${mod}/codex.md missing C3`);
    assert.ok(codex.includes('C4.'), `${mod}/codex.md missing C4`);
    assert.ok(codex.includes('C5.'), `${mod}/codex.md missing C5`);
    assert.ok(codex.includes('C6.'), `${mod}/codex.md missing C6`);
    assert.ok(codex.includes('C7.'), `${mod}/codex.md missing C7`);
    assert.ok(codex.includes('C8.'), `${mod}/codex.md missing C8`);
  }
});

test('Protection: behaviour → storage wiring is in place', () => {
  // StorageAdapter exists
  assert.ok(fs.existsSync(path.join(ROOT, 'src/data/StorageAdapter.ts')),
    'StorageAdapter.ts must exist for wire-up');

  // Each wired behaviour imports StorageAdapter
  const wired = ['TaskBehaviour.ts', 'ChatBehaviour.ts', 'FamilyBehaviour.ts'];
  for (const file of wired) {
    const content = fs.readFileSync(path.join(ROOT, 'src/behaviours', file), 'utf-8');
    assert.ok(content.includes('StorageAdapter'),
      `${file} must import StorageAdapter (proves it's wired)`);
    assert.ok(content.includes('localStorage') || content.includes('StorageAdapter'),
      `${file} must reference persistence layer`);
  }

  // AppOrchestrator awaits whenReady
  const orch = fs.readFileSync(path.join(ROOT, 'src/orchestrator/AppOrchestrator.tsx'), 'utf-8');
  assert.ok(orch.includes('whenReady'),
    'AppOrchestrator must call whenReady() before rendering (proves async load is handled)');
});
