// In this sketch, the "lead bird" has a general velocity and can lazily turn. Every so often it accelerates in the current direction it's heading.
// Behind and to the left of the lead bird is a "follower bird" whose position is set in space by invisible springs between the lead bird and the follower bird.
// If the follower bird is "out of range" of the optimal spring position it will turn and accelerate to the optimal position to get into the spring "tractor field" that will
// keep the birds in v-formation.

let bob;
let anchor1, anchor2;
let anchor1DirectionVec;
let spring1, spring2;
let leadBirdSpeed = 2.0;

function getRandomFloat(min, max, precision) {
  const range = max - min;
  const random = Math.random() * range + min;
  return random;
}

function randomTurn() {
  let turnTime = Math.random() * 5;
	if (turnTime > 4.0) {
		let randomTurnAngle = getRandomFloat(-5,5,2);
		let randomTurnRadians = randomTurnAngle * PI / 180;
		anchor1DirectionVec.rotate(randomTurnRadians);
	}
}

function adjustLeadBirdSpeed() {
	leadBirdSpeed *= 0.9;
  let boostTime = Math.random();
	if (boostTime > 0.75) {
		leadBirdSpeed += getRandomFloat(0.1,0.2,2);		
	}
	let boostVec = anchor1DirectionVec.copy();
	boostVec.normalize();
	boostVec.mult(leadBirdSpeed);
	anchor1.applyForce(boostVec);	
}

// Method to "lock" a fixed distance between this particle and another particle
function constrainDistance(particle1, particle2, constraint) {
	let halfConstraint = constraint / 2.0;
	let midPoint = new p5.Vector((particle1.position.x + particle2.position.x) / 2, (particle1.position.y + particle2.position.y) / 2, 0);
	let particlesVec = p5.Vector.copy(particle2.position);
	particlesVec.sub([particle1.position.x, particle1.position.y, 0]);

	particlesVec.normalize();

	let d2 =  p5.Vector.copy(particlesVec);
	d2.mult(halfConstraint);
	let newPos = p5.Vector.copy(midPoint);
	newPos.add([d2.x, d2.y, 0]);
  particle2.setPosition(newPos.x, newPos.y, 0);
	line(midPoint.x, midPoint.y, newPos.x, newPos.y);

	newPos.set(midPoint.x, midPoint.y, 0);
	newPos.sub([d2.x, d2.y, 0]);
  particle1.setPosition(newPos.x, newPos.y, 0);
	line(midPoint.x, midPoint.y, newPos.x, newPos.y);

	stroke(0);
	strokeWeight(1);
	textSize(16);
	fill(0,0,0);
	text('Drag mouse to move the red leader around. Green follower will stay at a "respectful" distance away and behind. If you don\'t drag, red leader will move around on its own.', 10,50);
	//text('particle1: [' + particle1.position.x.toFixed(2) + ',' + particle1.position.y.toFixed(2) + ']', 10,50);
	//text('particle2: [' + particle2.position.x.toFixed(2) + ',' + particle2.position.y.toFixed(2) + ']', 10,70);
	//text('particlesVec: [' + particlesVec.x.toFixed(2) + ',' + particlesVec.y.toFixed(2) + ']', 10,90);
}

function showAnchor1Direction() {
	const newVec = anchor1.position.copy();
	const arrowVec = anchor1DirectionVec.copy();
	arrowVec.normalize();
	arrowVec.mult(200);
	newVec.add([arrowVec.x, arrowVec.y,0]);
	line(anchor1.position.x, anchor1.position.y, newVec.x, newVec.y);
}

function setup() {
  createCanvas(1800, 800);
  anchor1 = new Particle({ position: { x: 350, y: 210}, color: { r: 255, g: 0,    b:0 },   particleSize: 25, dampener: 0.92});
  anchor2 = new Particle({ position: { x: 550, y: 210}, color: { r: 255, g: 100,  b:0 },   particleSize: 15, dampener: 0.92});
  bob     = new Particle({ position: { x: 350, y: 300}, color: { r: 45,  g: 244 , b:197 }, particleSize: 30, dampener: 0.92});
  spring1 = new Spring({ k: 0.05, restLength: 200, a: bob, b: anchor1 });
  spring2 = new Spring({ k: 0.05, restLength: 200, a: bob, b: anchor2 });
	anchor1DirectionVec = new p5.Vector(0.1,0,0);
}

function draw() {
  background(60, 100, 200);

  spring1.show();
  spring1.update();
  spring2.show();
  spring2.update();

  bob.show();
  bob.update();
  
	//randomJet(anchor1);
	anchor1.applyForce(anchor1DirectionVec);
  anchor1.show();
  anchor1.update();
	anchor2.show();
  anchor2.update();
	
	randomTurn();
	adjustLeadBirdSpeed();
	showAnchor1Direction();
	if ((anchor1.position.x < 0) || (anchor1.position.x > windowWidth) ||
			(anchor1.position.y < 0) || (anchor1.position.y > windowHeight) ) {
		anchor1.setPosition(20, windowHeight /2, 0);
	}
	
	constrainDistance(anchor1, anchor2,200);
	
  if (mouseIsPressed) { // allow drag of anchor1 (red)
    anchor1.position.set(mouseX, mouseY);
    anchor1.velocity.set(0, 0);
  }
}
