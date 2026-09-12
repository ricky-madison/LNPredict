# p53-LNP Designer

## In Silico LNP Formulation Platform for TP53-Targeted mRNA Delivery

**p53-LNP Designer** is a computational platform for exploring and predicting lipid nanoparticle (LNP) formulations for **TP53/p53-based cancer therapeutics**.

The platform connects:

- TP53 mutations
- Cancer type
- mRNA cargo
- Ionizable lipid properties
- LNP formulation parameters
- Predicted delivery characteristics
- Cancer-specific targeting strategies

> **Research software:** Computational predictions are intended for research and hypothesis generation and should not be interpreted as experimentally validated formulations or clinical recommendations.

---

## Overview

Lipid nanoparticles are an important delivery technology for nucleic-acid therapeutics, including mRNA. Selecting an appropriate ionizable lipid and formulation composition remains a challenging optimization problem.

p53-LNP Designer aims to provide an in silico workflow for evaluating and ranking candidate LNP formulations.

```text
TP53 Mutation
      |
      v
Cancer Type + Cargo
      |
      v
Lipid Library
      |
      +-- pKa
      +-- logP
      +-- Charge
      +-- Structure
      +-- Molecular Descriptors
      |
      v
Formulation Prediction
      |
      +-- Encapsulation Efficiency
      +-- Particle Size
      +-- PDI
      +-- Endosomal Escape
      |
      v
Targeting Strategy
      |
      v
Ranked Formulation Candidates
      |
      v
Research Report
