import {cellsContainerDiv, gameStatusDiv, levelsContainerDiv, pointsDiv, controlsDiv, pauseButton, restartButton, exitButton} from '../divs.js';

export class Pacman {
    constructor(gameSpeed, grid, numberOfEnemies, gameStatusDiv, pointsDiv, cellsContainerDiv, levelsContainerDiv, controlsDiv, pauseButton, restartButton, exitButton) {
        this.interval=null;

        this.gameSpeed=gameSpeed;

        this.grid=grid;

        this.numberOfEnemies = numberOfEnemies;
        this.enemies = [];
        this.gameStatusDiv = gameStatusDiv;

        this.points = 0;
        this.pointsDiv = pointsDiv;

        this.gameStatus = 'NOT_STARTED'; //NOT_STARTED, IN_PROGRESS, PAUSED, ABANDONED, WON, LOST
        this.gameStatusDiv.innerText = 'Wciśnij dowolny przycisk aby rozpocząć grę';

        this.controlsDiv = controlsDiv;
        this.pauseButton = pauseButton;
        this.restartButton = restartButton;
        this.exitButton = exitButton;

        this.cellsContainerDiv = cellsContainerDiv;
        this.cellsContainerDiv.classList.add("hidden")
        this.controlsDiv.classList.add("hidden");

        this.levelsContainerDiv = levelsContainerDiv;
        this.levelsContainerDiv.classList.remove("hidden");

        //event listeners
        window.addEventListener('keydown', this.handleKeyboardInputs.bind(this));
        this.cellsContainerDiv.addEventListener('click', this.handleClickInputs.bind(this));
        this.pauseButton.addEventListener('click', this.handlePauseButton.bind(this));
        this.restartButton.addEventListener('click', this.startGame.bind(this));
        this.exitButton.addEventListener('click', this.quitGame.bind(this));

        //pacman starts from the centre
        this.pacmanOldPosition = {x: 4, y: 4};
        this.pacmanCurrentPosition = {x: 4, y:4};
       
        //random default direction    
        this.pacmanCurrentDirection = this.getRandomDirection();

        this.drawGrid();
    }

