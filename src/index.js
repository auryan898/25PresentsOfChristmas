import Phaser from 'phaser';
import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';

const encryptWithAES = (passphrase, text) => {
    return AES.encrypt(text, passphrase).toString();
};

const decryptWithAES = (passphrase, ciphertext) => {
    const bytes = AES.decrypt(ciphertext, passphrase);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
};
window.decryptWithAES = decryptWithAES
window.encryptWithAES = encryptWithAES
// https://docs.idew.org/video-game/project-outline/1-7-phaser-practice-3-side-scrolling-game/p3-steps-1-5
// https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Sprite.html#willRender__anchor
function password_prompt() {
    let answer = window.prompt("What's the Secret Password in the Christmas Card?");
    while (!verify_password(answer)) {
        answer = window.prompt("What's the *Correct* Secret Password in the Christmas Card?");
    }
}

function verify_password(password) {
    let hash1 = 'U2FsdGVkX1/I2j98U37gS5e+UqeSEYyPxWQlli4T4KdvBYMr+KWwQ8xrXrHXZ5KGsSdeb39H0PPg+R9XTtEtQQ==';
    if (password == null) {
        document.getElementById('description').style.display = 'none';
        let element = document.getElementById('hidden-link');
        element.onclick = function() {
            if (element.attributes.href.value != '')
                return true;
            else
                password_prompt();
                return false;
        }
        element.style.display = 'block';
        return true; // Cancelling the password attempts
    }

    try {
        let link = decryptWithAES(password, hash1);
        if (link != '') {
            let element = document.getElementById('hidden-link');
            element.setAttribute('href', link);
            element.setAttribute('target', '_blank');
            element.style.display = 'block';
            document.getElementById('description').style.display = 'none';
            window.alert("Your gift card link is at the top of the webpage :)")
            element.click();
            return true;
        }
    } catch (error) {
        console.log(error)
    }
    return false;
}

var mover = {
    deadzone: 8,
    isActive: false,
    startX: 0,
    startY: 0,
    pointer: null,
    id: null
};
var jumper = {
    isActive: false,
    startX: 0,
    startY: 0,
    pointer: null,
    id: null,
};

// var mobile_controls = {
//     deadzone: 20,
//     direction: function () {
//         return {
//             left: mover.isActive && pointer.x < startX - this.deadzone,
//             right: mover.isActive && pointer.x > startX + this.deadzone,
//             up: mover.isActive && pointer.y < startY - this.deadzone,
//             down: mover.isActive && pointer.y > startY + this.deadzone,
//         }
//     },
//     pointers: [],
// }

function bounds(val, lo, hi) {
    return Math.min(Math.max(val, lo), hi);
}

var graphics;

var gravity_t = 0.9;
var gravity_h = 34;
var gravity_a = 4 * gravity_h / (gravity_t * gravity_t);
var gravity_v = 4 * gravity_h / gravity_t;
var gravity_dh = 64;
var gravity_vh = gravity_dh / gravity_t;
var gameHeight = 112;
var gameWidth = gameHeight * 2;
var followOffset = Math.ceil(gameHeight / 6);

var stuff;

var config = {
    type: Phaser.AUTO,
    scale: {
        parent: 'phaser-example',
        width: gameWidth,
        height: gameHeight,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#efefef',
    pixelArt: true,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: gravity_a },
            debug: false
        }
    },
};

var graphics;

var GAME_STARTED = false;
document.getElementById('start-button').addEventListener('click', function () {
    if (!GAME_STARTED) {
        var game = new Phaser.Game(config);
        GAME_STARTED = true;
    }
});
function preload() {
    main = this;
    this.stuff = {
        player: new Player(),
        platforms: new Platforms(),
        fullscreen: new Fullscreen(),
        collectibles: new Collectibles(),
        foreground: new Foreground(),
    }
    stuff = this.stuff;

    this.stuff.player.preload();
    this.stuff.platforms.preload();
    this.stuff.fullscreen.preload();
    this.stuff.collectibles.preload();
    this.stuff.foreground.preload();
}
var main;
function create() {
    // Set the physical boundaries for the player to not hit the world boundaries
    this.physics.world.setBounds(0, 0, 1600 - 160, 480);
    this.cameras.main.setBounds(0, 0, 1600, 480);

    // Initialize the input controls
    this.input.addPointer(10);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.stuff.foreground.create_background();

    // Create objects for the game
    this.stuff.platforms.create();
    this.stuff.fullscreen.create();
    // Special Foreground 
    this.stuff.foreground.create_foreground();

    this.stuff.player.create();
    this.stuff.collectibles.create();

    this.stuff.foreground.create_lastground();

    this.stuff.platforms.collide(this.stuff.player.sprite);
    this.stuff.platforms.collide(this.stuff.collectibles.stars);
    // Set camera following
    this.cameras.main.setZoom(1);
    this.cameras.main.startFollow(this.stuff.player.sprite, true, 0.3, 0.1, 0, followOffset);


    // Add graphics last to be on top
    this.graphics = this.add.graphics();
    graphics = this.graphics;
}

