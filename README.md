# QEpiKit
Epi Typescript / Javascript library

## What is it?
This library is a collection of tools for agent based modeling (ABM), specializing in models of communicable (and noncommunicable!) disease. QEpiKit also integrates concepts from equation based epidemiological modeling (EBM) and reinforcement learning. Although developed with the public health / epidemiology / biomedical domains in mind, this library may be useful in other fields.

## Why?
This library came out of an attempt to develop an agent based modeling library that could function as a whiteboarding / thought experiment tool for health workers. I chose Typescript / Javascript as the main language because they: 1) enable interactive browser (mobile too) based examples without plugins 2) are great for rapid prototyping and integration with web based data sources 3) can also be run on a server.

## Dependencies
QEpiKit doesn't have any required dependencies for basic use, but most models use at least one of the following:
- Random.js (or Chance.js) for better pseudo random numbers.
- jStat.js for distributions and descriptive statistics.
- D3.js (or Three.js or Pixi.js) for rendering. * Renderer is separate. See examples.*

For development, you will need:
- Typescript compiler
- tsDoc (for building documentation)
- check package.json and gulp.file for testing setup.



## Features
*Still very much a work in progresss*
- Agent Based Modeling Techniques
  - Hybrid Automata / State Machines
  - Behavior Trees
  - Hierarchal Task Networks
  - Belief Desire Intention
  - Utility-based Planning
- Other Features
  - Contact matrices (Who Infects Whom)
  - Read, write csv files (write via data URIs).
  - QLearners
  - Compartmental / differential equation models
