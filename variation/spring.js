// Spring Forces (Spring OOP)
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/160-spring-forces.html
// https://youtu.be/Rr-5HiXquhw

// Simple Spring: https://editor.p5js.org/codingtrain/sketches/dcd6-2mWa
// Spring Vector: https://editor.p5js.org/codingtrain/sketches/_A2pm_SSg
// Spring OOP: https://editor.p5js.org/codingtrain/sketches/9BAoEn4Po
// Soft Spring: https://editor.p5js.org/codingtrain/sketches/S5dY7qjxP

class Spring {
  constructor(springData ) {
    this.k = springData.k;
    this.restLength = springData.restLength;
    this.a = springData.a;
    this.b = springData.b;
  }

  update() {
    let force = p5.Vector.sub(this.b.position, this.a.position);
    let x = force.mag() - this.restLength;
    force.normalize();
    force.mult(this.k * x);
    this.a.applyForce(force);
    force.mult(-1);
    this.b.applyForce(force);
  }

  show() {
    strokeWeight(4);
    stroke(255);
    drawingContext.setLineDash([5, 10, 30, 10]);  // cf https://editor.p5js.org/squishynotions/sketches/Ax195WTdz
    line(
      this.a.position.x,
      this.a.position.y,
      this.b.position.x,
      this.b.position.y
    );
    drawingContext.setLineDash([1]);
  }
}
