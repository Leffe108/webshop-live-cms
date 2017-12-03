/** Users **/

/* exported InitUsers, NewUser, UpdateUsers, DeleteUser */
/* global g_users:true, g_next_new_user_time:true, g_current_time, g_speed, g_score:true, g_lives:true, g_elements, PlaySoundEffect */

function InitUsers() {
	g_users = [];
}

function NewUser() {
	var browser = document.getElementById('browser');
	var user_contianer = document.getElementById('browser-users');
	var r = Math.random();
	var color = 'red';
	if (r <= 0.33) color = 'blue';
	else if (r >= 0.67) color = 'yellow';

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
	var browser = document.getElementById('browser');

	if (g_users.length === 0) {
		NewUser();
	} else if (g_current_time > g_next_new_user_time) {
		NewUser();
	}

	for (var i = 0; i < g_users.length; i++) {
		var user = g_users[i];
		var user_speed = g_speed;
		if (user.happyness > 70) user_speed *= 2;

		if (user.state === 'free') {
			user.y += user_speed * time;
			user.x += user_speed * time * user.dx;
			if (user.x < 0) {
				user.x = 0; 
				user.dx = -user.dx;
			} else if (user.x > browser.clientWidth) {
				user.x = browser.clientWidth;
				user.dx = -user.dx;
			}

			var element = GetElementBelowUser(user);
			if (element !== null) {
				if (['image-red', 'image-yellow', 'image-blue'].indexOf(element.type) !== -1) {
					if (element.type !== 'image-' + user.color) {
						// Wrong image
						user.happyness -= 20;
						user.y = element.element.offsetTop + element.element.offsetHeight + 1;
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
					user.x += 2 * g_speed * time;
					if (user.x > read_elem.offsetLeft + read_elem.offsetWidth - margin) {
						user.x = read_elem.offsetLeft + margin;
						user.y += 20;
					}
					if (user.y > read_elem.offsetTop + read_elem.offsetHeight - margin) {
						user.read_counter = 101;
					}

					user.happyness -= time / 3;
					user.happyness = Math.max(0, user.happyness);
				} else if (['image-red', 'image-yellow', 'image-blue'].indexOf(user.read_element.type) !== -1) {
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
						i--;
						PlaySoundEffect('click');
						continue;
					} else {
						// Else reject buy
						user.read_counter = 101;
						user.happyness -= 20;
					}
				}
			}
		} else if (user.state === 'dissolve') {
			user.dissolve_counter += time;
			if (user.dissolve_counter > 2.0) {
				DeleteUser(i);
				i--;
				continue;
			}
		}

		// Lost user?
		if (user.state !== 'dissolve' && (user.happyness <= 0 || user.y > browser.clientHeight)) {
			DissolveUser(i);
			g_lives--;
			console.log('user lost');
			continue;
		}

		user.element.style.left = user.x + 'px';
		user.element.style.top = user.y + 'px';
		if (user.state !== 'dissolve') {
			user.element.style.opacity = Math.max(0.35, user.happyness / 100.0);
			if (user.happyness > 70) user.element.style.opacity = 1.0; // make it clear when user can buy
		}
	}
}

/** Start delete animation and schedule deletion of user **/
function DissolveUser(i) {
	g_users[i].state = 'dissolve';
	g_users[i].element.classList.add('dissolve');
	g_users[i].element.style.opacity = undefined;
	g_users[i].dissolve_counter = 0;
}

function DeleteUser(i) {
	g_users[i].element.remove();
	g_users.splice(i, 1);
	i--;
}

function GetElementBelowUser(user) {
	var browser = document.getElementById('browser');

	var elem = document.elementFromPoint(browser.offsetLeft + user.x, browser.offsetTop + user.y);
	if (elem === null) return null;
	for(var i = 0; i < g_elements.length; i++) {
		if (elem == g_elements[i].element || elem.parentElement == g_elements[i].element) {
			return g_elements[i];
		}
	}

	return null;
}
