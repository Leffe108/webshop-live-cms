/** Page **/

/* exported AddElement, MoveElement, GetElementCountLeft, RenderPage, UpdateToolboxUi */
/* global g_dirty_html:true, g_elements, OnDragStart */

function AddElement(elementType, x, y) {
	if (!CanPlaceElementHere(x, y)) return;
	var r = SnapElementXY(x, y);
	x = r[0];
	y = r[1];

	g_elements.push({
		type: elementType,
		x: x,
		y: y,
	});

	// Redraw
	g_dirty_html = true;
}
function MoveElement(element, index, x, y) {
	if (!CanPlaceElementHere(x, y)) return;
	var r = SnapElementXY(x, y);
	x = r[0];
	y = r[1];

	g_elements[index].x = x;
	g_elements[index].y = y;

	// Redraw
	g_dirty_html = true;
}

function CanPlaceElementHere(x, y) {
	var r = SnapElementXY(x, y);
	x = Math.round(r[0]);
	y = Math.round(r[1]);

	for (var i = 0; i < g_elements.length; i++) {
		if (Math.round(g_elements[i].x) === x && Math.round(g_elements[i].y) === y) {
			return false;
		}
	}

	return true;
}

function SnapElementXY(x, y) {
	var content = document.getElementById('browser-content');
	if (x < content.offsetWidth / 3) x = 0;
	else if (x < 2 * content.offsetWidth / 3) x = content.offsetWidth / 3;
	else x = 2 * (content.offsetWidth / 3);

	y = Math.floor(y / 80) * 80;

	return [x, y];
}

function GetElementCapacity(type) {
	switch (type) {
		case 'paragraph': return 3;
		case 'image-red': return 1;
		case 'image-yellow': return 1;
		case 'image-blue': return 1;
		case 'cart': return 1;
	}
}
function GetElementCountLeft(type) {
	var count_left = GetElementCapacity(type);
	for (var i = 0; i < g_elements.length; i++) {
		if (g_elements[i].type === type) {
			count_left -= 1;
		}
	}
	return Math.max(0, count_left);
}


function RenderPage() {
	var browser = document.getElementById('browser-content');
	browser.innerHTML = '';

	for (var i = 0; i < g_elements.length; i++) {
		var div = document.createElement('div');
		var type = g_elements[i].type;
		div.id = 'element' + i;
		div.classList.add('element');
		div.classList.add(type);
		div.style.left = g_elements[i].x + 'px';
		div.style.top = g_elements[i].y + 'px';
		div.draggable = true;
		(function() {
			var j = i;
			div.ondragstart = function(event) {
				OnDragStart(event, type, j);
			};
		})();
		if (type === 'paragraph') {
			div.innerHTML = 'A long paragraph of text that gets more boring the longer you read.';
		} else if (type === 'image-red') {
			div.innerHTML = '<img src="images/image-red.png">';
		} else if (type === 'image-yellow') {
			div.innerHTML = '<img src="images/image-yellow.png">';
		} else if (type === 'image-blue') {
			div.innerHTML = '<img src="images/image-blue.png">';
		} else if (type === 'cart') {
			div.innerHTML = '<img src="images/cart.png">';
		} else {
			console.error('Unknown type');
		}
		g_elements[i].element = div;

		browser.appendChild(div);
	}
}

function UpdateToolboxUi() {
	var types = ['paragraph', 'image-red', 'image-yellow', 'image-blue', 'cart'];
	for (var i = 0; i < types.length; i++) {
		var elem = document.getElementById('tool-' + types[i]);
		if (GetElementCountLeft(types[i]) >= 1) {
			elem.classList.remove('empty');
		} else {
			elem.classList.add('empty');
		}
	}
}


