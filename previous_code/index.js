var body = document.getElementById('body');
var button = document.createElement("button");
var div = document.createElement("div");
var player = ["blue","red"];
var player_num = 0;
var display = document.getElementById('playerTurn');
var undo = document.getElementById('undo');
var state = [];

addRemove(button,{
    class:{
        add:["button"]
    },
    setAttribute:{
        click:0,
        player:"none"
    }
});

addRemove(div,{
    class:{
        add:["div"]
    }
});

//buttons 10 by 10 maker
for(let i = 0;i < 10;i++) {
    var new_div = cloning(div,`div_${i}`);

    for(let j = 0;j < 10;j++) {
        var new_button = cloning(button,`button_${j}`);
        new_button.addEventListener("click",button_click);
        new_div.appendChild(new_button);
    }
    body.appendChild(new_div);
}

function cloning(div,id) {
    var new_div = div.cloneNode(true);
    new_div.id = id;
    return new_div;
}

function button_click() {

    var buttonPlayer = this.getAttribute("player");

    if (buttonPlayer == "none") {
        stateUpdate();
        clickUpdate(this,getGlobalPlayer());
        updateGlobalPlayer();
    }

    if(buttonPlayer == getGlobalPlayer()) {
        stateUpdate();
        clickUpdate(this,null);
        updateGlobalPlayer();
    }
    display.innerHTML = `${getGlobalPlayer().toUpperCase()} Player's Turn`;
}


function getGlobalPlayer() {
    return player[player_num];
}

function updateGlobalPlayer() {
    player_num++;
    player_num = player_num%player.length;
}

function backtrackGLobalPlayer() {
    player_num--;
    if(player_num == -1) {
        player_num = (player.length -1);
    }
}

function clickUpdate(thiss,player) {
    let click = thiss.getAttribute("click");
    click++;
    thiss.innerHTML = click;

    if(player == null) {
        addRemove(thiss,{
            class:{
                remove:[`${thiss.getAttribute("player")}${click-1}`],
                add:[`${thiss.getAttribute("player")}${click}`]
            },
            setAttribute:{
                click:`${click}`
            }
        });
        check(click,thiss);  
    }

    if(player == "red" || player == "blue") {
        addRemove(thiss,{
            class:{
                remove: [`${thiss.getAttribute("player")}${click-1}`],
                add: [`${player}${click}`]
            },
            setAttribute:{
                click:`${click}`,
                player:`${player}`
            }
        });
        check(click,thiss); 
    }
}

function check(click,thiss) {
    let coordinates = getCoordinates(thiss);
    let i = coordinates[0];
    let j = coordinates[1];
    if(valid(click,i,j) == false) {
        multiply(thiss,i,j);
    }
}

function getCoordinates(t) {
    //getting the coordinates using button and div id
    let j = parseInt(t.id.split("_")[1]);
    let i = parseInt(t.parentElement.id.split("_")[1]);
    return [i,j];
}

function valid(c,i,j) {
    //corner pieces
    if( (i == 0 || i == 9) && (j == 0 || j == 9) && c>=2) return false;

    //edge piecs
    if((i == 0 || i==9 || j==0 || j==9) && c>=3) return false;

    //core pieces
    if(c>=4) return false;
    return true;
}

async function multiply(thiss,i,j) {
    let player = thiss.getAttribute("player");
    
    thiss.innerHTML = "";
    addRemove(thiss,{
        setAttribute:{
            click:0,
            player:"none"
        },
        class:{
            remove:[
                `${thiss.getAttribute("player")}${thiss.getAttribute("click")}`
            ]
        }
    });

    let childs = getFourChilds(i,j);

    await delay(250);

    for(let index = 0;index<4;index++) {
        if(notOutOfBound(childs[index][0],childs[index][1])) {
            let n = getN(childs[index][0],childs[index][1]);
            clickUpdate(n,player);
        }
    }
}

function notOutOfBound(i,j) {
    if(i == -1 || i == 10 || j == -1 || j == 10) return false;
    return true;
}

function getN(i,j) {
    var r = body.childNodes[2+i].childNodes[j];
    return r;
}

function getFourChilds(i,j) {
    return [
        [i+1,j],
        [i-1,j],
        [i,j+1],
        [i,j-1]
    ];
}

function delay(n) {  
    return new Promise(done => {
      setTimeout(() => {
        done();
      }, n);
    });
}

function addRemove(thiss,parameters) {
    for(prop in parameters) {
        if(prop == "setAttribute") {
            for(p in (parameters[prop])) {
                thiss.setAttribute(p,parameters[prop][p]);
            }
        }
        if(prop == "class") {
            for(p in (parameters[prop])) {
                if(p == "remove") {
                    parameters[prop][p].forEach(element => {
                        thiss.classList.remove(element);
                    });
                }
                if(p == "add") {
                    parameters[prop][p].forEach(element => {
                        thiss.classList.add(element);
                    });
                }
            }
        }
    }
}

undo.addEventListener("click",undo_click);



function stateUpdate() {
    for(let i = 0;i<10;i++) {
        state[i] = [];
        for(let j = 0;j<10;j++) {
            state[i][j] = {};
            state[i][j].player =  body.childNodes[2+i].childNodes[j].getAttribute("player");
            state[i][j].click =  body.childNodes[2+i].childNodes[j].getAttribute("click");
        }
    }
}

function undo_click() {
    for(let i = 0;i<10;i++) {
        for(let j = 0;j<10;j++) {
            if(state[i][j].click == 0) {
                body.childNodes[2+i].childNodes[j].innerHTML = "";
            } else {
                body.childNodes[2+i].childNodes[j].innerHTML = state[i][j].click;
            }

            addRemove(body.childNodes[2+i].childNodes[j],{
                setAttribute:{
                    player:state[i][j].player,
                    click:state[i][j].click
                },
                class:{
                    remove:["red1","red2","red3","blue1","blue2","blue3"],
                    add:[`${state[i][j].player}${state[i][j].click}`],
                }
            });

        }
    }
    backtrackGLobalPlayer();
    display.innerHTML = `${getGlobalPlayer().toUpperCase()} Player's Turn`;
}