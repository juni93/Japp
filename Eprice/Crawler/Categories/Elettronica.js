const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
var http = require('http');
var https = require('https');
http.globalAgent.maxSockets = 1;
https.globalAgent.maxSockets = 1;

const details = [];
(async function () {
  try {
    const website = "https://www.eprice.it";
    const sitemapUrl = "https://www.eprice.it/p/putil/tutti-i-negozi-di-eprice";
    const pagesUrls = [];
    let verifiedUrl;
    //metto Header per sembrare un comportamento meno da Robot
    const mainHtml = await request({
    uri: sitemapUrl,
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
    const $ = cheerio.load(mainHtml);
//prendo le categorie dal sitemap
    const links = $('#main ul li').map((i, sitemap) =>{
      const $elettronica = $(sitemap).find('a[href^="/pr/"]').attr('href');

      if($elettronica !== undefined) {
        //aggiungo ?fd=1 alla fine di ogni url per preparare a contare le pagine
        $elettronica.charAt(0) !== '/' ? verifiedUrl = website + '/' + $elettronica + '?fd=1' : verifiedUrl = website + $elettronica + '?fd=1'
        return verifiedUrl;
      }
    }).get();

    await Promise.all(links.map(async (link) => {
      try {
        //per ogni cateogria vado a contare il numero di pagine
        const categoryPage = await request(link);
        const $ = cheerio.load(categoryPage, {
          normalizeWhitespace: true,
          xmlMode: true
        });

        const totalPages = $('ul.ep_Paginator li a').last().text();
        for(let i = 1; i <= totalPages; i++){
          pagesUrls.push(link + "&pp=" + [i]);
        }
        //rimuovo duplicati se ci sono
        let uniquePagesUrls = [...new Set(pagesUrls)]
        //scrivo in un file json tutte le url complete di pagine
        let data = JSON.stringify(uniquePagesUrls, null, 2);
        fs.writeFile('../../Jsons/Categories/elettronica.json', data, (err) => {
            if (err) throw err;
        });

      } catch(e) {
        console.log('Page Calc error: ', e);
      }
    }));

    console.log('Elettronica is finished');
  } catch (e) {
    console.log('Category error: ',e)
  }
})();
