document.addEventListener('DOMContentLoaded', function() {
  function checkModuleReady() {
    if (typeof Module !== 'undefined' && 
        Module.b2World && 
        Module.b2Vec2 && 
        Module.b2BodyDef && 
        Module.b2PolygonShape && 
        Module.b2ParticleSystemDef &&
        Module.b2ParticleGroupDef &&
        Module.JSDraw &&
        Module.e_shapeBit &&
        Module.e_particleBit &&
        Module.b2_waterParticle &&
        Module.b2Transform &&
        Module.b2ParticleColor // For setting particle color
        ) {
      console.log('LiquidFun Module and necessary components are ready.');
      setupLiquidFunScene(); 
    } else {
      // console.log('LiquidFun Module not ready yet, checking again in 100ms...');
      setTimeout(checkModuleReady, 100); 
    }
  }
  checkModuleReady();
});

var world = null; 
var particleSystem = null;
var pipeOutletPos = null;
var ctx = null;
var canvas = null;
var WORLD_SCALE = 30;
var previousSliderValue = 0;

// --- Adjusted Global Variables and Constants ---
var MAX_PARTICLES_ESTIMATE = 3000; // Adjusted for potentially smaller particle radius
var targetParticleCount = 0;

var bucketCenterX_M, bucketBottomCenterY_M, bucketHalfWidth_M, bucketHalfHeight_M;

function toWorld(px) { return px / WORLD_SCALE; }
function toPixels(worldUnits) { return worldUnits * WORLD_SCALE; }

function setupLiquidFunScene() {
  var CANVAS_WIDTH_PX = 300; 
  var CANVAS_HEIGHT_PX = 400;
  
  var CANVAS_WIDTH_M = toWorld(CANVAS_WIDTH_PX);
  var CANVAS_HEIGHT_M = toWorld(CANVAS_HEIGHT_PX);

  var gravity = new Module.b2Vec2(0, -10);
  world = new Module.b2World(gravity);
  console.log('b2World created.');

  canvas = document.getElementById('liquidfun-canvas');
  ctx = canvas.getContext('2d');
  canvas.width = CANVAS_WIDTH_PX;
  canvas.height = CANVAS_HEIGHT_PX;
  console.log('Canvas setup for LiquidFun.');

  var bd = new Module.b2BodyDef();
  var ground = world.CreateBody(bd);

  var bucketWidthPx = 150;
  var bucketHeightPx = 200;
  bucketHalfWidth_M = toWorld(bucketWidthPx / 2); 
  bucketHalfHeight_M = toWorld(bucketHeightPx / 2);
  bucketCenterX_M = CANVAS_WIDTH_M / 2;
  bucketBottomCenterY_M = bucketHalfHeight_M + toWorld(20); 
  var wallThickness = toWorld(10);

  var shape = new Module.b2PolygonShape();
  shape.SetAsBox(wallThickness, bucketHalfHeight_M, new Module.b2Vec2(bucketCenterX_M - bucketHalfWidth_M, bucketBottomCenterY_M + bucketHalfHeight_M), 0);
  ground.CreateFixture(shape, 0.0);
  shape.SetAsBox(wallThickness, bucketHalfHeight_M, new Module.b2Vec2(bucketCenterX_M + bucketHalfWidth_M, bucketBottomCenterY_M + bucketHalfHeight_M), 0);
  ground.CreateFixture(shape, 0.0);
  shape.SetAsBox(bucketHalfWidth_M + wallThickness, wallThickness, new Module.b2Vec2(bucketCenterX_M, bucketBottomCenterY_M), 0);
  ground.CreateFixture(shape, 0.0);
  console.log('Bucket walls created.');

  // --- Particle System Definition Tuning ---
  var psd = new Module.b2ParticleSystemDef();
  psd.radius = toWorld(3.0); // Adjusted: Slightly smaller radius (was 3.5)
  psd.density = 1.0; // Explicitly set, can be tuned (e.g., 1.0 to 1.5)
  psd.dampingStrength = 0.25; // Adjusted: Slightly increased damping
  
  // LiquidFun specific fluid properties for cohesion
  psd.surfaceTensionPressureStrength = 0.15; // Adjusted: Slightly reduced pressure strength
  psd.surfaceTensionNormalStrength = 0.2; // Example value
  // psd.viscousStrength = 0.1; // Uncomment for more viscous (thicker) water

  particleSystem = world.CreateParticleSystem(psd);
  try {
    // particleSystem.SetMaxParticleCount(MAX_PARTICLES_ESTIMATE + 500); // Usually managed internally
  } catch (e) { /* console.warn("SetMaxParticleCount may not be available or needed."); */ }
  Module.destroy(psd); 
  console.log('Particle system created with tuned parameters.');

  var pipeOutletX = bucketCenterX_M;
  var pipeOutletY = bucketBottomCenterY_M + (2 * bucketHalfHeight_M) + toWorld(50);
  pipeOutletPos = new Module.b2Vec2(pipeOutletX, pipeOutletY);

  try {
    var debugDraw = new Module.JSDraw(ctx, WORLD_SCALE);
    debugDraw.SetFlags(Module.e_shapeBit | Module.e_particleBit);
    world.SetDebugDraw(debugDraw);
    console.log('DebugDraw setup successfully.');
  } catch (e) {
    console.error('Error setting up DebugDraw:', e);
  }
  
  var waterSlider = document.getElementById('water-slider');
  previousSliderValue = parseInt(waterSlider.value);
  targetParticleCount = Math.floor((previousSliderValue / 100) * MAX_PARTICLES_ESTIMATE);

  waterSlider.addEventListener('input', function() {
    var currentSliderValue = parseInt(this.value);
    targetParticleCount = Math.floor((currentSliderValue / 100) * MAX_PARTICLES_ESTIMATE);

    if (currentSliderValue < previousSliderValue) {
      if (previousSliderValue - currentSliderValue > 5 || currentSliderValue === 0) {
        if (particleSystem && particleSystem.GetParticleCount() > 0) {
          try {
            var clearShape = new Module.b2PolygonShape();
            var clearTransform = new Module.b2Transform();
            clearTransform.SetIdentity();
            var bucketTopClear = bucketBottomCenterY_M + (2 * bucketHalfHeight_M) + toWorld(20);
            var clearBoxHalfWidth = bucketHalfWidth_M + wallThickness + toWorld(10);
            var clearBoxHalfHeight = bucketTopClear / 2;
            var clearBoxCenter = new Module.b2Vec2(bucketCenterX_M, bucketTopClear / 2);
            clearShape.SetAsBox(clearBoxHalfWidth, clearBoxHalfHeight, clearBoxCenter, 0);
            particleSystem.DestroyParticlesInShape(clearShape, clearTransform);
            Module.destroy(clearShape);
            Module.destroy(clearTransform);
            console.log("Cleared particles in shape.");
          } catch (e) {
            console.error("Error destroying particles with DestroyParticlesInShape: ", e);
          }
        }
      }
    }
    previousSliderValue = currentSliderValue;
  });

  requestAnimationFrame(update);
  console.log('Animation loop started.');
}

