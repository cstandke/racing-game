

//var world = new SSCD.World({grid_size: });
const debugMode = false;
var timeStart=Date.now();
var gameFinished=false;
var checkeredFlagImg=new Image();
    checkeredFlagImg.src="images/checkeredFlag.jpg";

class TrackSector {
  constructor(sectorName,x,y,lineX,lineY){
  this.sectorName = sectorName;
  this.x=x;
  this.y=y;
  this.lineX=lineX;
  this.lineY=lineY;
  this.collider;
  }
}

class Track {
  constructor() {
    this.img = new Image();
    this.img.src = "images/racetrack.png";
    this.sectorCount = 4;
    this.lapsToDo = 5//5;
    this.sectors = [new TrackSector("sector 1",80,315,130,0),new TrackSector("sector 2",370,375,0,130),new TrackSector("sector 3",590,315,130,0),new TrackSector("sector 4",390,115,0,130)];
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
    /* this.sector1 = world.add(new SSCD.Line(new SSCD.Vector(80,315),new SSCD.Vector(130,0)));
    this.sector1.set_collision_tags(["track","line"]);
    this.sector2 = world.add(new SSCD.Line(new SSCD.Vector(370,375),new SSCD.Vector(0,130)));
    this.sector2.set_collision_tags(["track","line"]);
    this.sector3 = world.add(new SSCD.Line(new SSCD.Vector(590,315),new SSCD.Vector(130,0)));
    this.sector3.set_collision_tags(["track","line"]);
    this.sector4 = world.add(new SSCD.Line(new SSCD.Vector(390,115),new SSCD.Vector(0,130)));
    this.sector4.set_collision_tags(["track","line"]); */
    
    
    this.sectors.forEach(function(sector){
      sector.collider = world.add(new SSCD.Line(new SSCD.Vector(sector.x,sector.y),new SSCD.Vector(sector.lineX,sector.lineY)));
      sector.collider.set_collision_tags(["track","line"]);
    });

  }
} //End Class Track

class Car {
  constructor(playerNr,name, color, startX, startY) {
    if (playerNr===1) this.keys=[37,39,38,40]; //Left, Right, Up, Down
    else this.keys=[89,67,83,88];
    this.keyMap={};
    this.keyMap[this.keys[0]]=false;
    this.keyMap[this.keys[1]]=false;
    this.keyMap[this.keys[2]]=false;
    this.keyMap[this.keys[3]]=false;
    if (debugMode) console.log(this.keyMap);
    //this.keyMap={37:false,38:false,39:false,40:false}; 
    this.baseAngle=270*Math.PI/180;
    //this.baseAngle=0;
    this.speedDivider = 10;
    this.steerDivider = 10;
    this.lineFactor= 2;
    this.clearedSectors=-1;
    this.lapsDone=0;
    this.name=name;
    this.timeStarted;
    this.timeFinished;
    this.lapTotalTime;
    this.lapTimes=[];
    this.hasFinished=false;

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

    this.vis.img.src = "images/car_"+color+"_small_5.png";
  
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

    this.phys.x_pointto = this.phys.x+this.phys.speed*this.lineFactor * Math.cos(this.phys.dir);
    this.phys.y_pointto = this.phys.y+this.phys.speed*this.lineFactor * Math.sin(this.phys.dir);

    this.vis.x_angleTo = this.vis.x+ 50 * Math.cos(this.phys.dir);
    this.vis.y_angleTo = this.vis.y+ 50 * Math.sin(this.phys.dir);
    }
 
  stop(){
    this.phys.speed=0;
  }

  /* bounce() {
    this.phys.dir=this.phys.dir-90*Math.PI/180;
  } */

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

  /* checkOutOfBounds() {
    return 
  } */