function update() {
    update_mobile_controls();
    this.stuff.player.update();
    this.stuff.fullscreen.update();
    this.stuff.collectibles.update();
}

function create_mobile_controls() {
    // for (let i = 0; i < 10; i++) {
    //     let pointer = main.input['pointer' + (i + 1)];
    //     mobile_controls.pointers = {
    //         original: pointer,
    //         x : function() {
    //             return this.original.x + main.cameras.main.scrollX;
    //         },
    //         y : function() {
    //             return this.original.y + main.cameras.main.scrollY;
    //         }
    //     }
    // }
}

function update_mobile_controls() {
    var cursors = main.cursors;

    graphics.clear()
    graphics.x = main.cameras.main.scrollX;
    graphics.y = main.cameras.main.scrollY;

    // Dissociate pointers from mover/jumper if !isDown
    if (mover.pointer != null && !mover.pointer.isDown) {
        mover.pointer = null;
        mover.isActive = false;
        mover.id = null;
    }

    if (jumper.pointer != null && !jumper.pointer.isDown) {
        jumper.pointer = null;
        jumper.isActive = false;
        jumper.id = null;
    }

    for (let i = 0; i < 10; i++) {
        let pointer = main.input['pointer' + (i + 1)];
        if (pointer.isDown && pointer.y > gameHeight / 4) {
            if (pointer.x <= gameWidth / 2 && !mover.isActive && i != jumper.id) {
                // Assign pointer to mover
                mover.isActive = true;
                mover.pointer = pointer;
                mover.startX = 40;
                mover.startY = pointer.y;
                mover.id = i;
            } else if (!jumper.isActive && i != mover.id) {
                // Assign pointer to jumper
                jumper.isActive = true;
                jumper.pointer = pointer
                jumper.startX = pointer.x;
                jumper.startY = pointer.y;
                jumper.id = i;
            }
        }
    }

    if (mover.isActive) {
        graphics.fillStyle(0xff0000, 1);
        let startX = mover.startX;
        let startY = mover.startY;
        let endX = bounds(mover.pointer.x, startX - 16, startX + 16)
        let endY = bounds(startY, startY - 16, startY + 16)
        graphics.fillCircle(startX, startY, 16);

        graphics.lineStyle(2, 0x0a0a0a, 1.0);
        graphics.beginPath();
        graphics.moveTo(startX, startY);
        graphics.lineTo(endX, endY);
        graphics.closePath();
        graphics.strokePath();

        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(endX, endY, 8);
    }

    if (jumper.isActive) {
        graphics.fillStyle(0x0000ff, 1);
        graphics.fillCircle(jumper.startX, jumper.startY, 16);
    }
}

class Foreground {
    preload() {
        main.load.tilemapTiledJSON('tiles-ground-map', 'assets/snowtiles/Arrangement2.json');
        main.load.image('tiles-background', 'assets/snowtiles/Background.png')
        main.load.image('tiles-largeitems', 'assets/snowtiles/ItemSheet_LargeItems.png')
    }
    create_background() {
        this.map_arranged = main.make.tilemap({ key: "tiles-ground-map" });
        this.tileset_back = this.map_arranged.addTilesetImage('Background', 'tiles-background');
        this.tileset_items = this.map_arranged.addTilesetImage('ItemSheet_LargeItems', 'tiles-largeitems');
        this.tileset_snow = this.map_arranged.addTilesetImage('TileSheet_Snow', 'tiles-snow');
        // map_arranged.setCollisionByExclusion([])
        let layer = this.map_arranged.createLayer('Tile Layer 1', [this.tileset_back, this.tileset_items, this.tileset_snow]);
        // layer.setCollisionByProperty({ collides: false });
    }
    create_foreground() {
        let layer = this.map_arranged.createLayer('Tile Layer 2', [this.tileset_back, this.tileset_items, this.tileset_snow]);
        // layer.setCollisionByProperty({});
    }

