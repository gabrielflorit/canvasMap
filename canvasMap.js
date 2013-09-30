function canvasMap(options) {

	function randomColor() {
		return '#'+ ('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6);
	}

	function rgbToHex(r, g, b) {
		if (r > 255 || g > 255 || b > 255) {
			throw "Invalid color component";
		}
		return ((r << 16) | (g << 8) | b).toString(16);
	}

	var geojson = topojson.feature(options.topodata, options.topodata.objects[options.topokey]);

	var container = options.container;
	container.className = container.className + ' ' +  'canvasMap';

	var boundingClientRect = container.getBoundingClientRect();
	var containerWidth = boundingClientRect.width;
	var containerHeight = boundingClientRect.height;

	var path = d3.geo.path().projection(null);
	var bounds = path.bounds(geojson);
	var originalWidth = Math.ceil(bounds[1][0]);
	var originalHeight = Math.ceil(bounds[1][1]);
	var ratio = originalHeight/originalWidth;

	var features = geojson.features.filter(options.filter);

	// create svg outline
	var outline;
	function createOutline() {

		outline = d3.select(container).append('svg')
			.attr({
				width: originalWidth,
				height: originalHeight,
				viewBox: '0 0 ' + originalWidth + ' ' + originalHeight,
				preserveAspectRatio: 'xMidYMid'
			});

		var mesh = topojson.mesh(options.topodata, options.topodata.objects[options.topokey], function(a, b) {
			return a === b;
		});

		path = d3.geo.path().projection(null);
		outline.append('path')
			.datum(mesh)
			.attr('d', path);
	}

	var extent = d3.extent(geojson.features, function(d) {
		return d.properties[options.featureKey];
	});

	var scale = d3.scale.linear()
		.domain(extent)
		.range([options.minColor, options.maxColor])
		.interpolate(d3.interpolateLab);

	var baseCanvas;
	var baseCanvasShadow;
	function createBaseCanvas() {
		baseCanvasShadow = document.createElement('canvas');
		baseCanvasShadow.width = originalWidth;
		baseCanvasShadow.height = originalHeight;
		var ctxShadow = baseCanvasShadow.getContext('2d');

		features.forEach(function(value, index) {

			var color = scale(value.properties[options.featureKey]);

			ctxShadow.fillStyle = color;
			ctxShadow.strokeStyle = color;

			ctxShadow.beginPath();
			path.context(ctxShadow)(value);
			ctxShadow.fill();
			ctxShadow.stroke();

		});

		baseCanvas = document.createElement('canvas');
		baseCanvas.className = 'base';
		container.appendChild(baseCanvas);
	}

	function drawBaseCanvas(width) {
		var height = ratio * width;

		baseCanvas.width = width;
		baseCanvas.height = height;
		var ctx = baseCanvas.getContext('2d');
		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(baseCanvasShadow, 0, 0, width, height);
	}

	var dictionary;
	var dictionaryCanvas;
	function createDictionaryCanvas() {
		dictionaryCanvas = document.createElement('canvas');
		dictionaryCanvas.width = originalWidth;
		dictionaryCanvas.height = originalHeight;
		var ctx = dictionaryCanvas.getContext('2d');

		dictionary = {};
		features.forEach(function(value, index) {

			var id = value.id;

			var color;

			while(true) {
				color = randomColor();
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
			ctx.fillRect(0, 0, originalWidth, originalHeight);

			ctx.restore();

		});
	}

	var interactionCanvas;
	function createInteractionCanvas() {
		interactionCanvas = document.createElement('canvas');
		interactionCanvas.className = 'interaction';
		container.appendChild(interactionCanvas);

		if (!options.noInteraction) {
			interactionCanvas.addEventListener('touchstart', interact);
			interactionCanvas.addEventListener('touchmove', interact);
			interactionCanvas.addEventListener('mousemove', interact);
		}
	}

	function drawInteractionCanvas(width) {
		var height = ratio * width;
		interactionCanvas.width = width;
		interactionCanvas.height = height;
	}

	function getPixelDataFromDictionaryCanvas(_x, _y, sourceCanvas) {

		var ctx = dictionaryCanvas.getContext('2d');
		var x = _x * originalWidth/sourceCanvas.width;
		var y = _y * originalHeight/sourceCanvas.height;

		var pixel = ctx.getImageData(x, y, 1, 1).data;
		var color = '#' + ('000000' + rgbToHex(pixel[0], pixel[0 + 1], pixel[0 + 2])).slice(-6);
		return color;
	}

	function interact(e) {
		e = e || window.event;

		var target = e.target || e.srcElement;
		var rect = target.getBoundingClientRect();
		var clientX = e.clientX || e.touches[0].clientX;
		var clientY = e.clientY || e.touches[0].clientY;
		var offsetX = clientX - rect.left;
		var offsetY = clientY - rect.top;

		var color = getPixelDataFromDictionaryCanvas(offsetX, offsetY, target);

		var id = dictionary[color];

		if (id) {
			e.preventDefault();
			var ctx = target.getContext('2d');
			ctx.save();

			ctx.clearRect(0, 0, target.width, target.height);
			ctx.scale(target.width/originalWidth, target.height/originalHeight);
			ctx.strokeStyle = options.highlightColor;
			ctx.fillStyle = options.highlightColor;
			ctx.lineWidth = 1;

			ctx.beginPath();

			// TODO: what if there is more than one feature?
			var feature = features.filter(function(value, index) {
				return value.id === id;
			})[0];

			path.context(ctx)(feature);

			ctx.stroke();
			ctx.fill();
			ctx.restore();

			options.drawDetails && options.drawDetails(feature, ctx, offsetX, offsetY);
		}

	}

	container.style.height = '100000px';

	// create canvases and svg outline
	function create() {
		createOutline();
		createBaseCanvas();
		createDictionaryCanvas();
		createInteractionCanvas();
	}
	create();

	// draw canvases
	function draw(width) {
		drawBaseCanvas(width);
		drawInteractionCanvas(width);
	}

	function resize() {
		var targetWidth = Math.floor(container.getBoundingClientRect().width);
		draw(targetWidth);

		outline.attr({
			width: targetWidth,
			height: targetWidth / (originalWidth/originalHeight)
		});
	}

	window.addEventListener('resize', debounce(resize, 150));

	resize();
	container.style.height = 'auto';

}