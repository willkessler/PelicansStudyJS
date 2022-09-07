// Wander (Sliders)
// The Nature of Code
// The Coding Train / Daniel Shiffman
// https://youtu.be/ujsR2vcJlLk
// https://thecodingtrain.com/learning/nature-of-code/5.5-wander.html

// Main: https://editor.p5js.org/codingtrain/sketches/LVtVlS52Q
// With Sliders: https://editor.p5js.org/codingtrain/sketches/uxemh7FGc
// Deleting Positions: https://editor.p5js.org/codingtrain/sketches/EWHjy--Os
// 3D: https://editor.p5js.org/codingtrain/sketches/t6sFXmVrk
// Displacement: https://editor.p5js.org/codingtrain/sketches/VdHUvgHkm
// Perlin Noise: https://editor.p5js.org/codingtrain/sketches/XH2DtikuI

// Todo:
// X make lead not wander when near edges
// X draw green box representing edgeBuffer
// make follower "see" the lead, and distance check before following
// make follower wander when it can't see the lead
// make follower be able to see across window edges so it doesn't zoom off
// make lead "get tired" so it can become a follower

// pass in settings object: x, y, maxSpeed, maxWanderSpeed, vehicleColor, wandering, drawViewCircle
class Vehicle {
  constructor(settings) {
    this.pos = createVector(settings.x, settings.y);
    //this.vel = createVector(random(0,maxSpeed), random(0,maxSpeed));
    this.vel = createVector(1,0);
    this.acc = createVector(0, 0);
    this.maxSpeed = settings.maxSpeed;
    this.maxWanderSpeed = settings.maxWanderSpeed;
    this.maxForce = 1;
    this.maxWanderForce = 0.2;
    this.viewingAngle = 90;
    this.viewingDistance = 400;
    this.drawViewCircle = settings.drawViewCircle;
    this.vehicleColor = {
      r: settings.vehicleColor.r,
      g: settings.vehicleColor.g,
      b: settings.vehicleColor.b
    };
    this.r = 16;
    this.edgeBuffer = 25;
    this.lineHeight = 20;
    this.numLines = (height - this.edgeBuffer * 2) / this.lineHeight;

    this.pathSize = 50;

    this.currentPath = [];
    this.paths = [this.currentPath];
    this.debugStrings = [];
    this.wanderData = undefined;
    this.wandering = false;
    if (settings.wandering) {
      this.wandering = true;
      this.wanderData = {
        theta : 0,
        maxTheta : PI / 6,
        show: false
      };
    }
  }

  addDebugString(debugString) {
    if (this.debugStrings.length > this.numLines) {
      this.debugStrings.shift();
    }
    this.debugStrings.push(debugString);
  }

  showDebugStrings() {
    let yPos = this.edgeBuffer;
    let fillAmt = 100;
    for (let debugString of this.debugStrings) {
      noStroke();
      fill(fillAmt);
      text(debugString, this.edgeBuffer, yPos);
      yPos += this.lineHeight;
      fillAmt = Math.min(255, fillAmt + Math.floor(155 / this.numLines));
    }      
  }
  
  clamp(val, maxVal) {
    if (Math.abs(val) > maxVal) {
      val = maxVal * Math.sign(val);
    }
    return val;
  }
  
  degrees(rads) {
    return (180.0 * (rads / Math.PI ));
  }
  
  // The angle between vectors is always a positive value, unless the third param is passed as true.
  angleBetweenVectors(v1, v2, signedAngle = false) {
    let v1norm = v1.copy();
    let v2norm = v2.copy();
    v1norm.normalize();
    v2norm.normalize();
    let dp = v1norm.dot(v2norm);
    //let denom = v1.mag() * v2.mag();
    //let angle = Math.acos(dp/denom);
    let angle = Math.acos(dp);
    if (signedAngle) {
      let cp = v1norm.cross(v2norm);
      if (Math.sign(cp.z) === 1) {
        angle *= -1;
      }
    }
    return this.degrees(angle);
  }

