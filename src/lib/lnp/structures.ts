/** Structure-data helpers: SMILES → 3D SDF, SDF parsing, PDB backbone parsing. */

export interface Atom3D {
  el: string;
  x: number;
  y: number;
  z: number;
}
export interface Bond3D {
  a: number;
  b: number;
  order: number;
}
export interface Molecule3D {
  atoms: Atom3D[];
  bonds: Bond3D[];
}

/** NCI CADD resolver returns a 3D-embedded SDF for a SMILES string. */
export function smilesSdfUrl(smiles: string) {
  return `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(smiles)}/file?format=sdf&get3d=true`;
}

export function parseSdf(text: string): Molecule3D {
  const lines = text.split(/\r?\n/);
  const counts = lines[3] ?? "";
  const nAtoms = parseInt(counts.slice(0, 3), 10);
  const nBonds = parseInt(counts.slice(3, 6), 10);
  if (!Number.isFinite(nAtoms) || !Number.isFinite(nBonds)) throw new Error("Unreadable SDF");

  const atoms: Atom3D[] = [];
  for (let i = 0; i < nAtoms; i++) {
    const l = lines[4 + i] ?? "";
    atoms.push({
      x: parseFloat(l.slice(0, 10)),
      y: parseFloat(l.slice(10, 20)),
      z: parseFloat(l.slice(20, 30)),
      el: l.slice(31, 34).trim(),
    });
  }
  const bonds: Bond3D[] = [];
  for (let i = 0; i < nBonds; i++) {
    const l = lines[4 + nAtoms + i] ?? "";
    bonds.push({
      a: parseInt(l.slice(0, 3), 10) - 1,
      b: parseInt(l.slice(3, 6), 10) - 1,
      order: parseInt(l.slice(6, 9), 10) || 1,
    });
  }
  return { atoms, bonds };
}

export const ELEMENT_COLORS: Record<string, number> = {
  C: 0x4b5563,
  H: 0xd8dee6,
  N: 0x2f6f9f,
  O: 0xb5482f,
  S: 0xc08a2a,
  P: 0xd08a3a,
  F: 0x4a9a7a,
  Cl: 0x4a9a5a,
};
export const ELEMENT_RADII: Record<string, number> = { H: 0.24, C: 0.36, N: 0.36, O: 0.35, S: 0.42, P: 0.44 };

export interface Residue {
  seq: number;
  name: string;
  x: number;
  y: number;
  z: number;
}

/** Cα trace for one chain of a PDB entry. */
export function parsePdbCA(text: string, chain = "A"): Residue[] {
  const out: Residue[] = [];
  for (const l of text.split(/\r?\n/)) {
    if (!l.startsWith("ATOM")) continue;
    if (l.slice(12, 16).trim() !== "CA") continue;
    if (l[21] !== chain) continue;
    const seq = parseInt(l.slice(22, 26), 10);
    if (out.length && out[out.length - 1]!.seq === seq) continue;
    out.push({
      seq,
      name: l.slice(17, 20).trim(),
      x: parseFloat(l.slice(30, 38)),
      y: parseFloat(l.slice(38, 46)),
      z: parseFloat(l.slice(46, 54)),
    });
  }
  return out;
}

/** 1TUP = p53 core domain bound to DNA (Cho et al. 1994). */
export const P53_PDB_URL = "https://files.rcsb.org/download/1TUP.pdb";

/** Residue number of each supported TP53 hotspot, for structural highlighting. */
export const VARIANT_RESIDUE: Record<string, number | null> = {
  R175H: 175,
  R248Q: 248,
  R273H: 273,
  Y220C: 220,
  G245S: 245,
  R249S: 249,
  R282W: 282,
  null: null,
};
