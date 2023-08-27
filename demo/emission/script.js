function createLang(language='en-EN'){
	const langEng = {
		login:'Login',
		password:'Password',
		register:'Register',
		captcha:'Captcha',
	}
	const langs = {
		'en-EN':langEng
	}
	return langs[language]
}
window.addEventListener('load', async e => {
	initPaint()
})
function initPaint() {
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')
	const paper = {
		size: [160, 90],
		color: '#000000',
		fullscreen: true,
		colorsCount: 3,
		canvasHeight: '80%'
	}
	const brushes = [
		{
			size: 1,
			form: 'rectangle'
		},
		{
			size: 2,
			form: 'rectangle'
		},
		{
			size: 30,
			form: 'rectangle'
		},
		{
			size: 2,
			form: 'circle'
		},
		{
			size: 3,
			form: 'circle'
		},
		{
			size: 5,
			form: 'circle'
		},
	]
	const pointer = {
		down: 0,
		brush: brushes[0],
	}
	//---
	document.body.style.background = '#cccccc'

	canvas.width = paper.size[0]
	canvas.height = paper.size[1]
	canvas.style.border = '1px solid #ffffff'
	canvas.style.background = '#eeeeee'
	canvas.style.imageRendering = 'pixelated'
	fullscreen(canvas, paper, true)
	canvas.oncontextmenu = 'return false;'
	canvas.oncontextmenu = () => { return false }

	const mainBlock = createBlock(document.body)
	mainBlock.add(canvas)
	mainBlock.current.style.height = '100%'
	mainBlock.current.style.flexWrap = 'wrap'

	const panelBlock = createBlock(mainBlock.current, [], true)

	const colorBlock = createBlock(panelBlock.current)
	const colors = ['#00000000']
	for (let i = 0; i < paper.colorsCount; i++) {
		const color = createColor()
		colors.push(color)
		const colorButton = addColorButton(paper, color)
		paper.color = colorButton.color
		colorBlock.add(colorButton)
	}
	colorBlock.current.classList.add('btn-group')

	const brushButtons = brushes.map(b => createBrushButton(b, pointer))
	const brushBlock = createBlock(panelBlock.current, brushButtons)
	brushBlock.current.classList.add('btn-group')

	document.body.addEventListener('keydown', e => {
		if (e.code === 'KeyZ') {
			paper.fullscreen = !paper.fullscreen
			fullscreen(canvas, paper)
		}
		if (e.code === 'KeyL') {
			const deflated = localStorage.getItem('save')
			const restoredView = restoreDeflated(deflated)
			restoreImage(ctx, paper, restoredView, colors)
		}
		if (e.code === 'KeyS') {
			const view = imageToBytes(paper, ctx, colors)
			saveImage(view)
		}
		if (e.code === 'KeyD') {
			downloadImage(canvas)
		}
		if (e.code === 'KeyB') {
			const view = imageToBytes(paper, ctx, colors)
			const deflated = deflate(view)
			let blobData = new Blob([deflated], { type: "text/plain" })
			console.log(deflated, blobData)
			downloadFile(blobData, 'backup', 'money')
		}
		if (e.code === 'KeyF') {
			var input = document.createElement('input')
			input.type = 'file'
			input.onchange = e => {
				var file = e.target.files[0]
				var reader = new FileReader()
				reader.readAsDataURL(file)
				reader.onload = readerEvent => {
					const contentBase64 = readerEvent.target.result
					const data = base64ToArrayBuffer(contentBase64)
					const restoredView = restoreDeflated(data)
					console.log(contentBase64, restoredView)
					restoreImage(ctx, paper, restoredView, colors)
				}
			}
			input.click()
		}
	})
	canvas.addEventListener('pointerdown', e => {
		if (e.button === 0) {
			pointer.down = 1
		} else if (e.button === 2) {
			pointer.down = 2
		}
		draw(pointer, canvas, paper, ctx)(e)
	})
	document.body.addEventListener('pointerup', e => {
		pointer.down = 0
	})
	canvas.addEventListener('pointermove', draw(pointer, canvas, paper, ctx))
}
function saveTextAsFile(textToSave)
{
    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileNameToSaveAs = document.getElementById("inputFileNameToSaveAs").value;
 
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
 
    downloadLink.click();
}
function destroyClickedElement(event)
{
    document.body.removeChild(event.target);
}
function loadFileAsText()
{
    var fileToLoad = document.getElementById("fileToLoad").files[0];
 
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent) 
    {
        var textFromFileLoaded = fileLoadedEvent.target.result;
        document.getElementById("inputTextToSave").value = textFromFileLoaded;
    };
    fileReader.readAsText(fileToLoad, "UTF-8");
}
function restoreDeflated(deflated) {
	const inflated = RawDeflate.inflate(deflated)
	const restored = base64ToArrayBuffer(inflated)
	const restoredView = new Int32Array(restored)
	return restoredView
}
function saveImage(view) {
	const deflated = deflate(view)
	localStorage.setItem('save', deflated)
}
function deflate(view) {
	var decoder = new TextDecoder('utf8')
	var b64encoded = btoa(decoder.decode(view))
	const deflated = RawDeflate.deflate(b64encoded)
	return deflated
}
function imageToBytes(paper, ctx, colors) {
	const buffer = new ArrayBuffer(paper.size[0] * paper.size[1] * 8)
	const view = new Int32Array(buffer)
	let i = 0
	for (let x = 0; x < paper.size[0]; x++) {
		for (let y = 0; y < paper.size[1]; y++) {
			const pixel = ctx.getImageData(x, y, 1, 1)
			const data = pixel.data
			const hex = rgbToHex(data[0], data[1], data[2])
			const colorIdx = colors.findIndex((v, i, o) => v === hex)
			view[i] = colorIdx === -1 ? 0 : colorIdx
			i++
		}
	}
	return view
}
function restoreImage(ctx, paper, restoredView, colors) {
	let i = 0
	ctx.clearRect(0, 0, paper.size[0], paper.size[1])
	i = 0
	for (let x = 0; x < paper.size[0]; x++) {
		for (let y = 0; y < paper.size[1]; y++) {
			idx = restoredView[i]
			const color = colors[idx]
			ctx.fillStyle = color
			ctx.fillRect(x, y, 1, 1)
			i++
		}
	}
	return i
}
//-------------------
/** @param {CanvasRenderingContext2D} ctx */
function draw(pointer, canvas, paper, ctx, isPixelPerfect = true) {
	return e => {
		if (pointer.down === 0) { return} 
		const { x, y } = getContext2DPosition(canvas, e, paper, isPixelPerfect)
		const xBbush = x - pointer.brush.size / 2
		const yBbush = y - pointer.brush.size / 2
		const pos = isPixelPerfect? [Math.round(xBbush),Math.round(yBbush)] :[xBbush,yBbush]
		if (pointer.down === 1) {
			ctx.fillStyle = paper.color
			if (pointer.brush.form === 'rectangle') {
				ctx.fillRect(pos[0], pos[1], pointer.brush.size, pointer.brush.size)
			} else {
				fillPixelatedCircle(ctx, x, y, pointer.brush.size)
			}
		} else if (pointer.down === 2) {
			if (pointer.brush.form === 'rectangle') {
				ctx.clearRect(pos[0], pos[1], pointer.brush.size, pointer.brush.size)
			} else {
				ctx.re
				clearCircle(ctx, x, y, pointer.brush.size)
			}
		}
	}
}
function createColor(){
	const colorInt = Math.floor(Math.random() * 16777216)
	var colorHexTemp = colorInt.toString(16)
	while (colorHexTemp.length < 6) {
		colorHexTemp = '0' + colorHexTemp
	}
	const colorHex = '#' + colorHexTemp
	return colorHex
}
function addColorButton(paper, colorHex) {
	const colorButton = document.createElement('span')
	document.body.appendChild(colorButton)
	
	colorButton.style.background = colorHex
	colorButton.color = colorHex
	colorButton.innerText = colorHex
	colorButton.addEventListener('click', e => {
		paper.color = colorButton.style.background
	})
	addBootstrapButton(colorButton, true)
	return colorButton
}
/** @param {HTMLElement} parent */
/** @param {HTMLElement[]} elements */
function createBlock(parent, elements=[], isColumn = false){
	const block = document.createElement('span')
	parent.appendChild(block)
	block.style.display='flex'
	block.style.flexWrap='wrap'
	if(isColumn){
		block.style.flexDirection='column'
	}
	const items = []
	for(const e of elements){
		add(e)
	}
	const blockObj = {
		/** @param {HTMLElement} e */
		add:(e)=>{
			add(e)
			return blockObj
		},
		current:block,
		items:items,
	}
	return blockObj
	//---
	function add(e){
		block.appendChild(e)
			items.push(e)
	}
}
function createBrushButton(brush, pointer) {
	const brushButton = document.createElement('span')
	document.body.appendChild(brushButton)
	brushButton.innerText = brush.form + ' (' + brush.size + ')'
	brushButton.addEventListener('click', e => {
		pointer.brush = brush
	})
	addBootstrapButton(brushButton, false, true)
	return brushButton
}
/** @param {HTMLCanvasElement} canvas */
function fullscreen(canvas, paper){
	if(!paper.fullscreen){
		canvas.style.width = paper.size[0]+'px'
		canvas.style.height = paper.size[1]+'px'
	} else {
		canvas.style.height = paper.canvasHeight
		var resizeObserver =  new ResizeObserver(e=>{
			resizeObserver.unobserve(canvas)
			const aspect = paper.size[0]/paper.size[1]
			const height = canvas.getBoundingClientRect().height
			const width = aspect * height
			canvas.style.width = Math.round(width)+'px'
		})
		resizeObserver.observe(canvas)
		resizeObserver.observe(document.body)
	}
}
/** @param {HTMLElement} element */
function addBootstrapButton(element, isPrimary=false, isOutline = false){
	element.classList.add('btn')
	element.classList.add(isPrimary?'btn-primary':'btn-secondary')
	element.classList.add(isOutline?'btn-outline':'btn-filled')
	element.classList.add('btn-sm')
}
function clearCircle(context, x, y, radius)
{
    context.save()
    context.globalCompositeOperation = 'destination-out'
	fillPixelatedCircle(context, x, y, radius)
    context.restore()
};
function getContext2DPosition(canvas, e, paper, isPixelPerfect = true) {
	const rect = canvas.getBoundingClientRect()
	const cx = e.clientX - rect.left
	const cy = e.clientY - rect.top
	const x = cx / rect.width * paper.size[0]
	const y = cy / rect.height * paper.size[1]
	if(isPixelPerfect){
		const pos =  { x:Math.floor(x), y:Math.floor(y) }
		return pos
	}
	return { x, y }
}
function fillPixelatedCircle(ctx, cx, cy, r){
    r |= 0; // floor radius
    ctx.setTransform(1,0,0,1,0,0); // ensure default transform
    var x = r, y = 0, dx = 1, dy = 1;
    var err = dx - (r << 1);
    var x0 = cx - 1| 0, y0 = cy | 0;
    var lx = x,ly = y;
    ctx.beginPath();
    while (x >= y) {
        ctx.rect(x0 - x, y0 + y, x * 2 + 2, 1);
        ctx.rect(x0 - x, y0 - y, x * 2 + 2, 1);
        if (x !== lx){
            ctx.rect(x0 - ly, y0 - lx, ly * 2 + 2, 1);
            ctx.rect(x0 - ly, y0 + lx, ly * 2 + 2, 1);
        }
        lx = x;
        ly = y;
        y++;
        err += dy;
        dy += 2;
        if (err > 0) {
            x--;
            dx += 2;
            err += (-r << 1) + dx;
        }
    }
    if (x !== lx) {
        ctx.rect(x0 - ly, y0 - lx, ly * 2 + 1, 1);
        ctx.rect(x0 - ly, y0 + lx, ly * 2 + 1, 1);
    }    
    ctx.fill();
}
function pixelPixelatedCircle(ctx, cx, cy, r){
    r |= 0;
    ctx.setTransform(1,0,0,1,0,0); // ensure default transform
    var x = r, y = 0, dx = 1, dy = 1;
    var err = dx - (r << 1);
    var x0 = cx | 0, y0 = cy  | 0;
    var lx = x,ly = y;
    var w = 1, px = x0;
    ctx.beginPath();
    var rendering = 2;
    while (rendering) {
        const yy = y0 - y;
        const yy1 = y0 + y - 1;
        const xx = x0 - x;
        const xx1 = x0 + x - 1;
        ctx.rect(xx, yy1, 1, 1);    
        ctx.rect(xx, yy, 1, 1); 
        ctx.rect(xx1, yy1, 1, 1);    
        ctx.rect(xx1, yy, 1, 1);
        if (x !== lx){
            const yy = y0 - lx;
            const yy1 = y0 + lx - 1;
            const xx = x0 - ly;
            w = px - xx;
            const xx1 = x0 + ly - w;
            ctx.rect(xx, yy, w, 1);
            ctx.rect(xx, yy1, w, 1); 
            ctx.rect(xx1, yy, w, 1); 
            ctx.rect(xx1, yy1, w, 1);
            px = xx;
        }
        lx = x;
        ly = y;
        y++;
        err += dy;
        dy += 2;
        if (err > 0) {
            x--;
            dx += 2;
            err += (-r << 1) + dx;
        }
        if (x < y) { rendering -- }
    }
    ctx.fill();
}
function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
function downloadImage(canvas){
	var link = document.createElement('a');
	link.download = 'filename.png';
	link.href = canvas.toDataURL()
	link.click()
}
function downloadFile(data, filename, type) {
    var file = new Blob([data], {type: type})
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename)
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file)
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(function() {
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        }, 0); 
    }
}