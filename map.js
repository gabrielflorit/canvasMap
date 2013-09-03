function themap(options) {

	var before = Date.now();

	function numberToHex(num) {
		var hex = ('000000' + num.toString(16)).slice(-6);
		return '#' + hex;
	}

	var geojson = options.geojson;
	var container = options.container;
	container.className = 'themap';

	var path = d3.geo.path().projection(null);
	var bounds = path.bounds(geojson);
	var width = Math.ceil(bounds[1][0]);
	var height = Math.ceil(bounds[1][1]);

	var features = geojson.features;

	function createBaseCanvas() {
		var canvas = document.createElement('canvas');
		canvas.className = 'base';
		canvas.width = width;
		canvas.height = height;
		container.appendChild(canvas);
		var ctx = canvas.getContext('2d');

		features.forEach(function(value, index) {

			var color = numberToHex(index);
			ctx.fillStyle = color;
			ctx.strokeStyle = color;

			ctx.beginPath();
			path.context(ctx)(value);
			ctx.fill();
			ctx.stroke();

		});

		return canvas;
	}

	var baseCanvas = createBaseCanvas();	


















	console.log(Date.now() - before);

}