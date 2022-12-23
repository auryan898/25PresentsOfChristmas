// https://docs.idew.org/video-game/project-outline/1-7-phaser-practice-3-side-scrolling-game/p3-steps-1-5
// https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Sprite.html#willRender__anchor
function bounds(val, lo, hi) {
    return Math.min(Math.max(val, lo), hi);
}

var gravity_t = 0.5;
var gravity_h = 32;
var gravity_a = 4 * gravity_h / (gravity_t * gravity_t);
var gravity_v = 4 * gravity_h / gravity_t;
var gravity_dh = 64;
var gravity_vh = gravity_dh / gravity_t;
var gameWidth = 270;
var gameHeight = 150;
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

var game = new Phaser.Game(config);

function preload() {
    main = this;
    this.stuff = {
        player: new Player(),
        platforms: new Platforms(),
    }
    stuff = this.stuff;

    this.stuff.player.preload();
    this.stuff.platforms.preload();
}
var main;
function create() {
    // Set the physical boundaries for the player to not hit the world boundaries
    this.physics.world.setBounds(0, 0, 1600, 300);
    this.cameras.main.setBounds(0, 0, 1600, 300);

    // Initialize the input controls
    this.input.addPointer(10);
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create objects for the game
    this.stuff.player.create();
    this.stuff.platforms.create();
    this.stuff.platforms.collide(this.stuff.player.sprite);


    this.cameras.main.setZoom(1);
    this.cameras.main.startFollow(this.stuff.player.sprite, true, 1.0, 0.1, 0, 0);
    // this.cameras.main.setLerp(1.0, 0.1)
    // this.cameras.main.setRoundPixels(true)
}

function update() {
    this.stuff.player.update();
}

class Platforms {
    preload() {
        main.load.image('ground', 'assets/firstgame/platform.png');
        // main.load.tilemapTiledJSON('tiles-snow-map', 'assets/snowtiles/TileSheet_Snow.json')
        // main.load.tilemapTiledJSON('tiles-festive-map', 'assets/snowtiles/TileSheet_Festive.json')
        main.load.tilemapTiledJSON('tiles-arranged-map', 'assets/snowtiles/Arrangement1.json')
        main.load.image('tiles-snow', 'assets/snowtiles/TileSheet_Snow.png')
        main.load.image('tiles-festive', 'assets/snowtiles/TileSheet_Festive.png')
    }

    create() {
        // this.group = main.physics.add.staticGroup();
        var platforms = this.group;

        // let map_snow = this.make.tilemap({key: 'tiles-snow-map'});
        // let tileset_snow = map.addTilesetImage('tiles-snow');

        // let map_festive = this.make.tilemap({key: 'tiles-festive-map'});
        // let tileset_festive = map.addTilesetImage('tiles-festive');

        let map_arranged = main.make.tilemap({key: "tiles-arranged-map"});
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
    }

    create() {
        this.sprite = main.physics.add.sprite(100, 50, 'santaidle1');
        let sprite = this.sprite;
        // sprite.setScale(2)
        // sprite.displayWidth = 100;
        // sprite.scaleY = sprite.scaleX;
        sprite.setBounce(0);
        sprite.setCollideWorldBounds(true);

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
        main.anims.create({
            key: 'right',
            frames: santawalkright,
            frameRate: 10,
            repeat: -1
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
            frameRate: 10,
            repeat: -1
        });

        this.isRight = false;
        this.isWalk = false;
        
        sprite.setOrigin(0.5, 1.0)
    }

    update() {
        let cursors = main.cursors;
        let player = this.sprite;

        if (cursors.left.isDown) {
            this.isRight = false;
            this.isWalk = true;
            player.setVelocityX(-gravity_vh);
        }
        else if (cursors.right.isDown) {
            this.isRight = true;
            this.isWalk = true;
            player.setVelocityX(gravity_vh);
        }
        else {
            this.isWalk = false;
            player.setVelocityX(0);
        }

        if ((cursors.up.isDown) && player.body.blocked.down) {
            // this.isWalk = true;
            player.setVelocityY(-gravity_v);
        }

        if (!player.body.blocked.down) {
            this.isWalk = true;
        }

        if (this.isWalk) {
            if (this.isRight) {
                player.anims.play('right', true);
            } else {
                player.anims.play('left', true);
            }
        } else {

            if (this.isRight) {
                player.anims.play('idleright', true);
            } else {
                player.anims.play('idleleft', true);
            }
        }
    }
}