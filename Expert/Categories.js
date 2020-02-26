const request = require('request-promise');
const cheerio = require('cheerio');
const http = require('http');
const https = require('https');
const fs = require('fs');

http.globalAgent.maxSockets = 1;
https.globalAgent.maxSockets = 1;

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

const details = [];
(async function (){
  try{

    await sleep(5000);

    const website = "https://www.expertonline.it";
    const mainHtml = await request({
      uri: website,
      header:{
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 't-IT,it;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Host': 'www.expertonline.it',
        'Origin': 'https://www.expertonline.it',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
      },
      gzip: true
    });

    await sleep(5000);

    const $ = cheerio.load(mainHtml, {
      normalizeWhitespace: true,
      xmlMode: true
    });


    const links = await $('#skywalker_header_multiline .col-sm-12.livello2').map((i, categories) => {
      const $category = $(categories).find('a').attr('href');
      return website + $category
    }).get();

    await sleep(5000);

    Promise.all(links.map(async (link) => {
      try{

        const currentPage = await request(link);
        const $ = cheerio.load(currentPage, {
          normalizeWhitespace: true,
          xmlMode: true
        });

        await sleep(5000);

        const items = $('.skywalker_riga_articolo');
        const search = items.map((i, item) => {
          return details.push({
            'itemName' : $(item).find('img').attr('alt'),
            'itemPrice' : $(item).find('.skywalker_riga_prezzo').html(),
            'itemUrl' : $(item).find('a#LnkProdotto').attr('href')
          })
        }).get();

          console.log(details);

      }catch(e){
        console.log('Item errore', e);
      }
    }));

    //console.log(links);

  }catch(e){
    console.log("Category Error", e );
  }

})();
