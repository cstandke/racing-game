

var world = new SSCD.World({grid_size: 100});

class Track {
  constructor() {
    this.img = new Image();
    this.img.src = "../images/racetrack.png";
    this.sectorCount = 3;
    this.lapsToDo = 5;
  }
  addCollider() {
    this.centerCollider = world.add(new SSCD.Rectangle(new SSCD.Vector(210,250),new SSCD.Vector(380,120)));
    this.centerCollider.set_collision_tags(["track","boundary"]);

    this.edgeCollider = world.add(new SSCD.LineStrip(new SSCD.Vector(200,115),[
                                  new SSCD.Vector(0,0),
                                  new SSCD.Vector(-50,10),
                                  new SSCD.Vector(-80,30),
                                  new SSCD.Vector(-110,65),
                                  new SSCD.Vector(-121,95),
                                  new SSCD.Vector(-121,300),
                                  new SSCD.Vector(-110,330),
                                  new SSCD.Vector(-80,365),
                                  new SSCD.Vector(-50,382),
                                  new SSCD.Vector(0,392),
                                  new SSCD.Vector(395,392),
                                  new SSCD.Vector(445,382),
                                  new SSCD.Vector(475,365),
                                  new SSCD.Vector(505,330),
                                  new SSCD.Vector(520,300),
                                  new SSCD.Vector(520,95),
                                  new SSCD.Vector(510,65),
                                  new SSCD.Vector(480,30),
                                  new SSCD.Vector(450,10),
                                  new SSCD.Vector(400,0),
                                  new SSCD.Vector(0,0),
                                  ],false));
    this.edgeCollider.set_collision_tags(["track","boundary"]);

    this.startLine = world.add(new SSCD.Line(new SSCD.Vector(370,115),new SSCD.Vector(0,130)));
    this.startLine.set_collision_tags(["track","line"]);
    this.sector1 = world.add(new SSCD.Line(new SSCD.Vector(80,315),new SSCD.Vector(130,0)));
    this.sector1.set_collision_tags(["track","line"]);
    this.sector2 = world.add(new SSCD.Line(new SSCD.Vector(370,375),new SSCD.Vector(0,130)));
    this.sector2.set_collision_tags(["track","line"]);
    this.sector3 = world.add(new SSCD.Line(new SSCD.Vector(590,315),new SSCD.Vector(130,0)));
    this.sector3.set_collision_tags(["track","line"]);

  }
} //End Class Track

