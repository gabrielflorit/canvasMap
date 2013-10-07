    canvasMap({
        container: document.getElementById('container'), // dom container
        topodata: json, // projected topojson
        topokey: 'blocks', // the geojson object you want to map
        featureKey: 'population', // the property you want to color
        filter: function(feature) { // filter function in case you don't want to draw all features
            return true;
        },
        minColor: '#FFF',
        maxColor: '#000',
        highlightColor: '#173368'
    });
