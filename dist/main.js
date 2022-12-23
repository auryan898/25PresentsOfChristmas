// https://docs.idew.org/video-game/project-outline/1-7-phaser-practice-3-side-scrolling-game/p3-steps-1-5
// https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Sprite.html#willRender__anchor
function bounds(val, lo, hi) {
    return Math.min(Math.max(val, lo), hi);
}

var gravity_t = 0.5;
var gravity_h = 92;
var gravity_a = 4 * gravity_h / (gravity_t * gravity_t);
var gravity_v = 4 * gravity_h / gravity_t;
var gravity_dh = 150;
var gravity_vh = gravity_dh / gravity_t;

var config = {
    type: Phaser.AUTO,
    scale: {
        parent: 'phaser-example',
        width: 800,
        height: 600,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#efefef',
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

    this.stuff.player.preload();
    this.stuff.platforms.preload();
}
var main;
function create() {
    // Set the physical boundaries for the player to not hit the world boundaries
    this.physics.world.setBounds(0, 0, 800, 600);

    // Initialize the input controls
    this.input.addPointer(10);
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create objects for the game
    this.stuff.player.create();
    this.stuff.platforms.create();
    this.stuff.platforms.collide(this.stuff.player.sprite);

}

function update() {
    this.stuff.player.update();
}

class Platforms {
    preload() {
        main.load.image('ground', 'assets/firstgame/platform.png');
    }

    create() {
        this.group = main.physics.add.staticGroup();
        var platforms = this.group;

        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        platforms.create(600, 400, 'ground');

        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');
    }

    collide(other) {
        main.physics.add.collider(other, this.group);
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
            main.load.image('santawalk'+i, 'assets/characters/Santa/SantaWalk/SantaWalk_'+String(i).padStart(2, '0')+'.png')
        }
        for (let i = 1; i <= 64; i++) {
            main.load.image('santaidle'+i, 'assets/characters/Santa/SantaIdle/SantaIdle_'+String(i).padStart(2, '0')+'.png')
        }
    }

    create() {
        this.sprite = main.physics.add.sprite(100, 450, 'santaidle1');
        let sprite = this.sprite;
        // sprite.setScale(2)
        sprite.displayWidth = 100;
        sprite.scaleY = sprite.scaleX;
        sprite.setBounce(0.1);
        sprite.setCollideWorldBounds(true);

        let santawalkright = []
        let santawalkleft = []
        let santaidleright = []
        let santaidleleft = []
        for (let i = 1; i <= 4; i++) {
            santawalkright.push({key: 'santawalk'+i})
            santawalkleft.push({key: 'santawalk'+(i+4)})
        }
        for (let i = 1; i <= 16; i++) {
            santaidleright.push({key: 'santaidle'+i})
            santaidleleft.push({key: 'santaidle'+(i+16)})
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
    }

    update() {
        let cursors = main.cursors;
        let player = this.sprite;
        
        if (cursors.left.isDown) {
            player.setVelocityX(-gravity_vh);
            this.isRight = false;
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(gravity_vh);
            this.isRight = true;
            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);
            if (this.isRight) {
                player.anims.play('idleright', true);
            } else {
                player.anims.play('idleleft', true);
            }
        }

        if ((cursors.up.isDown) && player.body.touching.down) {
            player.setVelocityY(-gravity_v);
        }
    }
}