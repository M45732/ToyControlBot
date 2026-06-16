const fs = require('fs')
const yaml = require('js-yaml')
const lovenseConfig = yaml.load(fs.readFileSync(`./config/lovenseOptions.yml`, 'utf8'));
const request = require('node-superfetch');

const { EmbedBuilder } = require('discord.js');

module.exports = class LovenseConnect {
	static delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	static async sendToLovense(uIDarray = [], toy_speedLevel, prevSpeeds, message = "" , toy_RotateAntiClockwise , toy_RotateClockwise, toy_RotateStop, toy_AirIn, toy_AirOut) {
		
		// and now we send the api requests.
		var prevSpeed = prevSpeeds[11];
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

			for(let uid of uIDarray){
				var smooth = 0;
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
			let url = `https://api.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=Vibrate&v=${toy_speedLevel}`;
			//let url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=pattern&rule=V:1;F:vr;S:1000#&strength=20;5;10&timeSec=20`;
			//let url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=Vibrate&v=${toy_speedLevel}`;
			// sample {"result":true,"code":0}
			
			request.post(url).then(async out => {
				if(!out.result)
					out = await request.post(url)
				//console.info(`Sending Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
				//console.info("Api response: ", out.text);
			})
			/*.catch(err => {
				console.log( 'Err: send',err );
			});*/
			
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
		}



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

	static async GetConnectedToysLovense(uid) {
		try {
			let toy = await request.post(`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=GetToys`);
				//console.info(`Sending AirIn and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
				//Response Okay 2 Toys: {"result":true,"code":0,"message":"OK","data":{"c45b7455b8bd":{"nickName":"","name":"Hush","id":"c45b7455b8bd","battery":"-1","version":"","status":0},"da0ba2a74095":{"nickName":"","name":"R01","id":"da0ba2a74095","battery":"85","version":"","status":1}}}
				//App running, no toys: {"result":true,"code":0,"message":"OK","data":{}}
				//App close: 			{"result": false, "code": 407, "message": "Lovense Connect is offline!"

			toy = JSON.parse(toy.body);
			var connectedToys = [];
			if (toy.result == true){
				//let connectedToys = [];
				for (let singletoy of Object.values(toy.data)) {
					if(singletoy.status == 1){
						connectedToys.push(`${singletoy.name}(🔋${singletoy.battery}%)`);
						console.log(singletoy);
					}
				}
			}
			console.log(connectedToys);
			return connectedToys;
		}catch(err) {
			let connectedToys = ["appoffline"];
			return connectedToys;
		}
	}

	static loginLovense(client, lovenseConfig, message, interaction, orgy = 0) {
		let uid = interaction.member.id
		return new Promise((resolve, reject) => {
			let uIDs = [];
			if (typeof uid == "string")
				uIDs = [uid]; // make 1 element array;
			else 
				uIDs.push(uid);

			let user = message.author;
			for(let uID of uIDs){
				if(uID != user.id)
					user = client.users.resolve(uID);
				
				
				let imageRequest = `https://api.lovense.com/api/lan/getQrCode?token=${lovenseConfig.token}&uid=${uID}&uname=${uID}&utoken=${uID}`;//utoken = lovenseConfig.uid?
				request.post(`${imageRequest}`).catch(err => message.author.reply(`Critical failure.`)).then(res => {
					let body = res.body;
					if(!body)
						return false
					if(body.code > 0  ) {// we have error
						message.author.send(`Failure: [${body.message}]`);
						console.log(`Failure calling for ${user}:`,body);
						return;
					}
					let img = body.message;
					if(!body.result) 
						return message.author.send(`Failure: ${body.message}`);
					
					const qrcodeMessage = new EmbedBuilder()
						.setDescription("You have been added to the Lovense Group Control")
						.addFields({name: "If this is the first time you use the Lovensebot", value: "1. Download the Lovense Connect app:"})
						.addFields({name: "Android:", value: "<https://play.google.com/store/apps/details?id=com.lovense.connect>"})
						.addFields({name: "iOS", value: "<https://itunes.apple.com/us/app/lovense-connect/id1273067916>"})
						.addFields({name: "QR code for first setup", value: "2. Scan this QR code with the Lovense Connect app:"})
						.setThumbnail(img)
						.setImage(img);
						
						if(orgy != 0){
							if(client.lovense.panel.length > 4)
								client.lovense.panel.edit({embeds: [qrcodeMessage]}).catch(e => console.error(e));
							else 
								message.author.send({embeds: [qrcodeMessage]}).catch(e => console.error(e));
						}else 
							//DM
							//client.users.resolve(uID).send({embeds: [qrcodeMessage]}).catch(err => console.error(`SEND EMBED to ${user}:`,err));
						
							//Reply
							interaction.followUp({embeds: [qrcodeMessage], ephemeral: false}).catch(err => console.error(`SEND EMBED to ${user}:`,err));
						
							//console.info(`Logging ${user} from discord to lovense connect.`);
						resolve();
					})
			}

			/*let res = [];
			let tries = 0
			while(res.length != uIDs.length || tries != 12){
				//for(let uID of uIDs){
					let toyDetect = `https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uID}&command=GetToys`;
					const { body } = await request.post(`${toyDetect}`).catch(err => message.author.reply(`Critical failure.`));
					if(!body)
						return false

					if(body.code != 0  ) {// we have error
						message.author.send(`Failure: [${body.message}]`);
						console.error(`Failure calling for ${user}:`,body);
						uIDs.splice(uIDs.indexOf(uID), 1);
						continue
					}
					if(!body.result) 
						continue

					let toy = body.data[Object.keys(body.data)[0]];
					res.push(toy.name);
				//}
				await this.delay(5000);
				tries++;
			}
			resolve(res);*/
				/*for (let i=0; i<uids.length;i++ ) {
					let uid = uids[i];
		
					//find here the USER associated with the UID
					if ( uid != message.author.id ) {
						///user = client.users.find("id",uid);
						// WORK IN PROGRESS TO EXTRACT USER THAT WILL RECEIVE THE INVITE.
						user = client.users.resolve(uid);
						console.log("User",user, "UID", uid);
					}
					let utoken = lovenseConfig.uid ; // or uid ? :D
					let imageRequest = `https://api.lovense.com/api/lan/getQrCode?token=${lovenseConfig.token}&uid=${uid}&uname=${uid}&utoken=${utoken}`;
					const { body } = await request.post(`${imageRequest}`).catch(O_o=> {
						message.author.reply(`Critical failure.`); 
					} );
					if (!body) {return false;}
					if (body.code > 0  ) {// we have error
						message.author.send(`Failure: [${body.message}]`);
						console.error(`Failure calling for ${user}:`,body);
						return;
					}
					let img = body.message;
		
					if (!body.result) {
						// failure
						message.author.send(`Failure: ${body.message}`);
						return;
					} else {
						let qrcodeMessage = new EmbedBuilder(client)
							.setDescription("You have been added to the Lovense Group Control")
							.addField("If this is the first time you use the Lovensebot","1. Download the Lovense Connect app:")
							.addField("Android:","<https://play.google.com/store/apps/details?id=com.lovense.connect>")
							.addField("iOS","<https://itunes.apple.com/us/app/lovense-connect/id1273067916>")
							.addField("QR code for first setup","2. Scan this QR code with the Lovense Connect app:")
							//.addField("REQ",imageRequest)
							.setThumbnail(img)
							.setImage(img);
						// we should find the user to get the priv message... because it is not anymore author.
						//find how to send a message to a user. 
						if ( orgy > 0 ) {
							if (client.lovense.panel.length>4) {
									client.lovense.panel.edit(qrcodeMessage).catch(e=> console.error(e));
							} else {
								message.author.send(qrcodeMessage).catch(e=> console.error(e));
							}
						} else {
							client.users.cache.get(uid).send(qrcodeMessage)
							.catch(err => {
								console.error(`SEND EMBED to ${user}:`,err);
							});
						}
						console.info(`Logging ${user} from discord to lovense connect.`);
					}
				}*/
			
		})
	}


	static async logoutLovense(client, lovenseConfig, message) {
		let uids = [];
		let uid = 0;
		if (typeof uid == "string")
			uids = [lovenseConfig.uid];
		else 
			uids = lovenseConfig.uid;
		
		//there should be the logout sequence to connect lovense with
		for (let i = 0; i< uids.length;i++) {
			uid = uids[i];
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

		}
		//console.info(`Logging out discord to lovense.`);
		client.lovense.panel = false;
		if ( client.lovense.collector ) { 
			client.lovense.collector.close();
		}
	}
};