    drawGrid() {

        this.grid.forEach(elParent=>{
          elParent.forEach(elChild => {

            //clear everythig
            if(elChild.div.classList.contains('PACMAN')) {
                elChild.div.classList.remove('PACMAN');
            }
            
            if(elChild.div.classList.contains('PACMAN-UP')) {
                elChild.div.classList.remove('PACMAN-UP');
            }

            if(elChild.div.classList.contains('PACMAN-DOWN')) {
                elChild.div.classList.remove('PACMAN-DOWN');
            }

            if(elChild.div.classList.contains('PACMAN-LEFT')) {
                elChild.div.classList.remove('PACMAN-LEFT');
            }

            if(elChild.div.classList.contains('PACMAN-RIGHT')) {
                elChild.div.classList.remove('PACMAN-RIGHT');
            }

            if(elChild.div.classList.contains('DOT')) {
                elChild.div.classList.remove('DOT');
            }

            if(elChild.div.classList.contains('EMPTY')) {
                elChild.div.classList.remove('EMPTY');
            }

            if(elChild.div.classList.contains('OBSTACLE')) {
                elChild.div.classList.remove('OBSTACLE');
            }

            if(elChild.div.classList.contains('ENEMY')) {
                elChild.div.classList.remove('ENEMY');
            }

            //add class to the current type
            if(elChild.div.classList.contains(elChild.type)===false) {
                elChild.div.classList.add(elChild.type);
            }
          })    
        });
        
        //putting pacman on the grid
    
        const pacmanCurrentDiv = this.grid[this.pacmanCurrentPosition.x][this.pacmanCurrentPosition.y].div;
        const pacmanOldDiv = this.grid[this.pacmanOldPosition.x][this.pacmanOldPosition.y].div;

        if(pacmanCurrentDiv.classList.contains('DOT')) {
            pacmanCurrentDiv.classList.remove('DOT')
        }

        pacmanCurrentDiv.classList.add('PACMAN');
        pacmanCurrentDiv.classList.add(`PACMAN-${this.pacmanCurrentDirection}`);
    
        if(pacmanOldDiv.classList.contains('DOT')) {
            pacmanCurrentDiv.classList.remove('DOT');
        }

        //putting the enemies on the grid

        this.enemies.forEach(enemy => {
            const enemyCurrentDiv = this.grid[enemy.x][enemy.y].div;

            if(enemyCurrentDiv.classList.contains('DOT')) {
              
                enemyCurrentDiv.classList.remove('DOT')
            }
            if(enemyCurrentDiv.classList.contains('EMPTY')) {
              enemyCurrentDiv.classList.remove('EMPTY')
            }
            enemyCurrentDiv.classList.add('ENEMY');
        });

    }

//PACMAN - RELATED METHODS
    movePacman(direction) {
        this.pacmanOldPosition = {...this.pacmanCurrentPosition};
        direction=direction.toUpperCase();

        if(direction==='UP' && this.isAccessible(this.pacmanCurrentPosition.x, this.pacmanCurrentPosition.y-1)) {
            this.addPoints(this.pacmanCurrentPosition.x, this.pacmanCurrentPosition.y-1)
            this.pacmanCurrentPosition.y--;
        }
        
        else if(direction==='DOWN' && this.isAccessible(this.pacmanCurrentPosition.x, this.pacmanCurrentPosition.y+1)) {
            this.addPoints(this.pacmanCurrentPosition.x, this.pacmanCurrentPosition.y+1)
            this.pacmanCurrentPosition.y++;
        }
        
        else if(direction==='LEFT' && this.isAccessible(this.pacmanCurrentPosition.x-1, this.pacmanCurrentPosition.y)) {
            this.addPoints(this.pacmanCurrentPosition.x-1, this.pacmanCurrentPosition.y)
            this.pacmanCurrentPosition.x--;
        }
        
        else if(direction==='RIGHT' && this.isAccessible(this.pacmanCurrentPosition.x+1, this.pacmanCurrentPosition.y)) { 
            this.addPoints(this.pacmanCurrentPosition.x+1, this.pacmanCurrentPosition.y)
            this.pacmanCurrentPosition.x++;
        }
        else if(direction!=='UP' && direction!=='DOWN' && direction!=='LEFT' && direction!=='RIGHT'){
            console.error('Wrong value of parameter for method "Pacman.movePacman().". Expected: "UP", "DOWN", "LEFT" or "RIGHT"');
        }

        this.grid[this.pacmanCurrentPosition.x][this.pacmanCurrentPosition.y].type='EMPTY';
    }

    movementInterval() {
        this.interval = setInterval(()=>{
            if(this.gameStatus === 'IN_PROGRESS') {
                this.movePacman(this.pacmanCurrentDirection);
                this.moveEnemies();
                this.drawGrid();
                if(this.isWon()) {
                    this.winGame();
                }
                
                if(this.isLost()) {
                    this.loseGame();
                }
            }
        }, this.gameSpeed)
    }

    removeMovementInterval() {
        clearInterval(this.interval);
    }

    handleKeyboardInputs(e) {
        if(e.keyCode===27 && (this.gameStatus==='IN_PROGRESS' || this.gameStatus==='PAUSED' || this.gameStatus==='NOT_STARTED' || this.gameStatus==="WON" || this.gameStatus==="LOST")) { //ESC
            this.quitGame();
        }

        if(e.keyCode===80) { //P
            this.handlePauseButton();
        }
        //R - restart
        if(e.keyCode===82 && (this.gameStatus==='IN_PROGRESS' || this.gameStatus==='PAUSED' || this.gameStatus==="WON" || this.gameStatus==="LOST")) {
            this.startGame();    
        }

        if(this.gameStatus==='NOT_STARTED') {
            this.startGame();
        }


        if(e.keyCode===38 || e.keyCode===87) { //up arrow or 'W'
          this.pacmanCurrentDirection='UP';
        }
        else if(e.keyCode===40 || e.keyCode===83) { // down arrow or 'S'
            this.pacmanCurrentDirection='DOWN';
        }
        else if(e.keyCode===37 || e.keyCode===65) {  // left arrow or 'A'
            this.pacmanCurrentDirection='LEFT';
        }
        else if(e.keyCode===39 || e.keyCode===68) { //right arrow or 'D'
            this.pacmanCurrentDirection='RIGHT';
        }
    }

