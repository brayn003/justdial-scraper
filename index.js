const puppeteer = require('puppeteer');
const { Parser } = require('json2csv');
const fs = require('fs');


const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0
      let distance = 100
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance
        if(totalHeight >= scrollHeight){
          clearInterval(timer)
          resolve()
        }
      }, 200)
    })
  })
}

const getList = async (browser, url, currentPage, maxPage, initialList = []) => {
  if(currentPage > maxPage) {
    return Promise.resolve(initialList);
  }

  const page = await browser.newPage();
  await page.goto(`${url}${currentPage > 1 ? `/page-${currentPage + 1}` : ''}`);
  await autoScroll(page);
  const list = await page.$$eval('li.cntanr', (els) => {
    const arr = [];
    const symMap = {
      'mobilesv icon-dc': '+',
      'mobilesv icon-fe': '(',
      'mobilesv icon-hg': ')',
      'mobilesv icon-ba': '-',
      'mobilesv icon-acb': '0',
      'mobilesv icon-yz': '1',
      'mobilesv icon-wx': '2',
      'mobilesv icon-vu': '3',
      'mobilesv icon-ts': '4',
      'mobilesv icon-rq': '5',
      'mobilesv icon-po': '6',
      'mobilesv icon-nm': '7',
      'mobilesv icon-lk': '8',
      'mobilesv icon-ji': '9',
    }
    els.forEach((el) => {
      const nameEl = el.querySelector('h2.store-name a');
      const ratingEl = el.querySelector('.newrtings span.green-box');
      const voteEl = el.querySelector('.newrtings .rt_count.lng_vote');
      let addressEl = (el.querySelector('.address-info.tme_adrssec a') || {});
      let phoneEls = el.querySelectorAll('.contact-info .mobilesv');
      
      let name = '';
      let link = '-';
      if(nameEl) {
        name = nameEl.textContent;
        link = nameEl.href;
      }

      let votes = '-';
      if(voteEl) {
        votes = voteEl.textContent || ''.replace(/[\t\n]/g, '').replace('Votes', ' Votes');
      }

      let rating = '-';
      if(ratingEl) {
        rating = ratingEl.textContent;
      }

      let address = '';
      if(addressEl) {
        address = addressEl.textContent.replace(/[\t\n]/g, '').replace('more..', '');
      }
      
      let phone = '';
      if(phoneEls.length > 0) {
        const numArr = Array.from(phoneEls).map((el) => {
          return symMap[el.className];
        })
        phone = numArr.join('');
      }

      arr.push({ name, rating, votes, address, phone, link });
    })
    return arr;
  });
  return getList(browser, url, currentPage + 1, maxPage, initialList.concat(list));
}

const writeListToFile = async (city, data) => {
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(data);
  fs.writeFileSync(`./sheets/counsellors-${city}.csv`, csv, 'utf-8');
  console.log(`[DONE] ${city}`);
}

const main = async () => {
  const browser = await puppeteer.launch({headless: false});
  // writeListToFile('Mumbai', await getList(browser, 'https://www.justdial.com/Mumbai/Career-Counselling-Centres/', 1, 1));
  // writeListToFile('Pune', await getList(browser, 'https://www.justdial.com/Pune/Career-Counselling-Centres/', 1, 1));
  // writeListToFile('Delhi', await getList(browser, 'https://www.justdial.com/Delhi/Career-Counselling-Centres/', 1, 1));
  // writeListToFile('Bangalore', await getList(browser, 'https://www.justdial.com/Bangalore/Career-Counselling-Centres/', 1, 1));
  // writeListToFile('Hyderabad', await getList(browser, 'https://www.justdial.com/Hyderabad/Career-Counselling-Centres/', 1, 1));
  // writeListToFile('Chennai', await getList(browser, 'https://www.justdial.com/Chennai/Career-Counselling-Centres/', 1, 1));
  // writeListToFile('Ahmedabad', await getList(browser, 'https://www.justdial.com/Ahmedabad/Career-Counselling-Centres/', 1, 1));
  // writeListToFile('Kolkata', await getList(browser, 'https://www.justdial.com/Kolkata/Career-Counselling-Centres/', 1, 1));
  // writeListToFile('Jaipur', await getList(browser, 'https://www.justdial.com/Jaipur/Career-Counselling-Centres/', 1, 1));


  // writeListToFile('Mumbai-Eduboard', await getList(browser, 'https://www.justdial.com/Mumbai/Overseas-Education-Consultants/nct-11365029/', 1, 1));
  // writeListToFile('Nariman-Point', await getList(browser, 'https://www.justdial.com/Mumbai/Overseas-Education-Consultants-in-Nariman-Point/nct-10958378', 1, 1));
  // writeListToFile('Nariman-Point', await getList(browser, 'https://www.justdial.com/Mumbai/Overseas-Education-Consultants-in-Nariman-Point/nct-10958378/page-2', 1, 1));

  
  // console.log(list)
  
  console.log('----done----');
  browser.close();
}


main();
