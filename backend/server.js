const express = require('express');
const path = require('path');
const {dep} = require('./data.js');

const app=express();
const PORT = 2000;



app.use('/static', express.static(path.join(__dirname, '../static')))

app.get("/api/department", (req,res)=>{

    res.json({data:dep})
})

app.get("/", (req,res)=>{
    res.redirect('/static/index.html');
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Для общего пользования по WIFI:  http://192.168.0.192:${PORT}`);
})