 /*  checkKeys(){ //old version - hardcoded keys
    if (this.keyMap[37]) this.steer("left");
    if (this.keyMap[39]) this.steer("right");
    if (this.keyMap[38]) this.accelerate(5);    
    if (this.keyMap[40]) this.accelerate(-5);

    if (!(this.keyMap[37]&&this.keyMap[39])) this.steer("clear");
    if (!(this.keyMap[38]&&this.keyMap[40])) this.accelerate(0);

    //console.log(this.keyMap);
  } */

  checkKeys(){

  if (this.hasFinished) {
    this.steer("clear");
    this.accelerate(0);
    return;
  }
  if (this.keyMap[this.keys[0]]) this.steer("left");
  if (this.keyMap[this.keys[1]]) this.steer("right");
  if (this.keyMap[this.keys[2]]) this.accelerate(5);    
  if (this.keyMap[this.keys[3]]) this.accelerate(-5);

  if (!(this.keyMap[this.keys[0]]&&this.keyMap[this.keys[1]])) this.steer("clear");
  if (!(this.keyMap[this.keys[2]]&&this.keyMap[this.keys[3]])) this.accelerate(0);

  //console.log(this.keyMap);
  }

  drawCar(context) {
    context.save();
    context.translate(this.vis.x, this.vis.y);
    context.rotate(this.vis.dir);
    context.drawImage(
      this.vis.img,
      0,
      0,
      this.vis.width,
      this.vis.height
    );
    context.restore();
  }

  drawPaths(context) {
    context.save();
    context.strokeStyle="black";
    context.beginPath();
    context.moveTo(this.phys.x,this.phys.y);
    context.lineTo(this.phys.x_pointto,this.phys.y_pointto);

    context.moveTo(this.vis.x,this.vis.y);
    context.lineTo(this.vis.x_angleTo,this.vis.y_angleTo);

    context.moveTo(400,300);
    context.lineTo(this.vis.x,this.vis.y);
    context.stroke();
    context.restore();
  };

  collisionHandler(track) {
    if (world.test_collision(this.collider))
      {
        //console.debug("Collision!");
        if (world.test_collision(this.collider,"boundary"))  {
          this.stop();
          //this.bounce();
        }

        if (world.test_collision(this.collider,"car"))  {
          //this.stop();
          this.speed>0 ? this.accelerate(-100) : this.accelerate(100);
          //this.bounce();
        }
        
        var collidedWith = world.pick_object(this.collider);
        if (world.test_collision(this.collider,"line"))  {
          if (collidedWith === track.startLine) {
            if (this.clearedSectors<track.sectorCount) {
              this.clearedSectors=0;
              if (debugMode) console.debug(this.name+" Start! Laps: "+this.lapsDone);
            }
            else {
              this.lapsDone++;
              this.clearedSectors=0;
              this.lapTimes.push(Date.now()-this.lapTotalTime);
              this.lapTotalTime=Date.now();
              //console.log(this.lapTotalTime);
              if (debugMode) console.debug(this.name+" Laps: "+this.lapsDone+", Lap time: " + timeToString(this.lapTimes[this.lapTimes.length-1]));
              if (this.lapsDone>=track.lapsToDo) { 
                this.timeFinished=Date.now()-this.timeStarted;
                this.hasFinished=true;
                if (debugMode) {
                  console.debug(this.name+" finished! Total Time: "+timeToString(this.timeFinished));
                }
              }
            }
          }
          for (var i=0;i<track.sectors.length;i++) {
            if (collidedWith === track.sectors[i].collider) {
              var msg = this.name+" "+track.sectors[i].sectorName;
              if (this.clearedSectors === i) {
                this.clearedSectors++;
                msg+=" clear!";
                if (debugMode) console.debug(msg);
              }
            }
          }
        }

        this.collider.set_debug_render_colors("red", "red");
        
        collidedWith.set_debug_render_colors("blue", "blue");
        //if (collidedWith === track.centerCollider) console.debug("Center!");
      }
  }


} // End Class Car 

