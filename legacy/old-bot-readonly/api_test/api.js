/*
Standard Solutions
If you integrate a Standard Solution, your users must use Lovense Remote to pair their toys. Lovense Remote is available on Google Play and the App Store.

Lovense Remote App

We offer two different ways of data forwarding solution

Standard API: based on http callbackUrl
Standard Socket API: based on socket communication
If you are a web application developer, We recommend that you use the Standard JDK directly, it is a javascript implementation of the Standard Socket API solution.

#Standard API
This API allows any application to access its users Lovense toys from the developer side.

Here is a sample demo for your reference.

#Step 1: Configure the developer dashboard
Go to the developer dashboard and set your Callback URL.

Set your Callback URL

#Step 2: Find your user's toy(s)
Your User
Your App
Your Server
Lovense Server
Lovense Remote App
Lovense Toy
Open Lovense Remote
Turn on the toy
User Logs in to your App
Request to bind with Lovense Toy
Request QR code from Lovense
Return a QR code URL
Display the QR code
User scans the QR code with Lovense Remote App
Lovense Remote app will post to your server:
Control the toy by instructing the App
Trigger vibration
Your User
Your App
Your Server
Lovense Server
Lovense Remote App
Lovense Toy
Get your developer token from the Lovense developer dashboard.

Your server calls Lovense server's API (use POST request)

For example:

java
Javascript

String url= "https://api.lovense-api.com/api/lan/getQrCode";
Map<String, String> requestParameter = new HashMap<String, String>();
//TODO initialize your parameters:
requestParameter.put("token", "{Lovense developer token}");
requestParameter.put("uid", "{user ID on your website}");
requestParameter.put("uname", "{user nickname on your website}");
requestParameter.put("utoken", "{Encrypted user token on your application. This is a security consideration, to avoid others stealing control of the toy.}");
requestParameter.put("v", 2);
HttpPost httpPost = new HttpPost(url);
List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>();
if (requestParameter != null && !requestParameter.isEmpty()) {
  Set<String> keys = requestParameter.keySet();
  for (String key : keys) {
    nameValuePairs.add(new BasicNameValuePair(key, requestParameter.get(key)));
  }
}
httpPost.setEntity(new UrlEncodedFormEntity(nameValuePairs, "utf-8"));
You will get:

{
   code: 0
   message: "Success"
   result: true
   data: {
     "qr": "https://test2.lovense.com/UploadFiles/qr/20220106/xxx.jpg", // QR code picture
     "code": "xxxxxx"
   }
}
Once the user scans the QR code with the Lovense Remote app, the app will invoke the Callback URL you've provided in the developer dashboard. The Lovense server is no longer required. All communications will go from the app to your server directly.

The Lovense Remote app will send the following POST to your server:

{
  "uid": "xxx",
  "appVersion": "4.0.3",
  "toys": {
    "xxxx": {
      "nickName": "",
      "name": "max",
      "id": "xxxx",
      "status": 1
    }
  },
  "wssPort": "34568",
  "httpPort": "34567",
  "wsPort": "34567",
  "appType": "remote",
  "domain": "192-168-1-44.lovense.club",
  "utoken": "xxxxxx",
  "httpsPort": "34568",
  "version": "101",
  "platform": "android"
}
#Step 3: Command the toy(s)
Note: iOS Remote 5.1.4+, Android Remote 5.1.1+, or PC Remote 1.5.8+ is required.

#By local application
If the user's device is in the same LAN environment, a POST request to Lovense Remote can trigger a toy response. In this case, your server and Lovense's server are not required.

If the user uses the mobile version of Lovense Remote app, the domain and httpsPort are accessed from the callback information. If the user uses Lovense Remote for PC, the domain is 127-0-0-1.lovense.club, and the httpsPort is 30010

With the same command line, different parameters will lead to different results as below.

GetToys Request

Get the user's toy(s) information.

API URL: https://{domain}:{httpsPort}/command

Request Protocol: HTTPS Request

Method: POST

Request Content Type: application/json

Response Format: JSON

Parameters:

Name	Description	Type	Note	Required
command	Type of request	String	/	yes
Request Example:

{
  "command": "GetToys"
}
Response Example:

{
  "code": 200,
  "data": {
    "toys": "{  \"fc9f37e96593\" : {    \"id\" : \"fc9f37e96593\",    \"status\" : \"1\",    \"version\" : \"\",    \"name\" : \"nora\",    \"battery\" : 100,    \"nickName\" : \"\"  }}",
    "platform": "ios",
    "appType": "remote"
  },
  "type": "OK"
}
Function Request

API URL: https://{domain}:{httpsPort}/command

Request Protocol: HTTPS Request

Method: POST

Request Content Type: application/json

Response Format: JSON

Parameters:

Name	Description	Type	Note	Required
command	Type of request	String	/	yes
action	Control the function and strength of the toy	string	Actions can be Vibrate, Rotate, Pump, Thrusting, Fingering, Suction or Stop. Use Stop to stop the toy’s response.
Range:
Vibrate:0 ~ 20
Rotate: 0~20
Pump:0~3
Thrusting:0~20
Fingering:0~20
Suction:0~20	yes
timeSec	Total running time	double	0 = indefinite length
Otherwise, running time should be greater than 1.	yes
loopRunningSec	Running time	double	Should be greater than 1	no
loopPauseSec	Suspend time	double	Should be greater than 1	no
toy	Toy ID	string	If you don’t include this, it will be applied to all toys	no
stopPrevious	Stop all previous commands and execute current commands	int	Default: 1, If set to 0 , it will not stop the previous command.	no
apiVer	The version of the request	int	Always use 1	yes
The stopPrevious parameter is available in the following versions: Android Remote 5.2.2, iOS Remote 5.4.4, PC Remote 1.6.3.

Request Example:

// Vibrate toy ff922f7fd345 at 16th strength, run 9 seconds then suspend 4 seconds. It will be looped. Total running time is 20 seconds.
{
  "command": "Function",
  "action": "Vibrate:16",
  "timeSec": 20,
  "loopRunningSec": 9,
  "loopPauseSec": 4,
  "toy": "ff922f7fd345",
  "apiVer": 1
}
// Vibrate 9 seconds at 2nd strength
// Rotate toys 9 seconds at 3rd strength
// Pump all toys 9 seconds at 4th strength
// For all toys, it will run 9 seconds then suspend 4 seconds. It will be looped. Total running time is 20 seconds.
{
  "command": "Function",
  "action": "Vibrate:2,Rotate:3,Pump:3",
  "timeSec": 20,
  "loopRunningSec": 9,
  "loopPauseSec": 4,
  "apiVer": 1
}
// Stop all toys
{
  "command": "Function",
  "action": "Stop",
  "timeSec": 0,
  "apiVer": 1
}
Pattern Request

If you want to change the way the toy responds very frequently you can use a pattern request. To avoid network pressure and obtain a stable response, use the commands below to send your predefined patterns at once.

API URL: https://{domain}:{httpsPort}/command

Request protocol: HTTPS Request

Method: POST

Request Content Type: application/json

Response Format: JSON

Parameters:

Name	Description	Type	Note	Required
command	Type of request	String	/	yes
rule	"V:1;F:v,r,p,t,f,s;S:1000#"
V:1; Protocol version, this is static;
F:v,r,p,t,f,s; Features: v is vibrate, r is rotate, p is pump, t is thrusting, f is fingering, s is suction, this should match the strength below;
S:1000; Intervals in Milliseconds, should be greater than 100.	string	The strength of r and p will automatically correspond to v.	yes
strength	The pattern
For example: 20;20;5;20;10	string	No more than 50 parameters. Use semicolon ; to separate every strength.	yes
timeSec	Total running time	double	0 = indefinite length
Otherwise, running time should be greater than 1.	yes
toy	Toy ID	string	If you don’t include this, it will apply to all toys	no
apiVer	The version of the request	int	Always use 2	yes
Request Example:

// Vibrate the toy as defined. The interval between changes is 1 second. Total running time is 9 seconds.
{
  "command": "Pattern",
  "rule": "V:1;F:v;S:1000#",
  "strength": "20;20;5;20;10",
  "timeSec": 9,
  "toy": "ff922f7fd345",
  "apiVer": 2
}
// Vibrate the toys as defined. The interval between changes is 0.1 second. Total running time is 9 seconds.
// If the toys include Nora or Max, they will automatically rotate or pump, you don't need to define it.
{
  "command": "Pattern",
  "rule": "V:1;F:v,r,p;S:100#",
  "strength": "20;20;5;20;10",
  "timeSec": 9,
  "apiVer": 2
}
Preset Request

API URL: https://{domain}:{httpsPort}/command

Request protocol: HTTPS Request

Method: POST

Request Content Type: application/json

Response Format: JSON

Parameters:

Name	Description	Type	Note	Required
command	Type of request	String	/	yes
name	Preset pattern name	string	We provide four preset patterns in the Lovense Remote app: pulse, wave, fireworks, earthquake	yes
timeSec	Total running time	double	0 = indefinite length
Otherwise, running time should be greater than 1.	yes
toy	Toy ID	string	If you don’t include this, it will be applied to all toys	no
apiVer	The version of the request	int	Always use 1	yes
Request Example:

// Vibrate the toy with pulse pattern, the running time is 9 seconds.
{
  "command": "Preset",
  "name": "pulse",
  "timeSec": 9,
  "toy": "ff922f7fd345",
  "apiVer": 1
}
Response Example:

{
  "code": 200,
  "type": "ok"
}
Error Codes:

Code	Message
500	HTTP server not started or disabled
400	Invalid Command
401	Toy Not Found
402	Toy Not Connected
403	Toy Doesn't Support This Command
404	Invalid Parameter
506	Server Error. Restart Lovense Connect.
#By server
If your application can’t establish a LAN connection to the user’s Lovense Remote app, you can use the Server API to connect the user’s toy.

⚠️ If you are using Lovense Remote for PC, you need to enter a code to establish connection. Use the code generated alongside the QR code in step 2 above.

pc-remote-code

Function Request

API URL: https://api.lovense-api.com/api/lan/v2/command

Request Protocol: HTTPS Request

Method: POST

Request Content Type: application/json

Request Format: JSON

Parameters:

Name	Description	Type	Note	Required
token	Your developer token	string		yes
uid	Your user’s ID	string	To send commands to multiple users at the same time, add all the user IDs separated by commas. The toy parameter below will be ignored and the commands will go to all user toys by default.	yes
command	Type of request	String	/	yes
action	Control the function and strength of the toy	string	Actions can be Vibrate, Rotate, Pump, Thrusting, Fingering, Suction, or Stop. Use Stop to stop the toy’s response.
Range:
Vibrate:0 ~ 20
Rotate: 0~20
Pump:0~3
Thrusting:0~20
Fingering:0~20
Suction:0~20	yes
timeSec	Total running time	double	0 = indefinite length
Otherwise, running time should be greater than 1.	yes
loopRunningSec	Running time	double	Should be greater than 1	no
loopPauseSec	Suspend time	double	Should be greater than 1	no
toy	Toy ID	string	If you don’t include this, it will be applied to all toys	no
stopPrevious	Stop all previous commands and execute current commands	int	Default: 1, If set to 0 , it will not stop the previous command.	no
apiVer	The version of the request	int	Always use 1	yes
The stopPrevious parameter is available in the following versions: Android Remote 5.2.2, iOS Remote 5.4.4, PC Remote 1.6.3.

Request Example:

// Vibrate toy ff922f7fd345 at 16th strength, run 9 seconds then suspend 4 seconds. It will be looped. Total running time is 20 seconds.
{
  "token": "FE1TxWpTciAl4E2QfYEfPLvo2jf8V6WJWkLJtzLqv/nB2AMos9XuWzgQNrbXSi6n",
  "uid": "1132fsdfsd",
  "command": "Function",
  "action": "Vibrate:16",
  "timeSec": 20,
  "loopRunningSec": 9,
  "loopPauseSec": 4,
  "apiVer": 1
}
// Vibrate 9 seconds at 2nd strength
// Rotate toys 9 seconds at 3rd strength
// Pump all toys 9 seconds at 4th strength
// For all toys, it will run 9 seconds then suspend 4 seconds. It will be looped. Total running time is 20 seconds.
{
  "token": "FE1TxWpTciAl4E2QfYEfPLvo2jf8V6WJWkLJtzLqv/nB2AMos9XuWzgQNrbXSi6n",
  "uid": "1132fsdfsd",
  "command": "Function",
  "action": "Vibrate:2,Rotate:3,Pump:3",
  "timeSec": 20,
  "loopRunningSec": 9,
  "loopPauseSec": 4,
  "apiVer": 1
}
Pattern Request

If you want to change the way the toy responds very frequently you can use a pattern request. To avoid network pressure and obtain a stable response, use the commands below to send your predefined patterns at once.

API URL: https://api.lovense-api.com/api/lan/v2/command

Request protocol: HTTPS Request

Method: POST

Request Content Type: application/json

Response Format: JSON

Parameters:

Name	Description	Type	Note	Required
token	Your developer token	string		yes
uid	Your user’s ID	string		yes
command	Type of request	String	/	yes
rule	"V:1;F:v,r,p,t,f,s;S:1000#"
V:1; Protocol version, this is static;
F:v,r,p,t,f,s; Features: v is vibrate, r is rotate, p is pump, t is thrusting, f is fingering, s is suction, this should match the strength below;
S:1000; Intervals in Milliseconds, should be greater than 100.	string	The strength of r and p will automatically correspond to v.	yes
strength	The pattern
For example: 20;20;5;20;10	string	No more than 50 parameters. Use semicolon ; to separate every strength.	yes
timeSec	Total running time	double	0 = indefinite length
Otherwise, running time should be greater than 1.	yes
toy	Toy ID	string	If you don’t include this, it will apply to all toys	no
apiVer	The version of the request	int	Always use 2	yes
Request Example:

// Vibrate the toy as defined. The interval between changes is 1 second. Total running time is 9 seconds.
{
  "token": "FE1TxWpTciAl4E2QfYEfPLvo2jf8V6WJWkLJtzLqv/nB2AMos9XuWzgQNrbXSi6n",
  "uid": "1ads22adsf",
  "command": "Pattern",
  "rule": "V:1;F:v;S:1000#",
  "strength": "20;20;5;20;10",
  "timeSec": 9,
  "apiVer": 2
}
// Vibrate the toys as defined. The interval between changes is 0.1 second. Total running time is 9 seconds.
// If the toys include Nora or Max, they will automatically rotate or pump, you don't need to define it.
{
  "token": "FE1TxWpTciAl4E2QfYEfPLvo2jf8V6WJWkLJtzLqv/nB2AMos9XuWzgQNrbXSi6n",
  "uid": "1ads22adsf",
  "command": "Pattern",
  "rule": "V:1;F:v,r,p;S:100#",
  "strength": "20;20;5;20;10",
  "timeSec": 9,
  "apiVer": 2
}
Preset Request

API URL: https://api.lovense-api.com/api/lan/v2/command

Request protocol: HTTPS Request

Method: POST

Request Content Type: application/json

Request Format: JSON

Parameters:

Name	Description	Type	Note	Required
token	Your developer token	string		yes
uid	Your user’s ID	string		yes
command	Type of request	String	/	yes
name	Preset pattern name	string	We provide four preset patterns in the Lovense Remote app: pulse, wave, fireworks, earthquake	yes
timeSec	Total running time	double	0 = indefinite length
Otherwise, running time should be greater than 1.	yes
toy	Toy ID	string	If you don’t include this, it will be applied to all toys	no
apiVer	The version of the request	int	Always use 1	yes
Request Example:

// Vibrate the toy with pulse pattern, the running time is 9 seconds.
{
  "token": "FE1TxWpTciAl4E2QfYEfPLvo2jf8V6WJWkLJtzLqv/nB2AMos9XuWzgQNrbXSi6n",
  "uid": "1adsf2323",
  "command": "Preset",
  "name": "pulse",
  "timeSec": 9,
  "apiVer": 1
}
Response Example:

{
  "result": true,
  "code": 200,
  "message": "Success"
}
Server Error Codes:

Code	Message
200	Success
400	Invalid command
404	Invalid Parameter
501	Invalid token
502	You do not have permission to use this API
503	Invalid User ID
507	Lovense APP is offline




*/














