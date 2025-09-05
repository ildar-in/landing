function createVideo(width = 400, height = 225, settings={
    textLineSize: 30,
    font: 'Courier'
}){
    let idCounter = 0
    const ctx = createCanvasRenderingContext2D('canvas',width, height)
    let current = false?createElement():null
    const video = {
        createScreen
    }
    return video
    //---
    /** @returns {CanvasRenderingContext2D} */
    function createCanvasRenderingContext2D(canvasId = 'myCanvas', width = 800, height = 600) {
        const canvas = document.createElement('canvas')
        document.body.appendChild(canvas)
        canvas.width = width
        canvas.height = height
        /** @type {CanvasRenderingContext2D} */
        var context = canvas.getContext('2d')
        return context
    }
    function createElementVideo(){
        return { 
            parent: null, 
            draw: ()=>{ }
        }
    }
    function createElementBase(parent=createElementVideo()){
        const element = {
            id: idCounter++,
            isDisposed:false,
            children: new Map(),
            parent
        }
        return element
    }
    function drawChildren(element = createElement()){
        element.base.children.forEach(c=>drawChild(c))
    }
    function drawChild(element = createElement()){
        element.draw(element)
        return element
    }
    function createElement(
      name = 'Untiled',
      elementAddon = { id: 0 },
      parentBase = createElementBase(),
      draw = ()=>{},
      onDispose = ( element = createElementBase() )=>{}
    ){
        const base = createElementBase(parentBase)
        let element = {
            base,
            name,
            dispose:()=>{dispose(base)},
            onDispose,
            draw,
            setFontSize,
            done,
            finallyHide,
        }
        element = Object.assign(element, elementAddon)
        attachTo(parentBase)
        current = element
        base.element = element
        return element
        //---
        function disposeBase(base = createElementBase()){
            if(base === null) { return }
            onDispose(base)
            base.children.forEach(c=>disposeBase(c))
            base.parent = null
            base.isDisposed = true
            base.children.clear()
        }
        function dispose(element = createElement()){
            disposeBase(element.base)
        }
        function attachTo(parent = createElement()){
            if(parent===null){return}
            parent.base.children.set(element.base.id, element)
        }
        function setFontSize(size){
            ctx.font = size + 'px'  + ' ' + settings.font
        }
        function done(){
            const elementParent = element.base.parent === null? element : element.base.parent
            current = elementParent
            return elementParent
        }
        function finallyHide(promise = new Promise()){
            promise.finally(()=>{
                element.dispose()
            })
            return element
        }
    }
    function createScreen(title){
        document.title = title
        const screenLines = new Map()
        const screenAddon = {
            addTextLine,
            clear,
        }
        const screen = createElement('screen', screenAddon, null, ()=>{
             drawChildren(screen)
             return screen
        },b=>console.log(b.id))
        return screenAddon
        //---
        function clear(){
            ctx.clearRect(0,0,width,height)
        }
        function createTextLineAddon(y=0){
            return { y }
        }
        function addTextLine(text){
            const y = (screenLines.size + 1) * settings.textLineSize 
            const textLine = createElement('textLine', 
            createTextLineAddon(y),
            current,
            (element=createTextLineAddon())=>{
                element.setFontSize(settings.textLineSize)
                //screenLines.
                console.log(screenLines, element, screenLines.keys(element.base.id))
                ctx.fillText(text + element.base.id, 0, element.y)
            }, base=>{
                console.log(base.id)
                screenLines.delete(base.id)
            })
            screenLines.set(textLine.base.id, textLine)
            return textLine
        }
    }
}