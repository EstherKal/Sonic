const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// Player object
let player = {
  x: 50,
  y: canvas.height - 100,
  width: 80,
  height: 80,
  vy: 0,
  jumping: false,
};

// Buildings array
let buildings = [];

let gravity = 0.5;
let buildingSpeed  = 4;
let score = 0;

function createBuilding() {
    const randomBuilding = buildingImages[Math.floor(Math.random() * buildingImages.length)];
  
    if (randomBuilding) {
      const lastBuilding = buildings[buildings.length - 1];
      const minSpacing = 280; // Minimum spacing between buildings
  
      buildings.push({
        x: lastBuilding ? lastBuilding.x + lastBuilding.width + minSpacing : canvas.width,
        y: canvas.height - randomBuilding.height, // Place on the ground
        width: randomBuilding.width,
        height: randomBuilding.height,
        image: randomBuilding.image,
      });
    }
  }
  
  const buildingScale = 0.2; // Scale down all buildings to 20% of their original size

  const buildingImages = [];
  for (let i = 1; i <= 6; i++) {
    const img = new Image();
    img.src = `./assets/building${i}.png`; 
    img.onload = () => {
      // Apply scaling to the building dimensions
      const scaledWidth = img.width * buildingScale;
      const scaledHeight = img.height * buildingScale;
  
      buildingImages.push({
        image: img,
        width: scaledWidth,
        height: scaledHeight,
      });
    };
  }

// Update building positions
function updateBuildings() {
  for (let building of buildings) {
    building.x -= buildingSpeed ;
  }

  // Remove buildings that move out of view
  buildings = buildings.filter(building => building.x + building.width > 0);

  // Add new buildings occasionally
  if (Math.random() < 0.02) createBuilding();
}

// Load player image
const playerImage = new Image();
playerImage.src = './assets/player.png'; 

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawBuildings() {
    for (let building of buildings) {
      ctx.drawImage(building.image, building.x, building.y, building.width, building.height);
    }
  }
  

// Apply physics to the player
function applyPhysics() {
  player.vy += gravity;
  player.y += player.vy;

  // Prevent falling below the canvas
  if (player.y + player.height >= canvas.height) {
    player.y = canvas.height - player.height;
    player.jumping = false; // Reset jumping state
  }
}

// Load background image
const backgroundImage = new Image();
backgroundImage.src = './assets/background.png'; 

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // Fill the entire canvas
  }
  
// Main game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  updateBuildings();
  applyPhysics();

  drawBuildings();
  drawPlayer();

  // Update and display score
  score++;
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);

  requestAnimationFrame(gameLoop);
}

// Initialize the game
createBuilding();
gameLoop();

// Microphone input for jumping
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const microphone = audioContext.createMediaStreamSource(stream);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  microphone.connect(analyser);

  function analyzeVoice() {
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;

    // Trigger jump if volume exceeds threshold
    if (average > 40 && !player.jumping) { // Adjust threshold as needed
      player.vy = -15;
      player.jumping = true;
    }

    requestAnimationFrame(analyzeVoice);
  }

  analyzeVoice();
}).catch(err => {
  console.error('Microphone access denied:', err);
});