/*
#Game Mode
If you are developing an offline game or application, we recommend this solution.

Enable Game Mode in Lovense Remote
Go to Me -> Settings -> Enable Game Mode switch -> Game Mode tab will open

game-mode

Get the Local IP address
Users input the Local IP address from the Game Mode tab into your game. The machine running your game and Lovense Remote app must be on the same LAN.

Command the user's toys
game-mode

Once the user has connected to your game, you can command the user's toy(s). Here is a link to the commands list (they're the same as the Standard API).

#Standard Socket API
#Work Flow
User(Lovense App)
Developer Interface
Developer Server
Lovense Server
1) Application for authorization token
Response authorization token
Forward authorization token
2) Validate authorization token
Verification success, response socket connection info
Establishing socket connection
Get QR code information by socket
Start Lovense App, connect toys and scan the QR code
3) Report device information periodically
Device information contains toy list, domain and port of local http service
Synchronizing Device Information
Show toys and send command
User(Lovense App)
Developer Interface
Developer Server
Lovense Server
#Step 1: Application for user authentication token
Use your developer token to apply for an authentication token for your users. You can get the developer token from developer dashboard.

WARNING

For security reasons, the developer token should always be used on the server side. You should never use it in your JS code from the client side.

API URL: https://api.lovense-api.com/api/basicApi/getToken

Request Protocol: HTTPS Request

Method: POST

Request Content Type: application/json

Parameters:

Name	Description	Required
token	Developer Token	yes
uid	User ID on your application	yes
uname	User nickname on your application	no
utoken	User token from your website. This is for your own verification purposes, and we suggest you generate a unique token for each user. This allows you to verify the user and avoid faking the calls.	no
Example:

java
NodeJs
String url= "https://api.lovense.com/api/basicApi/getToken";
Map<String, String> requestParameter = new HashMap<String, String>();
//TODO initialize your parameters:
requestParameter.put("token", "{Lovense developer token}");
requestParameter.put("uid", "{user ID on your application}");
requestParameter.put("uname", "{user nickname on your application}");
HttpPost httpPost = new HttpPost(url);
List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>();
if (requestParameter != null && !requestParameter.isEmpty()) {
  Set<String> keys = requestParameter.keySet();
  for (String key : keys) {
    nameValuePairs.add(new BasicNameValuePair(key, requestParameter.get(key)));
  }
}
httpPost.setEntity(new UrlEncodedFormEntity(nameValuePairs, "utf-8"));
Result:

{
  code: 0
  message: "Success"
  data: {
      "authToken": "{autoToken}"
  }
}
#Step 2: Validate authorization
Submit authToken to Lovense on the client side to verify authorization, and receive socket connection information.

WARNING

Please use Socket.IO for client 2.x when connecting to the socket service on the client side

API URL: https://api.lovense-api.com/api/basicApi/getSocketUrl

Method: POST

Content Type: application/json

Parameters:

Name	Description	Required
platform	Your Website Name (shown in the Developer Dashboard)	yes
authToken	Authorization token	yes
Return:

Name	Description	Type
code	return code, 0 for success	int
message	reason for failure when the request fails	string
data	result data	object
data.socketIoPath	socket.io path	string
data.socketIoUrl	socket.io url	string
Example:

java
javascript
String url= "https://api.lovense.com/api/basicApi/getSocketUrl";
Map<String, String> requestParameter = new HashMap<String, String>();
//TODO initialize your parameters:
requestParameter.put("platform", "{platform}");
requestParameter.put("authToken", "{authToken}");
HttpPost httpPost = new HttpPost(url);
List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>();
if (requestParameter != null && !requestParameter.isEmpty()) {
  Set<String> keys = requestParameter.keySet();
  for (String key : keys) {
    nameValuePairs.add(new BasicNameValuePair(key, requestParameter.get(key)));
  }
}
httpPost.setEntity(new UrlEncodedFormEntity(nameValuePairs, "utf-8"));
Result:

{
  code: 0
  message: "Success"
  data: {
      "socketIoPath": "/xxx",
      "socketIoUrl": "xxx"
  }
}
#Step 3: Get QR code
After connecting the socket, obtain the user's QR code information by sending the basicapi_get_qrcode_ts event, which is used for interface display. The response data is returned with the event basicapi_get_qrcode_tc

Emit Event: basicapi_get_qrcode_ts

Listen Event: basicapi_get_qrcode_tc

Return:

Name	Description	Type
code	Return code, 0 for success	int
message	Reason for failure when the request fails	string
data	Result data	object
data.qrcode	QR code raw data. You can use it to generate a QR code	string
data.qrcodeUrl	QR code picture url	string
data.ackId	If you pass a ackId when sending an event, a consistent ackId will be returned here	string
Example:

Javascript
import io from 'socket.io-client'

const socket = io('socketIoUrl', { path: 'socketIoPath', transports: ['websocket'] })
const ackId = '24fsf2536fs7324hj647f5'

socket.emit('basicapi_get_qrcode_ts', {
  ackId: ackId
})

socket.on('basicapi_get_qrcode_tc', res => {
  let resData = res ? JSON.parse(res) : {}
  if (resData.data && resData.data.ackId === ackId) {
    console.log(resData)
  }
})
Result:

{
  code: 0
  message: "Success"
  data: {
    "qrcodeUrl": "{qrcodeUrl}",
    "qrcode": "{qrcode}"
    "ackId": "24fsf2536fs7324hj647f5"
  }
}
#Step 4: Get device information
The toy and device information can be obtained with the event basicapi_update_device_info_tc

Listen Event: basicapi_update_device_info_tc

Example:

Javascript
import io from 'socket.io-client'

const socket = io('socketIoUrl', { path: 'socketIoPath', transports: ['websocket'] })

socket.on('basicapi_update_device_info_tc', res => {
  let resData = res ? JSON.parse(res) : {}
  console.log(resData)
})
Result:

{
  "deviceCode": "xxxxxx",
  "online": true,
  "domain": "192.168.1.xx.lovense.club",
  "httpsPort": 30010,
  "wssPort": 30110,
  "appVersion": "1.3.7",
  "platform": "android",
  "appType": "remote",
  "toyList": [
    {
      "id": "xxxxxxxx",
      "name": "Lush 3",
      "toyType": "lush",
      "nickname": "My Lush",
      "hVersion": "3",
      "fVersion": 300,
      "battery": 100,
      "connected": true
    }
  ]
}
#Step 5: Command the toy(s)
We provide two ways to send toy commands.

#By local
If the user's app and your application are on the same LAN, you can use the obtained device information to send toy command. Please refer to the documentation for specific parameters.

#By server
You can also send commands remotely with the latest basicapi_send_toy_command_ts event. The parameters are the same as those sent by local application.

Javascript
import io from 'socket.io-client'

const socket = io('socketIoUrl', { path: 'socketIoPath', transports: ['websocket'] })

socket.emit('basicapi_send_toy_command_ts', {
  command: "Function",
  action: "Vibrate:16",
  timeSec: 20,
  apiVer: 1
})
#Socket Event List
#Listen
Name	Description	Trigger
basicapi_get_qrcode_tc	Returns QR code information	when 'basicapi_get_qrcode_ts' event is sent
basicapi_update_device_info_tc	Returns device information	device information update
basicapi_update_app_status_tc	Returns the app connection status	user scans the code to establish a connection
basicapi_update_app_online_tc	Returns the app network status	the connection status of Lovense APP and Lovense server
#Emit
Name	Description
basicapi_get_qrcode_ts	get QR code information
basicapi_send_toy_command_ts	send toy commands by server
#Basic JS SDK
Basic JS SDK is a javascript implementation of the Standard Socket API solution above. We suggest to directly integrate this if you are a web application developer.

Here is a sample Demo for your reference.

#Import the Javascript file
Import the Javascript file to your web page. This Javascript will declare a global variable LovenseBasicSdk on the page.

<script src="https://api.lovense-api.com/basic-sdk/core.min.js"></script>
TIP

Please add the following domains to your CSP whitelist.

*.lovense.com *.lovense-api.com *.lovense.club:*

#Initialize
Declare an instance object using the LovenseBasicSdk constructor. The ready event is triggered after successful declaration.

Please refer here to see how to request authToken for your users.

/**
 * @param {object} option
 * @param {string} option.uid user ID on your application
 * @param {string} option.platform this is the Website Name shown in the developer dashboard
 * @param {string} option.authToken authorization token
 * @param {boolean} option.debug optional, whether to print debug messages on the console
 * @returns {object} instance object
 
LovenseBasicSdk(option)
Example:

const basicSdkInstance = new LovenseBasicSdk({
  platform: '{platform}',
  authToken: '{authToken}',
  uid: '{uid}',
  debug: true
})
basicSdkInstance.on('ready', instance => {
  console.log('ready')
})
#Methods
#getQrcode
Get the QR code to display on the interface. This is an asynchronous method.

Example:

const basicSdkInstance = new LovenseBasicSdk({
  platform: '{platform}',
  authToken: '{authToken}',
  uid: '{uid}',
  debug: true
})
basicSdkInstance.on('ready', async instance => {
  try {
    const codeRes = await instance.getQrcode()
    console.log(codeRes)
    // return:
    // {
    //   "qrcodeUrl": "https://apps.lovense-api.com/UploadFiles/qr/20220725/9b03dfb900af4328b2eb0573a39ec5e0.jpg",
    //   "qrcode": "{\"type\":5,\"data\":\"2Td5iU0YoWSpsE4fx5WSMUbt+khTj0d/GggSrRTVs8Sz4EOOpoISvcRUO3P6/WFxA/FHwfEgLkuCG4kP2m1X2Q==\"}"
    // }
  } catch (e) {
    console.error(e.message)
  }
})
#getAppStatus
Returns the app connection status.

Example:

basicSdkInstance.getAppStatus()
// return: true | false
#getOnlineToys
Get connected toy(s) information.

basicSdkInstance.getOnlineToys()

// return:
[{
  "id": "xxxxxxxx",
  "name": "Lush 3",
  "toyType": "lush",
  "nickname": "My Lush",
  "hVersion": "3",
  "fVersion": 300,
  "battery": 100,
  "connected": true
}]
#getToys
Get toy(s) information.

Example:

basicSdkInstance.getToys()

// return:
[{
  "id": "xxxxxxxx",
  "name": "Lush 3",
  "toyType": "lush",
  "nickname": "My Lush",
  "hVersion": "3",
  "fVersion": 300,
  "battery": 100,
  "connected": true
}]
#checkToyOnline
Check if any toys have been connected.

Example:

basicSdkInstance.checkToyOnline()
// return: true | false
#getDeviceInfo
Get device Information.

basicSdkInstance.getDeviceInfo()

// return:
{
  "deviceCode": "xxxxxx",
  "domain": "192.168.1.xx.lovense.club",
  "httpsPort": 30010,
  "appVersion": "1.3.7",
  "platform": "android",
  "appType": "remote"
}
#sendToyCommand
Send commands to toys.

Parameters:

Name	Type	Description	Required
vibrate	Number	Vibration strength, range 0-20	no
rotate	Number	Rotation strength, range 0-20. Supported by Nora.	no
pump	Number	Pump strength, range 0-3. Supported by Max/Max 2.	no
thrusting	Number	Thrusting strength, range 0-20. Supported by the Lovense Sex Machine and Gravity.	no
fingering	Number	Fingering strength, range 0-20. Supported by Flexer.	no
suction	Number	Suction strength, range 0-20. Supported by Tenera.	no
time	Number	Total running time, 0 = indefinite length. Otherwise, the running time should be greater than 1, default 0	no
toyId	String	Toy ID. If you don’t include this, it will be applied to all toys	no
Example:

// vibrate at 5th strength for all connected toys
basicSdkInstance.sendToyCommand({
  vibrate: 5
})

// vibrate 60 seconds at 5th strength for all connected toys
basicSdkInstance.sendToyCommand({
  vibrate: 5,
  time: 60
})

// vibrate 60 seconds at 5th strength for toys 234s25rsga3ts
// rotate 60 seconds at 10th strength for toys 234s25rsga3ts
basicSdkInstance.sendToyCommand({
  vibrate: 5,
  rotate: 10,
  time: 60,
  toyId: '234s25rsga3ts'
})
#sendPatternCommand
Send pattern command.

Parameters:

Name	Type	Description	Required
strength	String	Strength pattern. Use 0-20 to form a string of numbers, separated by a semicolon. Supports up to 50 numbers, for example: 20;20;5;20;10	yes
time	Number	Total running time, 0 = indefinite length. Otherwise, running time should be greater than 1, default 0	no
interval	Number	Vibration intervals in milliseconds. Should be greater than 100，default 150	no
vibrate	Boolean	Whether to enable vibration, default true	no
rotate	Boolean	Whether to enable rotation. Supported by Nora.	no
pump	Boolean	Whether to enable pump. Supported by Max/Max 2.	no
thrusting	Boolean	Whether to enable thrusting. Supported by the Lovense Sex Machine and Gravity.	no
fingering	Boolean	Whether to enable fingering. Supported by Flexer.	no
suction	Boolean	Whether to enable suction. Supported by Tenera.	no
toyId	String	Toy ID. If you don’t include this, it will be applied to all toys	no
Example:

basicSdkInstance.sendPatternCommand({
  strength: "6;8;10;12;14;20;20;20;16;14;12;10;8;6;6",
  time: 60
})
#sendPresetCommand
Send a command from Lovense preset patterns.

Name	Type	Description	Required
name	String	Preset pattern name. Supports "pulse", "wave", "fireworks", "earthquake"	yes
time	Number	Total running time, 0 = indefinite length. Otherwise, running time should be greater than 1, default 0	no
toyId	String	Toy ID. If you don’t include this, it will be applied to all toys	no
Example:

basicSdkInstance.sendPresetCommand({
  name: "pulse",
  time: 60
})
#stopToyAction
Stop toy’s response.

Parameters:

Name	Type	Description	Required
toyId	String	Toy ID. If you don’t include this, it will be applied to all toys	no
Example:

basicSdkInstance.stopToyAction()
#destroy
Destroy the instance.

Example:

basicSdkInstance.destroy()
#Event
#ready
Listen for the ready event, which will be called after successful initialization. You can use the instance normally after this event is triggered.

Example:

const basicSdkInstance = new LovenseBasicSdk({
  platform: '{platform}',
  authToken: '{authToken}',
  uid: '{uid}',
  debug: true
})
basicSdkInstance.on('ready', instance => {
  console.log('ready')
})
#appStatusChange
Triggered when the app connection state changes. For example, users scan the QR code and establish a connection successfully.

Example:

basicSdkInstance.on('appStatusChange', status => {
  // the app connection status
  // status = true | false
})
#toyInfoChange
Triggered when toy information changes.

Example:

basicSdkInstance.on('toyInfoChange', toyInfo => {
  // toyInfo:
  [{
    "id": "xxxxxxxx",
    "name": "Lush 3",
    "toyType": "lush",
    "nickname": "My Lush",
    "hVersion": "3",
    "fVersion": 300,
    "battery": 100,
    "connected": true
  }]
})
#toyOnlineChange
Triggered when the toy connection state changes.

Example:

basicSdkInstance.on('toyOnlineChange', status => {
  // have any toys been connected
  // status = true | false
})
#deviceInfoChange
Triggered when the device information changes.

Example:

basicSdkInstance.on('deviceInfoChange', deviceInfo => {
  // deviceInfo:
  {
    "deviceCode": "xxxxxx",
    "domain": "192.168.1.xx.lovense.club",
    "httpsPort": 30010,
    "appVersion": "1.3.7",
    "platform": "android",
    "appType": "connect"
  }
})
*/