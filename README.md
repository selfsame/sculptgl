SculptGL (VR) - WebGL sculpting
==========================

A fork of [https://github.com/stephomi/sculptgl](https://github.com/stephomi/sculptgl) adapted for webVR

This is under development, but usable.  A build is up at [http://selfsamegames.com/sculptglvr](http://selfsamegames.com/sculptglvr)

You need a browser that supports webVR ([https://webvr.rocks/](https://webvr.rocks/)).

Currently only tested with HTC Vive (other headsets should work but probably don't have all the controlls mapped)

No visual user interface, see controlls below, and use the html UI for other operations.

Vive controls
=============

## Right Controller: cursor projects to mesh

* right trigger - sculpt
* right pad click - toggle invert
* right grip - move mesh
* right steam button - redo

## Left Controller:

* left trigger - quick smooth tool
* left pad click - cycle tool (tool displayed with cursor color)
* left grip - scale mesh when combined with right grip
* left steam button - undo

Tools
=====

Install [nodejs](http://nodejs.org/).

Then use rollup :

    npm install -g rollup # if not already done
    npm install
    npm run dev # and visit app/index.html

Credits
=======

#### Environments

The raw environments can be found here (check the licenses !) :

http://www.hdrlabs.com/sibl/archive.html

http://hdrmaps.com/freebies
