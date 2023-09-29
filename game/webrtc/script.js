var peer = new Peer({
    config: {
        'iceServers': [
            { url: 'stun:stun.l.google.com:19302' },
            //   { url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
        ]
    } /* Sample servers, please use appropriate ones */
})
peer.on('open', function (id) {
    console.log('My peer ID is: ' + id)
    saveData(id)
    const mainElem = AddElem(document.body, 'div')
    const idShow = AddElem(mainElem, 'span', id)
    const idInput = AddElem(mainElem, 'input')
    const callBtn = AddElem(mainElem, 'button', 'connect')
    peer.on('connection', function (conn) {
        console.log('Connected', conn)
        conn.on('data', function (data) {
            console.log('Received', data)
            const msgShow = AddElem(mainElem, 'div', data)
        })
    })
    callBtn.onclick = () => {
        var conectionId = idInput.value
        var conn = peer.connect(conectionId)
        conn.on('open', function () {
            conn.send('Hello!')
            const msgInput = AddElem(mainElem, 'input', 'message')
            const sendBtn = AddElem(mainElem, 'button', 'send')
            sendBtn.onclick = (e) => {
                conn.send(msgInput.value)
            }
        })
    }
})
function saveData(text) {
    const { Client, Account, ID, Databases } = Appwrite;
    const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject('64fec2f077d94dde0a85');
    const databases = new Databases(client);
    const promise = databases.createDocument('64fec34e9cfd3a086b78', '64fec35c42883844e672', uuidv4(), { text: text });
    try {
        promise.then(function (response) {
            console.log(response); // Success
        }, function (error) {
            console.log(error); // Failure
        })
    } catch (err) {
        console.error(err)
    }
}
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}