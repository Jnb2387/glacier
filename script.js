
//Set up the map canvas
mapboxgl.accessToken = 'pk.eyJ1Ijoiam5iMjM4NyIsImEiOiJjaW8zb2o2bDkwMWJudmJsempjaHBvc2hrIn0.gxSz_BeDIJlbDrKExBPaEQ';
var map = new mapboxgl.Map({
    container: 'map',
    // style:'style.json',
    style: 'mapbox://styles/mapbox/outdoors-v10',
    center: [-113.7505012, 48.5562206],
    zoom: 8
});

map.addControl(new MapboxDirections({
    accessToken: mapboxgl.accessToken
}), 'top-left');


// When the map loads then run all this.
map.on('load', function () {
    //When the user clicks on the map query every feature where the click was.
    map.on('click', function (e) {
        var features = map.queryRenderedFeatures(e.point);//set the click point feature to the variable.
        let info = {};// create object to hold the data
        let feature = features[0];// grab the first index of the features.
        if (feature.properties) {
            info.properties = feature.properties;// if the feature has properties set the properties to the info object
        }
        if (feature.layer) {// this is the map.add and map.source info.
            info.layer = feature.layer;
        }
        //Display the query data in the pre tag.
        document.getElementById('allfeatures').innerHTML = JSON.stringify(info, null, 2);
    });

    //=======Add point to when a Geocode Point is found   
    //Adding the Source of just GeoJSON for the geocoder point
    map.addSource('geocode-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });
    // takes the source of the geocode-point and adds it to the map.
    map.addLayer({
        "id": "point",
        "source": "geocode-point",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#007cbf"
        }
    });
    // Listen for the `geocoder.input` event that is triggered when a user
    // makes a selection and add a symbol that matches the result.
    geocoder.on('result', function (ev) {
        console.log(ev)
        map.getSource('geocode-point').setData(ev.result.geometry);//grab the source set above and set the location to the click spot
    });
    //=====End Geocode Point

    //======LAYERS
    //Add 3D buildings layer.
    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': {
                'type': 'identity',
                'property': 'height'
            },
            'fill-extrusion-base': {
                'type': 'identity',
                'property': 'min_height'
            },
            'fill-extrusion-opacity': .6
        }
    });

    //glacier trails Vector tile hosted in mapbox studio
    map.addSource('trails', {
        "type": "vector",
        "url": 'mapbox://jnb2387.7b98tlt7'
    })
    map.addLayer({
        "id": "trails",
        'type': 'line',
        'source': 'trails',
        'source-layer': 'glaciertrailsgeojson',
        "layout": {
            'visibility': 'visible',
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": {
                'property': 'Miles',
                'stops': [
                    [0, 'blue'],
                    [3, 'gold'],
                    [5, 'green'],
                    [9, 'black'],
                    [11, 'red']
                ]
            },

            "line-width": 3
        }
    }, "road-label-small");

    map.addLayer({
        "id": "trail-hover",
        "type": "line",
        "source": "trails",
        'source-layer': 'glaciertrailsgeojson',
        "layout": {
            'visibility': 'visible',
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            'line-color': 'white',
            "line-width": 9,
            'line-opacity': .7

        },
        "filter": ["==", "TRLNAME", ""]
    }, 'trails');

    //set a pop up on the trail layer
    map.on('click', 'trails', function (e) {
        map.flyTo({ center: e.lngLat });
        new mapboxgl.Popup({ offset: [14, 0] })
            .setLngLat(e.lngLat)
            .setHTML('<h5><strong>' + e.features[0].properties.TRLNAME + '</strong></h5>  <b>' + e.features[0].properties.Miles + '</b><em> Miles</em>')
            .addTo(map);
    });

    // When the user moves their mouse over the trail layer, we'll update the filter in
    // the trails-hover layer to only show the matching trail, thus making a hover effect.
    map.on("mouseover", "trails", function (e) {
        map.getCanvas().style.cursor = 'pointer';
        map.setFilter("trail-hover", ["==", "TRLNAME", e.features[0].properties.TRLNAME]);
    });

    // Reset the trail-hover layer's filter when the mouse leaves the layer.
    map.on("mouseleave", "trails", function () {
        map.getCanvas().style.cursor = '';
        map.setFilter("trail-hover", ["==", "TRLNAME", ""]);
    });

    map.on('click', function (e) {//when the user moves the mouse
        var trailinfo = map.queryRenderedFeatures(e.point, {//query where the user moved for features set it to a variable
            layers: ['glaciers','glacierpoints', 'trails']// the layers to query when the user moves
        });
        if (trailinfo.length > 0) {//if there is any features that are returned in the query set the info in the pd element.

            document.getElementById('pd').innerHTML = '<h4><strong>' + trailinfo[0].properties.NAME + '</strong><h4>' +
                '</em></h4> \n \n <p><strong><em>Length: </strong>' + trailinfo[0].properties.Miles + ' Miles' +
                '</em></p> \n <p><strong><em>' + trailinfo[0].properties.TRLUSE +
                '</br></br>' + trailinfo[0].properties.TRLCLASS;

        } else {// if there are no features under the move location.
            document.getElementById('pd').innerHTML = '<p>Hover over a Census Area</p>';
        }
    });

});// end map load

