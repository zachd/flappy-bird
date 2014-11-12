WebFontConfig = {
    google: { families: [ 'Press+Start+2P::latin' ] },
    active: main
};
(function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})(); 


function main() {

var state = {
    preload: preload,
    create: create,
    update: update,
    render: render
};

var parent = document.querySelector('#screen');

var game = new Phaser.Game(
    0,
    0,
    Phaser.CANVAS,
    parent,
    state,
    false,
    false
);

function preload() {
    var assets = {
        spritesheet: {
            birdie: ['assets/birdie.png', 24, 24],
            clouds: ['assets/clouds.png', 128, 64],
            mutebutton: ['assets/mute.png', 32, 32],
            mutedbutton: ['assets/muted.png', 32, 32],
            bugicon: ['assets/bug.png', 35, 35]
        },
        image: {
            finger: ['assets/finger.png'],
            fence: ['assets/fence.png']
        },
        audio: {
            flap: ['assets/flap.wav'],
            score: ['assets/score.wav'],
            hurt: ['assets/hurt.wav']/*,
            scottjoplin: ['assets/scottjoplin.wav']*/
        }
    };
    Object.keys(assets).forEach(function(type) {
        Object.keys(assets[type]).forEach(function(id) {
            game.load[type].apply(game.load, [id].concat(assets[type][id]));
        });
    });
}

var gameStarted,
    gameOver,
    score,
    bg,
    credits,
    mutebutton,
    isMuted,
    clouds,
    fingers,
    invs,
    birdie,
    fence,
    scoreText,
    scoregoldText,
    clickedOnce,
    instText,
    gameOverText,
    lastFingerY,
    fingCntStretch,
    randObstacle,
    fingSpawn,
    flapSnd,
    scoreSnd,
    hurtSnd,
    fingersTimer,
    cloudsTimer,
    startTime,
    totalTime,
    timeTakenString;
    
function create() {
    // Set world dimensions
    var screenWidth = parent.clientWidth > window.innerWidth ? window.innerWidth : parent.clientWidth;
    var screenHeight = parent.clientHeight > window.innerHeight ? window.innerHeight : parent.clientHeight;
    game.world.width = screenWidth;
    game.world.height = screenHeight;
    // Draw bg
    bg = game.add.graphics(0, 0);
    bg.beginFill(0xDDEEFF, 1);
    bg.drawRect(0, 0, game.world.width, game.world.height);
    bg.endFill();
    clickedOnce = false;
    // Credits 'yo
    credits = game.add.text(
        game.world.width / 2,
        10,
        '',
        {
            font: '8px "Press Start 2P"',
            fill: '#fff',
            align: 'center'
        }
    );
    credits.anchor.x = 0.5;
    // Add clouds group
    clouds = game.add.group();
    // Add fingers
    fingers = game.add.group();
    // Add invisible thingies
    invs = game.add.group();
    // Add birdie
    birdie = game.add.sprite(0, 0, 'birdie');
    birdie.anchor.setTo(0.5, 0.5);
    birdie.animations.add('fly', [0, 1, 2, 3], 10, true);
    birdie.inputEnabled = true;
    birdie.body.collideWorldBounds = true;
    birdie.body.gravity.y = 39;
    // Add fence
    fence = game.add.tileSprite(0, game.world.height - 32, game.world.width, 32, 'fence');
    fence.tileScale.setTo(2, 2);
    // Add score text
    scoreText = game.add.text(
        game.world.width / 2,
        game.world.height / 4,
        "",
        {
            font: '14px "Press Start 2P"',
            fill: '#fff',
            stroke: '#430',
            strokeThickness: 4,
            align: 'center'
        }
    );
    scoreText.anchor.setTo(0.5, 0.5);

    // Add goldscore text
    scoregoldText = game.add.text(
        game.world.width / 2,
        game.world.height / 4,
        "",
        {
            font: '16px "Press Start 2P"',
            fill: '#FFD700',
            stroke: '#430',
            strokeThickness: 4,
            align: 'center'
        }
    );
    scoregoldText.anchor.setTo(0.5, 0.5);
    
    // Add instructions text
    instText = game.add.text(
        game.world.width / 2,
        game.world.height - game.world.height / 4,
        "",
        {
            font: '8px "Press Start 2P"',
            fill: '#fff',
            stroke: '#430',
            strokeThickness: 4,
            align: 'center'
        }
    );
    instText.anchor.setTo(0.5, 0.5);
    // Add game over text
    gameOverText = game.add.text(
        game.world.width / 2,
        game.world.height / 2,
        "",
        {
            font: '16px "Press Start 2P"',
            fill: '#fff',
            stroke: '#430',
            strokeThickness: 4,
            align: 'center'
        }
    );
    gameOverText.anchor.setTo(0.5, 0.5);
    gameOverText.scale.setTo(2, 2);    
    // Add mute
    mutebutton = game.add.sprite(game.world.width - 32, 0, 'mutedbutton');
    mutebutton.inputEnabled = true;
    // Add sounds
    flapSnd = game.add.audio('flap');
    scoreSnd = game.add.audio('score');
    hurtSnd = game.add.audio('hurt');
    //musicSnd = game.add.audio('scottjoplin');
   // musicSnd.loop = true;
    // Add controls
    mutebutton.events.onInputDown.add(mute);
    window.addEventListener('keydown',checkKey,false);
    game.input.onDown.add(flap);
    // Start clouds timer
    cloudsTimer = new Phaser.Timer(game);
    cloudsTimer.onEvent.add(spawnCloud);
    cloudsTimer.start();
    cloudsTimer.add(Math.random());
    // Mute Button
    var getmuted = window.localStorage.getItem('muted');
    if(getmuted != null && getmuted == "false"){
      isMuted = false;
      mutebutton.loadTexture('mutebutton');
    } else {
      isMuted = true;
    }
    /* RESET!
    if(!isMuted)
      musicSnd.play();*/
    reset();
}

function reset() {
    gameStarted = false;
    gameOver = false;
    clickedOnce = false;
    fingSpawn = 1;
    fingCntStretch = 0;
    randObstacle = 0;
    mutebutton.inputEnabled = true;
    mutebutton.renderable = true;
    credits.renderable = true;
    scoregoldText.setText('');
    scoreText.setText("Wanna Play Some\nFlappy Birds?");
	instText.setText("CLICK OR PRESS SPACE\nTO FLAP YOUR WINGS\n\n\n\n");
    var name = window.localStorage.getItem('name');
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","/flappy/score.php", true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("top=1&name=" + name);
	xmlhttp.onreadystatechange=function(){
			if (xmlhttp.readyState==4 && xmlhttp.status==200){
			var match = xmlhttp.responseText.match(/(.*)\|(\d*)/);
			topscore = match[1];
			hiscore = (match[2] ? match[2] : 0);
			if(name)
			  name = name.toUpperCase();
			instText.setText("CLICK OR PRESS SPACE\nTO FLAP YOUR WINGS\n\n" + (!name ? "TOP PLAYER: " + topscore + "\n" : "") + (hiscore >= 0 && name ? "\nWELCOME BACK " + name + "!\n" + "\nYOUR HIGHSCORE: " + hiscore : "") + (score >= 0 ? "\nLAST SCORE: " + score : ""));
		}
	}
	gameOverText.renderable = false;
    birdie.body.allowGravity = false;
    birdie.angle = 0;
    birdie.reset(game.world.width / 4, game.world.height / 2);
    birdie.scale.setTo(2, 2);
    score = 0;
    birdie.animations.play('fly');
    fingers.removeAll();
    invs.removeAll();
}

function checkKey(e) {
    if (e.keyCode == 32 || e.keyCode == 13)
        flap();
}

function start() {
    mutebutton.renderable = false;
    mutebutton.inputEnabled = false;
    credits.renderable = false;
    birdie.body.allowGravity = true;
    // SPAWN FINGERS!
    fingersTimer = new Phaser.Timer(game);
    fingersTimer.onEvent.add(spawnFingers);
    fingersTimer.start();
    fingersTimer.add(2);
    // Show score
    scoreText.setText(score);
    instText.renderable = false;
    // START!
    gameStarted = true;
    startTime = game.time.now;
}

function flap() {
    if (!gameStarted) {
        start();
    }
    if (!gameOver) {
        birdie.body.velocity.y = -620;
        if(!isMuted)
          flapSnd.play();
    } else {
      if(clickedOnce)
        reset();
      else{
        instText.setText("\nCLICK ONCE\nTO TRY AGAIN\n\nTIME: " + timeTakenString);
        clickedOnce = true;
      }
    }
}

function spawnCloud() {
    cloudsTimer.stop();

    var cloudY = Math.random() * game.height / 2;
    var cloud = clouds.create(
        game.width,
        cloudY,
        'clouds',
        Math.floor(4 * Math.random())
    );
    var cloudScale = 2 + 2 * Math.random();
    cloud.alpha = 2 / cloudScale;
    cloud.scale.setTo(cloudScale, cloudScale);
    cloud.body.allowGravity = false;
    cloud.body.velocity.x = -490 / cloudScale;
    cloud.anchor.y = 0;

    cloudsTimer.start();
    cloudsTimer.add(4 * Math.random());
}

function o() {
    return 134 + 60 * ((score > 50 ? 50 : 50 - score) / 50);
}

function spawnFinger(fingerY, flipped) {
    var finger = fingers.create(
        game.width,
        fingerY + (flipped ? -o() : o()) / 2,
        'finger'
    );
    finger.body.allowGravity = false;

    // Flip finger! *GASP*
    finger.scale.setTo(2, flipped ? -2 : 2);
    finger.body.offset.y = flipped ? -finger.body.height * 2 : 0;

    // Move to the left
    finger.body.velocity.x = -490;

    return finger;
}

function spawnFingers() {
    fingersTimer.stop();
    var fingerY = 0;
    
    //Math.floor(Math.random() * (max - min + 1) + min)
    
    if(score > 0 && (score + 1) % 5 == 0 && randObstacle == 0)
        randObstacle = Math.round(Math.random()) + 1;
    
    switch(randObstacle){
      case 1:
        fingerY = lastFingerY + ((Math.floor(Math.random() * (10 - 5 + 1) + 5)) * (lastFingerY > 330 ? -1 : 1));
        fingSpawn = 0.3;
        fingCntStretch++;
        if(fingCntStretch == 5){
          randObstacle = 0;
          fingSpawn = 1;
          fingCntStretch = 0;
        }
        break;
      case 2:
        fingerY = 0;
        fingSpawn = 0.6;
        fingCntStretch++;
        if(fingCntStretch == 3){
          randObstacle = 0;
          fingSpawn = 1.3;
          fingCntStretch = 0;
        }
        break;
      case 3:
        fingerY = 0;
        fingSpawn = 0.6;
        fingCntStretch++;
        if(fingCntStretch == 3){
          randObstacle = 0;
          fingSpawn = 1.3;
          fingCntStretch = 0;
        }
        break;
      default:
        fingerY = ((game.height - 16 - o() / 2) / 2) + (Math.random() > 0.5 ? -1 : 1) * Math.random() * game.height / 6;  
        fingSpawn = 1;
        break;
    }
    
    // Bottom finger
    var botFinger = spawnFinger(fingerY);
    
    // Top finger (flipped)
    var topFinger = spawnFinger(fingerY, true);    
    
    lastFingerY = fingerY;

    // Add invisible thingy
    if(randObstacle == 0){
      var inv = invs.create(topFinger.x + topFinger.width, 0);
      inv.width = 2;
      inv.height = game.world.height;
      inv.body.allowGravity = false; 
      inv.body.velocity.x = -490;
    }

    fingersTimer.start();
    
    console.log("spawn:" + fingSpawn + " obs:" + randObstacle + "fingY: " + fingerY + " fingCnt:" + fingCntStretch);
    fingersTimer.add(fingSpawn);
}

function addScore(_, inv) {
    invs.remove(inv);
    score += 1;
    if (score >= hiscore){
      scoregoldText.setText(score);
      scoreText.setText('');
    } else {
      scoregoldText.setText('');
      scoreText.setText(score);
    }
    if(!isMuted)
      scoreSnd.play();
}

function setGameOver() {
    endTime = game.time.now - startTime;
    gameOver = true;
    scoregoldText.setText('');
    scoreText.setText("Score: " + score);
    timeTakenString = (Math.floor(endTime / 1000 / 60) > 0 ? (Math.floor(endTime / 1000 / 60) == 1 ? "1 min " : 
      Math.floor(endTime / 1000 / 60) + "mins ") : "") + (Math.floor(endTime / 1000) == 1 ? 
      "1 sec" : Math.floor(endTime / 1000) + " secs");
    instText.setText("\nDOUBLE CLICK\nTO TRY AGAIN\n\nTIME: " + timeTakenString);
    instText.renderable = true;
    
    // Get Name
    var name = window.localStorage.getItem('name');
    /* while(!name || name.length > 10 || name.length <= 0){
        if(!name)
          name = prompt("Error! Please enter your name.", name);
        else
          name = prompt("Error! Must be less than 10 characters.", name);
      }  */
    if(!name || name == "null" || name == "Please enter your name" || name.length > 10 || name.length == 0){
      name = prompt("New Score! Please enter your name.");
      while(name && (name.length > 10 || name.length == 0))
        name = prompt("Error! Must be less than 10 characters.", name);
      if(name) {
        while(name.charAt(0) == (" ")){name = name.substring(1);}
        window.localStorage.setItem('name', name);
      }
    }
    oldhiscore = hiscore; 
  
    var mesg = (score <= 0 ? "You Got Zero!" : (score < 5 ? "How embarrassing!" : (score < 15 ? "Alright!" : (score < 20 ? "Not Bad!" : (score < 25 ? "Getting Better!" : (score < 30 ? "Nice!" : (score < 40 ? "Such Flap!" : (score < 50 ? "Very WOW!" : (score < 65 ? "Impressive!" : (score < 80 ? "Unbelievable!" : "Godlike!"))))))))));
    
    if(name){
      // Post Score
      //document.getElementById("scoreheader").innerHTML = "UPDATING..";
      //document.getElementById("usersheader").innerHTML = "UPDATING..";
      xmlhttp=new XMLHttpRequest();
      xmlhttp.open("POST","/flappy/score.php", true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.send("name=" + name + "&score=" + score);
      xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
          var match = xmlhttp.responseText.match(/^(\d*)\|(.*)\|(.*)$/);
          hiscore = match[1];
          gameOverText.setText(mesg + (score > parseInt(oldhiscore, 10) && score == hiscore ? "\n\nNEW SCORE!\n" : "\n\nHIGH SCORE\n") + hiscore);
          document.getElementById("scorevalues").innerHTML = match[2];
          document.getElementById("usersvalues").innerHTML = match[3];
        }
      }
    } else
      hiscore = 0;
    
    // Show Text
    gameOverText.setText(mesg + "\n\n\n");
    gameOverText.renderable = true;
    // Stop all fingers
    fingers.forEachAlive(function(finger) {
        finger.body.velocity.x = 0;
    });
    invs.forEach(function(inv) {
        inv.body.velocity.x = 0;
    });
    // Stop spawning fingers
    fingersTimer.stop();
    // Make birdie reset the game 
    //game.events.onInputDown.addOnce(reset);
    //birdie.events.onInputDown.addOnce(reset);
    if(!isMuted)
      hurtSnd.play();
}

