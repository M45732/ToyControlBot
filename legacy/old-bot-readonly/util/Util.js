const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
//const { SUCCESS_EMOJI_ID } = process.env;
//const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea', 'ya'];
//const no = ['no', 'n', 'nah', 'nope', 'nop'];

const males = ['verified ✅', 'Male', 'Trans FtM', 'Gay'];
const females = ['verified✔️','Female', 'Trans MtF', 'Lesbian', 'Kitty'];

module.exports = class Util {
	static delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	static async isMale(who, interaction) {
		const member = await interaction.guild.members.fetch(who);
		const roles = member.roles.cache
					.filter(role => role.id)
					.sort((a, b) => b.position - a.position)
					.map(role => role.name);
		let rep = males.filter(function(obj) {return roles.indexOf(obj) !=-1;}).length>0;
		console.log(rep);
	}

	static async isFemale(who, interaction) {
		const member = await interaction.guild.members.fetch(who);
		const roles = member.roles.cache
					.filter(role => role.id)
					.sort((a, b) => b.position - a.position)
					.map(role => role.name);
		let rep = females.filter(function(obj) {return roles.indexOf(obj) !=-1;}).length>0;
		console.log(rep);
	}

	static shuffle(array) {
		const arr = array.slice(0);
		for (let i = arr.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	}

	static list(arr, conj = 'and') {
		const len = arr.length;
		return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
	}

	static shorten(text, maxLen = 2000) {
		return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
	}

	static randomRange(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	static trimArray(arr, maxLen = 10) {
		if (arr.length > maxLen) {
			const len = arr.length - maxLen;
			arr = arr.slice(0, maxLen);
			arr.push(`${len} more...`);
		}
		return arr;
	}

	static firstUpperCase(text, split = ' ') {
		return text.split(split).map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
	}

	static base64(text, mode = 'encode') {
		if (mode === 'encode') return Buffer.from(text).toString('base64');
		if (mode === 'decode') return Buffer.from(text, 'base64').toString('utf8') || null;
		throw new TypeError(`${mode} is not a supported base64 mode.`);
	}

	static hash(text, algorithm) {
		return crypto.createHash(algorithm).update(text).digest('hex');
	}

    static encryptStringWithRsaPublicKey(toEncrypt, pathToPubKey) {
        let absPath = path.resolve(pathToPubKey);
        let pubKey = fs.readFileSync(absPath, 'utf8');
        let buf = Buffer.from(toEncrypt);
        let encrypted = crypto.publicEncrypt(pubKey, buf);
        return encrypted.toString('base64');
    }

    static decryptStringWithRsaPrivateKey(toDecrypt, pathToPrivKey) {
        let absPath = path.resolve(pathToPrivKey);
        let privKey = fs.readFileSync(absPath, 'utf8');
        let buf = Buffer.from(toDecrypt, 'base64');
        let decrypted = crypto.privateDecrypt(privKey, buf);
        return decrypted.toString('utf8');

    }

	static today(timeZone) {
		const now = new Date();
		if (timeZone) now.setUTCHours(timeZone);
		now.setHours(0);
		now.setMinutes(0);
		now.setSeconds(0);
		now.setMilliseconds(0);
		return now;
	}

	static tomorrow(timeZone) {
		const today = Util.today(timeZone);
		today.setDate(today.getDate() + 1);
		return today;
	}

    static emojiStringToArray(string){
        const split = string.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/ || " ");
        const array = [];
        for (let i=0; i < split.length; i++) {
            const char = split[i]
            if (char !== "") {
            array.push(char);
            }
        }
        return array;
    }
};
