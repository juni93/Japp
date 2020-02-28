
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
    await sleep(5000);
    //prendo le url dal json delle categorie
    fs.readFile('../../Jsons/Categories/elettronica.json', async (err, data) => {
      if (err) throw err;
      let singleUrls = JSON.parse(data);
      // for (let i = 0; i < singleUrls.length; i++){
      //   singleUrl.push(singleUrls[i]);
      // }

      //uno alla volta faccio request e carico in cheerio ogni url
      await sleep(5000);
      await Promise.all(singleUrls.map(async (singleUrl) => {
        try{
          await sleep(5000);
          const pageUrl = await request({
            uri: singleUrl,
            headers: {
              'accept': '*/*',
              'accept-encoding': 'gzip, deflate, br',
              'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6',
              'cache-control': 'no-cache',
              'origin': 'https://www.eprice.it',
              'pragma': 'no-cache',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'cross-site',
              'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36',
              },
            gzip: true
          });
          await sleep(5000);
          const $ = cheerio.load(pageUrl, {
            normalizeWhitespace: true,
            xmlMode: true
          });
          //prendo i dati dei singoli item
          await sleep(5000);
          const items = $('.ep_box_prodListing');
          const search = items.map((i, item) => {
            return details.push({
              "itemName" : $(item).find('a').attr('title'),
              "itemPrice" : $(item).find('.ep_itemPrice').html(),
              "ItemUrl" : $(item).find('a').attr('href')
            })
          }).get();
          await sleep(5000);
          //scrivo in un json tutti i dati recuperati
          let data = JSON.stringify(details, null, 2);
          fs.writeFile('../../Jsons/Items/elettronica.json', data, (err) => {
              if (err) throw err;
          });
          await sleep(5000);
        }catch(e){
          console.log('item error', e)
        }
      }));
      console.log('Items elettronica is finished');
    });
  } catch (e) {
    console.log('page error: ',e)
  }
})();