class Car {
  constructor(color, startX, startY) {
    this.keyMap={37:false,38:false,39:false,40:false};
    this.baseAngle=270*Math.PI/180;
    //this.baseAngle=0;
    this.speedDivider = 10;
    this.steerDivider = 10;
    this.lineFactor= 2;
    this.clearedSectors=0;
    this.lapsDone=0;

    this.phys = {
      x: startX,
      y: startY,
      dir: 180*Math.PI/180, //angle that the car is turned by
      //dir:0,
      steer: 0, //left: negative, right: positive
      speed: 0,
      engineBrake: -1,
      x_pointto: 0, 
      y_pointto: 0, 
     
    };

    this.vis = {
      x: startX,
      y: startY,
      visAngle:90*Math.PI/180,
      //visAngle:0,
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

      
      //console.log(this.phys.x_pointto+"/"+this.phys.y_pointto);
  }

  addCollider() {
    this.colliderBox = {
      point1: [this.vis.x,this.vis.y],
      point2: [this.vis.x+(this.vis.width*Math.cos(this.vis.dir)),
               this.vis.y+this.vis.width*Math.sin(this.vis.dir)],
      point3: [this.vis.x+(this.vis.width*Math.cos(this.vis.dir)-this.vis.height*Math.sin(this.vis.dir)),
               this.vis.y+(this.vis.width*Math.sin(this.vis.dir)+this.vis.height*Math.cos(this.vis.dir))],
      point4: [this.vis.x+0*this.vis.width*Math.cos(this.vis.dir)-this.vis.height*Math.sin(this.vis.dir),
              this.vis.y+0*this.vis.width*Math.sin(this.vis.dir)+this.vis.height*Math.cos(this.vis.dir)],
      
      vector1: [this.vis.width*Math.cos(this.vis.dir),this.vis.width*Math.sin(this.vis.dir)],
      vector2: [this.vis.width*Math.cos(this.vis.dir)-this.vis.height*Math.sin(this.vis.dir),
                this.vis.width*Math.sin(this.vis.dir)+this.vis.height*Math.cos(this.vis.dir)],
      vector3: [0*this.vis.width*Math.cos(this.vis.dir)-this.vis.height*Math.sin(this.vis.dir),
                0*this.vis.width*Math.sin(this.vis.dir)+this.vis.height*Math.cos(this.vis.dir)]
      }
    this.collider = world.add(new SSCD.LineStrip(new SSCD.Vector(this.colliderBox.point1[0],this.colliderBox.point1[1]),[
        new SSCD.Vector(0,0),
        new SSCD.Vector(this.colliderBox.vector1[0],this.colliderBox.vector1[1]),
        new SSCD.Vector(this.colliderBox.vector2[0],this.colliderBox.vector2[1]),
        new SSCD.Vector(this.colliderBox.vector3[0],this.colliderBox.vector3[1])],
        true));
    this.collider.set_collision_tags(["car"]);
  }

  dtr(degrees) {
    //console.log(degrees * Math.PI/180);
    return degrees * Math.PI/180;

  }

/*   drawBox() {
    var point1=[this.vis.x,this.vis.y];
    //var point2=[this.vis.x+this.vis.height,this.vis.y];
    //var point3=[this.vis.x+this.vis.height,this.vis.y-this.vis.width];
    //var point4=[this.vis.x,this.vis.y-this.vis.width];
  
    var point2=[this.vis.x+(this.vis.width*Math.cos(this.vis.dir)),
                this.vis.y+this.vis.width*Math.sin(this.vis.dir)];
    var point3=[this.vis.x+(this.vis.width*Math.cos(this.vis.dir)-this.vis.height*Math.sin(this.vis.dir)),
                this.vis.y+(this.vis.width*Math.sin(this.vis.dir)+this.vis.height*Math.cos(this.vis.dir))];
    var point4=[this.vis.x+0*this.vis.width*Math.cos(this.vis.dir)-this.vis.height*Math.sin(this.vis.dir),
                this.vis.y+0*this.vis.width*Math.sin(this.vis.dir)+this.vis.height*Math.cos(this.vis.dir)];
    //this.collider.move(new SSCD.Vector(1,1));  
    return [point1,point2,point3,point4];
  } */

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
 
  stop(){
    this.phys.speed=0;
  }

  bounce() {
    this.phys.dir=this.phys.dir-90*Math.PI/180;
    
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
    else {
      if (this.phys.steer<0) this.phys.steer=Math.min(0,this.phys.steer+=this.dtr(0.2));
      else this.phys.steer=Math.max(0,this.phys.steer-=this.dtr(0.2));
    }
    //console.log("steer: "+this.phys.steer);
  }

  move() {
    this.checkKeys();
    if (!(this.phys.speed===0)) this.rotate();
    
    this.phys.x = this.phys.x+this.phys.speed/this.speedDivider * Math.cos(this.phys.dir);
    this.phys.y = this.phys.y+this.phys.speed/this.speedDivider * Math.sin(this.phys.dir);
    
    this.updateVis();
    this.addCollider();
    
  }

  getCurrentSpeed() {
    return this.speed;
  }

  checkOutOfBounds() {
    return 
  }

  checkKeys(){
    if (this.keyMap[37]) this.steer("left");
    if (this.keyMap[39]) this.steer("right");
    if (this.keyMap[38]) this.accelerate(5);    
    if (this.keyMap[40]) this.accelerate(-5);

    if (!(this.keyMap[37]&&this.keyMap[39])) this.steer("clear");
    if (!(this.keyMap[38]&&this.keyMap[40])) this.accelerate(0);

    //console.log(this.keyMap);
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
    world = new SSCD.World({grid_size: 100});
    track.addCollider();
    ctx.save();
    
    if (world.test_collision(playerCar.collider))
      {
        //console.debug("Collision!");
        if (world.test_collision(playerCar.collider,"boundary"))  {
          playerCar.stop();
          //playerCar.bounce();
        }
        
        var collidedWith = world.pick_object(playerCar.collider);
        if (world.test_collision(playerCar.collider,"line"))  {
          if (collidedWith === track.startLine) {
            if (playerCar.clearedSectors<track.sectorCount) console.debug("Start! Laps: "+playerCar.lapsDone);
            else {
              if (playerCar.lapsDone<track.lapsToDo-1) {
                playerCar.lapsDone++;
                playerCar.clearedSectors=0;
                console.debug("Laps: "+playerCar.lapsDone);
              }
              else console.debug("Finished!");
            }
          }
          if (collidedWith === track.sector1) {
            var msg = "sector1";
            if (playerCar.clearedSectors < 1) {
              playerCar.clearedSectors++;
              msg+=" clear!";
            }
            console.debug(msg);
          }
          if (collidedWith === track.sector2) {
            var msg = "sector2";
            if (playerCar.clearedSectors < 2) {
              playerCar.clearedSectors++;
              msg+=" clear!";
            }
            console.debug(msg);
          }
          if (collidedWith === track.sector3) {
            var msg = "sector3";
            if (playerCar.clearedSectors < 3) {
              playerCar.clearedSectors++;
              msg+=" clear!";
            }
            console.debug(msg);
          }
        }

        playerCar.collider.set_debug_render_colors("red", "red");
        
        collidedWith.set_debug_render_colors("blue", "blue");
        //if (collidedWith === track.centerCollider) console.debug("Center!");
      }
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

  /*   var carBox=playerCar.drawBox();
    carBox.forEach(function(elem){
      ctx.beginPath();
      ctx.arc(elem[0],elem[1],2,0,playerCar.dtr(360));
      ctx.stroke();
    }); */

    world.render(canvas);

    window.requestAnimationFrame(updateCanvas);
  }

  function startGame() {
    //var keyMap={37:false,38:false,39:false,40:false};
    document.addEventListener('keydown', function(keyPressed){
      if (keyPressed.keyCode in playerCar.keyMap) playerCar.keyMap[keyPressed.keyCode]=true;
    });
    
    document.addEventListener('keyup', function(keyPressed){
      if (keyPressed.keyCode in playerCar.keyMap) playerCar.keyMap[keyPressed.keyCode]=false;
    });

    playerCar.move();
    updateCanvas();
  }
  startGame();
};
