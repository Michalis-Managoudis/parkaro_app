// mapboxgl.accessToken = 'pk.eyJ1IjoibWlob3NtaWtlIiwiYSI6ImNsNG8xcTJndjAwdDEza2xoMjRjZnhlcnoifQ.14_-vR9YsWexqJngngO1HA';
const map = new mapboxgl.Map({
    accessToken: 'pk.eyJ1IjoibWlob3NtaWtlIiwiYSI6ImNsNG8xcTJndjAwdDEza2xoMjRjZnhlcnoifQ.14_-vR9YsWexqJngngO1HA',
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [23.727539, 37.983810], // starting position [lng, lat]
    zoom: 11 // starting zoom
});

map.on('load', () => {
    // Add a GeoJSON source with 2 points
    map.addSource('parking_stations', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {// feature for Parking 1
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [23.737539, 37.983810]
                    },
                    'properties': { 'title': 'Parking 1' }
                },
                {// feature for Parking 2
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [23.717539, 37.983810]
                    },
                    'properties': { 'title': 'Parking 2' }
                }
            ]
        }
    });
    // Add a symbol layer
    map.addLayer({
        'id': 'parking_stations',
        'type': 'symbol',
        'source': 'parking_stations',
        'layout': {
            'icon-image': 'custom-marker',
            // get the title name from the source's "title" property
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 1.25],
            'text-anchor': 'top'
        }
    });
}
);


// const marker1 = new mapboxgl.Marker()
//     .setLngLat([23.737539, 37.983810])
//     .addTo(map);

// // Create a default Marker, colored black, rotated 45 degrees.
// const marker2 = new mapboxgl.Marker({ color: 'black', draggable: true })
//     .setLngLat([23.717539, 37.983810])
//     .setPopup(new mapboxgl.Popup().setHTML("<p>Hello World!</p>")) // add popup
//     .addTo(map);

// map.on('load', () => {
//     map.addLayer({
//         id: 'terrain-data',
//         type: 'line',
//         source: {
//             type: 'vector',
//             url: 'mapbox://mapbox.mapbox-terrain-v2'
//         },
//         'source-layer': 'contour'
//     });
// });

