const canvas = document.createElement('canvas')
canvas.width = 300
canvas.height = 200
canvas.style.height='100vh'
document.body.append(canvas)
const ctx = canvas.getContext('2d')

let t = 0
setInterval(() => {
	for(let x=0;x<canvas.width;x++){
		for(let y=0;y<canvas.height;y++){

			let r = 0
			let g = 0
			let b = 0

			if(t<50){
				r = x*x
				g = Math.atan(y/t)
				b = t*x/y/255
			} else if (t<100){
				r = Math.tan(x/y+t)
				g = Math.sin(y/t)
				b = t*t
			}else if(t>=100){
				t=0
			}

			ctx.fillStyle = rgbToHex(r,g,b)
			ctx.fillRect(x,y,1,1)
		}
	}
	t++
}, 13);

function componentToHex(c) {
	c = Math.ceil((c*255)%255)
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}