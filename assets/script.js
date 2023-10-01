window.addEventListener('load', e => {
  const localization = getCurrentLocalization()
  const formContainer =  document.getElementById('form-container')
  const formTitle = document.getElementById('form-title')
  formTitle.innerText = localization.formTitle
  const formMessage = document.getElementById('form-message')
  formMessage.innerText = localization.formMessage
  const formSend = document.getElementById('form-send')
  formSend.innerText = localization.formSend
  const formEmail = document.getElementById('form-email')
  formEmail.innerText = localization.formEmail
  const formSuccess = document.getElementById('form-success')
  formSuccess.hidden = true
  const formSuccessMessage = document.getElementById('form-success-message')
  formSuccessMessage.innerText = localization.onSucess
  formContainer.hidden = false
  handleForm(formData => {
    const message = formData.get('email') + ':' + formData.get('message')
    saveData(message.substring(0, 1000), response => {
    formContainer.hidden = true
    formSuccess.hidden = false
  })
  })
})
function getCurrentLocalization() {
  const lang = window.navigator.language
  const localizations = [
    {
      ids: ['en', 'en-en'],
      localization: createLocalization(
        'Write your question or request',
        'Enter your message:',
        'Click to send!',
        '(Optional) Email to response:',
        'Accepted!',
      )
    },
    {
      ids: ['ru', 'ru-ru'],
      localization: createLocalization()
    }
  ]
  const defaultLocalization = localizations[0].localization
  const localization = localizations.find(l => l.ids.indexOf(lang.toLowerCase()) != -1)?.localization ?? defaultLocalization
  return localization
}
function createLocalization(
  formTitle = 'Напишите Ваш вопрос или пожелание!',
  formMessage = 'Введите сообщение:',
  formSend = 'Нажмите, чтобы отправить!',
  formEmail = '(Необязательно) Почта для ответа:',
  onSucess = 'Принято!'
) {
  return {
    formTitle,
    formMessage,
    formSend,
    formEmail,
    onSucess,
  }
}
function saveData(text = 'text', callback = (response) => { }, config = {
  projectId: '64fec2f077d94dde0a85',
  dbId: '64fec34e9cfd3a086b78',
  collectionId: '64fec35c42883844e672',
}) {
  const documentId = getDocumentId()
  const { Client, Account, ID, Databases } = Appwrite;
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(config.projectId)
  const databases = new Databases(client)
  const promise = databases.createDocument(config.dbId, config.collectionId, documentId, { text: text });
  promise.then(function (response) {
    console.log(response) // Success
    callback(response)
  }, function (error) {
    console.log(error) // Failure
  })
}
function getDocumentId() {
  let userId = getUserId()
  const documentId = userId.substring(0, 13) + '-' + uuidv4().substring(0, 13)
  return documentId
}
function getUserId() {
  let userId = getCookie('ildarin-user-id')
  if (userId === undefined) {
    userId = uuidv4()
    setCookie('ildarin-user-id', userId, { secure: true, 'max-age': 32536000 })
  }
  return userId
}
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie(name, value, options = {}) {
  options = {
    path: '/',
    ...options
  };
  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }
  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }
  document.cookie = updatedCookie;
}
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
function handleForm(callback = formDataCallbackDefault) {
  document.getElementById("feedbackForm").addEventListener("submit", function (event) {
    event.preventDefault()
    var email = document.getElementById("email").value
    var message = document.getElementById("message").value
    var formData = new FormData()
    formData.append("email", email)
    formData.append("message", message)
    callback(formData)
  })
}
function formDataCallbackDefault(formData = new FormData()) {
  fetch("/submit-feedback", {
    method: "POST",
    body: formData
  })
    .then(function (response) {
      return response.text();
    })
    .then(function (data) {
      document.getElementById("response").innerHTML = data;
    })
    .catch(function (error) {
      console.error(error);
    });
}