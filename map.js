function themap(options) {

	var before = Date.now();

	function numberToHex(num) {
		var hex = ('000000' + num.toString(16)).slice(-6);
		return '#' + hex;
	}

	function rgbToHex(r, g, b) {
		if (r > 255 || g > 255 || b > 255) {
			throw "Invalid color component";
		}
		return ((r << 16) | (g << 8) | b).toString(16);
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

	var dictionary = {};

	function createDictionaryCanvas() {
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		var ctx = canvas.getContext('2d');

		features.forEach(function(value, index) {

			var id = value.id;

			var color;

			while(true) {
				color = '#' + Math.floor(Math.random()*16777215).toString(16);
				if (!(color in dictionary)) {
					break;
				}
			}

			// TODO: store the id in the dictionary, or store the entire feature?
			dictionary[color] = id;

			ctx.save();

			ctx.beginPath();
			path.context(ctx)(value);
			ctx.clip();

			ctx.fillStyle = color;

			// TODO: don't fill rect - only fill the necessary rectangle
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.restore();

		});

		return canvas;
	}

	var dictionaryCanvas = createDictionaryCanvas();

	function createInteractionCanvas() {
		var canvas = document.createElement('canvas');
		canvas.className = 'interaction';
		canvas.width = width;
		canvas.height = height;
		container.appendChild(canvas);
		var ctx = canvas.getContext('2d');

		return canvas;
	}

	var interactionCanvas = createInteractionCanvas();

	function getPixelDataFromInteractionCanvas(x, y) {

		var ctx = dictionaryCanvas.getContext('2d');
		var pixel = ctx.getImageData(x, y, 1, 1).data;
		var color = '#' + ('000000' + rgbToHex(pixel[0], pixel[0 + 1], pixel[0 + 2])).slice(-6);
		return color;
	}

	function interact(e) {
		e = e || window.event;

		var target = e.target || e.srcElement,
		rect = target.getBoundingClientRect(),
		offsetX = e.clientX - rect.left,
		offsetY = e.clientY - rect.top;

		var color = getPixelDataFromInteractionCanvas(offsetX, offsetY);

		// TODO: what if there is no match?
		var id = dictionary[color];

		var ctx = target.getContext('2d');
		ctx.clearRect(0, 0, target.width, target.height);
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 4;

		ctx.beginPath();

		// TODO: what if there are more than one features?
		var feature = features.filter(function(value, index) {
			return value.id === id;
		})[0];

		path.context(ctx)(feature);

		ctx.stroke();
	}

	interactionCanvas.addEventListener('touchstart', interact);

	interactionCanvas.addEventListener('touchmove', interact);

	interactionCanvas.addEventListener('mousemove', interact);

	console.log(Date.now() - before);

}