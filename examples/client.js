import {Cable} from '../index.js';

const cable = new Cable("localhost", 3000, false);

cable.send("test", "Hello World!");
cable.subscribe("test", (data) => {
  console.log(data);
});