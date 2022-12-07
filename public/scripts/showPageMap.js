
const fetchApi = async () => {
    try {
        const res = await fetch(`/getcamp/${campId}`)
        const campground = await res.json()
        return campground
    } catch (e) {
        console.log(e)
        return
    }
}
fetchApi().then((campground) => {
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: campground.geometry.coordinates, // starting position [lng, lat]
        zoom: 12, // starting zoom
        projection: 'globe' // display the map as a 3D globe
    });

    map.addControl(new mapboxgl.NavigationControl())

    map.on('style.load', () => {
        map.setFog({}); // Set the default atmosphere style
    });

    // Create a default Marker, colored black, rotated 45 degrees.
    const marker = new mapboxgl.Marker({ color: 'black', rotation: 45 })
        .setLngLat(campground.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 })
                .setHTML(
                    `<h3>${campground.title}</h3><p>${campground.location}</p>`
                )
        )
        .addTo(map);
})

