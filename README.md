SculptGL (VR) - WebGL sculpting
==========================

A fork of [sculptgl](https://github.com/stephomi/sculptgl) adapted for webVR

![s01](https://cloud.githubusercontent.com/assets/2467644/26756270/51157374-486c-11e7-8e4b-ccb7f1e041f4.gif)

This is under development, but usable.  

## [try it out here](http://selfsamegames.com/sculptglvr)

You need a browser that supports webVR ([https://webvr.rocks/](https://webvr.rocks/)).

Currently only tested with HTC Vive 
(If you have a Rift I'm looking for contributors to help sort out issues) 

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

* red - brush
* green - inflate
* blue - flatten
* yellow - pinch
* cyan - crease
* black - move

Dev
====

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
