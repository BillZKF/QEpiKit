## What is it?
This library is a collection of tools for dynamic modeling. Although developed with the public health / epidemiology / biomedical domains in mind.

## Why?
This library came out of an attempt to develop an dynamic modeling library that could function as a whiteboarding / thought experiment tool.

## Dependencies
- jStat.js for matrix math.

Most models use at least one of the following:
- turf.js for geospatial methods (leaflet.js for maps).
- three.js for visualization
- cytospace.js for graph analysis.
- D3.js (or Three.js) for rendering.

For development, you will need:
- Typescript compiler
- tsDoc (for building documentation)
- check karma.conf.js, package.json and gulp.file for testing setup.

## Features
*Still very much a work in progress*
- Compartmental / stock-flow models
- Event queueing
- Agent based modeling techniques
- seeded PRNG (with helper functions for popular distributions)
- Batch running 
- Read, write csv files (write via data URIs).
