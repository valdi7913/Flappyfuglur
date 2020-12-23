let mobile = false;

window.onload=function() {
    canv = document.getElementById("gc");
    ctx = canv.getContext("2d");

    let inputtype = "keydown";
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        inputtype = 'touchstart';
        mobile = true;
    }
    document.addEventListener(inputtype,keyPush);
    const startbtn = document.getElementById('startbtn');
    const savebtn = document.getElementById('savescorebtn');
    const soundbtn = document.getElementById('togglesound');
    let gamestarted = false;
    startbtn.addEventListener('click', () => {
        if(!gamestarted){
            setInterval(game, 2);
            gamestarted = true;    
        }
    });
    savebtn.addEventListener('click', () => {
        if(highestscore > 0){
            endgame();
        }
    });
    soundbtn.addEventListener('click', () => {
        if(sound){
            sound = false;
        } else {
            sound = true;
        }
    });
}

async function endgame() {
    if(highestscore > 0){
    const data = { highestscore };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    };
    await fetch('/endgame', options);
    highestscore = 0;
    window.location.href = "/getname";
    }
}

async function capturescore(){
    if(score > highestscore){
        highestscore = score;
    }
    score = 0;
}

//Fuglurinn
function fuglur() {
    this.dead = false;
    this.x = 100; 
    this.y = 200;
    this.v = 1;
    this.w = 1;
    this.a = 1.5;
    this.r = 9;
    this.die = function() {
        this.v = 0;
        this.a = 0;
        this.dead = true;
        fr = 0;
        capturescore();
    }
    this.move = function() {
        this.y += this.v/15;
        this.v += this.a/5;
        //reikna hallann
        this.h = this.v*0.07/this.w;
        //reikna hnitin
        this.A = this.x + (this.r/Math.sqrt(1+this.h**2));
        this.B = this.y + this.h*((this.r/Math.sqrt(1+this.h**2)));
        this.C = this.x - (this.r/Math.sqrt(1+this.h**2));
        this.D = this.y - this.h*((this.r/Math.sqrt(1+this.h**2)));
                    
        if(this.y+this.r>400) {
                this.flap();
            }
        }
    this.draw = function() {
        //Búkur
        ctx.beginPath();
        ctx.strokeStyle = "yellow";
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke(); 
        ctx.fillStyle = "yellow";
        ctx.fill();   
        ctx.beginPath();
        ctx.strokeStyle = "orange";
        ctx.arc(this.A, this.B, 5, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = "orange";
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = "yellow";
        ctx.arc(this.C, this.D, 3, 0, 2 * Math.PI); 
        ctx.closePath();
        ctx.fillStyle = "yellow";
        ctx.fill();
        this.move();
    }          
    this.flap = function() {
        this.v = -25;
        this.a = 1.5;
        flapp.currentTime = 0;
        if( sound ) {
            flapp.play();
        }
    }
    this.start = function() { 
        this.y = 200;
        this.v = 10;
        this.a = 1.5;
        this.dead = false;
    }
}

//Boxin
function Box() {
    this.x = 400;
    this.y = 400;
    this.h1 = Math.floor(Math.random()*canv.height*(5/6));
    this.h2 = 300 - this.h1;
    this.w = 60;
    this.v = -1;
    this.move = function() {
        this.x += this.v;
    }
    this.draw = function() {
        ctx.fillStyle="green";
        ctx.fillRect(this.x,this.y,this.w,-this.h1);    
        ctx.fillRect(this.x,0,this.w,this.h2);
        this.move();
    }
    this.stop = function() {
        this.v = 0;
    }
    this.start = function() {
        this.v = 0.7;
    }
}

//Global variables
let fr = 0;
let score = 0;
let highestscore = 0;
let boxes = [];
let sound = true;
fuglur = new fuglur();

//Sounds
var splatt = new Audio();
var stig = new Audio();
var flapp = new Audio();
if (sound == true) {
    splatt = new Audio('sounds/splatt.mp3');
    stig = new Audio('sounds/stig.mp3');
    flapp = new Audio('sounds/flapp.mp3');
}
else if(sound == false) {
    splatt = new Audio('');
    stig = new Audio('');
    flapp = new Audio('');
}

//Background
base_image = new Image();
base_image.src = 'img/background2.png';

//Tala sem fr eyskt um
n = 1;

//Leikurinn
function game() {
    //Telja frame-in
    fr += 1;
    //Hversu margir kassar eru inna skjanum  
    if(fr%300 == 0) {
    boxes.push(new Box());
    }
    // Ertu dauður, ef ekki fáðu stig
    for (j = 0; j < boxes.length; j++) {
        //ertu dauður?
        if(fuglur.x > boxes[j].x && fuglur.x < boxes[j].x+boxes[j].w &&
        (fuglur.y > boxes[j].y - boxes[j].h1 || fuglur.y < boxes[j].h2)) {
            for (k = 0; k < boxes.length; k++){
                boxes[k].v = 0;
            }
            if ( sound ) {
                splatt.play();     
            }
            fuglur.die();
            n = 0;
        } 
        if(fuglur.x == boxes[j].x+boxes[j].w/2){
            score += 1;
            stig.currentTime = 0; 
            if( sound ) {
                stig.play();
            }
            console.log("here");
        }   
    }
            
    //Teikna
    //Himinn
    ctx.drawImage(base_image, -fr%599, -100);
    //Box
    for (i = 0; i < boxes.length; i++) {
        boxes[i].draw();
    }
    //Fuglinn
    fuglur.draw();  
    //Score
    ctx.fillStyle="black";
    ctx.font = "28px Comic-Sans";
    ctx.fillText("Score: "+ score ,250,380);
    ctx.fillText("Highest: " + (highestscore > score ? highestscore : score), 250, 350);
}

// Space
function keyPush(evt) {
    if(evt.keyCode == 32 || mobile){
        fuglur.flap();
        if(fuglur.dead) {
            fuglur.v = -20;
            fuglur.a = 1.5;
            boxes = [];
            fuglur.dead = false;
            n = 1;
            score = 0;
        }
    }
}