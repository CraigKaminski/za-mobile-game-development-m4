export class Game extends Phaser.State {
  private readonly RUNNING_SPEED = 180;
  private readonly JUMPING_SPEED = 550;
  private actionButton: Phaser.Button;
  private barrelCreator: Phaser.TimerEvent;
  private barrels: Phaser.Group;
  private cursor: Phaser.CursorKeys;
  private fires: Phaser.Group;
  private goal: Phaser.Sprite;
  private ground: Phaser.Sprite;
  private leftArrow: Phaser.Button;
  private levelData: any;
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

    this.world.setBounds(0, 0, 360, 700);
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
    this.load.text('level', 'data/level.json');
  }

  public create() {
    this.ground = this.add.sprite(0, 638, 'ground');
    this.physics.arcade.enableBody(this.ground);
    this.ground.body.allowGravity = false;
    this.ground.body.immovable = true;

    this.levelData = JSON.parse(this.game.cache.getText('level'));

    this.platforms = this.add.group();
    this.platforms.enableBody = true;

    this.levelData.platformData.forEach((element: {x: number, y: number}) => {
      this.platforms.create(element.x, element.y, 'platform');
    });

    this.platforms.setAll('body.immovable', true);
    this.platforms.setAll('body.allowGravity', false);

    this.fires = this.add.group();
    this.fires.enableBody = true;

    this.levelData.fireData.forEach((element: {x: number, y: number}) => {
      const fire = this.fires.create(element.x, element.y, 'fire');
      fire.animations.add('fire', [0, 1], 4, true);
      fire.play('fire');
    });

    this.fires.setAll('body.allowGravity', false);

    this.goal = this.add.sprite(this.levelData.goal.x, this.levelData.goal.y, 'goal');
    this.physics.arcade.enable(this.goal);
    this.goal.body.allowGravity = false;

    this.player = this.add.sprite(this.levelData.playerStart.x, this.levelData.playerStart.y, 'player', 3);
    this.player.anchor.setTo(0.5);
    this.player.animations.add('walking', [0, 1, 2, 1], 6, true);
    this.physics.arcade.enableBody(this.player);
    this.player.body.collideWorldBounds = true;

    this.camera.follow(this.player);

    this.createOnscreenControls();

    this.barrels = this.add.group();
    this.barrels.enableBody = true;

    this.createBarrel();
    this.barrelCreator = this.time.events.loop(Phaser.Timer.SECOND * this.levelData.barrelFrequency, this.createBarrel, this);
  }

  public update() {
    this.physics.arcade.collide(this.player, this.ground);
    this.physics.arcade.collide(this.player, this.platforms);

    this.physics.arcade.collide(this.barrels, this.ground);
    this.physics.arcade.collide(this.barrels, this.platforms);
    this.physics.arcade.overlap(this.player, this.barrels, this.killPlayer, undefined, this);

    this.game.physics.arcade.overlap(this.player, this.fires, this.killPlayer, undefined, this);
    this.game.physics.arcade.overlap(this.player, this.goal, this.win, undefined, this);

    this.player.body.velocity.x = 0;

    if (this.cursor.left.isDown || this.player.data.isMovingLeft) {
      this.player.body.velocity.x = -this.RUNNING_SPEED;
      this.player.scale.setTo(1, 1);
      this.player.play('walking');
    } else if (this.cursor.right.isDown || this.player.data.isMovingRight) {
      this.player.body.velocity.x = this.RUNNING_SPEED;
      this.player.scale.setTo(-1, 1);
      this.player.play('walking');
    } else {
      this.player.animations.stop();
      this.player.frame = 3;
    }

    if ((this.cursor.up.isDown || this.player.data.mustJump) && this.player.body.touching.down) {
      this.player.body.velocity.y = -this.JUMPING_SPEED;
      this.player.data.mustJump = false;
    }

    this.barrels.forEach((element: Phaser.Sprite) => {
      if (element.x < 10 && element.y > 600) {
        element.kill();
      }
    }, this);
  }

  private createOnscreenControls() {
    this.leftArrow = this.add.button(20, 535, 'arrowButton');
    this.rightArrow = this.add.button(110, 535, 'arrowButton');
    this.actionButton = this.add.button(280, 535, 'actionButton');

    this.leftArrow.alpha = 0.5;
    this.rightArrow.alpha = 0.5;
    this.actionButton.alpha = 0.5;

    this.leftArrow.fixedToCamera = true;
    this.rightArrow.fixedToCamera = true;
    this.actionButton.fixedToCamera = true;

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

  private killPlayer(player: Phaser.Sprite, fire: Phaser.Sprite) {
    this.state.start('Game');
  }

  private win(player: Phaser.Sprite, goal: Phaser.Sprite) {
    this.state.start('Game');
  }

  private createBarrel() {
    let barrel: Phaser.Sprite = this.barrels.getFirstExists(false);

    if (!barrel) {
      barrel = this.barrels.create(0, 0, 'barrel');
    }

    barrel.body.collideWorldBounds = true;
    barrel.body.bounce.set(1, 0);

    barrel.reset(this.levelData.goal.x, this.levelData.goal.y);
    barrel.body.velocity.x = this.levelData.barrelSpeed;
  }
}
