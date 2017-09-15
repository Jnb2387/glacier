// This will let you use the .remove() function later on
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2lqbmpqazdlMDBsdnRva284cWd3bm11byJ9.V6Hg2oYJwMAxeoR9GEzkAA';
var bars;
var blocks;
// This adds the map
var map = new mapboxgl.Map({
    // container id specified in the HTML
    container: 'map',
    // style URL
    style: 'mapbox://styles/mapbox/light-v9',
    // initial position in [long, lat] format
    center: [-104.9900, 39.73909671288923],
    // initial zoom
    zoom: 11.5,
    // scrollZoom: false
});


// This adds the data to the map
map.on('load', function (e) {

    // This is where your '.addLayer()' used to be, instead add only the source without styling a layer
    map.addSource("places", {
        "type": "geojson",
        "data": bars
    });
    // Initialize the list
    buildLocationList(bars);




    // This is where your interactions with the symbol layer used to be
    // Now you have interactions with DOM markers instead
    bars.features.forEach(function (marker, i) {
        // Create an img element for the marker
        var el = document.createElement('div');
        el.id = "marker-" + i;
        el.className = 'marker';
        // Add markers to the map at all points
        new mapboxgl.Marker(el, { offset: [-28, -46] })
            .setLngLat([marker.geometry.coordinates[0], marker.geometry.coordinates[1]])
            .addTo(map);

        el.addEventListener('click', function (e) {
            // 1. Fly to the point
            flyToStore(marker);

            // 2. Close all other popups and display popup for clicked store
            createPopUp(marker);

            // 3. Highlight listing in sidebar (and remove highlight for all other listings)
            var activeItem = document.getElementsByClassName('active');

            e.stopPropagation();
            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }

            var listing = document.getElementById('listing-' + i);
            listing.classList.add('active');

        });
    });

});//map load


$.getJSON("http://67.165.241.133:5000/geojson/v1/bars?geom_column=geom&columns=*&limit=5000", function (data) {
    var items = [];
    $.each(data, function (key, val) {
        items.push("<li id='" + key + "'>" + val + "</li>");
    });
    console.log(data)
    bars = data;
});

$.getJSON("http://67.165.241.133:5000/geojson/v1/denverblocks?geom_column=geom&columns=id%2C%20population%2C%20geom&limit=10000", function (data) {
    // var items = [];
    // $.each( data, function( key, val ) {
    //   items.push( "<li id='" + key + "'>" + val + "</li>" );
    // });
    console.log(data)
    blocks = data;

    map.addSource("blocks",{
        "type":"geojson",
        'data': blocks,
    })
    map.addLayer({
        'id': 'blocks',
        'type': 'fill',
        'source': "blocks",
        'layout': {},
        'paint': {
            'fill-color': {
                property: 'population',
                stops: [
                    [0, 'grey'],
                    [50, '#fff'],
                    [75, '#E6B71E'],
                    [100, '#DA9C20'],
                    [250, '#CA8323'],
                    [500, '#B86B25'],
                    [750, '#A25626'],
                    [1000, '#8B4225'],
                    [2500, '#723122']
                ]
            },
            'fill-opacity':.7,
            // 'fill-outline-color':"blue"
        }
    },'road-secondary-tertiary')
    map.addLayer({
        "id":'block-line',
        'type':'line',
        'source':"blocks",
        'layout':{},
        "paint":{
            'line-color':"red",
            "line-width":1.3
        }
    },'road-label-small')
});
map.on('click', function(e){
    var features = map.queryRenderedFeatures(e.point);
    console.log(features[0].layer.id)
})

function flyToStore(currentFeature) {
    map.flyTo({
        center: [currentFeature.geometry.coordinates[0], currentFeature.geometry.coordinates[1]],
        zoom: 15
    });
}

function createPopUp(currentFeature) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();


    var popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true
    })
        .setLngLat([currentFeature.geometry.coordinates[0], currentFeature.geometry.coordinates[1]])
        .setHTML('<h3>' + currentFeature.properties.name + '</h3>' +
        '<h4>' + currentFeature.properties.descriptio + '</h4>')
        .addTo(map);
}


function buildLocationList(data) {
    for (i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];
        var prop = currentFeature.properties;
        // console.log(prop)

        var listings = document.getElementById('listings');
        var listing = listings.appendChild(document.createElement('div'));
        listing.className = 'item';
        listing.id = "listing-" + i;

        var link = listing.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
        link.dataPosition = i;
        link.innerHTML = prop.name;

        var details = listing.appendChild(document.createElement('div'));
        details.innerHTML = prop.descriptio;
        if (prop.phone) {
            details.innerHTML += ' &middot; ' + prop.descriptio;
        }



        link.addEventListener('click', function (e) {
            // Update the currentFeature to the store associated with the clicked link
            var clickedListing = data.features[this.dataPosition];

            // 1. Fly to the point
            flyToStore(clickedListing);

            // 2. Close all other popups and display popup for clicked store
            createPopUp(clickedListing);

            // 3. Highlight listing in sidebar (and remove highlight for all other listings)
            var activeItem = document.getElementsByClassName('active');

            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }
            this.parentNode.classList.add('active');

        });
    }
}
map.on('mousemove', function (e) {
    document.getElementById('coordinates').innerHTML =
        // e.point is the x, y coordinates of the mousemove event relative
        // to the top-left corner of the map
        JSON.stringify(e.point) + '<br />' +
        // e.lngLat is the longitude, latitude geographical position of the event
        JSON.stringify(e.lngLat);
});
map.on('click','blocks',function(e){
    console.log(e.lngLat)
    new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(e.features[0].properties)
    .addTo(map);
});