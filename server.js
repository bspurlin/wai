const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const daysoftheweek=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];


app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

    // Load client secrets from a local file.
var content=fs.readFileSync('credentials.json');


app.post('/', function (req, res) {
    
	// Authorize a client with credentials, then call the Google Sheets API.
	authorize(JSON.parse(content), function (auth) {
	    const sheets = google.sheets({version: 'v4', auth});
	    sheets.spreadsheets.values.get({
		spreadsheetId: '1c8pXr0tKcMl_JHvQ7VGz7X4DHvStO2qprOKdJ_XV8ls',
		range: req.body.sheetrange=='Worc'?'Worcester Area!A8:K':'Non-Worcester Area!A3:K',
	    }, (err, response) => {
		if (err) return console.log('The API returned an error: ' + err);
		let rows = response.data.values;
		//console.log('rows=' + JSON.stringify(rows));	    

		if (rows.length) {
		    // console.log(response.data);
		    
		    let day=daysoftheweek[req.body.day];
		    console.log("sheetrange="+req.body.sheetrange+"\n"+
				"req.body.day="+req.body.day+"\n"+
				req.hostname+"\n"+
				req.ip+"\n"+
				Date(Date.UTC(Date.now())) )
		    let rowobj = {};
		    rowobj.hits = [];
		    rowobj.day = day;
		    rowobj.checked = req.body.sheetrange;
		    rows.map((row) => {
			if(`${row[0]}`== day){
			    rowobj.hits.push({time:row[1], name:row[2],topic:row[3],url:row[4],mtgid:row[5],pwd:row[6],phone:row[7]});
			    //console.log(row[0] + "\t" + row[4])
			}
		    }
			    )
		    let testtext="test";
		    //console.log(JSON.stringify(rowobj));
		    res.render('index',{rowobj: rowobj, error:null})

		} else {
		    console.log('No data found.');
		}

	    } 
					  )

	}
		 )
	
}
	)
	       
	

	
	

app.get('/', function (req, res) {
    let rowobj={};
    rowobj.hits=null;
    rowobj.checked='Worc';
    res.render('index',{rowobj: rowobj,error: null})
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})


function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}
