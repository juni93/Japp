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

const pagesUrls = [];
const details = [];
(async function (){
  try{

    await sleep(2000);

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

    await sleep(2000);

    const $ = cheerio.load(mainHtml, {
      normalizeWhitespace: true,
      xmlMode: true
    });


    const links = await $('#skywalker_header_multiline .col-sm-12.livello2').map((i, categories) => {
      const $category = $(categories).find('a').attr('href');
      return website + $category
    }).get();

    await Promise.all(links.map(async (link) => {
      try {
        //per ogni cateogria vado a contare il numero di pagine
        const categoryPage = await request(link);
        const $ = cheerio.load(categoryPage, {
          normalizeWhitespace: true,
          xmlMode: true
        });

        const totalPages = $('.skywalker_shop_datapager_paginazione_mobile option').last().text();
        if(totalPages.length > 0){
          for(let i = 1; i <= totalPages; i++){
            pagesUrls.push(link + "?pagina=" + [i]);
          }
        }else{
          pagesUrls.push(link);
        }

        //rimuovo duplicati se ci sono
        let uniquePagesUrls = [...new Set(pagesUrls)]
        //scrivo in un file json tutte le url complete di pagine
        // let data = JSON.stringify(uniquePagesUrls, null, 2);
        // fs.writeFile('../../Jsons/Categories/urls.json', data, (err) => {
        //     if (err) throw err;
        // });
        await sleep(2000);

        Promise.all(uniquePagesUrls.map(async (singlePage) => {
          try{
            //per ogni pagina vado a prendere i dati degli item
            const currentPage = await request(singlePage);
            const $ = cheerio.load(currentPage, {
              normalizeWhitespace: true,
              xmlMode: true
            });

            await sleep(2000);

            const items = $('.skywalker_riga_articolo');
            const search = items.map((i, item) => {
              return details.push({
                'itemName' : $(item).find('img').attr('alt'),
                'itemPrice' : $(item).find('.skywalker_riga_prezzo').html(),
                'itemUrl' : $(item).find('a#LnkProdotto').attr('href')
              })
            }).get();
            //scrivo in un file tutti i dati degli item
            let itemsData = JSON.stringify(details, null, 2);
            fs.writeFile('../Jsons/items.json', itemsData, (err) => {
                if (err) throw err;
            });

          }catch(e){
            console.log('Item errore', e);
          }
        }));

      } catch(e) {
        console.log('Page Calc error: ', e);
      }

    }));

    console.log('Expert is finished');

  }catch(e){
    console.log("Category Error", e );
  }

})();
