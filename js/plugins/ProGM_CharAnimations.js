//=============================================================================
// Run Character Animations
// by ProGM
// Last Updated: 2016.05.02
//=============================================================================

/*:
 * @plugindesc Allows to run n-frames animations on characters on-demand.
 * @author ProGM
 *
 * Allows to run animations on characters. Animations must be defined in
 * data/CharAnimations.json file, with a certain format.
 * Animations can be created starting from a .gif image
 * from here: http://progm.github.io/gif2mv
 *
 * @help
 *
 * Plugin Command:
 *   CharAnimation start MyAnimationName     # Start animation "MyAnimationName" on player
 *   CharAnimation start MyAnimationName 1   # Start animation "MyAnimationName" on the first event
 *   CharAnimation loop MyAnimationName      # Start and loop animation "MyAnimationName"
 *   CharAnimation stop                      # Stops currently running animation on the player
 *   CharAnimation stop 1                    # Stops currently running animation on the first event
 *
 */

/*:it
 * @plugindesc Permette di riprodurre animazioni di un qualsiasi numero di frame su un personaggio.
 * @author ProGM
 *
 * Permette di riprodurre semplici animazioni sui personaggi. Le animazioni
 * data/CharAnimations.json file, with a certain format.
 * Le animazioni possono essere generate a partire da immagini .gif
 * da qui: http://progm.github.io/gif2mv
 *
 * @help
 *
 * Plugin Command:
 *   CharAnimation start MiaAnimazione       # Riproduce l'animazione "MiaAnimazione" sul player
 *   CharAnimation start MyAnimationName 1   # Riproduce l'animazione "MiaAnimazione" sull'evento con ID 0001
 *   CharAnimation loop MyAnimationName      # Riproduce e cicla l'animazione "MiaAnimazione" sul player
 *   CharAnimation stop                      # Interrompe l'animazione corrente sul player
 *   CharAnimation stop 1                    # Interrompe l'animazione corrente sull'evento con ID 0001
 *
 */

(function() {
  var parameters = PluginManager.parameters('ProGM_CharAnimations');

  var _charAnimationByID = function (id) {
    var eventID = parseInt(id);
    var target = (eventID > 0 ? $gameMap.event(eventID) : $gamePlayer);
    if (target) {
      return target.charAnimation();
    } else {
      throw new Error('There\'s no event with ID = ' + eventID);
    }
  }

  var _Game_Interpreter_pluginCommand =
          Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'CharAnimation') {
      switch (args[0]) {
        case 'start':
        case 'loop':
          var that = _charAnimationByID(args[2]);
          that[args[0]].call(that, args[1])
        break;
        case 'stop':
          _charAnimationByID(args[1]).stop();
        break;
        default:
          throw new Error('CharAnimation has no method ' + args[0]);
      }
    }
  };

  window.CharAnimation = function() {
    this.stop();
  }

  CharAnimation.prototype.isRunning = function () {
    return this._currentAnimation !== null
  }

  CharAnimation.prototype.loop = function (animationName) {
    this.start(animationName);
    this._loop = true;
  }

  CharAnimation.prototype.start = function (animationName) {
    this._currentAnimation = $dataCharAnimations[animationName];
  }

  CharAnimation.prototype.stop = function () {
    this._timer = 0;
    this._currentFrame = 0;
    this._loop = false;
    this._currentAnimation = null;
  }

  CharAnimation.prototype.currentSprite = function () {
    return (this._currentAnimation && this._currentAnimation[this._currentFrame] && this._currentAnimation[this._currentFrame].file_name) || "";
  }

  CharAnimation.prototype.currentDirection = function () {
    return parseInt((this._currentFrame % 9) / 3) * 2 + 2;
  }

  CharAnimation.prototype.currentPattern = function () {
    return parseInt((this._currentFrame % 9) % 3);
  }

  CharAnimation.prototype.checkAnimationEnding = function () {
    if (this._currentAnimation[this._currentFrame]) { return; }
    if (this._loop) {
      this._timer = 0;
      this._currentFrame = 0;
    } else {
      this.stop();
    }
  }

  CharAnimation.prototype.update = function () {
    if (this.isRunning()) {
      var currentState = this._currentAnimation[this._currentFrame];
      this._timer += 1;
      if (this._timer > currentState.delay) {
        this._timer = 0;
        this._currentFrame += 1;
        this.checkAnimationEnding();
      }
    }
  }

  // Patch for DataManager: Loading CharAnimations.json file in $dataCharAnimations
  DataManager._databaseFiles.push({ name: '$dataCharAnimations', src: 'CharAnimations.json' });

  // Patch for Game_CharacterBase: Instantiate CharAnimation and use it.
  var _Game_CharacterBase_prototype_initialize = Game_CharacterBase.prototype.initialize;
  Game_CharacterBase.prototype.initialize = function() {
      _Game_CharacterBase_prototype_initialize.call(this);
      this._charAnimation = new CharAnimation();
  };

  Game_CharacterBase.prototype.charAnimation = function() {
    return this._charAnimation;
  }

  var _Game_CharacterBase_prototype_characterName = Game_CharacterBase.prototype.characterName;
  Game_CharacterBase.prototype.characterName = function() {
    if (this._charAnimation.isRunning()) {
      return this._charAnimation.currentSprite();
    } else {
      return _Game_CharacterBase_prototype_characterName.call(this);
    }
  };

  var _Game_CharacterBase_prototype_update = Game_CharacterBase.prototype.update;
  Game_CharacterBase.prototype.update = function() {
    this._charAnimation.update();
    _Game_CharacterBase_prototype_update.call(this);
  };

  var _Game_CharacterBase_prototype_direction = Game_CharacterBase.prototype.direction;
  Game_CharacterBase.prototype.direction = function() {
    if (this._charAnimation.isRunning()) {
      return this._charAnimation.currentDirection();
    } else {
      return _Game_CharacterBase_prototype_direction.call(this);
    }
  };

  var _Game_CharacterBase_prototype_pattern = Game_CharacterBase.prototype.pattern;
  Game_CharacterBase.prototype.pattern = function() {
    if (this._charAnimation.isRunning()) {
      return this._charAnimation.currentPattern();
    } else {
      return _Game_CharacterBase_prototype_pattern.call(this);
    }
  };
})();