    handleClickInputs(e) {
        const x = parseInt(e.path[0].id.substring(5, 6));
        const y = parseInt(e.path[0].id.substring(7, 8));
        const clickCoordinates={x, y};

        if(
            (clickCoordinates.y < this.pacmanCurrentPosition.y) &&
            (
                (clickCoordinates.x == this.pacmanCurrentPosition.x) ||
                (clickCoordinates.x == this.pacmanCurrentPosition.x-1 && clickCoordinates.y !== this.pacmanCurrentPosition.y-1) ||
                (clickCoordinates.x == this.pacmanCurrentPosition.x+1 && clickCoordinates.y !== this.pacmanCurrentPosition.y-1)
            )
        ) {
            this.pacmanCurrentDirection = 'UP';
        }
        else if(
            (clickCoordinates.y > this.pacmanCurrentPosition.y) &&
            (
                (clickCoordinates.x == this.pacmanCurrentPosition.x) ||
                (clickCoordinates.x == this.pacmanCurrentPosition.x-1 && clickCoordinates.y !== this.pacmanCurrentPosition.y+1) ||
                (clickCoordinates.x == this.pacmanCurrentPosition.x+1 && clickCoordinates.y !== this.pacmanCurrentPosition.y+1)
            )
        ) {
            this.pacmanCurrentDirection = 'DOWN';
        }
        else if(
            (clickCoordinates.x < this.pacmanCurrentPosition.x) &&
            (
                (clickCoordinates.y == this.pacmanCurrentPosition.y) ||
                (clickCoordinates.y == this.pacmanCurrentPosition.y-1 && clickCoordinates.x !== this.pacmanCurrentPosition.x-1) ||
                (clickCoordinates.y == this.pacmanCurrentPosition.y+1 && clickCoordinates.x !== this.pacmanCurrentPosition.x-1)
            )
        ) {
            this.pacmanCurrentDirection = 'LEFT';
        }
        else if(
            (clickCoordinates.x > this.pacmanCurrentPosition.x) &&
            (
                (clickCoordinates.y == this.pacmanCurrentPosition.y) ||
                (clickCoordinates.y == this.pacmanCurrentPosition.y-1 && clickCoordinates.x !== this.pacmanCurrentPosition.x+1) ||
                (clickCoordinates.y == this.pacmanCurrentPosition.y+1 && clickCoordinates.x !== this.pacmanCurrentPosition.x+1)
            )
        ) {
            this.pacmanCurrentDirection = 'RIGHT';
        }
    }
    
    handlePauseButton() {
        if(this.gameStatus==='IN_PROGRESS') {
            this.pauseGame();
        }
        else if(this.gameStatus ==='PAUSED') {
            this.resumeGame();
        }   
    }

//ENEMIES - RELATED METHODS
    addEnemies() {
        for(let i=1; i<=this.numberOfEnemies; i++) {
            let randomX, randomY, randomDir;

            randomDir=this.getRandomDirection();

            do {
              randomX = this.getRandomCoordinate()
              randomY = this.getRandomCoordinate();
              
            } while(!this.isAccessible(randomX, randomY));

            this.enemies.push({x : randomX, y:randomY, direction: randomDir});
        }
    }
    moveEnemies() {
        this.enemies.forEach((enemy)=>{
            this.moveEnemy(enemy);
        })
    }
    moveEnemy(enemy) {  
      if(enemy.direction === 'UP' && this.isAccessible(enemy.x, enemy.y-1)) {
        enemy.y--;
      }
      else if(enemy.direction === 'DOWN' && this.isAccessible(enemy.x, enemy.y+1)) {
        enemy.y++;
      }
      else if(enemy.direction === 'LEFT' && this.isAccessible(enemy.x-1, enemy.y)) {
        enemy.x--;
      }
      else if(enemy.direction === 'RIGHT' && this.isAccessible(enemy.x+1, enemy.y)) {
        enemy.x++;
      }
      else {
        let isDirectionAccessible;
        let newDirection;

        do {
            newDirection = this.getRandomDirection();

            if(newDirection==='UP' && this.isAccessible(enemy.x, enemy.y-1)) {
                isDirectionAccessible = true;
                enemy.y--
            }
            else if(newDirection==='DOWN' && this.isAccessible(enemy.x, enemy.y+1)) {
                isDirectionAccessible = true;
                enemy.y++
            }
            else if(newDirection=='LEFT' && this.isAccessible(enemy.x-1, enemy.y)) {
                isDirectionAccessible = true;
                enemy.x--;
            }
            else if(newDirection==='RIGHT' && this.isAccessible(enemy.x+1, enemy.y)) {
                isDirectionAccessible = true;
                enemy.x++
            }
            else {
                isDirectionAccessible = false;
            }
        }
        while(!isDirectionAccessible);
        enemy.direction = newDirection;
      }
    }

//AUXILIARY METHODS
    getRandomDirection() {
        const availableDirections=['UP', 'DOWN', 'LEFT', 'RIGHT'];
        return availableDirections[Math.round(Math.random()*3)];
    }
    getRandomCoordinate() {
        return Math.round(Math.random()*9);
    }

