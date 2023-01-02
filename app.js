const express = require('express')
const app = express()
const path = require('path')
const port = 80

// respond with "hello world" when a GET request is made to the homepage



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use(express.static(path.join(__dirname, 'front/build')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/build/index.html'));
})