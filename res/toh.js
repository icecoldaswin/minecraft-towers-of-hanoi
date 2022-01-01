let queryStringMap;

function getFromQueryString(key) {
    if (!queryStringMap){
        queryStringMap = new Object();
        location.search.replaceAll("?", "").split("&")
            .forEach(x=>{
                kv=x.split("=");
                queryStringMap[kv[0]] = kv[1];
            });
    }
    
    return queryStringMap[key];
}

let towers = [];
let maxStacks = 3;
let maxDisks = parseInt(getFromQueryString("diskCount") || "3");
let disksInitialized = 0;
let initStackIdx = 0;

let pickedDisk;

class Tower {
    constructor(id){
        this.id = id;
        this.disks = [];
    }

    getLastAction() {
        return this.lastAction;
    }

    peek() {
        return this.disks[this.disks.length - 1];
    }

    push(disk) {
        let diskOnTop = this.peek();
        if (! diskOnTop || diskOnTop.order < disk.order) {
            disk.setTowerId(this.id)
            this.disks.push(disk);
            this.lastAction = 'PUSH';
        } else {
            throw 'UNABLE-TO-PLACE';
        }
    }

    pop() {
        this.lastAction = 'POP';
        
        return this.disks.pop();
    }
}
class Disk {
    setTowerId(id) {
        this.towerId = id;
    }
    towerId(){
        return this.towerId;
    }
    constructor(order) {
        this.order = order;
    }
}

function initialize() {
   disksInitialized = 0;
   for(i=0; i < maxStacks; i++) {
       towers[i] = new Tower(i+1);
   }

   for (j = 0; j < maxDisks; j++) {
       towers[initStackIdx].push(createDisk());
   }

   render();
}


function createDisk() {
   if (disksInitialized < maxDisks) {
       return new Disk(++disksInitialized);
   }
}

initialize();

function getTowerWithUIId(id) {
   return towers[parseInt(id.replace('stack-', '')) - 1];
}

$('.container').click((event) => {
   if (! pickedDisk) {
        let fromID = $(event.target).closest('.container').find('.stack').attr('id');
        let fromStack = getTowerWithUIId(fromID);
        
        pickedDisk = fromStack.pop();
   } else {    
        let toID = $(event.target).closest('.container').find('.stack').attr('id');
        let toStack = getTowerWithUIId(toID);
        
        try {
            toStack.push(pickedDisk);
        } catch(e) {
            if (e === 'UNABLE-TO-PLACE') {
                towers[pickedDisk.towerId].push(pickedDisk);
            }
        }
        
        pickedDisk = undefined;
   }     
   render();
})

function summarizeStacksToConsole() {
    console.log('Total stacks: ' + towers.length);

    for (i = 0; i < towers.length; i++) {
        console.log('Total disks in tower['+i+']: ' + towers[i].length);
        towers[i].disks.map(d => console.log(d.order));
    }
}
render();

function render() {
    $('.steves-place').empty();
    if (pickedDisk) {
        uiTower = $('#stack-' + pickedDisk.towerId);
        uiTower.closest('.container').css('background-color', 'lightyellow');
        
        if (towers[pickedDisk.towerId - 1].getLastAction() === 'POP') {
            uiTower.closest('.container').find('.steves-place').append('<img src="assets/steve-raised-hands.png" >');
            towers[i].lastAction = undefined;
        } 
    } else {
        for (i = 0; i < towers.length; i++) {
            
            uiTower = $('#stack-' + towers[i].id);
            uiTower.closest('.container').css('background-color', '');
            if (towers[i].getLastAction() === 'PUSH') {
                uiTower.closest('.container').find('.steves-place').append('<img src="assets/steve-lowered-hands.png" >');
                towers[i].lastAction = undefined;
            }

            elems = [];
            
            // towers[i].disks.map(d => elems.push($('<tr>').append($('<td align="center">').text('#'.repeat(((maxDisks + 1) - d.order) * 3)))));
            towers[i].disks.map(d => elems.push($('<tr>').append($('<td align="center">').append('<p style="font-size:8pt;"><img src="assets/minecraft-16x16-icon-8.png" style="width:'+ ((maxDisks + 1) - d.order) * 60 +'px; height: 20px; ">'+((maxDisks + 1) - d.order)+'</p>'))));
            uiTower.find('tbody').empty();
            elems.map(e => uiTower.find('tbody').append(e));
            
        }
    }
}

$('#level-up').click(() => { if (maxDisks <= 10) {maxDisks += 1; initialize();}});
$('#level-down').click(() => { if (maxDisks >= 1) {maxDisks -= 1; initialize();}});

$('#reload').click(initialize);

setTheme();

function setTheme() {
    let availableBackgrounds=['bg-1.jpg', 'bg-2.jpg', 'bg-3.jpg', 'bg-4.jpg', 'bg-5.jpg', 
                              'bg-6.jpg', 'bg-7.jpg', 'bg-8.jpg', 'bg-9.png', 'bg-10.jpg'];

    $('body')
      .css('background-image', 'url("assets/'+ availableBackgrounds[Math.floor(Math.random() * 10)] +'")');
}

