const express = require('express')
const axios = require('axios')
const app = express()
const path = require('path')
const fs = require('fs');
const port = 80
var cheerio = require('cheerio');

// respond with "hello world" when a GET request is made to the homepage
app.set('json spaces', 2)


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// app.use(express.static(path.join(__dirname, 'front/build'))) 

app.get('/catastrophe/:userId/', (req, res) => {

    const url = 'https://www.acmicpc.net'
    const jsonfile = fs.readFileSync('./json/step_problem_id_data.json', 'utf8');
    const step_infos = JSON.parse(jsonfile);
    var total_cnt = 0
    var match_count = {}
    
    for (let index = 0; index < step_infos.length; index++) {
        const info = step_infos[index];
        
        for (let dd = 0; dd < info.problem_ids.length; dd++) {
            const now = info.problem_ids[dd];
            match_count[now] = info.step_id
        }
        total_cnt += info.problem_count
    }
    const users_info = 
    {"mekind" : {
        "id": "mekind",
        "now": 0,
        "total":0,
        "detail": [],
        "pid": []
    },
     "gksrudtn99": {
        "id": "gksrudtn99",
        "now": 0,
        "total":0,
        "detail": [],
        "pid": []
    },
    "mikle8244": {
        "id": "mikle8244",
        "now": 0,
        "total":0,
        "detail": [],
        "pid": []
    }}
    
    

    const get_users_status = (match_count) => {
    const config = { headers: { 'User-Agent': ('Mozilla/5.0 (Windows NT 10.0;Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36') } }
    var info = users_info[req.params.userId]
    var now_url = url + "/user/" + info.id

    axios.get(now_url, config).then((Response) => {
        // console.log(Response.data);
        var $ = cheerio.load(Response.data)
        var data = $('.problem-list').text().split(' ')
        
        for (let i = 0; i < data.length; i++){
            var now = data[i]

            if (now in match_count) {
                // console.log(now + "is in")
                // info.pid.push(now)
                info.now += 1
                if (now == 10816 || now == 14425){
                    info.now += 1
                }
            }
        }
        info.total = total_cnt
    }).then((aa) => {
        res.json(info)
    })
    }

    get_users_status(match_count)
})


app.get('/', (req, res) => {
    res.send('Hello')
})
