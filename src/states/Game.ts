export class Game extends Phaser.State {
  private readonly RUNNING_SPEED = 180;
  private readonly JUMPING_SPEED = 550;
  private actionButton: Phaser.Button;
  private cursor: Phaser.CursorKeys;
  private ground: Phaser.Sprite;
  private leftArrow: Phaser.Button;
  private platforms: Phaser.Group;
  private player: Phaser.Sprite;
  private rightArrow: Phaser.Button;

  public init() {
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.arcade.gravity.y = 1000;

    this.cursor = this.input.keyboard.createCursorKeys();
  }

  public preload() {
    this.load.image('ground', 'images/ground.png');
    this.load.image('platform', 'images/platform.png');
    this.load.image('goal', 'images/gorilla3.png');
    this.load.image('arrowButton', 'images/arrowButton.png');
    this.load.image('actionButton', 'images/actionButton.png');
    this.load.image('barrel', 'images/barrel.png');
    this.load.spritesheet('player', 'images/player_spritesheet.png', 28, 30, 5, 1, 1);
    this.load.spritesheet('fire', 'images/fire_spritesheet.png', 20, 21, 2, 1, 1);
  }

  public create() {
    this.ground = this.add.sprite(0, 500, 'ground');
    this.physics.arcade.enableBody(this.ground);
    this.ground.body.allowGravity = false;
    this.ground.body.immovable = true;

    const platformData = [
      {x: 0, y: 430},
      {x: 45, y: 560},
      {x: 90, y: 290},
      {x: 0, y: 140},
    ];

    this.platforms = this.add.group();
    this.platforms.enableBody = true;

    platformData.forEach((element) => {
      this.platforms.create(element.x, element.y, 'platform');
    });

    this.platforms.setAll('body.immovable', true);
    this.platforms.setAll('body.allowGravity', false);

    this.player = this.add.sprite(100, 200, 'player', 3);
    this.player.anchor.setTo(0.5);
    this.player.animations.add('walking', [0, 1, 2, 1], 6, true);
    this.physics.arcade.enableBody(this.player);

    this.createOnscreenControls();
  }

  public update() {
    this.physics.arcade.collide(this.player, this.ground);
    this.physics.arcade.collide(this.player, this.platforms);

    this.player.body.velocity.x = 0;

    if (this.cursor.left.isDown || this.player.data.isMovingLeft) {
      this.player.body.velocity.x = -this.RUNNING_SPEED;
    } else if (this.cursor.right.isDown || this.player.data.isMovingRight) {
      this.player.body.velocity.x = this.RUNNING_SPEED;
    }

    if ((this.cursor.up.isDown || this.player.data.mustJump) && this.player.body.touching.down) {
      this.player.body.velocity.y = -this.JUMPING_SPEED;
      this.player.data.mustJump = false;
    }
  }

  private createOnscreenControls() {
    this.leftArrow = this.add.button(20, 535, 'arrowButton');
    this.rightArrow = this.add.button(110, 535, 'arrowButton');
    this.actionButton = this.add.button(280, 535, 'actionButton');

    this.leftArrow.alpha = 0.5;
    this.rightArrow.alpha = 0.5;
    this.actionButton.alpha = 0.5;

    this.actionButton.events.onInputDown.add(() => {
      this.player.data.mustJump = true;
    });

    this.actionButton.events.onInputUp.add(() => {
      this.player.data.mustJump = false;
    });

    this.leftArrow.events.onInputDown.add(() => {
      this.player.data.isMovingLeft = true;
    });

    this.leftArrow.events.onInputUp.add(() => {
      this.player.data.isMovingLeft = false;
    });

    this.leftArrow.events.onInputOver.add(() => {
      this.player.data.isMovingLeft = true;
    });

    this.leftArrow.events.onInputOut.add(() => {
      this.player.data.isMovingLeft = false;
    });

    this.rightArrow.events.onInputDown.add(() => {
      this.player.data.isMovingRight = true;
    });

    this.rightArrow.events.onInputUp.add(() => {
      this.player.data.isMovingRight = false;
    });

    this.rightArrow.events.onInputOver.add(() => {
      this.player.data.isMovingRight = true;
    });

    this.rightArrow.events.onInputOut.add(() => {
      this.player.data.isMovingRight = false;
    });
  }
}
