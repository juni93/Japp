const puppeteer = require('puppeteer');
const categoryPage = "https://www.mediaworld.it/catalogo/computer-e-smart-home/stampa";

async function MWParser (link) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 926 });
  await page.goto(link, {waitUntil: 'domcontentloaded'});

  let articleData = await page.evaluate(() => {
    const articles = [];
    const title = [];

    let categoryArticle = document.querySelectorAll('article, div.col-2, span.pagination.bottom span.pages');
    categoryArticle.forEach((articleDetails) => {
      // let articleTitle = {};
      // let articlePrice = {};
      // let articlePages = {};
      try {
        articleTitle =  articleDetails.querySelector('h3.product-name a').innerText
        articlePrice =  articleDetails.getAttribute("data-gtm-price")
        //articlePages =  articleDetails.querySelector("a").innerText
      }
      catch(err) {
        console.log(err);
      }
      if(articleTitle !== undefined && articlePrice !== undefined){
        articles.push({
          "Title" : articleTitle,
          "Price" : articlePrice
        });
      }
    });

    return articles;
  });

  console.log(articleData);
};

MWParser(categoryPage);
module.exports = MWParser;
