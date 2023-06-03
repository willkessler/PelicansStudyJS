// Spring Forces (Spring OOP)
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/160-spring-forces.html
// https://youtu.be/Rr-5HiXquhw

// Simple Spring: https://editor.p5js.org/codingtrain/sketches/dcd6-2mWa
// Spring Vector: https://editor.p5js.org/codingtrain/sketches/_A2pm_SSg
// Spring OOP: https://editor.p5js.org/codingtrain/sketches/9BAoEn4Po
// Soft Spring: https://editor.p5js.org/codingtrain/sketches/S5dY7qjxP

class Particle {
  constructor(partData) {
    this.acceleration = createVector(0, 0, 0);
    this.velocity = createVector(0, 0, 0);
    this.position = createVector(partData.position.x, partData.position.y, 0);
    this.mass = 1; // Let's do something better here!
    this.r = 16;
    this.dampener = partData.dampener;
    this.color = partData.color;
    this.particleSize = partData.particleSize;
  }

  applyForce(force) {
    let f = force.copy();
    f.div(this.mass);
    this.acceleration.add(f);
  }

  // Method to update position
  update() {
    this.velocity.mult(this.dampener);

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }
	
  setPosition(newX,newY,newZ) {
    this.position.x = newX;
    this.position.y = newY;
    this.position.z = newZ;
  }

  // Show particle as arrow going in the direction of the velocity
  show() {
    stroke(this.color.r, this.color.g, this.color.b);
    strokeWeight(2);
    fill(this.color.r, this.color.g, this.color.b);
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());

    // triangle centered on this.pos
    //triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);

    // triangle with its tip on this.pos
    let tSize = -this.r * 3 / 2;
    triangle(tSize, -this.r / 2, tSize, this.r / 2, 0, 0);
    pop();

    // Old ellipse way
    // stroke(255);
    // strokeWeight(2);
    // fill(this.color.r, this.color.g, this.color.b);
    // ellipse(this.position.x, this.position.y, this.particleSize);
  }	
}
