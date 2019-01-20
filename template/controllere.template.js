var e = {};

e.controller = (data)=>{ 
return `var e = {};
var mongoose = require('mongoose');
var definition = require('../helper/definition');
var counterDefinition = require('../helper/counter');
var Schema = mongoose.Schema;
var dataSchema = new Schema(definition,{collection: '${data.name}'});
var counter = new Schema(counterDefinition,{collection: 'counter'});
var counterModel = mongoose.model('counter',counter);


dataSchema.pre('save', function(next) {
    let count = 0;
    return counterModel.findOne({_id:'${data.name}'})
    .then(data=>{
        if(data){
            count = data.count+1;
            data.count = count;
            return counterModel.findOneAndUpdate({_id:'${data.name}'},data)
        }
        else{
            count = 1000;
            body = new counterModel({"_id":'${data.name}',"count":count});
            return body.save();
        }
    })
    .then(()=>{
        let name = '${data.name}';
        this._id= name.toUpperCase().slice(0, 3)+count;
        next();
    }) 
});

var model = mongoose.model('model',dataSchema);

e.getAll=(req,res)=>{
   model.find({})
   .then(result=>{
        res.send(result);
   })
}

e.getOne=(req,res)=>{
    let id  = req.params.id;
    model.findOne({_id:id})
    .then(result=>{
         res.send(result);
    })
 }

e.create = (req,res)=>{
    let body = new model(req.body);  
    body.save()
    .then(data=>{
        res.send(data);
    })
}

e.updateOne = (req,res)=>{
    let id  = req.params.id;
    let body = req.body;
    model.findOneAndUpdate({_id:id},body)
    .then(data=>{
        res.send(data);
    })
}

e.deleteOne = (req,res)=>{
    let id = req.params.id;
    model.findOneAndRemove({_id:id})
    .then(()=>{
        res.status(200).json({"message":"Deleted"})
    })
}

module.exports =e;`

}

module.exports = e;