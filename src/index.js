// https://docs.idew.org/video-game/project-outline/1-7-phaser-practice-3-side-scrolling-game/p3-steps-1-5
var mover = {
    isActive: false,
    startX: 0,
    startY: 0,
    pointer: null,
    id: null,
};
var jumper = {
    isActive: false,
    startX: 0,
    startY: 0,
    pointer: null,
    id: null,
};

function bounds(val, lo, hi) {
    return Math.min(Math.max(val, lo), hi);
}

var graphics;
var main_obj;
var GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function GameScene() {
            Phaser.Scene.call(this, { key: 'gameScene', active: true });

            this.player = null;
            this.cursors = null;
            this.score = 0;
            this.scoreText = null;
        },

    preload: function () {
        this.load.image('sky', 'assets/firstgame/sky.png');
        this.load.image('ground', 'assets/firstgame/platform.png');
        this.load.image('star', 'assets/firstgame/star.png');
        this.load.image('bomb', 'assets/firstgame/bomb.png');
        this.load.spritesheet('dude', 'assets/firstgame/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('fullscreen', 'assets/fullscreen.png', { frameWidth: 64, frameHeight: 64 });
    },

    create: function () {
        main_obj = this;
        this.physics.world.setBounds(0, 0, 800, 600);
        
        this.input.addPointer(10);
        this.add.image(400, 300, 'sky');

        var platforms = this.physics.add.staticGroup();

        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        platforms.create(600, 400, 'ground');

        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        var player = this.physics.add.sprite(100, 450, 'dude');

        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        this.cameras.main.target = player;

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        var stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        stars.children.iterate(function (child) {

            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);

        this.physics.add.overlap(player, stars, this.collectStar, null, this);

        this.player = player;

        var button = this.add.image(400 - 16, 16, 'fullscreen', 0).setOrigin(1, 0).setInteractive();
        button.scrollFactorX = 1;
        button.on('pointerup', function () {

            if (this.scale.isFullscreen) {
                button.setFrame(0);

                this.scale.stopFullscreen();
            }
            else {
                button.setFrame(1);

                this.scale.startFullscreen();
            }

        }, this);

        this.scoreText.setText('v15');

        var FKey = this.input.keyboard.addKey('F');

        FKey.on('down', function () {

            if (this.scale.isFullscreen) {
                button.setFrame(0);
                this.scale.stopFullscreen();
            }
            else {
                button.setFrame(1);
                this.scale.startFullscreen();
            }

        }, this);
        graphics = this.add.graphics();
    },

    update: function () {
        var cursors = this.cursors;
        var player = this.player;

        this.cameras.main.scrollX = player.x - 300 / 2;

        if (cursors.left.isDown || (mover.isActive && mover.pointer.x < mover.startX - 30)) {
            player.setVelocityX(-160);

            player.anims.play('left', true);
        }
        else if (cursors.right.isDown || (mover.isActive && mover.pointer.x > mover.startX + 30)) {
            player.setVelocityX(160);

            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);

            player.anims.play('turn');
        }

        if ((cursors.up.isDown || jumper.isActive) && player.body.touching.down) {
            player.setVelocityY(-330);
        }

        graphics.clear()

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
            let pointer = this.input['pointer' + (i + 1)];
            if (pointer.isDown && pointer.y > this.game.scale.height/4) {
                if (pointer.x <= this.game.scale.width / 2 && !mover.isActive && i != jumper.id) {
                    // Assign pointer to mover
                    mover.isActive = true;
                    mover.pointer = pointer;
                    mover.startX = pointer.x;
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
            let endX = bounds(mover.pointer.x, startX - 80, startX + 80)
            let endY = bounds(startY, startY - 80, startY + 80)
            graphics.fillCircle(startX, startY, 60);

            graphics.lineStyle(10, 0x0a0a0a, 1.0);
            graphics.beginPath();
            graphics.moveTo(startX, startY);
            graphics.lineTo(endX, endY);
            graphics.closePath();
            graphics.strokePath();

            graphics.fillStyle(0x00ff00, 1);
            graphics.fillCircle(endX, endY, 40);
        }

        if (jumper.isActive) {
            graphics.fillStyle(0x0000ff, 1);
            graphics.fillCircle(jumper.startX, jumper.startY, 30);
        }
    },

    collectStar: function (player, star) {
        star.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }

});

var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: GameScene
};

var game = new Phaser.Game(config);
