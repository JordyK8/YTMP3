const fetch = require('node-fetch')
const fs = require('fs')
const express = require('express')
const app = express()
const  ytdl = require('ytdl-core')
const extractAudio = require('ffmpeg-extract-audio')



app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.get('/', (req, res )=>{
    res.render('index')
})
app.post('/', async (req, res) => {
    const { url } = req.body
        const videoData = await createVideoFile(url)
        await setTimeout(async ()=>{
            await convertMp4ToMp3(videoData.title)
            const file = `${videoData.title}.mp3`;
        res.download(file);
        }, 3000)
})

async function createVideoFile(url){
    try{
        const info = await ytdl.getBasicInfo(url)
        const title = info.player_response.videoDetails.title
        console.log(title);
        const data = await ytdl(url)
        const file = await data.pipe(fs.createWriteStream('video.mp4'));
        return { title, file}
    }catch(e){
        console.log(e);
    }   
}
async function convertMp4ToMp3(title){
    try{
        await extractAudio({
            input: 'video.mp4',
            output: `${title}.mp3`
        })
    }catch(e){
        console.log(e);
    }
    fs.unlinkSync('./video.mp4')
}



app.listen(3000,()=>{console.log('listening');})

