class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        this.load.image("gemW", "./assets/56.png");
        this.load.image("gemR", "./assets/57.png");
        this.load.image("gemB", "./assets/58.png");
    }

    create() {
        this.selectedPoints = [];
        this.movingPoints = [];
        this.movingRect = this.add.rectangle(0, 0, 200, 200, 0xffcccb, 0.5)
            .setOrigin(0, 0)
        this.quad = new QuadTree(0, 0, 800, 600);
        this.input.keyboard.on("keydown-P", () => {
            let sprite = this.add.sprite(this.input.activePointer.x, this.input.activePointer.y, "gemW")
                .setOrigin(.5, .5);
            this.quad.addObject(sprite.x, sprite.y, sprite)
        })
        this.cursorRect = this.add.rectangle(0, 0, 0, 0, 0x6666ff, 0.5)
        this.cursorStartPoint = { x: -10000, y: -1 };
        this.input.on("pointerdown", () => {
            this.cursorStartPoint = { x: this.input.activePointer.x, y: this.input.activePointer.y };
            this.cursorRect.x = this.input.activePointer.x;
            this.cursorRect.y = this.input.activePointer.y;
        })
        this.input.on("pointerup", () => {
            this.cursorStartPoint = { x: -10000, y: -1 };
            this.cursorRect.x = -10000;
            this.cursorRect.setSize(0, 0);
        })
    }

    update() {
        //clear crystal colors
        for (let i = 0; i < this.selectedPoints.length;) {
            let point = this.selectedPoints.pop();
            point.object.setTexture("gemW");
        }
        for (let i = 0; i < this.movingPoints.length;) {
            let point = this.movingPoints.pop();
            point.object.setTexture("gemW");
        }
        //draw rectangle and recolor crystals
        if (this.cursorStartPoint.x != -10000) {
            //move selection box
            this.cursorRect.setSize(this.input.activePointer.x - this.cursorStartPoint.x, this.input.activePointer.y - this.cursorStartPoint.y);
            //query quadTree for points in selection rectangle
            this.selectedPoints = this.quad.boxQuery(this.cursorStartPoint.x, this.input.activePointer.y, this.input.activePointer.x, this.cursorStartPoint.y);
            for (let i = 0; i < this.selectedPoints.length; i++) {
                this.selectedPoints[i].object.setTexture("gemR");
            }
        }
        //handle moveing rectangle
        this.movingRect.x += 5;
        if (this.movingRect.x > 600) {
            this.movingRect.x = 0;
            this.movingRect.y += 200;
        }
        this.movingRect.y = this.movingRect.y > 500 ? 0 : this.movingRect.y;
        this.movingPoints = this.quad.boxQuery(this.movingRect.x, this.movingRect.y + 200, this.movingRect.x + 200, this.movingRect.y);
        for (let i = 0; i < this.movingPoints.length; i++) {
            this.movingPoints[i].object.setTexture("gemB");
        }


    }
}