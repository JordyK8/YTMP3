const fetch = require('node-fetch')
const fs = require('fs')
const express = require('express')
const app = express()
const  ytdl = require('ytdl-core')
const extractAudio = require('ffmpeg-extract-audio')
const port = process.env.PORT || 3000

const music = [
    {
        artist: 'Infected Mushroom',
        title: 'Heavy Weight',
        album: 'Vicious Delicious'
    }
]


app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.get('/', (req, res ) => {
    res.render('index')
})
app.post('/music/find', async (req, res) => {
    const filter = req.body.filter.toLowerCase().trim()
    let foundMusic = music.map((item) => {
        const fieldsToFilter = Object.keys(item)
        const searchObject = fieldsToFilter.map((field) => {
            return item[`${field}`].toLowerCase().includes(filter)
        })
        if (searchObject.includes(true)) {
            return item
        }
    })
    res.send(foundMusic)
})

app.get('/data', (req, res) => {
    res.send({audioFile: fs.readFileSync('./SLIPKNOT - Snuff (ACOUSTIC COVER).mp3')})
})
app.post('/', async (req, res) => {
    const { url } = req.body
    try { 
        const videoData = await createVideoFile(url)
        setTimeout(async () => {
            await convertMp4ToMp3(videoData.title)
            const file = `${videoData.title}.mp3`;
            res.download(file);
        }, 3000)
        setTimeout(async () => {
            fs.unlinkSync(`${videoData.title}.mp3`)
        }, 10000)
    } catch (err) {
        console.log(err);
    }
})

async function createVideoFile(url) {
    try{
        const info = await ytdl.getBasicInfo(url)
        const title = info.player_response.videoDetails.title
        const data = await ytdl(url)
        const file = await data.pipe(fs.createWriteStream('video.mp4'));
        return { title, file}
    }catch(e){
        console.log(e);
    }   
}
async function convertMp4ToMp3(title) {
    try{
        await extractAudio({
            input: 'video.mp4',
            output: `${title}.mp3`
        })
    }catch(e) {
        console.log(e);
    }
    fs.unlinkSync('./video.mp4')
}



app.listen(port,() => { console.log('listening') })

