let gameState = -1; // -1: 首頁, 0: 等待進入起點, 1: 遊戲中, 2: 失敗, 3: 勝利
let path = [];
let pathWidth = 90; // 道路的寬度預設值
let startAreaWidth = 80; // 將起點/終點區域加寬，方便操作
let noiseStep = 0.005; // 道路起伏程度的預設值
let lives = 0; // 目前生命數
let maxLives = 0; // 該難度的最大生命數 (0代表不使用此機制)
let invincibleTimer = 0; // 失誤後的無敵時間計時器

function setup() {
  createCanvas(windowWidth, windowHeight); // 稍微加寬畫布讓路徑長一點
  generatePath();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generatePath();
  gameState = -1; // 調整視窗大小後回到首頁，避免狀態錯亂
}

function generatePath() {
  path = [];
  let noiseOffset = random(1000); // 隨機生成地形的種子
  
  // 使用 Perlin noise 產生平滑且隨機的路徑
  for (let x = 0; x <= width; x++) {
    // 確保路徑不會超出畫面上下的邊界
    path[x] = map(noise(noiseOffset), 0, 1, pathWidth, height - pathWidth);
    noiseOffset += noiseStep; // 使用變數控制崎嶇程度
  }
}

function draw() {
  background(30); // 牆壁顏色 (暗色)

  // 繪製安全道路 (淺色)
  fill(220);
  noStroke();
  beginShape();
  for (let x = 0; x <= width; x++) {
    vertex(x, path[x] - pathWidth / 2);
  }
  for (let x = width; x >= 0; x--) {
    vertex(x, path[x] + pathWidth / 2);
  }
  endShape(CLOSE);

  // 繪製起點區域 (綠色)
  fill(0, 200, 0, 150);
  rect(0, 0, startAreaWidth, height); // 左側皆設為開始點，高度涵蓋整個畫面

  // 繪製終點區域 (藍色)
  fill(0, 150, 255, 150);
  rect(width - startAreaWidth, path[width] - pathWidth / 2, startAreaWidth, pathWidth);

  // 繪製生命值 (愛心)
  if ((gameState === 0 || gameState === 1) && maxLives > 0) {
    fill(255, 50, 50);
    textSize(24);
    textAlign(LEFT, TOP);
    let heartStr = "";
    for (let i = 0; i < lives; i++) {
      heartStr += "❤️ ";
    }
    text(heartStr, 10, 10);
  }

  // 遊戲邏輯與 UI 顯示
  if (gameState === -1) {
    // 繪製難度選擇按鈕
    rectMode(CENTER);
    textSize(24);
    textAlign(CENTER, CENTER);
    
    // 簡單按鈕 (綠色)
    fill(100, 255, 100);
    rect(width / 2, height / 2 - 80, 200, 60, 10);
    fill(0);
    text("簡單 (Easy)", width / 2, height / 2 - 80);

    // 普通按鈕 (黃色)
    fill(255, 255, 100);
    rect(width / 2, height / 2, 200, 60, 10);
    fill(0);
    text("普通 (Normal)", width / 2, height / 2);

    // 困難按鈕 (紅色)
    fill(255, 100, 100);
    rect(width / 2, height / 2 + 80, 200, 60, 10);
    fill(0);
    text("困難 (Hard)", width / 2, height / 2 + 80);

    rectMode(CORNER); // 恢復預設繪製模式
  } else if (gameState === 0) {
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    
    if (maxLives > 0 && lives < maxLives) {
      fill(255, 100, 100);
      text(`失誤了！剩下 ${lives} 條命，請將滑鼠移回左側綠色區域重新開始`, width / 2, 30);
    } else {
      text("請將滑鼠移至左側綠色區域以正式開始", width / 2, 30);
    }

    // 當滑鼠移動到起點範圍內時，正式進入遊戲中狀態
    if (mouseX >= 0 && mouseX < startAreaWidth && mouseY >= 0 && mouseY <= height) {
      gameState = 1;
    }
  } else if (gameState === 1) {
    // 繪製玩家滑鼠游標的紅點
    fill(255, 0, 0);
    ellipse(mouseX, mouseY, 10, 10);

    // 檢查是否抵達終點
    if (mouseX > width - startAreaWidth) {
      gameState = 3;
    } else {
      // 檢查是否碰到邊界 (觸電)
      let mx = constrain(floor(mouseX), 0, width);
      let topBound = path[mx] - pathWidth / 2;
      let bottomBound = path[mx] + pathWidth / 2;

      // 在起點區域內不會被判定失敗
      if (mouseX >= startAreaWidth) {
        // 玩家圓點半徑約為 5
        if (mouseY - 5 < topBound || mouseY + 5 > bottomBound) {
          if (maxLives > 0) {
            lives--;
            if (lives > 0) {
              gameState = 0; // 扣命後回到起點等待
            } else {
              gameState = 2; // 沒命了，遊戲結束
            }
          } else {
            gameState = 2; // 簡單模式不使用命機制，直接結束
          }
        }
      }
    }
  } else if (gameState === 2) {
    fill(255, 50, 50);
    textSize(40);
    textAlign(CENTER, CENTER);
    text("觸電了！遊戲結束", width / 2, height / 2);
    textSize(20);
    text("點擊滑鼠重新開始", width / 2, height / 2 + 40);
  } else if (gameState === 3) {
    fill(50, 255, 50);
    textSize(40);
    textAlign(CENTER, CENTER);
    text("恭喜過關！", width / 2, height / 2);
    textSize(20);
    text("點擊滑鼠再來一局", width / 2, height / 2 + 40);
  }
}

// 滑鼠點擊事件 (用於重新開始)
function mousePressed() {
  if (gameState === -1) {
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100) {
      // 檢查是否點擊簡單按鈕 (Y 軸中心點為 height/2 - 80)
      if (mouseY > height / 2 - 80 - 30 && mouseY < height / 2 - 80 + 30) {
        pathWidth = 140; noiseStep = 0.003; maxLives = 0; lives = 0; generatePath();
        gameState = 0; // 點擊後切換至等待滑鼠進入起點的狀態
      }
      // 檢查是否點擊普通按鈕 (Y 軸中心點為 height/2)
      else if (mouseY > height / 2 - 30 && mouseY < height / 2 + 30) {
        pathWidth = 90; noiseStep = 0.005; maxLives = 3; lives = 3; generatePath();
        gameState = 0;
      }
      // 檢查是否點擊困難按鈕 (Y 軸中心點為 height/2 + 80)
      else if (mouseY > height / 2 + 80 - 30 && mouseY < height / 2 + 80 + 30) {
        pathWidth = 40; noiseStep = 0.008; maxLives = 10; lives = 10; generatePath();
        gameState = 0;
      }
    }
  } else if (gameState === 2 || gameState === 3) {
    generatePath(); // 重新生成新路徑
    gameState = -1; // 遊戲結束後點擊，回到首頁
  }
}

// 鍵盤事件 (用於觸發按鈕)
function keyPressed() {
  if (gameState === -1 && (key === ' ' || keyCode === ENTER)) {
    // 預設以「普通」難度開始
    pathWidth = 90; noiseStep = 0.005; maxLives = 3; lives = 3; generatePath();
    gameState = 0; // 切換至等待滑鼠進入起點的狀態
  }
}
