const aboutUsElement = document.querySelector('#aboutUs');
const advertiseElement = document.querySelector('#advertise');
const popupContainer = document.querySelector('.popup-container');

function openAboutUs() {
    popupContainer.style.display = 'block';
    aboutUsElement.style.display = 'flex';
}

function openAdvertise() {
    popupContainer.style.display = 'block';
    advertiseElement.style.display = 'flex';
}

function closeAboutUs() {
    popupContainer.style.display = 'none';
    aboutUsElement.style.display = 'none';
}

function closeAdvertise() {
    popupContainer.style.display = 'none';
    advertiseElement.style.display = 'none';
}

function getToken() {
    const cookieName = 'omi-token' + '=';
    const cookie = decodeURIComponent(document.cookie);
    const cookieArray = cookie.split(';');
    for(let i = 0; i < cookieArray.length; i++) {
        let c = cookieArray[i];
        while(c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookieName) == 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    
    return "";
}

function login() {
    if (getToken() == '') {
        window.location = 'login.html';
    } else {
        window.location = 'lobby.html';
    }
}