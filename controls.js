      //======Adding Controls to the Map.
        //Add the Geocoder.
        var geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken
        });
        map.addControl(geocoder);
        //for the 3D button toggle
        class PitchToggle { //create a class that has the pitch and bearing
            constructor({ bearing = 0, pitch = 70, minpitchzoom = null }) {
                this._bearing = bearing;
                this._pitch = pitch;
                this._minpitchzoom = minpitchzoom;
            }

            onAdd(map) {
                this._map = map;
                let _this = this;
                this._btn = document.createElement('button');// create the 3d button
                this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-3d';// set the class name for css styling
                this._btn.type = 'button';
                this._btn['aria-label'] = 'Toggle Pitch';//not sure
                this._btn.onclick = function () { //when the button is clicked
                    if (map.getPitch() === 0) {// if the pitch is 0 then run this
                        let options = { pitch: _this._pitch, bearing: _this._bearing };// grab the pitch & bearing from the class constructor 
                        if (_this._minpitchzoom && map.getZoom() > _this._minpitchzoom) {//dont really need
                            options.zoom = _this._minpitchzoom;
                        }
                        map.easeTo(options);
                        _this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-2d';//change button to show 2d after change
                    } else {
                        map.easeTo({ pitch: 0, bearing: 0 });// reset back to 2D if the pitch is not 0
                        _this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-3d';//change button to show 3d after change
                    }
                };
                this._container = document.createElement('div');// create a div
                this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
                this._container.appendChild(this._btn);
                return this._container;
            }
            onRemove() {
                this._container.parentNode.removeChild(this._container);
                this._map = undefined;
            }
        }

        class Sidepanel { //create a class that will add the panel button to the map
            onAdd(map) {
                this._map = map;
                let _this = this;
                this._btn = document.createElement('button');// create the  button
                this._btn.type = 'button';
                this._btn.innerHTML = "MENU";
                this._btn['aria-label'] = 'Toggle Pitch';//not sure
                this._btn.onclick = function () { //when the button is clicked
                    if ($("#sidepanel")) {// if the panel is showing then run this
                        console.log("Sidepanel Toggled")
                        $("#sidepanel").toggle()
                    } else {
                        console.log("something went wrong")
                    }
                };
                this._container = document.createElement('div');// create a div
                this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
                this._container.id= 'menuid'
                this._container.appendChild(this._btn);
                return this._container;
            }
            onRemove() {
                this._container.parentNode.removeChild(this._container);
                this._map = undefined;
            }
        }

//Reformat not working!
        // class Zoompanel { //create a class that will add the panel button to the map
        //     onAdd(map) {
                
        //         this._map = map;
        //         let _this = this;
        //         this._btn = document.createElement('button');// create the  button
        //         this._btn.type = 'button';
        //         this._btn['aria-label'] = 'Toggle Pitch';//not sure
        //         this._btn.onclick = function () { //when the button is clicked
        //            var zoomnum = map.getZoom()
        //         };
        //         this._btn.innerHTML = zoomnum;
        //         this._container = document.createElement('div');// create a div
        //         this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        //         this._container.appendChild(this._btn);
        //         return this._container;
        //     }
        //     onRemove() {
        //         this._container.parentNode.removeChild(this._container);
        //         this._map = undefined;
        //     }
        // }


        // map.addControl(new Zoompanel('bottom-right'))
        map.addControl(new Sidepanel('bottom-right'))
        //Add the zoom and nav controls.
        var nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-left');


        // var poscoords=[];
        // // Add geolocate control to the map.
        // var geoLocate = new mapboxgl.GeolocateControl({
        //     positionOptions: {
        //         enableHighAccuracy: true
        //     },
        //     trackUserLocation: true
        // });
        // map.addControl(geoLocate);
        // geoLocate.on('geolocate', function(e) {
        //     poscoords.push(geoLocate._lastKnownPosition.coords.latitude);
        //     poscoords.push(geoLocate._lastKnownPosition.coords.longitude);
        // console.log('geolocated',poscoords)
        // })


          map.addControl(new PitchToggle({ minpitchzoom: 11 }));

        //Add Scalebar.
        map.addControl(new mapboxgl.ScaleControl({
            maxWidth: 80,
            unit: 'imperial'
        }));
        //=======End Controls

        