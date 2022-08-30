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

class Vehicle {
  constructor(x, y, maxSpeed, wandering) {
    this.pos = createVector(x, y);
    //this.vel = createVector(random(0,maxSpeed), random(0,maxSpeed));
    this.vel = createVector(1,0);
    this.acc = createVector(0, 0);
    this.maxSpeed = maxSpeed;
    this.maxForce = 0.2;
    this.r = 16;
    this.edgeBuffer = 100;

    this.pathSize = 150;

    this.currentPath = [];
    this.paths = [this.currentPath];
    this.wanderData = undefined;
    if (wandering) {
      this.wanderData = {
        theta : 0,
        maxTheta : PI / 6,
        show: false
      };
    }
  }

  clamp(val, maxVal) {
    if (Math.abs(val) > maxVal) {
      val = maxVal * Math.sign(val);
    }
    return val;
  }
  
  wander() {
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
    steer.setMag(this.maxForce);
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
    prediction.rotate(3 * PI/4);
    prediction.mult(30);
    target.add(prediction);
    target.add(offset);
    stroke(0,0,255);
    line(target.x - 10, target.y, target.x + 10, target.y);
    line(target.x, target.y - 10, target.x, target.y + 10);
    return this.seek(target, useArrival);
  }

  arrive(vehicle, offset) {
    // 2nd argument true enables the arrival behavior
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.rotate(3 * PI/4);
    prediction.mult(30);
    target.add(prediction);
    target.add(offset);
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

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    this.currentPath.push(this.pos.copy());

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
    stroke(255);
    strokeWeight(2);
    fill(255);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
    pop();

    for (let path of this.paths) {
      beginShape();
      noFill();
      for (let v of path) {
        vertex(v.x, v.y);
      }
      endShape();
    }

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

  // create "repulse" that will *slowly* direct vehicle away from edges
  repulseAtEdges() {
    let repulseVector = new p5.Vector(0,0);
    let edgeRepulseVector = new p5.Vector(0,0);
    let edgeDistance = 1;
    let repulsing = false;
    if (this.pos.x > width - this.edgeBuffer) {
      edgeDistance = width - this.pos.x;
      edgeRepulseVector.set(-1,0);
      edgeRepulseVector.setMag(1 / edgeDistance);
      repulseVector.add(edgeRepulseVector);
      repulsing = true;
    }
    if (this.pos.x < this.edgeBuffer) {
      edgeDistance = this.pos.x;
      edgeRepulseVector.set(1,0);
      edgeRepulseVector.setMag(1 / edgeDistance);
      repulsing = true;
      repulseVector.add(edgeRepulseVector);
    }
    if (this.pos.y > height - this.edgeBuffer) {
      edgeDistance = height - this.pos.y;
      edgeRepulseVector.set(0,-1);
      edgeRepulseVector.setMag(1 / edgeDistance);
      repulseVector.add(edgeRepulseVector);
      repulsing = true;
    }
    if (this.pos.y < this.edgeBuffer) {
      edgeDistance = this.pos.y;
      edgeRepulseVector.set(0,1);
      edgeRepulseVector.setMag(1 / edgeDistance);
      repulseVector.add(edgeRepulseVector);
      repulsing = true;
    }
    if (repulsing) console.log(repulseVector);
    repulseVector.limit(this.maxForce * 2);

    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
      repulseVector.rotate(PI);
    }
    return repulseVector;
  }

}

class Target extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(5);
  }

  show() {
    stroke(255);
    strokeWeight(2);
    fill("#F063A4");
    push();
    translate(this.pos.x, this.pos.y);
    circle(0, 0, this.r * 2);
    pop();
  }
}