    isAccessible(x,y) {
        //checks if the position on the grid is accessible
        if(x>=0 && x<=9 && y>=0 && y <=9) {
          if(
              this.grid[x][y].type==='DOT' || 
              this.grid[x][y].type==='EMPTY' || 
              this.grid[x][y].type==='PACMAN' ||
              this.grid[x][y].type==='ENEMY') 
          {
              return true;
          }     
          else {
              return false;
          }
        }
        else {
          return false;
        }
      }
  
      addPoints(x,y) {
          if(this.grid[x][y].type==='DOT') {
              this.points++;
              this.pointsDiv.innerText=this.points;
          }
      }
  
      getPoints() {
          return this.points;
      }

//game control
      startGame() {
          this.points=0 
          this.pointsDiv.innerText=this.points; 

          this.cellsContainerDiv = cellsContainerDiv;
          this.cellsContainerDiv.classList.remove("hidden")
          this.controlsDiv.classList.remove("hidden");
  
          this.levelsContainerDiv = levelsContainerDiv;
          this.levelsContainerDiv.classList.add("hidden");
  

          //if(this.pacmanCurrentPosition.x!==4 && this.pacmanCurrentPosition.y!==4) {
          this.pacmanCurrentPosition = {x: 4, y: 4}
          this.pacmanOldPosition = {x: 4, y: 4}

        
          this.grid.forEach(elParent => {
            elParent.forEach(elChild => {
                if(elChild.type==='EMPTY') {
                    elChild.type='DOT';
                }
            })
          }) 

          this.gameStatus = 'IN_PROGRESS';
          this.gameStatusDiv.innerText = '';
          
          this.enemies = [];
          this.addEnemies();
          
          if(this.interval!==null) {
            this.removeMovementInterval();
          }
          this.movementInterval();
      }
      pauseGame() {
          this.gameStatus = 'PAUSED';
          this.gameStatusDiv.innerText = 'Wciśnij "P" aby wznowić grę"';
      }
      resumeGame() {
          this.gameStatus='IN_PROGRESS';
          this.gameStatusDiv.innerText = '';
      }
      winGame() {
          this.gameStatus = 'WON';
          this.gameStatusDiv.innerText = 'Zwycięstwo!';
          const myTimeout = setTimeout(()=>{
            this.quitGame()
          }, 5000);
      }
      loseGame() {
          this.gameStatus = 'LOST';
          this.gameStatusDiv.innerText = 'Przegrana';
          const myTimeout = setTimeout(()=>{
            this.quitGame();
          }, 5000);
      }
      quitGame() {
          this.gameStatus='ABANDONED';
          this.gameStatusDiv.innerText = `Koniec gry. Twój wynik to: ${this.points} punktów`;
          this.cellsContainerDiv.classList.add("hidden");
          this.controlsDiv.classList.add("hidden");
          this.levelsContainerDiv.classList.remove("hidden");
      }
      changeProperties(gameSpeed, grid, numberOfEnemies) {
        this.gameSpeed=gameSpeed;
        this.grid=grid;
        this.numberOfEnemies=numberOfEnemies;

        this.startGame();
      }
//Checkers of the game status
      isWon() {
          let isThereADotLeft;
          this.grid.forEach(elParent=>{
                const checkForDots = elParent.find(elChild => {    
                    if(elChild.type==='DOT') {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                if(checkForDots !== undefined) {
                    isThereADotLeft=true;
                }
                else if(checkForDots===undefined && isThereADotLeft===false) {
                    isThereADotLeft=false;
                }
          });        

          return !isThereADotLeft;
      }
      isLost() {
        //check if Pacman has encountered one of the enemies
        let enemySpotted = false;

        this.enemies.forEach(enemy=>{
            if(enemy.x === this.pacmanCurrentPosition.x && enemy.y === this.pacmanCurrentPosition.y) {
                enemySpotted = true;
            }
        });

        return enemySpotted;
      }
}
