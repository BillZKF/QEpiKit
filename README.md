# QEpiKit
Epi Typescript / Javascript library

## What is it?
This library provides broad access to simple tools for "hacking" compartmental / differential equation (CM) and agent based (AB) models of communicable (and noncommunicable!) disease. Although developed with the   public health / epidemiology / biomedical domains in mind, the tools themselves are domain neutral, and might be translate to other areas.

## Why?
When I started development (because I was trying to learn more about epidemiological modeling), I could not find a free, open javascript library covering multiple approaches to epidemiological modeling. I chose Typescript / Javascript as the main language because they: 1) enable browser based examples on most devices 2) can be deployed to a server 3) (Typescript) will allow migration to ES6.

Rather than focus on computational speed and precision, this library offers a variety of extensible model components that can be combined in new and interesting ways. Ultimately, these library is a tool for rapid model / hypothesis generation and testing. Most of the model components output to CSV for easy analysis using your preferred data analysis tools / language. All For the AB portion of the library, I included methods from other fields including robotics and system dynamics. See more in this introduction.

## Features
- Descriptives
- Compartment Models
- Agent Based components
  - Contact Patches (contact matrix & who infects whom arrays)
  - Behavior Trees
  - Hierarchal Finite State Machines
- Planning / decision-making components
  - Hierarchal Task Networks
  - Belief Desire Intention Model
- Soon!
  - Simple Reinforcement Learning
