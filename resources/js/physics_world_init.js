/**
 * Author: Marco Garzon Lara
 * Student Number: 33970651
 * Brief: Unintuitive, physics-based volume mixer UI
 * Notes: This JavaScript file is so gross and coupled I apologise in advance to whoever has to read this, I wrote this on the fly lol.
 */

const matterContainer = document.querySelector("#matter-container"); //Contain the matter world scope/viewport within the matter-container Div.
const THICCNESS = 60;

var volume = 50; //initial volume value set to 50
var volumeLock = true;

function lockVolume() {
  var checkBox = document.getElementById("volume-lock");
  if (checkBox.checked == true){
    volume = volumeBounds(volume);
    document.getElementById('output').innerHTML = volume; //update current volume output to screen

    volumeLock = true;
  } else {
    volumeLock = false;
  }
  console.log(volumeLock);
}

function volumeBounds(currentVolume) {   
  if(currentVolume > 100) {
    return 100;
  } else if(currentVolume < 0) {
    return 0;
  }
  return currentVolume;
}

// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Events = Matter.Events,
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
        background: 'transparent',
        wireframes: false,
        showAngleIndicator: false
    }
});

/**
 * create plinko machine peg collider grid and buckets
 */
for (let i = 0; i < 10; ++i) {
  let Offset = 25;
  for(let j = 0; j < 52; ++j) {
    if(i % 2 == 0) { //if row is even then apply an offset. This displays a plinko-like layout
      let circle = Bodies.circle((j * 50) + Offset, 250 + i * 50, 8, { //create a circle with the x-pos offset
          label: 'peg',
          isStatic: true,
          friction: 0
      });
      Composite.add(engine.world, circle); //add the collider onto the scene
    } else {
        let circle = Bodies.circle(j * 50, 250 + i * 50, 8, { //create ball without the offset
            label: 'peg',
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
    label: 'bucket',
    isStatic: true,
    friction: 0
  });
  Composite.add(engine.world, currentBucket);
}

//Create the 'detectors' for volume percentage logic
var volumePercentageZones = []; //create an array structure for the rectangle detectors
var currentVolumeChange = -100;
for(let i = 0; i < 21; ++i) {
  let volumeUpdateRectangle = { xPos: i * (matterContainer.clientWidth / 21) + 50, yPos: matterContainer.clientHeight, width: 100, height: 10, isStatic: true, volumeChange: currentVolumeChange }; //container with all the parameters needed for each volume updated and its associated volume percentage increase/decrease
  volumePercentageZones.push(volumeUpdateRectangle); //store the rectangle detector parameters into the structure
  currentVolumeChange += 10; //update current volume so each zone has the right change amount
}

//add zones to composite
for(let i = 0; i < volumePercentageZones.length; ++i) {
  let currentZone = Bodies.rectangle(volumePercentageZones[i].xPos, volumePercentageZones[i].yPos, volumePercentageZones[i].width, volumePercentageZones[i].height, { 
    isStatic: volumePercentageZones[i].isStatic, 
    label: 'zone',
    zone: volumePercentageZones[i].volumeChange 
  });
  Composite.add(engine.world, currentZone);
}

/**
 * Player particle spawner position and spawning logic
 */
var currentPlayerPosition = matterContainer.clientWidth / 2; //Set the inital player position to middle of viewport
let playerCounter = Bodies.rectangle(currentPlayerPosition, 70, 12, 12, { //Make the player a rectangle
  isStatic: true
});
document.addEventListener('keydown', (e) => { //player movement controls
  switch(e.key) {
    case "a": //left
      currentPlayerPosition += -20;
      break;
    case "ArrowLeft":
      currentPlayerPosition += -20;
      break;
    case "d": //right
      currentPlayerPosition += 20;
      break;
    case "ArrowRight":
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
        label: 'particle',
        friction: 0.3,
        frictionAir: 0,
        restitution: 0.7
      });
      Composite.add(engine.world, circle); //add ball to physics world
    }
    if(e.key === "Escape") {
      Composite.clear(engine.world, true); //clear all of the spawned balls
    }
});

/**
 * COLLISION RESOLUTION LOGIC CALLBACK
 */
function zoneCollision(event) {
  var pairs = event.pairs;
  //volume += 10;
  for(let i = 0; i < pairs.length; ++i) {
    //console.log(pairs);
    var BodyA = pairs[i].bodyA;
    var BodyB = pairs[i].bodyB;
    
    if(BodyA.label == 'particle' && BodyB.label == 'zone') {
      volume += BodyB.zone;
      if(volumeLock == true) {
        volume = volumeBounds(volume);
      }
      Composite.remove(engine.world, BodyA);
    } else if(BodyB.label == 'particle' && BodyA.label == 'zone') {
      volume += BodyA.zone;
      if(volumeLock == true) {
        volume = volumeBounds(volume);
      }
      Composite.remove(engine.world, BodyB);
    }
    document.getElementById('output').innerHTML = volume; //update current volume output to screen
  }
}

Events.on(engine, "collisionStart", zoneCollision); //register the collision resolution callback to the engine.

/**
 * Spawn world boundaries
 */
var ground = Bodies.rectangle( //ground collision
  matterContainer.clientWidth / 2,
  matterContainer.clientHeight + THICCNESS / 2,
  27184,
  THICCNESS,
  { isStatic: true, label: 'ground' }
);

let leftWall = Bodies.rectangle( //Left collision wall (left browser window border)
  0 - THICCNESS / 2,
  matterContainer.clientHeight / 2,
  THICCNESS,
  matterContainer.clientHeight * 5,
  {
    isStatic: true, label: 'leftborder'
  }
);

let rightWall = Bodies.rectangle( //Right collision wall (right browser window border)
  matterContainer.clientWidth + THICCNESS / 2,
  matterContainer.clientHeight / 2,
  THICCNESS,
  matterContainer.clientHeight * 5,
  { isStatic: true, label: 'rightborder' }
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

/**
 * Volume modifier numbers for interface
 */
let volumeModifiers = document.querySelector("#volume-modifiers")
let volumeModifierPadding = 10 + "px";
let volumeModifierSpacing = ((matterContainer.clientWidth / 21) / 2) + "px";
console.log(matterContainer.clientWidth);
volumeModifiers.style.setProperty('padding-left', volumeModifierPadding);
volumeModifiers.style.setProperty('word-spacing', volumeModifierSpacing);

document.getElementById('output').innerHTML = volume; //update current volume output to screen

window.addEventListener("resize", () => handleResize(matterContainer));