function timeToString(time) {
  var mm = Math.floor(time/60000);
  var ss = Math.floor(time/1000-mm*60);
  var ms = Math.floor(time%1000/10);
  if (mm < 10) {mm = "0"+mm;}
  if (ss < 10) {ss = "0"+ss;}
  if (ms < 10) {ms = "0"+ms;}
  // This formats your string to MM:SS:MS
  var t = mm+":"+ss+":"+ms;
  return t;
}

function drawTime(context) {
  context.save();
  //context.fillStyle="rgba(255,255,255,128)";
  //context.fillRect(500,20,250,50);
  context.font="22px Arial black";
  context.fillStyle="white";
  context.fillText(timeToString(Date.now()-timeStart),600,30);
  context.restore();
}

window.onload = function() {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var track = new Track();
  var playerCars = [new Car(1,"Player 1","red", 390, 160),new Car(2,"Player 2","green", 390, 200)];

  function updateCanvas() {
    var allCarsFinished=true;
    ctx.clearRect(0, 0, 800, 600);
    ctx.drawImage(track.img, 0, 0);
    world = new SSCD.World({grid_size: 75});
    track.addCollider();
    

    playerCars.forEach(function(playerCar){
      playerCar.move();
      playerCar.collisionHandler(track);
      playerCar.drawCar(ctx);
      if (debugMode) playerCar.drawPaths(ctx); //Debug mode: path lines 
      allCarsFinished = playerCar.hasFinished && allCarsFinished;
    });
    
    drawTime(ctx);

    if (debugMode) world.render(canvas); //Debug mode: show collision detection
  
    if (!(allCarsFinished)) window.requestAnimationFrame(updateCanvas);
    else showFinishScreen(ctx);
  }

  function showFinishScreen(context) {
    
    //context.save();
    context.clearRect(0, 0, 800, 600);
    context.drawImage(track.img, 0, 0);
    playerCars.forEach(function(playerCar){playerCar.drawCar(context);});
    context.globalAlpha=0.6;
    //checkeredFlagImg.onload= function() {
      context.drawImage(checkeredFlagImg,50,100,700,407);
    //};
    context.fillStyle="white";
    context.globalAlpha=0.4;
    context.fillRect(50,100,700,407);
    context.fillStyle="black";
    for (i=0;i<playerCars.length;i++) {
      var playerCar=playerCars[i];
      context.font="30px Arial Black";
      context.globalAlpha=1;
      context.fillText(playerCar.name,150+i*300,170);
      context.fillText(timeToString(playerCar.timeFinished),150+i*300,205);
      context.fillText("Lap Times",150+i*300,260);
      for (i2=0;i2<playerCar.lapTimes.length;i2++) {
        console.log(playerCar.lapTimes[i2]);
        context.font="20px Arial Black";
        context.fillText(timeToString(playerCar.lapTimes[i2]),150+i*300,290+i2*30);
        
      } 
    } 

    //context.restore();
    //ctx.drawImage(checkeredFlagImg,50,50);
    //window.requestAnimationFrame(showFinishScreen(ctx));
  }


  function startGame() {
    //var keyMap={37:false,38:false,39:false,40:false};
    document.addEventListener('keydown', function(keyPressed){
      playerCars.forEach(function(playerCar){
        if (keyPressed.keyCode in playerCar.keyMap) playerCar.keyMap[keyPressed.keyCode]=true;
      });
    });
    
    document.addEventListener('keyup', function(keyPressed){
      playerCars.forEach(function(playerCar){
        if (keyPressed.keyCode in playerCar.keyMap) playerCar.keyMap[keyPressed.keyCode]=false;
      });
    });
    //if (debugMode) console.log(track.sectors);
    //playerCar.move();
    
    playerCars.forEach(function(playerCar){
      playerCar.timeStarted = timeStart;
      playerCar.lapTotalTime=timeStart;
      //console.log(playerCar.timeStarted);
    })
    updateCanvas();
    //console.log("finishScreen");
    //showFinishScreen(ctx);
  }
  startGame();
};
