# cable  
 Connect Node.JS servers by WebSocket.  
  
### Installation
 `npm i @wikgu/cable`  
  
### Example usage
##### server  
 ```js  
import {CableServer} from '@wikgu/cable';

let server = new CableServer(3000);
server.subscribe('test', (data) => {
  console.log(data);
});
let pingnumber = 0;
setInterval(() => server.send('test', 'Hello World! pingnumber = ' + pingnumber++ ), 1000);
```  
##### client  
 ```js  
import {Cable} from '@wikgu/cable';

const cable = new Cable("localhost", 3000, false);

cable.send("test", "Hello World!");
cable.subscribe("test", (data) => {
  console.log(data);
});
```  
