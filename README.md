# CharAnimations for RPG Maker MV

A plugin to run custom animations on RPG Maker Characters.

## How to use this with GIFs

It's main usage is to export GIFs animations to RPG Maker character animations.

For example, we have this GIF from "Rhaxen" game:

![Rhaxen](https://raw.githubusercontent.com/ProGM/CharAnimations/master/sample.gif)

1. Install [this plugin](https://raw.githubusercontent.com/ProGM/CharAnimations/master/ProGM_CharAnimations.js)
2. Go to http://progm.github.io/gif2mv and upload all gifs
3. Copy the generated JSON data in your `data/` folder, creating a new file in named `CharAnimations.json`
4. Dowload all generated sprites from the website and put them in your `img/characters` folder
5. Call it from events, using Plugin Command option: `CharAnimation start sample`, where "sample" is your animation name (generally it's your file name without extension).