  // Whether or not a given vehicle is within "viewing distance" and within "viewing cone" of this vehicle.
  canSee(vehicle) {
    const thisVel = this.vel.copy().normalize();
    const targetVec = vehicle.pos.copy();
    targetVec.sub(this.pos).normalize();
    const angleBetweenVehicles = this.angleBetweenVectors(thisVel, targetVec, false);
    const vecToVehicle = vehicle.pos.copy();
    vecToVehicle.sub(this.pos);
    const distanceToVehicle = vecToVehicle.mag();
    if ((angleBetweenVehicles < this.viewingAngle) &&
        (distanceToVehicle < this.viewingDistance)) {
      return true;
    }
    return false;
  }
  
  wander() {
    if (!this.wandering) {
      return;
    }
    if (this.isWithinEdgeBuffer()) {
      return;
    }
    let wanderPoint = this.vel.copy();
    wanderPoint.setMag(slider1.value());
    wanderPoint.add(this.pos);
    this.wanderData.point1 = wanderPoint.copy();

    this.wanderData.radius = slider2.value();

    let theta = this.wanderData.theta + this.vel.heading();

    let x = this.wanderData.radius * cos(theta);
    let y = this.wanderData.radius * sin(theta);
    wanderPoint.add(x, y);
    this.wanderData.point2 = wanderPoint.copy();

    let steer = wanderPoint.sub(this.pos);
    steer.setMag(this.maxWanderForce);
    this.applyForce(steer);

    let displaceRange = slider3.value();
    if (!pause) {
      this.wanderData.theta += random(-displaceRange, displaceRange);
      this.wanderData.theta = this.clamp(this.wanderData.theta, this.wanderData.maxTheta);
    }

//    console.log('wander theta:', this.wanderData.theta);
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  pursue(vehicle, offset, useArrival) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.rotate(PI/4);
    prediction.mult(30);
    target.add(prediction);
    target.add(offset);
    stroke(0,0,255);
    line(target.x - 10, target.y, target.x + 10, target.y);
    line(target.x, target.y - 10, target.x, target.y + 10);
    return this.seek(target, useArrival);
  }

  arrive(vehicle) {
    // 2nd argument true enables the arrival behavior
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.normalize();
    prediction.rotate(5 * PI/8);
    prediction.mult(80);
    target.add(prediction);
    stroke(0,0,255);
    line(target.x - 10, target.y, target.x + 10, target.y);
    line(target.x, target.y - 10, target.x, target.y + 10);
    return this.seek(target, true);
  }

  flee(target) {
    return this.seek(target).mult(-1);
  }

  seek(target, arrival = false) {
    let force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;
    if (arrival) {
      let slowRadius = 50;
      let distance = force.mag();
      if (distance < slowRadius) {
        desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
      }
    }
    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }


  edges() {
    let hitEdge = false;
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
      hitEdge = true;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
      hitEdge = true;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
      hitEdge = true;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
      hitEdge = true;
    }

