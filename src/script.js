var keyMap={37:false,38:false,39:false,40:false};

class Track {
  constructor() {
    this.img = new Image();
    this.img.src = "../images/racetrack.png";
  }
}

class Car {
  constructor(color, startX, startY) {
    this.baseAngle=270*Math.PI/180;
    //this.baseAngle=0;
    this.speedDivider = 10;
    this.steerDivider = 10;
    this.phys = {
      x: startX,
      y: startY,
      dir: 180*Math.PI/180, //angle that the car is turned by
      steer: 0, //left: negative, right: positive
      speed: 0,
      engineBrake: -2,
      x_pointto: 0, 
      y_pointto: 0, 
     
    };

    this.vis = {
      x: startX,
      y: startY,
      visAngle:90*Math.PI/180,
      dir: 0,
      width: 25,
      height: 50,
      img: new Image(),
      x_angleTo: 0,
      y_angleTo: 0
    };

    switch (color) {
      case "red":
        this.vis.img.src = "../images/car_red_small_5.png";
        break;
      default:
        this.vis.img.src = "../images/car_red_small_5.png";
        break;
    }
      this.lineFactor= 100;
      
      //console.log(this.phys.x_pointto+"/"+this.phys.y_pointto);
  }

  dtr(degrees) {
    //console.log(degrees * Math.PI/180);
    return degrees * Math.PI/180;

  }

  drawBox() {
    var point1=[this.vis.x,this.vis.y];
    //var point2=[this.vis.x*Math.cos(this.phys.dir)+this.vis.y*Math.sin(this.phys.dir),
    //  -this.vis.x*Math.sin(this.phys.dir)+this.vis.y*Math.cos(this.phys.dir)];
    //var point3=[this.vis.x+this.vis.width,this.vis.y+this.vis.height];
    //var point4=[this.vis.x+this.vis.width,this.vis.y];
    return [point1];
    //return [point1,point2];
    //return [point1,point2,point3,point4];
  }

  updateVis() {

    this.vis.dir = this.phys.dir+this.vis.visAngle;

    this.vis.x = this.phys.x+20*Math.cos(this.phys.dir-(40*Math.PI/180));
    this.vis.y = this.phys.y+20*Math.sin(this.phys.dir-(40*Math.PI/180));
    
    //this.vis.x=this.phys.x;
    //this.vis.y=this.phys.y;

  }

  rotate() {
    this.phys.dir += this.phys.steer;
    
    if (this.phys.dir > Math.PI*2) this.phys.dir = this.phys.dir - Math.PI*2;
    if (this.phys.dir <= 0) this.phys.dir = this.phys.dir + Math.PI*2;
    //this.updateVis();

    this.phys.x_pointto = this.phys.x+this.phys.speed*this.lineFactor * Math.cos(this.phys.dir);
    this.phys.y_pointto = this.phys.y+this.phys.speed*this.lineFactor * Math.sin(this.phys.dir);


    this.vis.x_angleTo = this.vis.x+ 50 * Math.cos(this.phys.dir);
    this.vis.y_angleTo = this.vis.y+ 50 * Math.sin(this.phys.dir);
    
    
  }
 
  accelerate(speedDiff) {
    if (speedDiff>0) this.phys.speed=Math.min(50,this.phys.speed+=speedDiff);
    else if (speedDiff<0) this.phys.speed=Math.max(-20,this.phys.speed+=speedDiff);
    else {
      if (this.phys.speed>0) this.phys.speed=Math.max(0,this.phys.speed+=this.phys.engineBrake);
      else if (this.phys.speed<0) this.phys.speed=Math.min(0,this.phys.speed-=this.phys.engineBrake);
    }
    //console.log("accel: "+speedDiff+", speed: "+this.phys.speed);
  }

  steer(direction) {
    if (direction==="left") this.phys.steer=Math.max(this.dtr(-2.5),this.phys.steer-=this.dtr(0.5));
    else if (direction==="right") this.phys.steer=Math.min(this.dtr(2.5),this.phys.steer+=this.dtr(0.5));
    //else this.phys.steer=0;
    console.log("steer: "+this.phys.steer);
  }

  move() {
    this.rotate();
    
    this.phys.x = this.phys.x+this.phys.speed/this.speedDivider * Math.cos(this.phys.dir);
    this.phys.y = this.phys.y+this.phys.speed/this.speedDivider * Math.sin(this.phys.dir);
    
    this.updateVis();
    // console.log("speed: "+this.phys.speed", accel: "+this.)
  }

  getCurrentSpeed() {
    return this.speed;
  }

  checkOutOfBounds() {
    return 
  }
} // End Class Car 

window.onload = function() {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var track = new Track();
  var playerCar = new Car("red", 385, 200);

  function updateCanvas() {
    ctx.clearRect(0, 0, 800, 600);
    ctx.drawImage(track.img, 0, 0);
    
    /* if (!(keyMap[37]&&keyMap[38]&&keyMap[39]&&keyMap[40])) {
      playerCar.steer("clear");
      playerCar.accelerate(0);
     }*/
    ctx.save();
    playerCar.move();
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

    ctx.moveTo(playerCar.vis.x,playerCar.vis.y);
    ctx.lineTo(playerCar.vis.x_angleTo,playerCar.vis.y_angleTo);

    ctx.moveTo(400,300);
    ctx.lineTo(playerCar.vis.x,playerCar.vis.y);
    ctx.stroke();

    var carBox=playerCar.drawBox();
    carBox.forEach(function(elem){
      ctx.beginPath();
      ctx.arc(elem[0],elem[1],2,0,playerCar.dtr(360));
      ctx.stroke();
    });

    window.requestAnimationFrame(updateCanvas);
  }

  function startGame() {
    //var keyMap={37:false,38:false,39:false,40:false};

    document.addEventListener('keypress', function(keyPressed){
      if (keyPressed.keyCode in keyMap) {
        keyMap[keyPressed.keyCode]=true;
        if (keyMap[37]) {
          playerCar.steer("left");
          //playerCar.accelerate(0);
        }
        if (keyMap[39]) {
          playerCar.steer("right");
          //playerCar.accelerate(0);
        }
        if (keyMap[38]) {
          //playerCar.steer("clear");
          playerCar.accelerate(5);
        } 
        
        if (keyMap[40]) {
          //playerCar.steer("clear");
          playerCar.accelerate(-5);
        }
        
        //console.log(keyMap);
        if (keyMap[37]&&keyMap[38]) {
          playerCar.steer("left");
          playerCar.accelerate(5);
        }
        if (keyMap[39]&&keyMap[38]) {
          playerCar.steer("right");
          playerCar.accelerate(5);
        }
        if (keyMap[37]&&keyMap[40]) {
          playerCar.steer("left");
          playerCar.accelerate(-5);
        }
        if (keyMap[37]&&keyMap[40]) {
          playerCar.steer("left");
          playerCar.accelerate(-5);
        }

      }
    });
    
    document.addEventListener('keyup', function(keyPressed){
      if (keyPressed.keyCode in keyMap) {
        keyMap[keyPressed.keyCode]=false;
        if (!(keyMap[37]||keyMap[39])) {
          //playerCar.steer("clear");
        //console.log(keyMap);
        }
        if (!(keyMap[38]||keyMap[40])) {
          playerCar.accelerate(0);
        }
      }
    });
    window.requestAnimationFrame(updateCanvas);
  }
  startGame();
};