$(document).ready(function () {
    $("#getAjax").click(function () {
        var ajaxfeatures;
        $.ajax({
            method: 'GET',
            url: 'glaciers.json',
            crossDomain: true,
            dataType: 'json',
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            success: function (response) {
                //Add 3D another layer.
                var ajaxLayer = map.addLayer({

                    "id": "glaciers",
                    'type': 'fill-extrusion',
                    'source': {
                        'type': 'geojson',
                        'data': response
                    },
                    "layout": {
                        'visibility': 'visible',
                    },
                    "paint": {
                        'fill-extrusion-base': 0,
                        'fill-extrusion-color':
                        {
                            'property': 'ELEVATION',
                            'stops': [
                                [0, '#756bb1']
                            
                               
                            ]
                        },
                        'fill-extrusion-outline':1,
                        'fill-extrusion-height': {
                            'type': 'identity',
                            'property': 'ELEVATION'
                        },
                        'fill-extrusion-opacity': .9,
                    }
                },'poi-scalerank1');


                console.log(response);
                ajaxfeatures = response;

            }
        });
    })
    $("#getcamp").click(function () {
        $('#getcamp').html('Remove Points')
        $('#legend').toggle()

        console.log('getting POI\'s')
        var ajaxfeatures;
        $.ajax({
            method: 'GET',
            url: 'glacierpoints.geojson',
            crossDomain: true,
            dataType: 'json',
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            success: function (response) {
                // console.log(response)
                map.addSource('glacierpoints', {
                    'type': "geojson",
                    "data": response,
                    'cluster': true,
                    'clusterMaxZoom': 15, // Max zoom to cluster points on
                    'clusterRadius': 20 // Use small cluster radius for the heatmap look
                })

                var layers = [
                    [0, 'blue'],
                    [5, 'orange'],
                    [20, 'red']
                ]

                layers.forEach(function (layer, i) {
                    map.addLayer({
                        "id": "cluster-" + i,
                        "type": "circle",
                        "source": "glacierpoints",
                        "paint": {
                            "circle-color": layer[1],
                            "circle-radius": 70,
                            "circle-blur": 1 // blur the circles to get a heatmap look
                        },
                        "filter": i === layers.length - 1 ?
                            [">=", "point_count", layer[0]] :
                            ["all",
                                [">=", "point_count", layer[0]],
                                ["<", "point_count", layers[i + 1][0]]]
                    }, 'waterway-label');
                });

                map.addLayer({
                    'id': 'glacierpoints',
                    'source': 'glacierpoints',
                    'type': 'circle',
                    "layout": {
                        'visibility': 'visible',
                    },
                    'paint': {
                        // make circles larger as the user zooms from z12 to z22
                        'circle-radius': {
                            'base': 1.75,
                            'stops': [[12, 5], [22, 180]]
                        },
                        "circle-blur": 1,
                        // color circles by POI type, using data-driven styles
                        'circle-color': {
                            'property': 'POITYPE',
                            'type': 'categorical',
                            'stops': [
                                ['Trailhead', '#fbb03b'],
                                ['Campground', '#223b53'],
                                ['Viewpoint', '#e55e5e'],
                                ['Cabin', '#3bb2d0'],
                                ['Lodging', 'blue'],
                                ['Picnic Area', 'red'],
                                ['Entrance Station', 'green'],
                                ['Point of Interest', 'orange'],
                                ['Food Service', 'yellow'],
                                ['Restroom', 'pink'],
                                ['Tower', 'purple'],
                                ['Other', '#ccc']]
                        }
                    },
                    "filter": ["!=", "cluster", true]
                });
            }

        })
        //set a pop up on the trail layer
        map.on('click', 'glacierpoints', function (e) {
            map.flyTo({ center: e.lngLat });
            new mapboxgl.Popup({ offset: [14, 0] })
                .setLngLat(e.lngLat)
                .setHTML('<h5><strong>' + e.features[0].properties.POINAME + '</strong></h5>  <b>' + e.features[0].properties.POITYPE + '</b>')
                .addTo(map);
        });
    })
    //======controls for the trail layer
    //button to toggle trail layer visibility
    $('#trailbtn').click(function () {
        console.log("Trail Button Clicked");
        var visibility = map.getLayoutProperty('trails', 'visibility')
        if (visibility === 'visible') {
            map.setLayoutProperty('trails', 'visibility', 'none');
        } else {
            map.setLayoutProperty('trails', 'visibility', 'visible');
        }
    });
    var changeColor = $('#btn').click(function () {
        var color = $('#myinput').val()
        map.setPaintProperty('trails', 'line-color', color);
    });
    //=======end trail layer controls            
    var urbanbtn = $('#urbanbtn');
    urbanbtn.click(function () {

        var visible = map.getLayoutProperty('camps', 'visibility');
        visible == "none" ? map.setLayoutProperty('camps', 'visibility', 'visible') : map.setLayoutProperty('camps', 'visibility', 'none')
    });
});

