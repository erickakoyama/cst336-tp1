const mysql = require('mysql');

// Add this to any file that needs DB support
// var sql = require('./services/mysqlService');

// app.js has it already but lobbyRegistrar needs it for server Stats.
// lobbyRegistrar has a function for removing empty lobbies. stats can be grabbed there.
// there should be / will be a variable to tell if a game session has started. If that is set
// to true then stats should be collected, otherwise this is a lobby that was never played.
// userRegistrar has a function for players logging in and out.

var connection;

module.exports = { MySQLConnection: connection };


(function() {

	module.exports.Connect = function() {
		connection = mysql.createConnection({
			host: process.env.Host,
			user: process.env.User,
			password: process.env.Password,
			database: process.env.Database
		  });

		connection.connect((err) => {
			if(err){
				console.log('Error connection to DB');
				return;
			}
			console.log('Connected!');
			});
		if(connection){
			return connection;
		}
		};
		
		
		//functions that deal with the user stats table
		
		//callback returns boolean false if failed true if success.
	module.exports.addUserStats = function(userId, won, callback) {
    	var sql;
    	let user;
    	if(won){
    		sql = 'UPDATE userStats SET gamesPlayed = gamesPlayed + 1, gamesWon = gamesWon + 1 ';
          	sql += 'WHERE userId = ?;';
     
          	user = 
            { userID: userId, gamesPlayed: 1, 
            gamesWon: 1, gamesLost : 0 };
    	}else{
    		sql = 'UPDATE userStats SET gamesPlayed = gamesPlayed + 1, gamesLost = gamesLost + 1 ';
          	sql += 'WHERE userId = ?;';
    		
    			user = 
            { userID: userId, gamesPlayed: 1, 
            gamesWon: 0, gamesLost : 1 };
    	}
            
        this.selectUserStats(userId, function(results){
        	if(!results)
        	{
        		console.log("ERROR");
        		callback(false);
        	}
        	//user has no reccord create One
        	else if(results.length === 0)
        	{
            connection.query('INSERT INTO userStats SET ?', user, (err, res) => {
			    if(err) {
			    	console.log("Error inserting into DB, Error Code:")
			    	console.log(err.code);
			    	callback(false);
			    }else{
			    	console.log('Last insert ID for UserStats:', res.insertId); 
			    	callback(true);
			    }
			});//*query
    		}//*if user has no reccord
          //if user has a record update record
          else{
			connection.query(sql,
			[userId], (err, res) => {
				if(err) {
					console.log("Error inserting into DB, Error Code!:")
					console.log(err);
					callback(false);
				}else{
					console.log(res.affectedRows + " record(s) updated"); 
					callback(true);
			    }
			});//*query
          }//*if user has a record update record
		});//*selectUserStats()
	}//*addUserStats

	module.exports.selectUserStats = function(userID ,callback) {
		connection.query('SELECT * FROM userStats WHERE userID = ?', 
    	userID, (err, res, fields) => 
    	{
    		if(err){
    			console.error(err);
        		callback(false);
    		}
    		else{
      			callback(res);
    		}
    	});	//query
	};// selectUserStats
	
	
	
	module.exports.dbAddScenarioStats = function(name) {
	
	};
	
	//Functions that deal with the user Table
	
	module.exports.login = function(username, password ,callback) {
		connection.query('SELECT * FROM users WHERE accountName = ? AND password = ?', 
    	[username, password], (err, res, fields) => 
    	{
    		if(err){
    			console.error(err);
        		callback(false);
    		}
    		else{
      			callback(res);
    		}
    	});	//selection query for login
	};//login

	module.exports.register = function(user, callback) {
		connection.query('INSERT INTO users SET ?', user, (err, res) => {
			if(err) {
				console.log("Error inserting into DB Code:");
				console.log(err.code);
				callback(false);
			}else{
				console.log('Last insert ID:', res.insertId); 
				callback(true);
			}
		});//Insert Query
	};//register()
	
	//function updates user table with displayName and  
	//avatar color returns false if failed and true if success
	module.exports.updateUser = function(id, displayName, avatarColor, gender, locationCode, avatarUrl, callback) {
		
		this.selectUser(id, function(results){
			//if results is false there was an error
			if(!results)
			{
				console.log("ERROR UPDATING USERTABLE");
				callback(false);
			}
			//if no results there user is not in db
			else if(results === 0)
			{
				console.log("User Does not exist, Cannot update");
				callback(false);
			}
			else{
				var sql = 'UPDATE users SET displayName = ?, avatarColor = ?, gender = ?, locationCode = ?, avatarUrl = ? ';
	          	sql += 'WHERE id = ?;';
				connection.query(sql,
				[displayName, avatarColor, gender, locationCode, avatarUrl, id], (err, res) => {
				
				if(err) {
					console.log("Error Updating into DB, Error Code!:");
					console.log(err);
					callback(false);
				}else{
					console.log(res.affectedRows + " record(s) updated"); 
					callback(true);
				}
				});	//query
			}//else --- If user exists
		});//selectUser
	};//updateUser
	
	//funciton returns "user" object from db
	module.exports.selectUser = function(userID ,callback) {
			connection.query('SELECT * FROM users WHERE id = ? ', 
        	userID, (err, res, fields) => 
        	{
        		if(err){
        			console.error(err);
            		callback(false);
        		}
        		else{
          			callback(res);
        		}
        	});	//select query
	};//selectUser()
		
	/*	No! - *Peter Griffin Voice*
	module.exports.gameOver = function(mapID, userID, won, callback)
	{
		//this.updateUserStats(userID, won);
		//this.updateMapStats(mapID);
		
	}//gameOver
	*/
	
	module.exports.updateMapStats = function(mapName){
		var sql = 'UPDATE mapStats SET playCount = playCount + 1 ';
      	sql += 'WHERE mapName = ?;';
		connection.query(sql,
		mapName, (err, res) => {
		
			if(err) {
				console.log("Error Updating into DB, Error Code!:");
				console.log(err);
			}else{
				console.log(res.affectedRows + " record(s) updated"); 
			}
		});	//query
		
	}//updateMapStats
}());