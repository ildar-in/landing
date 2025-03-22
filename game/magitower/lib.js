
//-----------------

function normalizeVector(v=[]){
    var x=v[0],y=v[1];
    var length = Math.sqrt(x**2+y**2);
    //Then divide the x and y by the length.
    x = x/length;
    y = y/length;
    return [x,y]
}

function multVector(v=[], m=1){
    return [v[0]*m,v[1]*m]
}

// Javascript program to Check if a 
// point lies on or inside a rectangle | Set-2 
 
// function to find if given point 
// lies inside a given rectangle or not. 
function FindPoint(x1, y1, x2, y2, x, y) 
{ 
    return x > x1 && x < x2 && y > y1 && y < y2
} 

function isRectanglesCollides(x1,y1,w1,h1, x2,y2,w2,h2) {
	return overlaps({x1:x1,y1:y1, x2:x1+w1,y2:y1+h1},{x1:x2,y1:y2, x2:x2+w2,y2:y2+h2});
}

// Check if rectangle a overlaps rectangle b
// Each object (a and b) should have 2 properties to represent the
// top-left corner (x1, y1) and 2 for the bottom-right corner (x2, y2).
function overlaps(a, b) {
	// no horizontal overlap
	if (a.x1 >= b.x2 || b.x1 >= a.x2) return false;

	// no vertical overlap
	if (a.y1 >= b.y2 || b.y1 >= a.y2) return false;

	return true;
}


function playAudio(path,volume=1){
    var a = new Audio(path)
    a.volume = volume
    a.play()
    return a
}

function createDiv(parent,x,y,w,h,tag='div'){
    const cellHtml = document.createElement(tag)
    parent.appendChild(cellHtml)
    cellHtml.style.position='absolute'
    cellHtml.style.left = x
    cellHtml.style.top = y
    cellHtml.style.width = w
    cellHtml.style.height = h

    cellHtml.setPosition = (x,y)=>{
        cellHtml.style.left = x
        cellHtml.style.top = y
    }

    return cellHtml
}

/**
 * 
 * @param {*} items 
 * @returns {Array<ReturnType<typeof createBlockInfo>>}
 */
//Sample
// helpInfoHtml.style.userSelect='none'

function getPressedKeys(){
    var pressedKeys = {}
    window.onkeyup = function(e) { pressedKeys[e.code] = false }
    window.onkeydown = function(e) { pressedKeys[e.code] = true }
    return pressedKeys
}

function arrayRemove(arr,value){
    var i = 0;
    while (i < arr.length) {
      if (arr[i] === value) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
}