function addWaterParticles() { 
  if (!particleSystem || !pipeOutletPos) return; 
  var shape = new Module.b2PolygonShape();
  shape.SetAsBox(toWorld(3), toWorld(3), pipeOutletPos, 0); 

  var pgd = new Module.b2ParticleGroupDef();
  pgd.flags = Module.b2_waterParticle;
  pgd.shape = shape;
  
  // --- Attempt to set particle color ---
  try {
    var color = new Module.b2ParticleColor(0, 0, 255, 255); // RGBA (0-255) for blue
    // pgd.color.Set(color.r, color.g, color.b, color.a); // One way if Set method exists
    pgd.color.Copy(color); // Another common way if Copy method exists for b2ParticleColor
    Module.destroy(color);
    // console.log('Particle group color set to blue.');
  } catch (e) {
    console.warn('Failed to set particle color in b2ParticleGroupDef:', e);
    // If this fails, particles will likely use a default color from JSDraw.
  }
  
  var group = particleSystem.CreateParticleGroup(pgd);
  Module.destroy(shape);
  Module.destroy(pgd);
  // console.log("Current Particles: " + particleSystem.GetParticleCount()); 
}

function update() {
  if (!world || !particleSystem || !ctx || !canvas) { 
    requestAnimationFrame(update);
    return;
  }

  var currentParticleCount = particleSystem.GetParticleCount();
  if (currentParticleCount < targetParticleCount) {
    addWaterParticles(); 
  } 

  world.Step(1/60, 8, 3); 
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  try {
    world.DrawDebugData();
  } catch (e) { /* console.error("Error drawing debug data: ", e); */ }
  ctx.restore();

  requestAnimationFrame(update);
}
