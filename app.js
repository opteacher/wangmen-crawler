Promise = require("bluebird")
const url = require("url")
const fs = require("fs")
const util = require("util")
const puppeteer = require("puppeteer")
const request = require("request")
const m3u8 = require("m3u8")
const m3u8ToMp4 = require("node-m3u8-to-mp4")

const Chrome = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
const Url = "https://www.wanmen.org/courses/586d23485f07127674135dbf/lectures/586d23535f0712767415a761"
const Prefix = "https://media.wanmen.org/"

async function puppeteerRequest() {
	const browser = await puppeteer.launch({
		executablePath: Chrome,
		headless: true
	})
	const page = await browser.newPage()
	page.setDefaultNavigationTimeout(600000)
	let m3u8List = []
	page.on("response", response => {
		if (response.status() !== 200) {
			return
		}
		let reqUrl = response.url()
		console.log(`响应来自：${reqUrl}`)
		if (url.parse(reqUrl).pathname.endsWith(".m3u8")) {
			m3u8List.push(reqUrl)
		}
	})
	await page.goto(Url)
	await page.waitFor(5000)
	await browser.close()
	return m3u8List
}

function getM3u8File(m3u8Url) {
	let fName = url.parse(m3u8Url).pathname.split("/").pop()
	let fileLoc = `destination/${fName}`
	request(m3u8Url).pipe(fs.createWriteStream(fileLoc))
	return fileLoc
}

function parseM3u8File(fileLoc) {
	return new Promise(resolve => {
		let parser = m3u8.createStream()
		let m3u8File = fs.createReadStream(fileLoc)
		m3u8File.pipe(parser)

		parser.on("m3u", async m3u8 => {
			resolve(
				m3u8.items.PlaylistItem.map(pli => pli.properties.uri)
			)
		})
	})
}

function streamToBuffer(stream) {
	return new Promise((resolve, reject) => {
		let bufAry = []
		stream.on("data", data => {
			bufAry.push(data)
		})
		stream.on("end", () => {
			resolve(Buffer.concat(bufAry))
		})
		stream.on("error", err => reject(err))
	})
}

async function main() {
	// 用puppeteer向网站请求，过滤出.m3u8后缀的URL
	let m3u8List = await puppeteerRequest()

	console.log(m3u8List)
	for (let m3u8Url of m3u8List) {
		await m3u8ToMp4(m3u8Url, "output/test.mp4")

		// // 获取m3u8文件并保存
		// let fLoc = getM3u8File(m3u8Url)
		//
		// // 用m3u8模组解析文件
		// console.log(m3u8Url)
		// let tsList = await parseM3u8File(fLoc)
		// console.log(`TS文件总数：${tsList.length}`)
		//
		// // 请求并保存TS文件
		// let tsFiles = []
		// for (let tsFile of tsList) {
		// 	let tsFileLoc = `destination/${tsFile}`
		// 	tsFiles.push(tsFileLoc)
		// 	request(Prefix + tsFile).pipe(fs.createWriteStream(tsFileLoc))
		// }
		//
		// // 合并TS文件成MP4
		// for (let tsFile of tsFiles) {
		// 	console.log(`合并${tsFile}中`)
		// 	let data = await streamToBuffer(fs.createReadStream(tsFile))
		// 	console.log(data.length)
		// 	await Promise.promisify(fs.appendFile)("output/test.mp4", data)
		// }
	}
	return Promise.resolve()
}

main()