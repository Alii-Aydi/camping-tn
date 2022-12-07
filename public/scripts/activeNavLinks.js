const activeLinkNav = () => {
    const links = document.querySelectorAll('.nav-link')
    for (let link of links) {
        link.classList.remove('active')
    }
    for (let link of links) {
        if (window.location.protocol + '//' + window.location.host + link.getAttribute('href') == window.location.href) {
            link.classList.add('active')
        }
    }
}
window.onload = activeLinkNav()