    create_lastground() {
        let layer = this.map_arranged.createLayer('Tile Layer 3', [this.tileset_back, this.tileset_items, this.tileset_snow]);
    }
}

class Collectibles {
    preload() {
        main.load.image('star', 'assets/firstgame/star.png');
        main.load.image('props', 'assets/collectibles/props.png')
        main.load.once('filecomplete-image-props', function () {
            let tex = main.textures.get('props');
            // Gifts 0-2
            tex.add(0, 0, 81, 8, 7, 8);
            tex.add(1, 0, 97, 8, 7, 8);
            tex.add(2, 0, 113, 8, 7, 8);

            // Star
            tex.add(3, 0, 112, 59, 7, 6);

            // Snowman
            tex.add(4, 0, 27, 14, 10, 8);

            // Tree, Ornaments, Lights, Tinsel
            tex.add(5, 0, 9, 64, 22, 39);
            tex.add(6, 0, 34, 64, 22, 39);
            tex.add(7, 0, 56, 64, 22, 39);
            tex.add(8, 0, 81, 64, 22, 39);
        });
    }
    create() {
        this.xoff = 8;
        this.yoff = 8;
        this.score = 0;

        var stars = main.physics.add.group();
        this.stars = stars;
        // ground = 16 * 14
        // first platform = 16 * 9
        // 25 presents goal
        let coordinates = [
            [-1, 4, 7],
            [-1, 8, 10],
            [-1, 11, 5],
            [-1, 12, 5],
            [-1, 14, 10],
            [-1, 2, 13],
            [-1, 9, 13],
            [-1, 18, 13],
            [-1, 23, 11],
            [-1, 26, 6],
            [-1, 28, 6],
            [-1, 31, 12],
            [-1, 33, 9],
            [-1, 35, 9],
            [-1, 32, 4],
            [-1, 33, 4],
            [-1, 34, 4],
            [-1, 35, 4],
            [-1, 41, 7],
            [-1, 44, 7],
            [-1, 51, 8],
            [-1, 53, 8],

            [-1, 38, 13],
            [-1, 45, 13],
            [-1, 53, 13],
            [-1, 60, 13],

            [-1, 60, 9],
            [-1, 66, 11],
            [-1, 69, 10],
            [-1, 63, 15],
            [-1, 67, 16],
            [-1, 72, 13],

            [-1, 76, 13],
            [-1, 74, 8],
            [-1, 71, 6],
            [-1, 72, 6],
        ]

        for (let i = 0; i < coordinates.length; i++) {
            let coord = coordinates[i];
            let frame = coord[0] >= 0 ? coord[0] : (i + 1) % 3;
            let x = coord[1] * 16 + 8;
            let y = coord[2] * 16;
            stars.create(x, y, 'props', frame);
        }

        stars.children.iterate(function (child) {
            child.displayWidth = 8;
            child.scaleY = child.scaleX;
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        this.scoreText = main.add.text(this.xoff, this.yoff, 'Gifts Collected: 0', { fontSize: '32px', fill: '#000' });
        this.scoreText.setFontFamily('Times New Roman')
        this.scoreText.setStroke(0, 1);
        this.scoreText.setScale(0.5);

        main.physics.add.overlap(main.stuff.player.sprite, stars, this.collectStar, null, this);
    }
    collectStar(player, star) {
        star.disableBody(true, true);

        this.score += 1;
        this.scoreText.setText('Gifts Collected: ' + this.score);
        if (this.score >= 25) {
            this.scoreText.setText('You got them all!');
            main.stuff.player.flyToEnd();
        }
    }
    update() {
        this.scoreText.x = main.cameras.main.scrollX + this.xoff;
        this.scoreText.y = main.cameras.main.scrollY + this.yoff;

        this.stars.children.iterate(function (child) {
            if (child.body.blocked.down) {
                child.setVelocityY(Phaser.Math.FloatBetween(-gravity_v / 3, -gravity_v / 2));
            }
        });
    }
}

class Fullscreen {
    preload() {
        main.load.spritesheet('fullscreen', 'assets/fullscreen.png', { frameWidth: 64, frameHeight: 64 });
    }
    create() {
        this.xoff = 8;
        this.yoff = 8

        var button = main.add.image(gameWidth - this.xoff, this.yoff, 'fullscreen', 0).setOrigin(1, 0).setInteractive();
        this.button = button;

        button.setScale(0.25)

        button.on('pointerup', function () {

            if (main.scale.isFullscreen) {
                button.setFrame(0);

                main.scale.stopFullscreen();
            }
            else {
                button.setFrame(1);

                main.scale.startFullscreen();
            }

        }, main);

        document.getElementById('fullscreen-button').addEventListener('click', function () {
            if (main.scale.isFullscreen) {
                button.setFrame(0);

                main.scale.stopFullscreen();
            }
            else {
                button.setFrame(1);

                main.scale.startFullscreen();
            }
        });
    }
    update() {
        this.button.x = main.cameras.main.scrollX + (gameWidth - this.xoff);
        this.button.y = main.cameras.main.scrollY + this.yoff;
    }
}

class Platforms {
    preload() {
        main.load.image('ground', 'assets/firstgame/platform.png');
        main.load.tilemapTiledJSON('tiles-arranged-map', 'assets/snowtiles/Arrangement1.json')
        main.load.image('tiles-snow', 'assets/snowtiles/TileSheet_Snow.png')
        main.load.image('tiles-festive', 'assets/snowtiles/TileSheet_Festive.png')
    }

    create() {
        // this.group = main.physics.add.staticGroup();
        var platforms = this.group;

        let map_arranged = main.make.tilemap({ key: "tiles-arranged-map" });
        let tileset_snow = map_arranged.addTilesetImage('TileSheet_Snow', 'tiles-snow');
        let tileset_festive = map_arranged.addTilesetImage('TileSheet_Festive', 'tiles-festive');

        let layer = map_arranged.createLayer('Tile Layer 1', [tileset_snow, tileset_festive]);
        // map_arranged.setCollisionByExclusion([-1])
        // layer.setCollisionByProperty({ collides: true });
        layer.setCollisionFromCollisionGroup();
        this.group = layer;
        // platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        // platforms.create(600, 400, 'ground');

        // platforms.create(50, 250, 'ground');
        // platforms.create(750, 220, 'ground');
    }

    collide(other) {
        main.physics.add.collider(other, this.group, null, null, main);
    }

    update() {

    }
}

class Player {
    preload() {
        // main.load.spritesheet('dude', 'assets/firstgame/dude.png', { frameWidth: 32, frameHeight: 48 });
        // main.load.spritesheet('dude', 'assets/characters/Santa/SantaIdle/SantaIdle_01_16x4.png', {frameWidth:20, frameHeight: 12});
        // main.load.spritesheet('santawalk', 'assets/characters/Santa/SantaWalk_01_16x1.png', {frameWidth:18, frameHeight:16});

        for (let i = 1; i <= 16; i++) {
            main.load.image('santawalk' + i, 'assets/characters/Santa/SantaWalk/SantaWalk_' + String(i).padStart(2, '0') + '.png')
        }
        for (let i = 1; i <= 64; i++) {
            main.load.image('santaidle' + i, 'assets/characters/Santa/SantaIdle/SantaIdle_' + String(i).padStart(2, '0') + '.png')
        }
        main.load.spritesheet('santaspin', 'assets/characters/Santa/SantaAttack.png', { frameHeight: 32, frameWidth: 32 })
        main.load.spritesheet('santagift', 'assets/characters/Santa/SantaGift.png', { frameHeight: 32, frameWidth: 32 })
    }

    create() {
        this.isPresenting = false;
        this.sprite = main.physics.add.sprite(80, 180, 'santaidle1');
        let sprite = this.sprite;
        // sprite.setScale(2)
        // sprite.displayWidth = 100;
        // sprite.scaleY = sprite.scaleX;
        sprite.setBounce(0);
        sprite.setCollideWorldBounds(true);
        // sprite.setOrigin(0.5, 0);

        let santawalkright = []
        let santawalkleft = []
        let santaidleright = []
        let santaidleleft = []
        for (let i = 1; i <= 4; i++) {
            santawalkright.push({ key: 'santawalk' + i })
            santawalkleft.push({ key: 'santawalk' + (i + 4) })
        }
        for (let i = 1; i <= 16; i++) {
            santaidleright.push({ key: 'santaidle' + i })
            santaidleleft.push({ key: 'santaidle' + (i + 16) })
        }

        let santaheli = []
        for (let j = 0; j <= 3; j++) {
            for (let i = 2; i <= 6; i++) {
                santaheli.push({ key: 'santaspin', frame: i + 9 * j });
            }
        }
        // for (let i = 2; i <= 6; i++) {
        //     santaheli.push({key: 'santaspin', frame: i+9*1});
        // }

        main.anims.create({
            key: 'search_bag',
            frames: main.anims.generateFrameNames('santagift', { start: 18, end: 18 + 13 }),
            repeat: 0,
            framerate: 1,
        })

        main.anims.create({
            key: 'show_present',
            frames: main.anims.generateFrameNames('santagift', { start: 18 + 14, end: 18 + 18 - 1 }),
            repeat: -1,
            framerate: 5,
        })

        main.anims.create({
            key: 'spin',
            frames: santaheli,
            frameRate: 10,
            repeat: -1,
        })

        main.anims.create({
            key: 'right',
            frames: santawalkright,
            frameRate: 5,
            // repeat: -1
        });

        main.anims.create({
            key: 'idleright',
            frames: santaidleright,
            frameRate: 10
        });

        main.anims.create({
            key: 'idleleft',
            frames: santaidleleft,
            frameRate: 10
        });

        main.anims.create({
            key: 'left',
            frames: santawalkleft,
            frameRate: 5,
            // repeat: -1
        });

        this.isRight = false;
        this.isWalk = false;

        sprite.setOrigin(0.5, 1.0)
    }

    flyToEnd() {
        // main.cameras.main.setZoom(0.8);
        let timeline = main.tweens.createTimeline();
        let player = this.sprite;
        timeline.add({
            targets: player,
            // x: 81 * 16,
            y: player.y - 5 * 16,
            ease: 'Linear',
            duration: 3000,
        });

        timeline.add({
            targets: player,
            x: 91.5 * 16,
            y: 2 * 16,
            ease: 'Power1',
            duration: 3000,
        })
        let self = this;
        timeline.add({
            targets: player,
            x: 91.5 * 16,
            y: 5 * 16,
            ease: 'Power1',
            duration: 1500,
            onComplete: function () {
                player.body.enable = true;
                self.doPresent();
            }
        })
        player.body.enable = false;
        player.anims.play('right', true);
        player.setOrigin(0.0, 1.0);
        player.anims.play('spin', true);
        timeline.play();
    }

    doPresent() {
        let player = this.sprite;
        player.body.enable = false;
        // player.anims.play('search_bag')
        main.stuff.collectibles.scoreText.setText("You win!");
        player.chain(['search_bag', 'show_present']);
        player.anims.stop();
        player.y += 12;
        setTimeout(function () {
            password_prompt();
        }, 3500);
    }

    update() {

        let cursors = main.cursors;
        let player = this.sprite;

        if (!player.body.enable) {
            return;
        }

        if (cursors.left.isDown || (mover.isActive && mover.pointer.x < mover.startX - 4)) {
            this.isRight = false;
            this.isWalk = true;
            if (!mover.isActive)
                player.setVelocityX(-gravity_vh);
            else
                player.setVelocityX(gravity_vh * bounds(0.01 * (mover.pointer.x - mover.startX) * 10, -1, 1));
        }
        else if (cursors.right.isDown || (mover.isActive && mover.pointer.x > mover.startX + 4)) {
            this.isRight = true;
            this.isWalk = true;
            if (!mover.isActive)
                player.setVelocityX(gravity_vh);
            else
                player.setVelocityX(gravity_vh * bounds(0.01 * (mover.pointer.x - mover.startX) * 10, -1, 1));
        }
        else {
            this.isWalk = false;
            player.setVelocityX(0);
        }

        if ((cursors.up.isDown || jumper.isActive) && player.body.blocked.down) {
            // this.isWalk = true;
            player.setVelocityY(-gravity_v);
        }

        if (!player.body.blocked.down) {
            this.isWalk = true;
        }

        if (this.isWalk) {
            if (this.isRight) {
                player.anims.play('right', true);
                player.setOrigin(1.0, 1.0);
            } else {
                player.anims.play('left', true);
                player.setOrigin(0.0, 1.0);
            }
        } else {

            if (this.isRight) {
                player.anims.play('idleright', true);
                player.setOrigin(1.0, 1.0);
            } else {
                player.anims.play('idleleft', true);
                player.setOrigin(0.0, 1.0);
            }
        }
    }
}