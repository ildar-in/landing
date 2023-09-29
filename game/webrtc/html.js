function AddElem(parent = document.body, tag, text = '') {
    /** @type {HTMLElement} */
    let elem = document.createElement(tag)

    parent ??= document.body
    parent.appendChild(elem)
    elem.innerText = text

    if (tag === 'button') {
        /** @type {HTMLButtonElement} */
        const elemRes = elem
        return elemRes
    }
    if (tag === 'input') {
        /** @type {HTMLInputElement} */
        const elemRes = elem
        elemRes.value = text
        return elemRes
    }
    return elem
}