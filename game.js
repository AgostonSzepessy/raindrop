var canvas = document.getElementById('canvas');
canvas.height = 600;
canvas.width = parseInt(720 * 16 / 9, 10);

var context = canvas.getContext('2d');

var FPS = 60;
var timePerFrame = 1000 / 60;

function clearCanvas(strColor) {
	context.fillStyle = strColor;
	
	context.beginPath();
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.closePath();
	context.fill();
}

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
	this.tempState = true;
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

// base class for game states
function GameState() { }

GameState.prototype.update = function(dt) { };

GameState.prototype.render = function() { };

function MenuState() {
	GameState.call();
}

function PlayState() {
	GameState.call();
}

MenuState.prototype.update = function(dt) {
	
};

MenuState.prototype.render = function() {
	clearCanvas("#1d00ff");
};

PlayState.prototype.update = function(dt) {
	
};

PlayState.prototype.render = function() {
	clearCanvas("#ff0000");
};

var Game = { };

Game.update = function(dt) {
	Game.gsm.update(dt);
};

Game.render = function() {
	Game.gsm.render();
};

window.onload = function() {
	var sources = {
		bucket: '/raindrop/res/bucket.png',
		raindrop: '/raindrop/res/raindrop.png'
	};
	
	loadImages(sources, startGame);
};

function loadImages(sources, gameStart) {
	var images = {};
	var numImages = 0;
	var numImagesLoaded = 0;
	
	for(var i in sources) {
		numImages++;
	}
	
	for(i in sources) {
		images[i] = new Image();
		images[i].src = sources[i];
		
		// once all images are loaded, start the game
		images[i].onload = function() {
			if(++numImagesLoaded >= numImages) {
				gameStart(images);
			}
		};
	}
}

function init() {
	Game.prevTime = window.performance.now();
	Game.accumulator = 0;
	Game.gsm = new GameStateManager();
	Game.gsm.states.push(new MenuState());
}

function startGame(images) {
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