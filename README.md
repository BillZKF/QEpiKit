# QEpiKit
Epi Typescript / Javascript library.

## What is it?
This library is a collection of tools for agent based modeling (ABM). Although developed with the public health / epidemiology / biomedical domains in mind, this library may be useful in other fields.

## Why?
This library came out of an attempt to develop an agent based modeling library that could function as a whiteboarding / thought experiment tool.

## Dependencies
No required dependencies for basic use, but most models use at least one of the following:
- Random.js (or Chance.js) for better pseudo random numbers.
- jStat.js for distributions and descriptive statistics.
- turf.js for geospatial methods.
- cytospace.js for network analysis.
- D3.js (or Three.js) for rendering. * Renderer is separate. See examples.*

For development, you will need:
- Typescript compiler
- tsDoc (for building documentation)
- check karma.conf.js, package.json and gulp.file for testing setup.

## Features
*Still very much a work in progresss*
- Agent Based Modeling Techniques
  - random and parallel activation
  - easy parameter sweep and model calibration.
  - classes for structuring behavior including
    - Behavior Trees
    - Hierarchal Task Networks
    - Belief Desire Intention
    - Utility-based Planning
- Other Features
  - Contact matrices (Who Infects Whom)
  - Read, write csv files (write via data URIs).
  - QLearners
  - Compartmental / differential equation models
