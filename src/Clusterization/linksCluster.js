// / Modules from this project
const cluster = require('cluster');
const CheckInfo = require('../service/checkInfo');
const Data = require('../models/urls.model');
const process = require('node:process');
const Change = require('../models/urls.model')
const cron = require('node-cron')

const { option } = require("../../connectSQL");
const knex = require('knex')(option);
const numCPUs = require('os').cpus().length;
console.log(numCPUs);
let start = 0;
let end = 0;
let worker = [];

const array = []


cron.schedule('0 0 0 * * *', () => {
  console.log('will run every day at 12:00 AM ')

let informationalResponses;

async function isPrimary() {
  if (cluster.isPrimary) {

    const limit = await Change.getNull()
    
    const step =1;

    const links = await Data.getLinks(0, limit);


    for (let i = 0; i < numCPUs; i += 1) {
      worker.push(cluster.fork());
      start = step * i;
      end = start + step;



      console.log(start, 'start', 'end', end);


      worker[i].send(links.slice(start, end));

      worker[i].on('message', async (msg) => {

        const val = Change.changeing().then(async (elem) => {
          
          if( msg.data[3].length > 0){

            array.push(msg.data);


          for (let r = 0; r < elem[1].length; r++) {
            
            
            if(elem[0][r].rel !== msg.data[1][r]|| elem[1][r].keyword !== msg.data[2][r] || elem[1][r].status !== msg.data[3][r].status || elem[0][r].robot_tag !== msg.data[3][r].robot_tag){
            informationalResponses = await knex
              .from('urls')
              .where("external_urls",'=',elem[0][r].external_urls)
              .update({ changeing: {"oldRel": `"${elem[0][r].rel}"` , "newRel": `"${msg.data[1][r]}"` , "oldKeyword":`"${elem[1][r].keyword}"` , "newKeyword":`"${msg.data[2][r]}"`}})
              .update({changeing_status:{"oldStatus":`"${elem[1][r].status}"`,"newStatus":`"${msg.data[3][r].status}"`,"oldRobot":`"${elem[0][r].robot_tag}"`,"newRobot":`"${msg.data[3][r].robot_tag}"`}})
              .update({updated_at:new Date()})
              .where('changeing',null);
              }
           }  
        }
      }
    )
  });

      worker[i].on('error', (error) => {
        console.log(error);
      });
    }



    cluster.on('exit', async (currWorker) => {
        start = end;
        end = start + step;


        worker[numCPUs - 1].on('error', (error) => {
          console.log(error);
        });
    });
  } else {
    process.on('message', async (msg) => {
      // console.log({ data: await CheckInfo.checkInfo(msg)});
      const data = await CheckInfo.checkInfo(msg)
      if(data !== undefined && data[3].length > 0 ){
      process.send({ data: data });
      }
      process.kill(process.pid);
    });
  }
}

isPrimary()

});
