// enum type
const robot = require('../enum/robot.enum');
const rel = require('../enum/rel.enum');

const fetch = require("node-fetch");
class ChangeUrls {
  static async changeUrls(domain) {   
    const robotsRegex = /<meta[^>]*?name=["']robots["'][^>]*?>/i;
    let unexts = domain;
    const externalStatus = []
    const robotExternals = [];
    const info = [];
    const info1 = [];
    const information = [];
    const urlAndRobot = {urlRobot:[]}
    const urlAndStatus = { urlStatus:[],status:[]}

    if (unexts.length > 0) {
      let success;
      const fetchData = async link => {
        try {
          const response = await fetch(link, { redirect: "manual" });
          const data = response;
          return { status: "fulfilled", value: data };
        } catch (error) {
          return {
            status: "rejected", value: {
              status: 503,
              aborted: false,
            },
          }
        }
      }
      
      const dataExternal = await Promise.allSettled(unexts.map(fetchData))
      .then(results => {
        results.forEach((result, index) => {
          if (String(result.value.value.cause).includes('Error: Client network') && String(result.value.value.code).includes('UND_ERR_SOCKET')) {
            info1.push({
              url: unexts[index],
              text: 'null',
              status: 404
            })
            externalStatus.push(503)
          } else if (result.value.status === "rejected") {
            const texts = result.value.value;
            information.push({
              url: unexts[index],
              text: texts
            })
            info1.push({
              url: unexts[index],
              text: 'null',
              status: 503
            })
          } else if (result.value.status === "fulfilled") {
            const texts = result.value.value;
            success = result.value.value.status
            externalStatus.push(success);
            information.push({
              url: result.value.value.url,
              text: texts
            })
          }
        });
      })
      .catch((err) => {
        console.log(err);
        externalStatus.push(404);
      })


        await Promise.allSettled(information.map(async (elem,index) => {
          info1.push({
            url: elem.url,
            text: await elem.text.text(),
            status: information[index].text.status
          })
        }));

        for (let x = 0; x < info1.length; x++) {      
          robotExternals.push(String(info1[x].text.match(robotsRegex)));
          info.push({
            url: info1[x].url,
            status: info1[x].status || 508,
            robot_tag: robotExternals[x] === 'null' || robotExternals[x] === undefined || !robotExternals[x].includes('noindex') ? 'indexable' : 'noindexable',
          })
        }
      }
      // console.log(info,"info");
      return info
      // const exportData = await inserting([urlAndStatus,urlAndRobot])
    }

    static async checkInfoFromMain(furls) {
      const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/;
      const robotsRegex = /<meta[^>]*?name=["']robots["'][^>]*?>/i;
      const faviconRegex = /<link[^>]*(?:rel\s*=\s*['"](?:shortcut icon|icon)['"][^>]*)\s*href\s*=\s*['"]([^'"]*)['"][^>]*>/i;
      const mainStatuses = [];
      const robotOfMain = [];
      const title = [];
      const favicons = [];
      const mainInfo = [];
      const htmlOfMain = []
      let counter = Math.floor(Math.random() * 999999999999999);
      const domain = furls.map((el) => el + `?v=${counter}`)


     try{
  var domains = furls.map((el) => new URL(el).hostname.replace('www.', ''));
  const dataMain = await Promise.all(domain.map((elem) => fetch(elem)));
  for (let elem of dataMain) {
      //Receive statuses of Links
      if(elem.status === 404) {
          const vil = await Promise.all(furls.map((elem) => fetch(elem)))
          for (let elem of vil) {
            let text = await elem.text();
            htmlOfMain.push(text);
            mainStatuses.push(elem.status);
          }
        }else {
          let mainText = await elem.text();
          htmlOfMain.push(mainText)
          mainStatuses.push(elem.status);
        }
    }}catch (err) {
      if(err instanceof TypeError || err.message === 'terminated') {
        let counter = Math.floor(Math.random() * 999999999999999);
        const links = furls.map((el) => el + `?v=${counter}`)
        var dataMain = await Promise.all(links.map((elem) => 
        axios.get(`${elem}`).then((response)=>{
            return response
          })));
  
        for (let elem of dataMain) {
          //Receive statuses of Links
            let mainText = elem.data;
            htmlOfMain.push(mainText);
            mainStatuses.push(elem.status);
        }
      }
      else{
        return "Problem"
      }
    }
    try{
  for (let i = 0; i < domain.length; i++) {
      title.push(htmlOfMain[i].match(titleRegex));
      robotOfMain.push(String(htmlOfMain[i].match(robotsRegex)));
      favicons.push(htmlOfMain[i].match(faviconRegex));
      //Creating object for All Information of External link
      mainInfo.push(
          {
              url: furls[i],
              redirected_chains: [],
              robot_tag: robotOfMain[i] === undefined || !robotOfMain[i].includes('noindex') ||  robotOfMain[i] === null ? robotOfMain[i] = 'indexable' : robotOfMain[i] = 'noindexable',
              title: title[i] === null ? title[i] : title[i][1].replace(/&#8211/g, '-').replace(/&#8217/g, "'").replace(/;/g, "")  ,
              favicon: (!favicons[i] ||  favicons[i][1].includes(',')) ? null : (favicons[i][1].includes('https://') ? favicons[i][1] : `https://${domains[i]}` + '/' + favicons[i][1]),
              status: mainStatuses[i]
            }
      )
  }
  }catch (error){
    for (let i = 0; i < domain.length; i++) {
      mainInfo.push({
        url: furls[i],
        status: error.cause.code === 'ENOTFOUND' ? 404 : furls[i].includes(error.cause.host) ? 503 : 200,
      })
    }
  }   
  const inform = mainInfo.flat(3)
  return inform



  }
}


module.exports = ChangeUrls;