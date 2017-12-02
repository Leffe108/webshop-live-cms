/*
 * Main
 */

// Global variables
var g_elements = [];
var g_dirty_html = false;
var g_users = [];
var g_next_new_user_time = 0;
var g_current_time = 0;
var g_score = 0;
var g_speed = 1;


// Methods

function InitGameState()
{
	g_elements = [];
	g_current_time = 0;
	g_next_new_user_time = 0;
	g_speed = 20;
	InitUsers();
}

/**
 * @param time Seconds since last Update
 */
function Update(time) {
	var gui_time = time; // GUI time is not affected by speed modifier

	UpdateUsers(time)
}
function RenderHtml() {
	RenderPage();
}

function RenderScore() {
	var s = document.getElementById('score');
	s.innerHTML = 'Score: ' + Math.floor(g_score);
}

// Main game loop
function Main() {
	var now = Date.now();
	var delta = now - g_last_loop;
	g_current_time += delta/1000;

	Update(delta / 1000);
	if (g_dirty_html) RenderHtml();
	g_dirty_html = false;
	RenderScore();

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

	// Cross-browser support for requestAnimationFrame
	var w = window;
	g_request_animation_frame_fn = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
	
	// Start main loop
	g_last_loop = Date.now();
	Main();
}

// Call Init
Init();
