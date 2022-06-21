import {CableServer} from '../index.js';

let server = new CableServer(3000);
server.subscribe('test', (data) => {
  console.log(data);
});
let pingnumber = 0;
setInterval(() => server.send('test', 'Hello World! pingnumber = ' + pingnumber++ ), 1000);