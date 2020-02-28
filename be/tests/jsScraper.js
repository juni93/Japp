const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const url = "https://www.unieuro.it/online/Computer-e-Tablet/Tablet-e-eBook-Reader/iPad";

puppeteer
  .launch()
  .then(browser => browser.newPage())
  .then(page => {
    return page.goto(url).then(function() {
      return page.content();
    });
  })
  .then(html => {
    const $ = cheerio.load(html);
    const newsHeadlines = [];
    $('.items-container .hits .title ').each(function() {
      newsHeadlines.push({
        title: $(this).find('a').text()
      });
    });

    console.log(newsHeadlines);
  })
  .catch(console.error);
