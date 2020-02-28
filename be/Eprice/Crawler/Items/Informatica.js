
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
var http = require('http');
var https = require('https');
http.globalAgent.maxSockets = 1;
https.globalAgent.maxSockets = 1;

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

const details = [];
(async function () {
  try {
    //prendo le url dal json delle categorie
    fs.readFile('../../Jsons/Categories/informatica.json', async (err, data) => {
      if (err) throw err;
      let singleUrls = JSON.parse(data);
      // for (let i = 0; i < singleUrls.length; i++){
      //   singleUrl.push(singleUrls[i]);
      // }
      await sleep(5000);
      //uno alla volta faccio request e carico in cheerio ogni url
      await Promise.all(singleUrls.map(async (singleUrl) => {
        try{
          const pageUrl = await request({
            uri: singleUrl,
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
              'Accept-Encoding': 'gzip, deflate, br',
              'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
              'Cache-Control': 'max-age=0',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
              },
              gzip: true
          });
      await sleep(5000);
          const $ = cheerio.load(pageUrl, {
            normalizeWhitespace: true,
            xmlMode: true
          });
          //prendo i dati dei singoli item
          const items = $('.row .item');
          const search = items.map((i, item) => {
            return details.push({
              "itemName" : $(item).find('h2.itemName').text(),
              "itemPrice" : $(item).find('span.contPrice').text(),
              "ItemUrl" : $(item).find('a.linkTit').attr('href')
            })
          }).get();
          await sleep(5000);
          //scrivo in un json tutti i dati recuperati
          let data = JSON.stringify(details, null, 2);
          fs.writeFile('../../Jsons/Items/informatica.json', data, (err) => {
              if (err) throw err;
          });

        }catch(e){
          console.log('item error', e)
        }
      }));
      console.log('Items tecnologia is finished');
    });
  } catch (e) {
    console.log('page error: ',e)
  }
})();
