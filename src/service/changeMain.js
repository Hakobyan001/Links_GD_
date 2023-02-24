// enum type
const robot = require('../enum/robot.enum');
const rel = require('../enum/rel.enum');

const fetch = require("node-fetch");
class ChangeMain {
  static async changeMain(domain) {

    const aRegex = /<a[^>]*href=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/a>/g;
    const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/;
    const robotsRegex = /<meta[^>]*?name=["']robots["'][^>]*?>/i;
    const faviconRegex = /<link[^>]*(?:rel\s*=\s*['"](?:shortcut icon|icon)['"][^>]*)\s*href\s*=\s*['"]([^'"]*)['"][^>]*>/i;
    const hrefRegex = /(?<=href=")[^"]+/g;
    const aTags = [];
    const htmlOfLinks = [];
    const mainStatuses = [];
    const info = [];
    const title = [];
    const robots = [];
    const favicons = [];
    const externalInfo = [];
    const aTagOfExternals = []
    const unique = [];
    const sorted = [];
    const hrefs = [];
    const unique2 = [];
    const uniqueArray = [];
    const replaced = [];
    let hrefValues = [];
    let FullInfoExternals = [];
    let FullInfoAboutExternals = [];
    let ExternalsLinks = [];
    const htmlOfExternals = [];
    const externalStatuses = [];
    const robotsOfExternals = [];
    const idOfMain = []
    const links = []

    if(domain.length>0){
        for(let link = 0 ;link<domain.length;link++){
            links.push(domain[link].urls);
      idOfMain.push(domain[link].id)
        }
    }
    try {
      const dataMain = await Promise.all(links.map((elem) => fetch(elem)));

      for (let elem of dataMain) {
        //Receive text of HTML
        let mainText = await elem.text();
        htmlOfLinks.push(mainText)
        //Receive statuses of Links
        mainStatuses.push(elem.status);
      }
    } catch (error) {
      console.log(error);
      return "Please input the correct link"
    }

    for (let i = 0; i < links.length; i++) {

      // //Getting External links
      try {
        const domains = links.map((el) => new URL(el).hostname.replace('www.', ''));
        externalInfo.push([]);
        aTags.push(htmlOfLinks[i].match(aRegex));
        aTagOfExternals.push([...new Set(aTags[i])].filter((el) => !el.includes(domains[i]) && el.includes('href="http') && !el.includes('@') && !el.includes('.js') && !el.includes('.css') && !el.includes('.html')))
        sorted.push(aTagOfExternals[i].map((el) => el.split(' ').sort().join(' ')));
        unique.push(sorted[i].filter((elem, index, array) => elem.includes('http')));
        replaced.push(aTagOfExternals[i].map((elem) => elem.replaceAll(/<\/?[^>]+(>|$)/gi, "")));

        hrefs.push(unique[i].map(aTag => {
          const matches = aTag.match(hrefRegex);
          return matches ? matches[0] : null;
        }));
        hrefValues = hrefs[i].filter((el) => el.startsWith('http') && !el.startsWith('http://https') && !el.startsWith('https://http'));
        
        let count = Math.floor(Math.random() * 999999999999999)
        ExternalsLinks = hrefValues.map((el) => el + `?v=${count}`); 

        for (let k = 0; k < hrefValues.length; k++) {
          uniqueArray.push([...new Set(unique[i].filter(str => str.includes(hrefValues[k])))][0]);
        }
        unique2.push(uniqueArray)
        title.push(htmlOfLinks[i].match(titleRegex));
        robots.push(String(htmlOfLinks[i].match(robotsRegex)));
        favicons.push(htmlOfLinks[i].match(faviconRegex));

          //Pushing Information about external links
        for (let x = 0; x < ExternalsLinks.length; x++) {
            externalInfo[i].push(JSON.stringify({
              url: ExternalsLinks[x],
              rel: uniqueArray[x].includes('nofollow') ?  rel.nofollow : rel.dofollow,
              keyword: aTagOfExternals[i][x].includes(replaced[i][x]) && replaced[i][x] !== '' && !replaced[i][x].includes('/') ? replaced[i][x] : "null",
            }))
        }

        let a = externalInfo[i];
        let a1 = [...new Set(a)];
        FullInfoExternals = a1.map((el) => JSON.parse(el));
        // Creating object for All Information of Main link
        info.push(
          {
            link: links[i],
            title: title[i] === null ? title[i] : title[i][1],
            robot_tag: robots[i] === undefined || !robots[i].includes('noindex') || robots[i] === "null" ? robot.indexable : robot.noindexable,
            favicon: (!favicons[i] || favicons[i][1].includes(','))  ? null : (favicons[i][1].includes('https://') ? favicons[i][1] : `https://${domains[i]}` + '/' + favicons[i][1]),
            status: mainStatuses[i],
          }
        )
        
      } catch (error) {
        console.log(error);
        if (hrefs[i] !== undefined) {
          let b = externalInfo[i];
          let b1 = [...new Set(b)];
          FullInfoAboutExternals = b1.map((el) => JSON.parse(el));

          info.push(
            {
              link: links[i],
              title: title[i] === null ? title[i] : title[i][1],
              favicon: !favicons[i] ? "null" : (favicons[i][1].includes('https://') ? favicons[i][1] : links[i] + '/' + favicons[i][1]),
            }
          )
        } else {
          return "Please input the correct link"
        }
      }
      console.log(info,'info');
      return [info[i].title,info[i].robot_tag,info[i].favicon,info[i].status ,idOfMain]
    }



  }
}


module.exports = ChangeMain;