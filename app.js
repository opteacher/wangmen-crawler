const puppeteer = require("puppeteer")

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto("https://www.wanmen.org/courses/586d23485f07127674135dbf/lectures/586d23535f0712767415a761")

  await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll("video"))
    console.log(videos)
  })

  await browser.close()
})()