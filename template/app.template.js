var e = {};

e.app = (data)=>{ 
return `var express = require('express');
var mongoose = require('mongoose');
var controller = require('./controller/controller.js')
var app = express();
var mongoUrl = 'mongodb://localhost:27017/examples';
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongoose.connect(mongoUrl)
.then(()=>{
    console.log('connected to db');  
})

app.post('/',controller.create);
app.get('/',controller.getAll);
app.get('/:id',controller.getOne);
app.put('/:id',controller.updateOne);
app.delete('/:id',controller.deleteOne)
app.listen(${data.port},()=>{
    console.log('yeah i m listening at', ${data.port});
});`}

module.exports = e;