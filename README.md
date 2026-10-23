# LNPredict

## In Silico Nanocarrier Formulation Platform for TP53-Targeted Cancer Therapeutics

**LNPredict** is an open-access, computational design and biophysical simulation platform for engineering lipid nanoparticle (LNP) and nanocarrier formulations targeting *TP53* mutations in solid tumours.

Developed as the companion platform to the translational review:
- 🌐 **Interactive Web App:** [lnpredict.rickymadison.com](https://lnpredict.rickymadison.com/)
- 📄 **Peer-Reviewed Paper (OA):** [doi:10.1186/s12645-026-00431-9](https://doi.org/10.1186/s12645-026-00431-9)
- 💻 **Source Code:** [github.com/ricky-madison/LNPredict](https://github.com/ricky-madison/LNPredict)

> **Research software:** Computational predictions are intended for research, preclinical hypothesis generation, and formulation optimization. They do not constitute clinical recommendations.

---

## Overview

Overcoming the traditional "undruggable" dogma of *TP53* requires delivering macromolecular nucleic acids past three major pharmacological barriers:
1. **The ~0.7% EPR bottleneck:** Median passive tumour accumulation remains under 1% ID/g across solid tumours.
2. **Endosomal entrapment:** Conventional LNPs release only 1–4% of encapsulated cargo into the cytosol.
3. **Hepatic clearance & liver tropism:** Apolipoprotein E (ApoE) opsonization shuttles >80% of unfunctionalized particles to the liver.

**LNPredict** operationalises the biophysical rules of nanocarrier delivery into an interactive in silico pipeline—connecting clinical *TP53* mutations, multimodal RNA/DNA payloads, lipid architectures, active surface functionalization, and organ tropism into a single unified workflow.

```text
                  TP53 Mutation Profile (LOF vs GOF)
                                  │
                                  ▼
           Therapeutic Cargo Selection & Sequence Engine
   [ p53 mRNA │ mutant siRNA │ Dual siRNA+mRNA │ miR-34a │ CRISPR-Cas9 ]
                                  │
                                  ▼
                   Nanocarrier Architecture (Table 1)
 [ Ionizable LNP │ Cationic Liposome │ SLN │ NLC │ Hybrid Lipid-Polymer ]
                                  │
                                  ▼
                     Biophysical Formulation Core
      ┌───────────────────────────┴───────────────────────────┐
      ▼                                                       ▼
Ionizable Lipid Library                             Formulation Parameters
• Apparent pKa (target: 6.0–7.0)                    • N/P Molar Ratio
• Mol Weight, LogP, Volume                          • Helper Lipid (DOPE/DSPC)
• Ionization charge curves                          • Cholesterol & PEG-lipid mol%
      └───────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
                   Predictive Biophysics Engine
• Hydrodynamic Size (nm) & Polydispersity Index (PDI)
• Encapsulation Efficiency (%) & Total Payload Capacity
• Predicted Endosomal Escape Score & pKa Suitability
• Microfluidic Flow Parameters (Total Flow Rate & FRR)
                                  │
                                  ▼
              Active Targeting & Biodistribution Engineering
• Table 2 Surface Ligands (Folate, Tf, cRGDfK, Trastuzumab, Cetuximab, AS1411, HA)
• SORT (Selective Organ Targeting) Lipid Tuning (Liver ➔ Spleen / Lung Tropism)
• Stimuli-Responsive Release Kinetics (pH, Redox/GSH, Thermo, Ultrasound, Enzyme)
• Anti-PEG Pre-existing Antibody Risk Scoring
• Immune Checkpoint Synergy (anti-PD-1 / KEYNOTE-942 Context)
                                  │
                                  ▼
               Real-Time Visualization & Validation
• 3D Interactive Particle Cross-Section (Cut-away internal core view)
• 3D Molecular Lipid & Protein Viewers (1TUP p53 hotspot mapping)
• Parity Plots & Benchmarks vs 20 Published Formulations (MAE/RMSE/R²)
• Exportable Research Dossier (JSON / Print-Ready PDF Spec)
