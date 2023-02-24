const Data = require('../models/urls.model');
// enum type
const ChangeUrls = require('../service/changeUrls')
const robot = require('../enum/robot.enum');
const rel = require('../enum/rel.enum');

class CheckInfo {

  static async checkInfo(furl) {
    // console.log(furl,"fur;");
    let links = [];
    links = furl.map((el) => el.urls)
    const rank = []

    const aRegex = /<a[^>]*href=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/a>/g;
    const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/;
    const robotsRegex = /<meta[^>]*?name=["']robots["'][^>]*?>/i;
    const faviconRegex = /<link[^>]*(?:rel\s*=\s*['"](?:shortcut icon|icon)['"][^>]*)\s*href\s*=\s*['"]([^'"]*)['"][^>]*>/i;
    const hrefRegex = /(?<=href=")[^"]+/g;
    const aTags = [];
    const htmlOfLinks = [];
    const mainStatuses = [];
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
    const rels = [];
    const arr = [];
    let uniqueSorted = [];
    let hrefValues = [];
    let FullInfoAboutExternals = [];
    let ExternalsLinks = [];
    let dofollow = []
    let nofollow = []
    const arrayfromExternals = [];


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

    }

    for (let i = 0; i < links.length; i++) {
      // //Getting External links
      try {
        const domains = links.map((el) => new URL(el).hostname.replace('www.', ''));
        externalInfo.push([]);
        aTags.push(htmlOfLinks[i].match(aRegex));
        aTagOfExternals.push([...new Set(aTags[i])].filter((el) => !el.includes(domains[i]) && el.includes('href="http') && !el.includes('@') && !el.includes('.js') && !el.includes('.css') && !el.includes('.html')))
        sorted.push(aTagOfExternals[i].map((el) => el.split(' ').sort().join(' ')));
        uniqueSorted = [...new Set(sorted[i])];
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
        //Pushing Information about external links
        for (let x = 0; x < uniqueSorted.length; x++) {
          externalInfo[i].push(JSON.stringify({
            url: ExternalsLinks[x],
            rel: uniqueSorted[x].includes('nofollow') ? rels.push(rel.nofollow) : rels.push(rel.dofollow),
            keyword: aTagOfExternals[i][x].includes(replaced[i][x]) && replaced[i][x] !== '' && !replaced[i][x].includes('/') ? arr.push(replaced[i][x]) : arr.push("null"),
          }))
        }
        let a = externalInfo[i];
        let a1 = [...new Set(a)];
        FullInfoAboutExternals = a1.map((el) => JSON.parse(el));
      } catch (error) {
        console.log(error);
        if (hrefs[i] !== undefined) {
          for (let x = 0; x < uniqueSorted.length; x++) {
            if (ExternalsLinks[x].startsWith('http')) {
              externalInfo[i].push(JSON.stringify({
                url: ExternalsLinks[x],
                rel: uniqueSorted[x].includes('nofollow') ? rels.push(rel.nofollow) : rels.push(rel.dofollow),
                keyword: aTagOfExternals[i][x].includes(replaced[i][x]) && replaced[i][x] !== '' && !replaced[i][x].includes('/') ? arr.push(replaced[i][x]) : arr.push("null"),
              }))
            }
          }
          let b = externalInfo[i];
          let b1 = [...new Set(b)];
          FullInfoAboutExternals = b1.map((el) => JSON.parse(el));

        } else {
          return "Please input the correct link"
        }
      }


    }

// console.log(hrefValues,54);
const alfa = await Data.getExternalWithCheck();


for(let j in alfa){

arrayfromExternals.push(alfa[j].external_urls)
rank.push(alfa[j].id)
} 
    let FullData;
    if(rels.length > 0 && arr.length > 0){
    FullData = await ChangeUrls.changeUrls(arrayfromExternals)
    if(FullData.length > 0)
        return [rank,rels, arr,FullData]
    }
  }
}


module.exports = CheckInfo;
