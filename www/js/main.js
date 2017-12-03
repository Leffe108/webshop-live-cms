/*
 * Main
 */

/* exported g_elements, g_dirty_html, g_users, g_next_new_user_time, g_current_time, g_score, g_speed, g_lives, g_lost */
/* exported OnCloseClick, OnHelpClick, OnRefreshClick */
/* global InitUsers, RenderPage, UpdateToolboxUi, DeleteUser, UpdateUsers */

// Global variables
var g_elements = [];
var g_dirty_html = false;
var g_users = [];
var g_next_new_user_time = 0;
var g_current_time = 0;
var g_last_loop = 0;
var g_score = 0;
var g_speed = 1;
var g_lives = 3;
var g_lost = false;
var g_request_animation_frame_fn;


// Methods

function InitGameState() {
	g_elements = [];
	g_users = [];
	g_dirty_html = true;
	g_current_time = 0;
	g_next_new_user_time = 0;
	g_speed = 20;
	g_score = 0;
	g_lives = 3;
	g_lost = false;
	InitUsers();
}

function InitGui() {
	var ab = document.getElementById('address-bar');
	ab.value = window.location.href;

	UpdateToolboxUi();
}

function OnRefreshClick() {
	while (g_users.length > 0) {
		DeleteUser(0);
	}

	var game = document.getElementById('game');
	game.classList.remove('lost');

	Init();
}

function OnHelpClick() {
	alert('Get started:\n-------------------\nDrag page elements from the right onto the page.\n\nMake users (pointers) happy by providing them content of the same color and then have them reach the buy button.\n\nHints and tips:\n-------------------\nMove around elements on your website in real-time so your users get their desired content and then happily buy your stuff. Bored users and users that get past the end of the screen will leave your page and we can only allow you to lose up to 3 users. Solid pointers are happy users and almost transparent users are the most bored users.');
}

function OnCloseClick() {
	alert('Not implemented');
}

/**
 * @param time Seconds since last Update
 */
function Update(time) {
	if (!g_lost && g_lives <= 0) {
		g_lost = true;

		var game = document.getElementById('game');
		game.classList.add('lost');

		setTimeout(function() {
			alert('You lost!\n\nScore: ' + g_score + '\n\nTime: ' + GetTimeStr());
		}, 500);
	}

	UpdateUsers(time);

	// Slowly speed up speed
	g_speed += 0.5 * time;
}
function RenderHtml() {
	RenderPage();
}

function RenderScore() {
	var s = document.getElementById('score');
	s.innerHTML = 'Score: ' + Math.floor(g_score) + ' Lives: ' + g_lives;
}

function RenderTime() {
	var t = document.getElementById('time');
	t.innerHTML = GetTimeStr();
}

function GetTimeStr() {
	var s = Math.floor(g_current_time);
	var m = Math.floor(s / 60);
	s -= m*60;

	if (m < 10) m = '0' + m;
	if (s < 10) s = '0' + s;
	return m + ':' + s;
}

// Main game loop
function Main() {
	var now = Date.now();
	var delta = now - g_last_loop;
	if (!g_lost) {
		g_current_time += delta/1000;

		Update(delta / 1000);
		if (g_dirty_html) RenderHtml();
		g_dirty_html = false;
		RenderScore();
		RenderTime();
	} else {
		// Run dissolve counters of lost users
		for (var i = 0; i < g_users.length; i++) {
			if (g_users[i].state === 'dissolve') {
				g_users[i].dissolve_counter += delta/1000;
				if (g_users[i].dissolve_counter > 2.0) {
					DeleteUser(i);
					i--;
				}
			}
		}
	}

	g_last_loop = now;

	// Request to do this again ASAP
	if (g_request_animation_frame_fn ) {
		g_request_animation_frame_fn(Main);
	} else {
		window.setTimeout(Main, 1);
	}
}


function Init() {
	g_dirty_html = true;
	InitGameState();
	InitGui();

	// Cross-browser support for requestAnimationFrame
	var w = window;
	g_request_animation_frame_fn = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
	
	// Start main loop
	g_last_loop = Date.now();
	Main();
}

// Call Init
Init();
