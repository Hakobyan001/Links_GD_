// Modules from this project
const cluster = require('cluster');
const Data = require('../models/urls.model');
const process = require('node:process');
const Change = require('../models/urls.model')
const ChangeMain = require('../service/changeMain');
const cron = require('node-cron');


const { option } = require("../../connectSQL");
const knex = require('knex')(option);
const numCPUs = require('os').cpus().length;
console.log(numCPUs);
let start = 0;
let end = 0;
let worker = [];
const step = 1;
let changedInfo;

// cron.schedule('0 0 0 * * *', () => {
//   console.log('will run every day at 12:00 AM ')


async function isPrimary() {
  if (cluster.isPrimary) {

    const limitOfLength = await Data.linksChange()
    const limit = limitOfLength.length


    const links = await Data.linksChange()

    for (let i = 0; i < numCPUs; i += 1) {
      worker.push(cluster.fork());
      start = step * i;
      end = start + step;

      worker[i].send(links.slice(start, end));

      worker[i].on('message', async (msg) => {
        console.log(msg.data,'data');

        if (msg.data !== undefined) {
          const val = Change.linksChange().then(async (elem)  => {
            console.log(elem);
            for (let r = 0; r < elem.length; r++) {
              if(elem[r].title !== msg.data[0] || elem[r].robot_tag !== msg.data[1] || elem[r].favicon !== msg.data[2] || elem[r].status !== msg.data[3]){
              changedInfo = await knex
                .from('links')
                .where("change", "=","active")
                .update({
                  changeing: {
                    "oldTitle": `"${elem[r].title}"`, "newTitle": `"${msg.data[0]}"`
                    , "oldRobot": `"${elem[r].robot_tag}"`, "newRobot": `"${msg.data[1]}"`
                    , "oldFavicon": `"${elem[r].favicon}"`, "newFavicon": `"${msg.data[2]}"`
                    , "oldStatus": `"${elem[r].status}"`, "newStatus": `"${msg.data[3]}"`
                  }
                })
                .update({ updated_at: new Date() });
              }
            }


            const changeData = await Data.getChanges();
            for (let c = 0; c < changeData.length; c++) {
              
            const insertChanges = await knex.from('changes').insert({campaign_id:changeData[c].campaign_id,user_id:changeData[c].user_id,created_at:new Date()})
          }

          }
          )
        }

      });


      worker[i].on('error', (error) => {
        console.log(error);
      });
    }

    cluster.on('exit', async (currWorker) => {
      start = end;
      end = start + step;

      if (end <= limit) {
        worker = worker.filter((w) => w.id !== currWorker.id);

        worker.push(cluster.fork());
        const chunk = links.slice(start, end);
        console.log('INIT start, end => ', start, end);
        worker[numCPUs - 1].send(chunk);

        worker[numCPUs - 1].on('message', async (msg) => {

          if (msg.data !== undefined) {
            const val = Change.linksChange().then(async (elem) => {


              for (let r = 0; r < elem.length; r++) {
                if((elem[r].title !== msg.data[0] || elem[r].robot_tag !== msg.data[1]) && (elem[r].favicon !== msg.data[2] || elem[r].status !== msg.data[3])){
                changedInfo = await knex
                  .from('links')
                  .where("change", "=","active")
                  .update({
                    changeing: {
                      "oldTitle": `"${elem[r].title}"`, "newTitle": `"${msg.data[0]}"`
                      , "oldRobot": `"${elem[r].robot_tag}"`, "newRobot": `"${msg.data[1]}"`
                      , "oldFavicon": `"${elem[r].favicon}"`, "newFavicon": `"${msg.data[2]}"`
                      , "oldStatus": `"${elem[r].status}"`, "newStatus": `"${msg.data[3]}"`
                    }
                  })
                  .update({ updated_at: new Date() });
                }
              }
            }
            )
          }
        });


        worker[numCPUs - 1].on('error', (error) => {
          console.log(error);
        });
      }
    });
  } else {
    process.on('message', async (msg) => {
      process.send({ data: await ChangeMain.changeMain(msg) });
      process.kill(process.pid);

    });

  }
}

isPrimary();
// });