    if (hitEdge) {
      this.currentPath = [];
      this.paths.push(this.currentPath);
    }
  }

  reverseAtEdges() {
    if (this.pos.x > width - this.edgeBuffer) {
      this.vel.rotate(PI / 2);
    } else if (this.pos.x < this.edgeBuffer) {
      this.vel.rotate(PI / 2);
    } else if (this.pos.y > height - this.edgeBuffer) {
      this.vel.rotate(PI / 2);
    } else if (this.pos.y < this.edgeBuffer) {
      this.vel.rotate(PI / 2);
    }
  }

  isWithinEdgeBuffer () {
    return ( (this.pos.x > width - this.edgeBuffer) ||
             (this.pos.x < this.edgeBuffer) ||
             (this.pos.y > height - this.edgeBuffer) ||
             (this.pos.y < this.edgeBuffer) );
  }

  // Simulate "repulsion" that will *slowly* direct vehicle away from edges
  repulseAtEdges() {
    let repulseVector = new p5.Vector(0,0);
    let edgeRepulseVector = new p5.Vector(0,0);
    let edgeDistance = 1;
    let repulsing = false;
    let powVal;
    const aVal = 0.1;
    const expBase = 1.005;
    if (this.pos.x > width - this.edgeBuffer) {
      edgeDistance = Math.abs(width - this.pos.x);
      edgeRepulseVector.set(-1,0);
      powVal = aVal * Math.pow(expBase, edgeDistance);
      edgeRepulseVector.setMag(powVal);
      repulseVector.add(edgeRepulseVector);
      repulsing = true;
    }
    if (this.pos.x < this.edgeBuffer) {
      edgeDistance = Math.abs(this.pos.x);
      edgeRepulseVector.set(1,0);
      powVal = aVal * Math.pow(expBase, edgeDistance);
      edgeRepulseVector.setMag(powVal);
      repulseVector.add(edgeRepulseVector);
      repulsing = true;
    }
    if (this.pos.y > height - this.edgeBuffer) {
      edgeDistance = Math.abs(height - this.pos.y);
      edgeRepulseVector.set(0,-1);
      powVal = aVal * Math.pow(expBase, edgeDistance);
      edgeRepulseVector.setMag(powVal);
      repulseVector.add(edgeRepulseVector);
      repulsing = true;
    }
    if (this.pos.y < this.edgeBuffer) {
      edgeDistance = Math.abs(this.pos.y);
      edgeRepulseVector.set(0,1);
      powVal = aVal * Math.pow(expBase, edgeDistance);
      edgeRepulseVector.setMag(powVal);
      repulseVector.add(edgeRepulseVector);
      repulsing = true;
    }
    repulseVector.limit(this.maxForce);
/*
    if (repulsing) {
      this.addDebugString('expBase:' + expBase.toFixed(3) + ' : ' + 
                          'edgeDistance:' + Math.floor(edgeDistance) + ' : ' +
                          'powVal:' + powVal.toFixed(3) + ' : ' +
                          'repulseVector: [' + repulseVector.x.toFixed(3) + ', ' + repulseVector.y.toFixed(3) + '] ' );
    }
*/
    // now displaying this info in canvas
    //console.log(expBase,edgeDistance, powVal, repulseVector);
    return repulseVector;
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    let backOfTriangle = this.pos.copy();
    let reverseVel = this.vel.copy();
    reverseVel.normalize().mult(-this.r * 3 / 2);
    backOfTriangle.add(reverseVel);
    this.currentPath.push(backOfTriangle.copy());

    // Count positions
    let total = 0;
    for (let path of this.paths) {
      total += path.length;
    }

   if (total > this.pathSize) {
      this.paths[0].shift();
      if (this.paths[0].length === 0) {
        this.paths.shift();
       }
    }
  }

  show() {
    stroke(this.vehicleColor.r, this.vehicleColor.g, this.vehicleColor.b);
    strokeWeight(2);
    fill(this.vehicleColor.r, this.vehicleColor.g, this.vehicleColor.b);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    // triangle centered on this.pos
    //triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);

    // triangle with its tip on this.pos
    let tSize = -this.r * 3 / 2;
    triangle(tSize, -this.r / 2, tSize, this.r / 2, 0, 0);
    pop();

    for (let path of this.paths) {
      beginShape();
      noFill();
      for (let v of path) {
        vertex(v.x, v.y);
      }
      endShape();
    }

    // render a circle around the viewing distance
    if (this.drawViewCircle) {
      stroke(this.vehicleColor.r,this.vehicleColor.g,this.vehicleColor.b);
      circle(this.pos.x, this.pos.y,this.viewingDistance * 2);
    }
    
    // render a box representing the edgebuffer
    stroke(0,75,0);
    noFill();
    drawingContext.setLineDash([3,3]);
    rect(this.edgeBuffer, this.edgeBuffer, width - this.edgeBuffer * 2, height - this.edgeBuffer * 2);

    if (this.wanderData && this.wanderData.show) {
      noFill();
      stroke(255, 200,0);
      circle(this.wanderData.point1.x, this.wanderData.point1.y, this.wanderData.radius * 2);
      push();
      stroke(255, 100,0);
      line(this.pos.x, this.pos.y, this.wanderData.point1.x, this.wanderData.point1.y);
      pop();
      
      fill(0, 255, 0);
      noStroke();

      push();
      circle(this.wanderData.point2.x, this.wanderData.point2.y, slider3.value() * 100);

      stroke(255, 150);
      line(this.pos.x, this.pos.y, this.wanderData.point2.x, this.wanderData.point2.y);
      pop();
    }
    drawingContext.setLineDash([1]);

    this.showDebugStrings();
    
  }

}
