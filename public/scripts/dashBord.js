const containers = document.querySelectorAll('.descreption')
const texts = document.querySelectorAll('.read-more')
const dots = document.querySelectorAll('.more')
for (let container of containers) {
    container.addEventListener('click', function (e) {
        container.children[0].classList.toggle('active')
    })
}