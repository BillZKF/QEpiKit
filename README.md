# QEpiKit
Epi Typescript / Javascript library.

## What is it?
This library is a collection of tools for dynamic modeling. Although developed with the public health / epidemiology / biomedical domains in mind, this library may be useful in other fields.

## Why?
This library came out of an attempt to develop an dynamic modeling library that could function as a whiteboarding / thought experiment tool.

## Dependencies
No required dependencies for basic use, but most models use at least one of the following:
- Random.js (or Chance.js) for better pseudo random numbers.
- jStat.js for distributions and descriptive statistics.
- turf.js for geospatial methods (leaflet.js for maps).
- cytospace.js for graph analysis.
- D3.js (or Three.js) for rendering. * Renderer is separate. See examples.*

For development, you will need:
- Typescript compiler
- tsDoc (for building documentation)
- check karma.conf.js, package.json and gulp.file for testing setup.

## Features
*Still very much a work in progresss*
- Agent Based Modeling Techniques
  - random and parallel activation
  - classes for structuring behavior including:
    - Behavior Trees, Hierarchal Task Networks, Belief Desire Intention, Utility-based Planning
- Compartmental / stock-flow models
- Event queueing
- Batch running
- Contact matrices (Who Infects Whom)
- Read, write csv files (write via data URIs).
