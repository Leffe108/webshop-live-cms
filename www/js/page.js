
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
	var types = ['paragraph', 'image-red', 'image-blue', 'cart'];
	for (var i = 0; i < types.length; i++) {
		var elem = document.getElementById('tool-' + types[i]);
		if (GetElementCountLeft(types[i]) >= 1) {
			elem.classList.remove('empty');
		} else {
			elem.classList.add('empty');
		}
	}
}


/* -- Page users -- */

function InitUsers() {
	g_users = [];
}

function NewUser() {
	var browser = document.getElementById('browser');
	var user_contianer = document.getElementById('browser-users');
	var color = Math.random() > 0.5? 'red' : 'blue'

	var div = document.createElement('div');
	div.classList.add('cursor');
	div.classList.add(color);

	user_contianer.appendChild(div);

	g_users.push({
		x: 5 + Math.random() * (browser.offsetWidth - 10),
		y: 0,
		dx: 2 * (Math.random() - 0.5), // free speed
		color: color,
		element: div,
		state: 'free',
		happyness: 40,
	});
	g_next_new_user_time = g_current_time + 200 / g_speed;
}

/**
 * @param time Seconds since last Update
 */
function UpdateUsers(time) {
	browser = document.getElementById('browser');

	if (g_users.length === 0) {
		NewUser();
	} else if (g_current_time > g_next_new_user_time) {
		NewUser();
	}

	for (var i = 0; i < g_users.length; i++) {
		var user = g_users[i];

		if (user.state === 'free') {
			user.y += g_speed * time;
			user.x += g_speed * time * user.dx;
			if (user.x < 0) {
				user.x = 0; 
				user.dx = -user.dx;
			} else if (user.x > browser.clientWidth) {
				user.x = browser.clientWidth;
				user.dx = -user.dx;
			}

			element = GetElementBelowUser(user);
			if (element !== null) {
				if (['image-red', 'image-blue'].indexOf(element.type) !== -1) {
					if (element.type !== 'image-' + user.color) {
						// Wrong image
						user.y += 80;
						user.happyness -= 20;
						continue;
					}
				}
				user.state = 'reading';
				user.read_element = element;
				user.read_counter = 0;
				user.x = user.read_element.element.offsetLeft + 5;
				user.y = user.read_element.element.offsetTop + 5;
			}
		} else if (user.state === 'reading') {
			var margin = 5;
			var read_elem = user.read_element.element;
			if (user.read_counter > 100) {
				user.state = 'free';
				user.y = read_elem.offsetTop + read_elem.offsetHeight + 5;
				user.x = read_elem.offsetLeft + read_elem.offsetWidth/2;
			} else {
				// Progress state
				if (user.read_element.type === 'paragraph') {
					user.x += 3 * g_speed * time;
					if (user.x > read_elem.offsetLeft + read_elem.offsetWidth - margin) {
						user.x = read_elem.offsetLeft + margin;
						user.y += 20;
					}
					if (user.y > read_elem.offsetTop + read_elem.offsetHeight - margin) {
						user.read_counter = 101;
					}

					user.happyness -= time / 2;
					user.happyness = Math.max(0, user.happyness);
				} else if (['image-red', 'image-blue'].indexOf(user.read_element.type) !== -1) {
					var duration = 15;
					user.read_counter += time * 100 / duration;
					
					user.x = read_elem.offsetLeft + read_elem.offsetWidth/2 + Math.cos(user.read_counter * 2 * 3.1416 / 100.0 * 5) * 30;
					user.y = read_elem.offsetTop + read_elem.offsetHeight/2 + Math.sin(user.read_counter * 2 * 3.1416 / 100.0 * 5) * 30;
					user.happyness += time * 3;
					user.happyness = Math.min(100, user.happyness);
				} else if (user.read_element.type === 'cart') {
					// Allow buy if enough happy
					if (user.happyness > 70) {
						g_score += 1;
						DeleteUser(i);
						continue;
					} else {
						// Else reject buy
						user.read_counter = 101;
						user.happyness -= 20;
					}
				}
			}
		}

		// Lost user?
		if (user.happyness <= 0 || user.y > browser.clientHeight) {
			DeleteUser(i);
			continue;
		}

		user.element.style.left = user.x + 'px';
		user.element.style.top = user.y + 'px';
		user.element.style.opacity = user.happyness / 100.0;
	}
}

function DeleteUser(i) {
	g_users[i].element.remove();
	g_users.splice(i, 1);
	i--;
	console.log('user lost');
}

function GetElementBelowUser(user) {
	browser = document.getElementById('browser');

	var elem = document.elementFromPoint(browser.offsetLeft + user.x, browser.offsetTop + user.y);
	if (elem === null) return null;
	for(var i = 0; i < g_elements.length; i++) {
		if (elem == g_elements[i].element || elem.parentElement == g_elements[i].element) {
			return g_elements[i];
		}
	}

	return null;
}
