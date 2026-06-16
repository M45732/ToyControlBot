//const crypto = require('crypto');
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const lovenseConfig = yaml.load(fs.readFileSync(`./config/lovenseOptions.yml`, 'utf8'));
//const request = require('node-superfetch');
//const fetch = require('node-fetch');
//const axios = require('axios');
//const md5 = require('md5');

const delay = async (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const LovenseConnect_send_tip = async (uIDarray = [], speed, duration) => {

}

const LovenseConnect_send = async (uIDarray = [], toy_speedLevel, prevSpeeds, speed) => {
		
	//pattern: pulse, wave, fireworks, earthquake

	// and now we send the api requests.
	var prevSpeed = prevSpeeds[10];
	switch (toy_speedLevel) {
		case 1:
			toy_speedLevel *= 4;
			prevSpeed *= 4;
			break;
		case 2:
			toy_speedLevel *= 4;
			prevSpeed *= 4;
			break;
		case 3:
			toy_speedLevel *= 4;
			prevSpeed *= 4;
			break;
		case 4:
			toy_speedLevel *= 4;
			prevSpeed *= 4;
			break;
		case 5:
			toy_speedLevel *= 4;
			prevSpeed *= 4;
			break;
		default:
			toy_speedLevel = 0;
			prevSpeed *= 4;
	}
	let uids = '';
	for(let uid of uIDarray){
		if(uids == ''){
			uids = uid;
		} else {
			uids = uids+','+uid
		}

	}
		//replace smoother with command pattern
		/** 			var smooth = 0;
		if (prevSpeed>toy_speedLevel){

			smooth = prevSpeed - toy_speedLevel;
			
		}else{
			smooth = toy_speedLevel - prevSpeed;
		}
			smooth = smooth / 2;
		
			for (let smoothsteps = 1; smoothsteps < smooth; smoothsteps++) {
				var smoother = 0
				if (prevSpeed>toy_speedLevel){
					smoother = prevSpeed - smoothsteps * 2;
				}else{
					smoother = prevSpeed + smoothsteps * 2;
				}
				let url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=Vibrate&v=${smoother}`;
				// sample {"result":true,"code":0}
				
				await request.post(url).then(async out => {
					if(!out.result)
						out = await request.post(url)
					//console.info(`Sending Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
					//console.info("Api response: ", out.text);
				})
			}
		*/
		//replace smoother with command pattern
		//let url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=Vibrate&v=${toy_speedLevel}`;
		let pattern = "";
		let speeddifference = 0;
		if(prevSpeed == toy_speedLevel){
			pattern = toy_speedLevel
		}else{
			if (prevSpeed>toy_speedLevel){
				speeddifference = prevSpeed-toy_speedLevel
				for(let step = 0; step < speeddifference;step++){
					if(step+1 == speeddifference){
						pattern = pattern + `${prevSpeed-step}`;
					}else{
						pattern = pattern + `${prevSpeed-step};`;
					}
				}
			}else{
				speeddifference = toy_speedLevel-prevSpeed
				for(let step = 0; step < speeddifference;step++){
					
					if(step+1 == speeddifference){
						pattern = pattern + `${prevSpeed+step}`;
					}else{
						pattern = pattern + `${prevSpeed+step};`;
					}
				}
			}
		}
		//https://apps.lovense.com/api/lan/v2/command
		/*const result = await axios.post('https://api.lovense.com/api/lan/command',
		{
			token: `${lovenseConfig.token}`,  // Lovense developer token
			uid: uids,  // user id on your website
			//uname: uid, // user nickname on your website
			//utoken: md5(uid + 'Token@VibeMyToy.com'),  // This is for your own verification purposes. We suggest you to generate a unique token/secret for each user. This allows you to verify the user and avoid others faking the calls.
			//command:"Function",
			//action:"Vibrate:2,Rotate:3,Pump:4",
			"V:1;F:v,r,p;S:1000#"
			//V:1; Protocol version, this is static;
			//F:v,r,p; Features: v is vibrate, r is rotate, p is pump, this should match the strength below;
			//S:1000; Intervals in Milliseconds, should be greater than 100.
			//toy_speedLevel+prevSpeed/2
			command :"Pattern",
			rule: "V:1;F:v;S:500#", 
			strength: `${pattern}`,
			timeSec: 5, 
			apiVer:2 
		})*/


		let data_all1 = new URLSearchParams();
		data_all1.append('token', `${lovenseConfig.token}`);
		data_all1.append('uid', `${uids}`);

/*
		data_all1.append('command', `Pattern`);
		data_all1.append('rule', `V:1;F:v;S:500#`);
		data_all1.append('strength', `${pattern}`);
		data_all1.append('timeSec', `5`);


		data_all1.append('command', `Vibrate`);
		data_all1.append('v', toy_speedLevel);
		data_all1.append('apiVer', `2`);
		let send = await fetch('https://api.lovense.com/api/lan/command', { method: 'POST', body: data_all1 });
*/
		data_all1.append('command', `Function`);
		data_all1.append('action', `Vibrate:${toy_speedLevel}`);
		data_all1.append('timeSec', `10`);

		let send = await fetch('https://api.lovense-api.com/api/lan/v2/command', { method: 'POST', body: data_all1 });

		console.log(send)
			/**
				// Virbate the toy under the pattern you have define , The interval between changes is 1 second. the total time will be 9 seconds. 
			{
				command :"Pattern ",
				rule: "V:1;F:v;S:1000#", 
				strength:"20;20;5;20;10",    
				timeSec:9,                         
				toy:"ff922f7fd345",
				apiVer:1
			}*/
		/**
		let url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=Vibrate&v=${toy_speedLevel}`;
		//sample {"result":true,"code":0}

		request.post(url).then(async out => {
			if(!out.result)
				out = await request.post(url)
			//console.info(`Sending Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			//console.info("Api response: ", out.text);
		}).catch(err => {
			console.log( 'Err: send',err );
		});

		if (toy_RotateAntiClockwise > toy_RotateClockwise && toy_RotateAntiClockwise > toy_RotateStop) {
			url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=RotateAntiClockwise&v=${toy_speedLevel}`;
			request.post(`${url}`).then( out => {
				//console.info(`Sending Rotation AntiClockwise on and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			}).catch(err => {
				console.log( 'Err',err );
			});
		}

		if (toy_RotateClockwise > toy_RotateAntiClockwise && toy_RotateClockwise > toy_RotateStop) {
			url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=RotateClockwise&v=${toy_speedLevel}`;
			request.post(`${url}`).then( out => {
				//console.info(`Sending Rotation on and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			}).catch(err => {
				console.log( 'Err',err );
			});
		}

		if (toy_RotateStop > toy_RotateAntiClockwise && toy_RotateStop > toy_RotateClockwise) {
			url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=RotateAntiClockwise&v=0`;
			request.post(`${url}`).then( out => {
				//console.info(`Sending Rotation off and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			}).catch(err => {
				console.log( 'Err',err ); 
			});
		} 
		
		if (toy_AirIn > toy_AirOut) {
			url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=AirIn`;
			request.post(`${url}`).then( out => {
				//console.info(`Sending AirIn and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			}).catch(err => {
				console.log( 'Err',err );
			});
		} 
		
		if (toy_AirOut > toy_AirIn) {
			url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=AirOut`;
			request.post(`${url}`).then( out => {
				//console.info(`Sending AirOut and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			}).catch(err => {
				console.log( 'Err',err );
			});
		}

		*/
	

	/*
	try {
		let toy = await request.post(`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uIDarray[0]}&command=GetToys`);
			//console.info(`Sending AirIn and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			//Response Okay 2 Toys: {"result":true,"code":0,"message":"OK","data":{"c45b7455b8bd":{"nickName":"","name":"Hush","id":"c45b7455b8bd","battery":"-1","version":"","status":0},"da0ba2a74095":{"nickName":"","name":"R01","id":"da0ba2a74095","battery":"85","version":"","status":1}}}
			//						{"result":true,"code":0,"message":"OK","data":{"dc0d300b5b7f":{"id":"dc0d300b5b7f","status":"1","nickName":"Nora","name":"Nora","version":"","battery":64}}}
			//App running, no toys: {"result":true,"code":0,"message":"OK","data":{}}
			//App close: 			{"result": false, "code": 407, "message": "Lovense Connect is offline!"

		try {
			toy = JSON.parse(toy.body)
		} catch (e) {

		}
		if (toy.result = true){
			let connectedToys = []
			if(toy.data){
				for (let singletoy of Object.values(toy.data)) {
					
					if(singletoy.status === 1){
						connectedToys.push(singletoy.name);
						console.log(singletoy);
					}
				}
			}
			console.log(connectedToys);

			return connectedToys

		}
	}catch(err) {
		console.log( 'Err',err );
	}
	*/
}


const LovenseConnect_getQrCode = async (interaction) => {

	let data_all1 = new URLSearchParams();
	data_all1.append('token', `${lovenseConfig.token}`);
	data_all1.append('uid', `${interaction.member.id}`);
	data_all1.append('uname', `${interaction.member.id}`);
	data_all1.append('v', `2`);
	//let result = await fetch('https://api.lovense.com/api/lan/getQrCode', { method: 'POST', body: data_all1 });
	let result = await fetch('https://api.lovense-api.com/api/lan/getQrCode', { method: 'POST', body: data_all1 });
	

	/*const result = await axios.post('https://api.lovense.com/api/lan/getQrCode',
	{ 
		token: lovenseConfig.token,  // Lovense developer token
		uid: interaction.member.id,  // user id on your website
		uname: interaction.member.id, // user nickname on your website
		//utoken: md5(uid + '234wedfe@dfgdgrc54')  // This is for your own verification purposes. We suggest you to generate a unique token/secret for each user. This allows you to verify the user and avoid others faking the calls.
	})*/
	return await result.json();
}

//ready, maybe adding utoken later
const LovenseConnect_GetConnectedToys = async (uid) => {
	try {

		let data_all1 = new URLSearchParams();
		data_all1.append('token', `${lovenseConfig.token}`);
		data_all1.append('uid', `${uid}`);
		//data_all1.append('uname', `${uid}`);
		data_all1.append('command', `GetToys`);
		let toy = await fetch('https://api.lovense.com/api/lan/command', { method: 'POST', body: data_all1 });
	

		/*
		let toy = await axios.post('https://api.lovense.com/api/lan/command',
		{ 
			token: lovenseConfig.token,  // Lovense developer token
			uid: uid,  // user id on your website
			uname: uid, // user nickname on your website
			//utoken: md5(uid + '234wedfe@dfgdgrc54')  // This is for your own verification purposes. We suggest you to generate a unique token/secret for each user. This allows you to verify the user and avoid others faking the calls.
		})*/
		//console.info(`Sending AirIn and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
		//Response Okay 2 Toys: {"result":true,"code":0,"message":"OK","data":{"c45b7455b8bd":{"nickName":"","name":"Hush","id":"c45b7455b8bd","battery":"-1","version":"","status":0},"da0ba2a74095":{"nickName":"","name":"R01","id":"da0ba2a74095","battery":"85","version":"","status":1}}}
		//App running, no toys: {"result":true,"code":0,"message":"OK","data":{}}
		//App close: 			{"result": false, "code": 407, "message": "Lovense Connect is offline!"

		toy = await toy.json();
		var connectedToys = [];
		if (toy.result == true){
			//let connectedToys = [];
			for (let singletoy of Object.values(toy.data)) {
				if(singletoy.status == 1){
					let battery = 0;
					if(singletoy.battery == -1){
						battery = 100;
					} else {
						battery = singletoy.battery;
					}
					connectedToys.push(`${singletoy.name}(🔋${battery}%)`);
					console.log(singletoy);
				}
			}
			if (connectedToys.length == 0 ){
				connectedToys = ["toyoffline"];
			}
		} else {
			connectedToys = ["appoffline"];
		}
		console.log(connectedToys);
		return connectedToys;
	}catch(err) {
		let connectedToys = ["appoffline"];
		return connectedToys;
	}
}




const LovenseConnect_logout = async (client, lovenseConfig, message) => {
	let uids = [];
	let uid = 0;
	if (typeof lovenseConfig.uid == 'string')
		uids = [lovenseConfig.uid];
	else 
		uids = lovenseConfig.uid;
	
	//there should be the logout sequence to connect lovense with
	for (let i = 0; i< uids.length;i++) {
		uid = uids[i];
		/** 
		await LovenseConnect.delay(500); // Pausiert die Funktion für 3 Sekunden
		// this one also could be used with request.post.then.catch system ( see node-prefetch)
		let url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=Vibrate&v=0`;
		console.log("Logout",url);
		let { output } = request
		.post(`${url}`)
		.then( out => {
			console.info(`Sending Speed: 0 - Message: ${message} - UserID: ${uid}`);
		})
		.catch(err => {
			console.log( 'Err: send',err );
		});

		await LovenseConnect.delay(500); // Pausiert die Funktion für 3 Sekunden
		let url_air=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=AirOut`;
		console.log(url_air);
		let { output_air } = request
		.post(`${url_air}`)
		.then( out => {
			console.info(`Sending AirOut: 0 - Message: ${message} - UserID: ${uid}`);
		})
		.catch(err => {
			console.log( 'Err',err );
		});

		await LovenseConnect.delay(500); // Pausiert die Funktion für 3 Sekunden
		let url_antirotate=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=RotateAntiClockwise&v=0`;
		console.log(url_antirotate);
		let { output_antirotate } = request
		.post(`${url_antirotate}`)
		.then( out => {
			console.info(`Sending Rotation off and Speed: 0 - Message: ${message} - UserID: ${uid}`);
		})
		.catch(err => {
			console.log( 'Err',err );
		});

		await LovenseConnect.delay(500); // Pausiert die Funktion für 3 Sekunden
		let url_rotate=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=RotateClockwise&v=0`;
		console.log(url_rotate);
		let { output_rotate } = request
		.post(`${url_rotate}`)
		.then( out => {
			console.info(`Sending Rotation off and Speed: 0 - Message: ${message} - UserID: ${uid}`);
		})
		.catch(err => {
			console.log( 'Err',err );
		});
*/
	}
	//console.info(`Logging out discord to lovense.`);
	client.lovense.panel = false;
	if ( client.lovense.collector ) { 
		client.lovense.collector.close();
	}
	lovenseConfig = lovenseConfig.filter(item => item !== message.id)
}

module.exports =  {
	LovenseConnect_send,
	LovenseConnect_send_tip,
	LovenseConnect_getQrCode,
	LovenseConnect_GetConnectedToys,
	LovenseConnect_logout
}
