var canvas = document.getElementById('canvas');
canvas.height = 600;
canvas.width = parseInt(720 * 16 / 9, 10);

var context = canvas.getContext('2d');

var FPS = 60;
var timePerFrame = 1000 / 60;

var resources = { };

var Keys = {
	currentKeys: [],
	prevKeys: [],
	
	A: 65,
	D: 68,
	Right: 39,
	Left: 37,
	Space: 32,
	Escape: 27,
	
	// Triggers as long as the key is held down.
	isKeyDown: function(keyCode) {
		return this.currentKeys[keyCode];
	},
	
	// Only triggers once, even if the key is held down. It checks to see if
	// the key was not pressed last frame and it is pressed this frame.
	isKeyPressed: function(keyCode) {
		return !this.prevKeys[keyCode] && this.currentKeys[keyCode];
	},
	
	onKeyDown: function(event) {
		this.currentKeys[event.keyCode] = true;
	},
	
	onKeyUp: function(event) {
		this.currentKeys[event.keyCode] = false;
	},

	// backup key states
	update: function() {
		for(var i = 0; i < this.currentKeys.length; ++i) {
			this.prevKeys[i] = this.currentKeys[i];
		}
	}
};



// Clears the canvas with the color that is passed in.
function clearCanvas(strColor) {
	context.fillStyle = strColor;
	
	context.beginPath();
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.closePath();
	context.fill();
}

// Creates a rectangle and sets its coordinates to (x, y) and width and height.
function Rectangle(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

Rectangle.prototype.intersects = function(rectangle) {
	if(rectangle.x < this.x + this.width && this.x < rectangle.x + rectangle.width &&
	  	rectangle.y < this.y + this.height && rectangle.y + rectangle.height > this.y) {
		return true;
	}
	
	return false;
};

function Entity(image) {
	this.image = image;
	this.boundingBox = new Rectangle(0, 0, this.image.width, this.image.height);
}

Entity.prototype.setPosition = function(x, y) {
	this.boundingBox.x = x;
	this.boundingBox.y = y;
};

function GameStateManager() {
	this.states = [];
	this.tempState = null;
	this.changingState = false;
	this.poppingState = false;
	this.pushingState = false;
}

GameStateManager.prototype.pushState = function(gameState) {
	this.tempState = gameState;
	this.pushingState = true;
};

GameStateManager.prototype.popState = function() {
	this.poppingState = true;
};

GameStateManager.prototype.changeState = function(gameState) {
	this.changingState = true;
	this.tempState = gameState;
};

GameStateManager.prototype.update = function(dt) {
	
	if(this.changingState) {
		this.states.pop();
		this.states.push(this.tempState);
		this.tempState = null;
		this.changingState = false;
	}
	else if(this.pushingState) {
		this.states.push(this.tempState);
		this.tempState = null;
		this.pushingState = false;
	}
	else if(this.poppingState) {
		this.states.pop();
		this.poppingState = false;
	}
	
	this.states[this.states.length - 1].update(dt);
};

GameStateManager.prototype.render = function() {
	this.states[this.states.length - 1].render();
};

var Game = { };

Game.update = function(dt) {
	Game.gsm.update(dt);
};

Game.render = function() {
	Game.gsm.render();
};

// base class for game states
function GameState() { }

GameState.prototype.update = function(dt) { };

GameState.prototype.render = function() { };

// The menu state
function MenuState() {
	GameState.call();
}

// State where the player collects raindrops.
function PlayState() {
	GameState.call();
}

MenuState.prototype.update = function(dt) {
	if(Keys.isKeyPressed(Keys.Space)) {
		Game.gsm.changeState(new PlayState());
	}
};

MenuState.prototype.render = function() {
	clearCanvas("#5a9aff");
	
	var title = "Raindrop";
	var displayTitle = context.measureText(title);
	
	var text = "Press Space to start";
	var displayText = context.measureText(text);
	
	context.beginPath();
	context.fillStyle = "#000000";
	context.font = "30px arial";
	
	context.fillText(title, canvas.width / 2 - displayTitle.width / 2, canvas.height /4);
	context.fillText(text, canvas.width / 2 - displayText.width / 2, canvas.height / 2);
	context.closePath();
};

PlayState.prototype.update = function(dt) {
	if(Keys.isKeyPressed(Keys.Space)) {
		Game.gsm.changeState(new MenuState());
	}
};

PlayState.prototype.render = function() {
	clearCanvas("#ff0000");
};

window.onload = function() {
	var sources = {
		bucket: '/raindrop/res/bucket.png',
		raindrop: '/raindrop/res/raindrop.png'
	};
	
	loadImages(sources, startGame);
};

// Load images to be used.
function loadImages(sources, gameStart) {
	var numImages = 0;
	var numImagesLoaded = 0;
	
	for(var i in sources) {
		numImages++;
	}
	
	for(i in sources) {
		resources[i] = new Image();
		resources[i].src = sources[i];
		
		// once all images are loaded, start the game
		resources[i].onload = function() {
			if(++numImagesLoaded >= numImages) {
				gameStart();
			}
		};
	}
}

function init() {
	Game.prevTime = window.performance.now();
	Game.accumulator = 0;
	Game.gsm = new GameStateManager();
	Game.gsm.states.push(new MenuState());
	
	window.addEventListener('keyup', function(event) { Keys.onKeyUp(event); }, false);
	window.addEventListener('keydown', function(event) { Keys.onKeyDown(event); }, false);
}

function startGame() {
	console.log('starting game');
	
	init();
		
	function gameLoop(tFrame) {
		window.requestAnimationFrame(gameLoop);
		
		var now = tFrame;
		Game.accumulator += now - Game.prevTime;
		Game.prevTime = now;
		
		while(Game.accumulator >= timePerFrame) {
			Game.update(timePerFrame);
			Game.accumulator -= timePerFrame;
		}
		
		Game.render();
		Keys.update();
	}
	
	gameLoop(window.performance.now());
}