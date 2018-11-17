class Track {
  constructor() {
    this.img = new Image();
    this.img.src = "../images/racetrack.png";
  }
}

class Car {
  constructor(color, startX, startY) {
    this.baseAngle=270*Math.PI/180;
    this.phys = {
      x: startX,
      y: startY,
      dir: 0,
      speed: 4,
      x_pointto: 0, 
      y_pointto: 0  
    };

    this.vis = {
      x: startX,
      y: startY,
      dir: 0,
      width: 25,
      height: 50,
      img: new Image()
    };

    switch (color) {
      case "red":
        this.vis.img.src = "../images/car_red_small_5.png";
        break;
      default:
        this.vis.img.src = "../images/car_red_small_5.png";
        break;
    }
      this.lineFactor= 25;
      this.phys.x_pointto = this.phys.speed*this.lineFactor * Math.cos(this.phys.dir+this.baseAngle)+this.phys.x;
      this.phys.y_pointto = this.phys.speed*this.lineFactor * Math.sin(this.phys.dir+this.baseAngle)+this.phys.y;
      //console.log(this.phys.x_pointto+"/"+this.phys.y_pointto);
  }

  dtr(degrees) {
    //console.log(degrees * Math.PI/180);
    return degrees * Math.PI/180;

  }

  updateVis() {
    this.vis.x = 20*Math.cos(this.phys.dir+this.baseAngle-(40*Math.PI/180))+this.phys.x;
    this.vis.y = 20*Math.sin(this.phys.dir+this.baseAngle-(40*Math.PI/180))+this.phys.y;
    this.vis.dir = this.phys.dir;
  }

  update() {
    this.y++
  }

  rotate(direction, degrees) {
    if (direction === "left") {
      this.phys.dir -= this.dtr(degrees);
      //this.vis.dir += this.dtr(degrees);
    } else {
      this.phys.dir += this.dtr(degrees);
     // this.vis.dir -= this.dtr(degrees);
    }
    if (this.phys.dir > Math.PI*2) this.phys.dir = this.phys.dir - Math.PI*2;
    if (this.phys.dir <= 0) this.phys.dir = this.phys.dir + Math.PI*2;
    //this.updateVis();

    this.phys.x_pointto = this.phys.speed*this.lineFactor * Math.cos(this.phys.dir+this.baseAngle)+this.phys.x;
    this.phys.y_pointto = this.phys.speed*this.lineFactor * Math.sin(this.phys.dir+this.baseAngle)+this.phys.y;
  }

  move(direction) {
    if (direction === "forward") {
      this.phys.x = this.phys.speed * Math.cos(this.phys.dir+this.baseAngle)+this.phys.x;
      this.phys.y = this.phys.speed * Math.sin(this.phys.dir+this.baseAngle)+this.phys.y;
    } else {
      this.phys.x = -this.phys.speed * Math.cos(this.phys.dir+this.baseAngle)+this.phys.x;
      this.phys.y = -this.phys.speed * Math.sin(this.phys.dir+this.baseAngle)+this.phys.y;
    }
    //this.updateVis();
    this.rotate("left",0);
   //console.log(this.phys.dir,this.phys.x+"/"+this.phys.y+"/"+this.vis.x+"/"+this.vis.y);
  } 
}

window.onload = function() {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var track = new Track();
  var playerCar = new Car("red", 250, 200);

  function updateCanvas() {
    playerCar.updateVis();
    playerCar.update()
    ctx.clearRect(0, 0, 800, 600);
    ctx.drawImage(track.img, 0, 0);
    ctx.save();
    ctx.translate(playerCar.vis.x, playerCar.vis.y);
    ctx.rotate(playerCar.vis.dir);
    ctx.drawImage(
      playerCar.vis.img,
      0,
      0,
      playerCar.vis.width,
      playerCar.vis.height
    );
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(playerCar.phys.x,playerCar.phys.y);
    ctx.lineTo(playerCar.phys.x_pointto,playerCar.phys.y_pointto);
    ctx.stroke();
    window.requestAnimationFrame(updateCanvas);
  }

  function startGame() {
    var keyMap={37:false,38:false,39:false,40:false};

    /* window.onkeydown = function(keyPressed) {
      switch (keyPressed.keyCode) {
        case 37:
          playerCar.rotate("left", 5);
          break;
        case 39:
          playerCar.rotate("right", 5);
          break;
        case 38:
          playerCar.move("forward");
          break;
        case 40:
          playerCar.vis.y += 5;
          break;
      }
    }; */

    document.addEventListener('keydown', function(keyPressed){
      if (keyPressed.keyCode in keyMap) {
        keyMap[keyPressed.keyCode]=true;
        if (keyMap[37]) playerCar.rotate("left", 5);
        if (keyMap[39]) playerCar.rotate("right", 5);
        if (keyMap[38]) playerCar.move("forward");
        if (keyMap[40]) playerCar.move("backward");
        if (keyMap[37]&&keyMap[38]) {
          playerCar.rotate("left", 5);
          playerCar.move("forward");
        }
        if (keyMap[39]&&keyMap[38]) {
          playerCar.rotate("right", 5);
          playerCar.move("forward");
        }

      }
    });
    
    document.addEventListener('keyup', function(keyPressed){
      if (keyPressed.keyCode in keyMap) keyMap[keyPressed.keyCode]=false;
    });
    window.requestAnimationFrame(updateCanvas);
  }
  startGame();
};