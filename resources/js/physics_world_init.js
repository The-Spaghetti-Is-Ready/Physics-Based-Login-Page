/**
 * Author: Marco Garzon Lara
 * Student Number: 33970651
 * Brief: Unintuitive, physics-based volume mixer UI
 * Notes: This JavaScript file is so gross and coupled I apologise in advance to whoever has to read this, I wrote this on the fly lol.
 */

const matterContainer = document.querySelector("#matter-container"); //Contain the matter world scope/viewport within the matter-container Div.
const THICCNESS = 60;

let volume = 0;

// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

// create a physics engine
var engine = Engine.create();

// create a renderer. We are using Matter.js's default 'debug' renderer which limits functionality but saves development time.
var render = Render.create({
    element: matterContainer,
    engine: engine,
    options: {
        width: matterContainer.clientWidth,
        height: matterContainer.clientHeight,
        background: "transparent",
        wireframes: false,
        showAngleIndicator: false
    }
});

/**
 * create plinko machine peg collider grid and buckets
 */
for (let i = 0; i < 15; ++i) {
  let Offset = 25;
  for(let j = 0; j < 52; ++j) {
    if(i % 2 == 0) { //if row is even then apply an offset. This displays a plinko-like layout
      let circle = Bodies.circle((j * 50) + Offset, 250 + i * 50, 8, { //create a circle with the x-pos offset
          isStatic: true,
          friction: 0
      });
      Composite.add(engine.world, circle); //add the collider onto the scene
    } else {
        let circle = Bodies.circle(j * 50, 250 + i * 50, 8, { //create ball without the offset
            isStatic: true,
            friction: 0
        });
        Composite.add(engine.world, circle);
    }
  }
}

//Create the plinko buckets
for(let i = 0; i < 21; ++i) {
  let currentBucket = Bodies.rectangle(i * (matterContainer.clientWidth / 21), matterContainer.clientHeight - 50, 10, 100, { //Make the bucket
    isStatic: true,
    friction: 0
  });
  Composite.add(engine.world, currentBucket);
}

/**
 * Player particle spawner position and spawning logic
 */
var currentPlayerPosition = matterContainer.clientWidth / 2; //Set the inital player position to middle of viewport
let playerCounter = Bodies.rectangle(currentPlayerPosition, 70, 10, 10, { //Make the player a rectangle
  isStatic: true
});
document.addEventListener('keydown', (e) => { //player movement controls
  switch(e.key) {
    case "a": //left
    currentPlayerPosition += -20;
    break;
    case "d": //right
    currentPlayerPosition += 20;
    break;
  }
  Matter.Body.set(playerCounter, "position", { x: currentPlayerPosition, y: 70 }); //update player position
});
Composite.add(engine.world, playerCounter); //Add player to the world

document.addEventListener('keydown', (e) => {  //Spawns particle when spacebar is pressed.
    if (e.key === "Enter") { //Spawn a ball when 'b' is pressed into the world
        //create circle
        let circle = Bodies.circle(currentPlayerPosition, 80, 10, {
            friction: 0.3,
            frictionAir: 0.00001,
            restitution: 0.8
        });
        Composite.add(engine.world, circle); //add ball to physics world
    }
    if(e.key === "Escape") {
      Composite.clear(engine.world, true); //clear all of the spawned balls
    }
});


/**
 * Spawn world boundaries
 */
var ground = Bodies.rectangle( //ground collision
  matterContainer.clientWidth / 2,
  matterContainer.clientHeight + THICCNESS / 2,
  27184,
  THICCNESS,
  { isStatic: true }
);

let leftWall = Bodies.rectangle( //Left collision wall (left browser window border)
  0 - THICCNESS / 2,
  matterContainer.clientHeight / 2,
  THICCNESS,
  matterContainer.clientHeight * 5,
  {
    isStatic: true
  }
);

let rightWall = Bodies.rectangle( //Left collision wall (right browser window border)
  matterContainer.clientWidth + THICCNESS / 2,
  matterContainer.clientHeight / 2,
  THICCNESS,
  matterContainer.clientHeight * 5,
  { isStatic: true }
);

Composite.add(engine.world, [ground, leftWall, rightWall]); // add all of the bodies to the world

/**
 * Mouse movement constraints
 */
let mouse = Matter.Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false
    }
  }
});

Composite.add(engine.world, mouseConstraint); //add this constraint to the world

mouseConstraint.mouse.element.removeEventListener( // allow scroll through the canvas by removing scroll wheel from Composite
  "mousewheel",
  mouseConstraint.mouse.mousewheel
);
mouseConstraint.mouse.element.removeEventListener(
  "DOMMouseScroll",
  mouseConstraint.mouse.mousewheel
);

/**
 * Runtime calls
 */
Render.run(render); // run the renderer

var runner = Runner.create(); // create runner

Runner.run(runner, engine); // run the engine

/**
 *  Browser window resizing handlers
 */
function handleResize(matterContainer) {
  // set canvas size to new values
  render.canvas.width = matterContainer.clientWidth;
  render.canvas.height = matterContainer.clientHeight;

  // reposition ground
  Matter.Body.setPosition(
    ground,
    Matter.Vector.create(
      matterContainer.clientWidth / 2,
      matterContainer.clientHeight + THICCNESS / 2
    )
  );

  // reposition right wall
  Matter.Body.setPosition(
    rightWall,
    Matter.Vector.create(
      matterContainer.clientWidth + THICCNESS / 2,
      matterContainer.clientHeight / 2
    )
  );
}

window.addEventListener("resize", () => handleResize(matterContainer));

document.getElementById('output').innerHTML = volume;