function mute() {
  if(isMuted){
    mutebutton.loadTexture('mutebutton');
    isMuted = false;
    window.localStorage.setItem('muted', false);
    /*if(musicSnd.isPlaying == false)
      musicSnd.play();*/
  } else {
    mutebutton.loadTexture('mutedbutton');
    isMuted = true;
    window.localStorage.setItem('muted', true);
    /*if(musicSnd.isPlaying == true)
      musicSnd.stop();*/
  }
}

function update() {
    if (gameStarted) {
        // Make birdie dive
        var dvy = 620 + birdie.body.velocity.y;
        birdie.angle = (90 * dvy / 620) - 180;
        if (birdie.angle < -30) {
            birdie.angle = -30;
        }
        if (
            gameOver ||
            birdie.angle > 90 ||
            birdie.angle < -90
        ) {
            birdie.angle = 90;
            birdie.animations.stop();
            birdie.frame = 3;
        } else {
            birdie.animations.play('fly');
        }
        // Birdie is DEAD!
        if (gameOver) {
            /* dont make birdie bigger
            if (birdie.scale.x < 4) {
                birdie.scale.setTo(
                    birdie.scale.x * 1.2,
                    birdie.scale.y * 1.2
                );
            }*/
            // Shake game over text
            gameOverText.angle = Math.random() * 5 * Math.cos(game.time.now / 100);
        } else {
            // Check game over
            game.physics.overlap(birdie, fingers, setGameOver);
            if (!gameOver && birdie.body.bottom >= game.world.bounds.bottom) {
                setGameOver();
            }
            // Add score
            game.physics.overlap(birdie, invs, addScore);
        }
        // Remove offscreen fingers
        fingers.forEachAlive(function(finger) {
            if (finger.x + finger.width < game.world.bounds.left) {
                finger.kill();
            }
        });
        // Update finger timer
        fingersTimer.update();
    } else {
        birdie.y = (game.world.height / 2) + 8 * Math.cos(game.time.now / 200);
    }
    if (!gameStarted || gameOver) {
        // Shake instructions text
        instText.scale.setTo(
            2 + 0.1 * Math.sin(game.time.now / 100),
            2 + 0.1 * Math.cos(game.time.now / 100)
        );
    }
    // Shake score text
    scoreText.scale.setTo(
        2 + 0.1 * Math.cos(game.time.now / 100),
        2 + 0.1 * Math.sin(game.time.now / 100)
    );
    // Shake gold score textl
    scoregoldText.scale.setTo(
        2 + 0.1 * Math.cos(game.time.now / 100),
        2 + 0.1 * Math.sin(game.time.now / 100)
    );
    // Update clouds timer
    cloudsTimer.update();
    // Remove offscreen clouds
    clouds.forEachAlive(function(cloud) {
        if (cloud.x + cloud.width < game.world.bounds.left) {
            cloud.kill();
        }
    });
    // Scroll fence
    if (!gameOver) {
        fence.tilePosition.x -= game.time.physicsElapsed * 490 / 2;
    }
}

function render() {
    if (false) {
        game.debug.renderSpriteBody(birdie);
        fingers.forEachAlive(function(finger) {
            game.debug.renderSpriteBody(finger);
        });
        invs.forEach(function(inv) {
            game.debug.renderSpriteBody(inv);
        });
    }
}

};
