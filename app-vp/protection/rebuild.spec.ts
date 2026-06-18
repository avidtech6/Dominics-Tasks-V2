/**
 * Protection tests — Recipe rebuild verification
 *
 * These tests verify that the Recipe (app-fragments/) + doctrine + source
 * can rebuild the app. They don't run the build (that's slow); they verify
 * the Recipe is internally consistent.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

describe('Recipe rebuild (protection)', () => {
  // Phase 7.2: Rebuild test — verify Recipe structure
  it('every module has all 7 recipe-book files', () => {
    const fragmentsDir = path.join(ROOT, 'app-fragments');
    const modules = fs.readdirSync(fragmentsDir).filter(d =>
      fs.statSync(path.join(fragmentsDir, d)).isDirectory()
    );

    const required = ['recipe.md', 'codex.md', 'rules.md', 'module-meta.json',
                     'ingredients.json', 'plan.md', 'coverage-matrix.md'];

    expect(modules.length).toBeGreaterThanOrEqual(14);

    for (const mod of modules) {
      for (const f of required) {
        const p = path.join(fragmentsDir, mod, f);
        expect(fs.existsSync(p)).toBe(true);
      }
    }
  });

  // Phase 7.2: Drift test — verify source files still exist where recipe claims
  it('recipe source-line claims map to existing files', () => {
    // Pick the orchestrator and verify its claimed source exists
    const orchRecipe = path.join(ROOT, 'app-fragments/orchestrator/recipe.md');
    const content = fs.readFileSync(orchRecipe, 'utf-8');
    expect(content).toContain('src/orchestrator/AppOrchestrator.tsx');
    expect(fs.existsSync(path.join(ROOT, 'src/orchestrator/AppOrchestrator.tsx'))).toBe(true);
  });

  // Phase 7.2: Lineage test — verify DNA is consistent
  it('DNA declares v8 lineage', () => {
    const dna = JSON.parse(fs.readFileSync(path.join(ROOT, 'app-dna/app.dna.json'), 'utf-8'));
    expect(dna.freshvibe_way_version).toBe('v8');
    expect(dna.freshvibe_compliance.has_recipe).toBe(true);
    expect(dna.freshvibe_compliance.has_codex).toBe(true);
    expect(dna.freshvibe_compliance.has_dna).toBe(true);
    expect(dna.freshvibe_compliance.has_trace_atlas).toBe(true);
    expect(dna.freshvibe_compliance.has_pact).toBe(true);
    expect(dna.freshvibe_compliance.has_fragments).toBe(true);
    expect(dna.freshvibe_compliance.has_vp_tests).toBe(true);
  });

  // Phase 7.2: Atlas test — verify every module has trace atlas entry
  it('Trace Atlas covers every fragment module', () => {
    const atlas = JSON.parse(fs.readFileSync(path.join(ROOT, 'app-trace-atlas/atlas.json'), 'utf-8'));
    const fragments = fs.readdirSync(path.join(ROOT, 'app-fragments'));

    for (const frag of fragments) {
      const modId = Object.keys(atlas.modules).find(k => k.endsWith(frag) || k.includes(frag));
      expect(modId).toBeDefined();
    }
  });

  // Phase 7.2: Pact test — invariants are documented
  it('App-Pact documents invariants', () => {
    const pact = fs.readFileSync(path.join(ROOT, 'app-pact/app-pact.md'), 'utf-8');
    expect(pact).toContain('Invariants');
    expect(pact).toContain('Constraints');
    expect(pact).toContain('Guarantees');
  });

  // Phase 7.2: Shadow test — original snapshot exists
  it('shadow/original-001/ exists', () => {
    const shadow = path.join(ROOT, 'app-recipe/shadow/original-001');
    expect(fs.existsSync(shadow)).toBe(true);
    expect(fs.statSync(shadow).isDirectory()).toBe(true);
  });
});
