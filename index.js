var express = require('express');

var app = express();

app.disable('x-powered-by');

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(require('body-parser').urlencoded({extended: true}));
var formidable = require('formidable');

var credientials = require('./credientials.js');
app.use(require('cookie-parser')(credientials.cookieSecret));

var session = require('express-session');

var parseurl = require('parseurl');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: credientials.cookieSecret,
}));

app.use(function(req, res, next) {
	var views = req.session.views;

	if(! views){
		views = req.session.views = {};
	}

	var pathname = parseurl(req).pathname;

	views[pathname] = (views[pathname] || 0) + 1;

	next();

});


app.use(function(req, res, next){
	console.log('Looking for URL: '+ req.url);
	next();
});


	var mysql = require('mysql');
	var pool  = mysql.createPool({
	  connectionLimit : 10,
	  host            : 'localhost',
	  user            : 'root',
	  password        : 'root',
	  database        : 'nodejs'
	});

app.get('/', function(req, res){

	pool.getConnection(function(err, connection) {
	  connection.query('SELECT * FROM students', function (error, results, fields) {
	    connection.release();

	    if (error) throw error;

		res.render('students/home', {students: results, data: '<p>Hello world</p>'});
	  });
	});

});

app.get('/students', function(req, res){

	pool.getConnection(function(err, connection) {
	  connection.query('SELECT * FROM students', function (error, results, fields) {
	    connection.release();

	    if (error) throw error;

		res.render('students/home', {students: results});
	  });
	});

});

app.get('/add-student', function(req, res){

	res.render('students/add_student', {csrf: 'CSRF token'});

});

app.post('/add-student', function(req, res){

	pool.getConnection(function(err, connection) {
		
		var student  = {
						name: req.body.name,
						email: req.body.email, 
						mobile: req.body.mobile 
					};

		var query = connection.query('INSERT INTO students SET ?', student, function (error, results, fields) {
		  	if (error) throw error;
		  	
		  	res.redirect(303, '/');

		});
	
	});

});

app.get('/student/:id/edit', function(req, res){
	pool.getConnection(function(err, connection) {
		
		pool.getConnection(function(err, connection) {
		  	connection.query('SELECT * FROM students WHERE id="'+ req.params.id +'"', function (error, results, fields) {
		    	connection.release();

		    	if (error) throw error;

				res.render('students/edit_student', {csrf: 'CSRF Token', student: results});
		  	});
		});
	
	});

});

app.post('/student/:id/edit', function(req, res){
	pool.getConnection(function(err, connection) {
		
		pool.getConnection(function(err, connection) {
		  	connection.query('UPDATE students SET name = ?, email = ?, mobile = ? WHERE id = ?', [req.body.name, req.body.email, req.body.mobile, req.params.id], function (error, results, fields) {
			  	if (error) throw error;

			  	res.redirect(303, '/');
			});
		});
	
	});

});


app.get('/student/:id/delete', function(req, res){
	pool.getConnection(function(err, connection) {
		
		connection.query('DELETE FROM students WHERE id = "'+ req.params.id +'"', function (error, results, fields) {
		  	if (error) throw error;

			res.redirect(303, '/');
		});
	
	});

});


app.get('/topic', function(req, res){
	res.render('topic/home');
});

app.get('/contact', function(req, res) {
	res.render('contact/home', {csrf: 'SCRF token here'});
});

app.get('/thankyou', function(req, res) {
	res.render('thankyou/home');
});

app.post('/process', function(req, res) {
	console.log('Form : ' + req.query.form);
	// console.log('CSRF : ' + req.body._csrf);
	// console.log('Email : ' + req.body.email);
	// console.log('Question : ' + req.body.question);

	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, file){
		if(err) {
			console.log('Something happened wrong.');
		}

		console.log('Receive file');
		console.log(file);

		console.log('CSRF : ' + fields._csrf);
		console.log('Email : ' + fields.email);
		console.log('Question : ' + fields.question);

		res.redirect(303, '/thankyou');
	});

});

app.get('/viewcount', function(req, res, next){
	res.send('You visited this page '+ (req.session.views['/contact'] || 0 ) +' times.');

});

var fs = require('fs');

app.get('/readfile', function(req, res) {
	fs.readFile('./public/randomfile2.txt', function(err, data){
		if(err) {
			return console.error(err);
		}

		res.send('the file : ' + data.toString());
	});
});


app.get('/writefile', function(req, res, next) {
	fs.writeFile('./public/randomfile2.txt', 'New file created', function(err){
		if(err) {
			return console.log(err);
		}
	});

	res.redirect(303, '/readfile');

	// fs.readFile('./public/randomfile2.txt', function(err, data){
	// 	if(err) {
	// 		return console.error(err);
	// 	}

	// 	res.send('the file : ' + data.toString());
	// });
});

app.use(function(req, res) {
	res.type('text/html');
	res.status(404);
	res.render('partials/404');
});


// app.use(function(err, req, res, next) {
// 	console.log('Error: '+ err.message);
// 	next();
// });



app.listen(app.get('port'), function() {
	console.log('express');
});

// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// app.get('/', function(req, res){
//   // res.sendFile(__dirname + '/test.html');
//   res.render('test');
// });

// io.on('connection', function(socket){
//   console.log('a user connected');
  
//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });

//   socket.on('chat message', function(msg){
//     io.emit('chat message', msg);
//     console.log('message: ' + msg);
//   });

// });

// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });