const chekbox = document.querySelector('.ckb')
const pw = document.querySelectorAll('.pw')
const user = document.querySelector('.user')
chekbox.addEventListener('change', () => {
    if (chekbox.checked) {
        user.disabled = true
        for (let p of pw) {
            p.disabled = false
        }
    } else {
        user.disabled = false
        for (let p of pw) {
            p.disabled = true
        }
    }
})







