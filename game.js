var canvas = document.getElementById('canvas');
canvas.height = 600;
canvas.width = parseInt(720 * 16 / 9, 10);

var context = canvas.getContext('2d');

var FPS = 60;
var timePerFrame = 1000 / 60;

// Stores the pictures.
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
		if(!this.prevKeys[keyCode] && this.currentKeys[keyCode]) {
			return true;
		}
		return false;
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

// Checks if 2 rectangles are intersecting
Rectangle.prototype.intersects = function(rectangle) {
	if(rectangle.x < this.x + this.width && this.x < rectangle.x + rectangle.width &&
	  	rectangle.y < this.y + this.height && rectangle.y + rectangle.height > this.y) {
		return true;
	}
	
	return false;
};

// Base class for the entities in the game.
function Entity(image) {
	this.image = image;
	this.boundingBox = new Rectangle(0, 0, this.image.width, this.image.height);
	
	this.dx = 0;
	this.dy = 0;
	this.gravity = 0.0005;

}

// Sets the position of the Entity to (x, y)
Entity.prototype.setPosition = function(x, y) {
	this.boundingBox.x = x;
	this.boundingBox.y = y;
};

// Checks if the Entity is still on the canvas
Entity.prototype.isInBounds = function() {
	return this.boundingBox.x + this.boundingBox.width > 0 && this.boundingBox.x < canvas.width &&
		this.boundingBox.y > -100 && this.boundingBox.y < canvas.height;
};

Entity.prototype.update = function(dt) {
};

Entity.prototype.render = function() {
	context.drawImage(this.image, this.boundingBox.x, this.boundingBox.y);
};

function Collectible(type, resName) {
	Entity.call(this, resources[resName]);
	this.type = type;
	
}

// Indicates that the Collectible is a raindrop
Collectible.RAINDROP = 0;

// Indicates that the collectible is a rock
Collectible.ROCK = 1;

Collectible.prototype = Object.create(Entity.prototype);
Collectible.prototype.constructor = Collectible;

Collectible.prototype.update = function(dt) {
	this.dy += this.gravity * dt;
	this.boundingBox.y += this.dy * dt;
};

// Player class
function Player() {
	Entity.call(this, resources['bucket']);
	this.boundingBox.x = canvas.width / 2 - this.boundingBox.width / 2;
	this.boundingBox.y = canvas.height - this.boundingBox.height - 5;
	
	this.acceleration = 0.05;
	this.maxVelocity = 0.5;
	
	this.movingRight = false;
	this.movingLeft = false;
	
	this.numRaindrops = 0;
	this.numRocks = 0;
}

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {
	if(this.movingRight) {
		this.dx += this.acceleration * dt;
		
		if(this.dx > this.maxVelocity) {
			this.dx = this.maxVelocity;
		}
	}
	else if(this.movingLeft) {
		this.dx -= this.acceleration * dt;
		
		if(this.dx < - this.maxVelocity) {
			this.dx = -this.maxVelocity;
		}
	}
	// slow player down if he's not moving
	else {
		this.dx *= 0.001;
		
		if(this.dx < 0.000001) {
			this.dx = 0;
		}
	}
	
	this.boundingBox.x += this.dx * dt;
	
	// check boundaries
	if(this.boundingBox.x < 0) {
		this.boundingBox.x = 0;
	}
	else if(this.boundingBox.x + this.boundingBox.width > canvas.width) {
		this.boundingBox.x = canvas.width - this.boundingBox.width;
	}
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
	Keys.update();

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
	
	this.collectibles = [];
	this.collectibles.push(new Collectible(Collectible.RAINDROP, 'raindrop'));
	this.collectibles[0].setPosition(canvas.width / 2, 0);
	
	this.player = new Player();
	
	// time elapsed between collectible generations
	this.collectibleTime = 0;
	// generate collectible every 500 milliseconds
	this.generationTime = 1000;
}

// Main menu state and titlescreen
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
	
	if(Keys.isKeyDown(Keys.A) || Keys.isKeyDown(Keys.Left)) {
		this.player.movingLeft = true;
	}
	else {
		this.player.movingLeft = false;
	}
	
	if(Keys.isKeyDown(Keys.D) || Keys.isKeyDown(Keys.Right)) {
		this.player.movingRight = true;
	}
	else {
		this.player.movingRight = false;
	}
	
	this.generateCollectible(dt);
	
	for(var i = 0; i < this.collectibles.length; ++i) {
		this.collectibles[i].update(dt);
		if(!this.collectibles[i].isInBounds()) {
			this.collectibles.splice(i, 1);
		}
	}
	
	this.player.update(dt);
	
	for(var i = 0; i < this.collectibles.length; ++i) {
		if(this.collectibles[i].boundingBox.intersects(this.player.boundingBox)) {
			if(this.collectibles[i].type === Collectible.RAINDROP) {
				this.player.numRaindrops++;
			}
			else {
				this.player.numRocks++;
			}
			
			this.collectibles.splice(i, 1);
		}
	}
};

PlayState.prototype.render = function() {
	clearCanvas("#ff0000");
	
	for(var i = 0; i < this.collectibles.length; ++i) {
		this.collectibles[i].render();
	}
	
	this.player.render();
	
	var raindropText = "Raindrops: " + this.player.numRaindrops;
	var rockText = "Rocks: " + this.player.numRocks;
	
	var raindropTextMeasurement = context.measureText(raindropText);
	var rockTextMeasurement = context.measureText(rockText);
	
	context.font = "30px arial";
	context.fillStyle = "#000000";
	context.fillText(raindropText, canvas.width - raindropTextMeasurement.width, 30);
	context.fillText(rockText, canvas.width - rockTextMeasurement.width, 60);
};

PlayState.prototype.generateCollectible = function(dt) {
	this.collectibleTime += dt;
	
	if(this.collectibleTime >= this.generationTime) {
		// type is either 0 or 1
		var type = Math.floor((Math.random() * 100) + 1) % 2;
		
		var collectible;
		
		if(type === Collectible.RAINDROP) {
			collectible = new Collectible(type, 'raindrop');
		}
		else {
			collectible = new Collectible(type, 'rock');
		}
		
		var x = Math.floor(Math.random() * canvas.width);
		
		collectible.boundingBox.x = x;
		collectible.boundingBox.y = -collectible.boundingBox.height;
		
		this.collectibles.push(collectible);
		
		this.collectibleTime = 0;
	}
};

window.onload = function() {
	var sources = {
		bucket: '/raindrop/res/bucket.png',
		raindrop: '/raindrop/res/raindrop.png',
		rock: '/raindrop/res/rock.png'
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
	}
	
	gameLoop(window.performance.now());
}