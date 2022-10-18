import {Pacman} from './classes/Pacman.js';
import {gridLvl1} from  './lvls/gridLvl1.js'
import {gridLvl2} from  './lvls/gridLvl2.js'
import {gridLvl3} from  './lvls/gridLvl3.js'
import {gridLvl4} from  './lvls/gridLvl4.js'
import {gridLvl5} from  './lvls/gridLvl5.js'
import {cellsContainerDiv, gameStatusDiv, levelsContainerDiv, pointsDiv, lvl1Button, lvl2Button, lvl3Button, lvl4Button, lvl5Button, controlsDiv, pauseButton, restartButton, exitButton} from './divs.js';

window.addEventListener('DOMContentLoaded', ()=> {
    const pcmn = new Pacman(260, gridLvl1, 3, gameStatusDiv, pointsDiv, cellsContainerDiv, levelsContainerDiv, controlsDiv, pauseButton, restartButton, exitButton);

    lvl1Button.addEventListener('click', () =>{
        pcmn.changeProperties(260, gridLvl1, 4);
    });

    lvl2Button.addEventListener('click', () =>{
        pcmn.changeProperties(240, gridLvl2, 4);

    });

    lvl3Button.addEventListener('click', () =>{
        pcmn.changeProperties(220, gridLvl3, 5);

    });

    lvl4Button.addEventListener('click', () =>{
        pcmn.changeProperties(200, gridLvl4, 3);

    });

    lvl5Button.addEventListener('click', () =>{
        pcmn.changeProperties(180, gridLvl5, 3)
    });
});