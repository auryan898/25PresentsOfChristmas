import Phaser from 'phaser';

var config = {
    type: Phaser.AUTO,
    scale: {
        parent: 'phaser-example',
        width: 1600,
        height: 900,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#efefef',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var graphics;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('logo', './assets/phaser3-logo.png');
}

function create ()
{

    var self = this;
    //  We need 2 extra pointers, as we only get 1 by default
    this.input.addPointer(10);

    var sprite1 = this.add.sprite(400, 100, 'logo').setInteractive({ draggable: true });

    sprite1.on('drag', function (pointer, dragX, dragY) {

        this.x = dragX;
        this.y = dragY;

    });

    var sprite2 = this.add.sprite(400, 300, 'logo').setInteractive({ draggable: true });

    sprite2.on('drag', function (pointer, dragX, dragY) {

        this.x = dragX;
        this.y = dragY;
        // if (self.scale.isFullscreen)
        //     self.scale.stopFullscreen();

    });

    var sprite3 = this.add.sprite(400, 500, 'logo').setInteractive({ draggable: true });

    
    sprite3.on('drag', function (pointer, dragX, dragY) {

        this.x = dragX;
        this.y = dragY;

        // if (!self.scale.isFullscreen)
        //     self.scale.startFullscreen();
    });

    graphics = this.add.graphics();

    this.add.text(10, 10, 'Multi touch drag test', { font: '16px Courier', fill: '#000000' });

    console.log(this.game.width, this.game.height)
}
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

function update ()
{
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
        let pointer = this.input['pointer'+(i+1)];
        if (pointer.isDown) {
            if (pointer.x <= this.game.scale.width/2 && !mover.isActive && i != jumper.id) {
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
        graphics.fillCircle(startX, startY, 160);

        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(bounds(mover.pointer.x, startX-80, startX+80), bounds(mover.pointer.y, startY-80, startY+80), 80);
    }

    if (jumper.isActive) {
        graphics.fillStyle(0x0000ff, 1);
        graphics.fillCircle(jumper.startX, jumper.startY, 80);
    }
}
