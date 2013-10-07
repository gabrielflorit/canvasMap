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

# real world examples

http://www.bostonglobe.com/2013/09/26/votes-for-grabs/eGRbWgFVwt2ipuEn9Wos5J/story.html

http://www.bostonglobe.com/2013/09/20/campaign-donations-block-block/YF8Rn3diG8rNAqLJW8fRPJ/story.html
