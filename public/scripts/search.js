const fetchApisearch = async () => {
    try {
        const res = await fetch(`/getcamps`)
        const campgrounds = await res.json()
        return campgrounds
    } catch (e) {
        console.log(e)
        return
    }
}
fetchApisearch().then((campgrounds) => {
    const camps = campgrounds.map(camp => (camp))
    const form = document.querySelector('form')
    const searchBar = document.querySelector('.search')
    const results = document.querySelector('.results')
    const wrapper = document.querySelector('.wrapper')
    searchBar.addEventListener('keyup', (e) => {
        let res = []
        let input = searchBar.value
        if (input.length) {
            res = camps.filter(el => {
                return el.title.toLowerCase().includes(input.toLowerCase())
            })
        }
        let resSliced = res.slice(0, 6)
        renderRes(resSliced, wrapper, results)
    })
    document.addEventListener('click', (e) => {
        if (e.target.nodeName.toLowerCase() != 'input')
            wrapper.classList.remove('show')
    })
})

const renderRes = (res, wrapper, results) => {
    if (!res.length) {
        return wrapper.classList.remove('show')
    }
    let content = res.map(item => (`<li><a href="/campgrounds/${item._id}"> ${item.title}</a></li>`)).join(' ')
    wrapper.classList.add('show')
    results.innerHTML = `<ul>${content}</ul>`
}