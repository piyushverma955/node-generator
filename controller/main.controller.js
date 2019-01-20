var e = {};
var mongoose = require('mongoose');
var definition = require('../helper/service.definition');
var counterDefinition = require('../helper/counter.definition');
var createProject = require('./create.Project');
var Schema = mongoose.Schema;
var dataSchema = new Schema(definition,{collection: 'generator'});
var counter = new Schema(counterDefinition,{collection: 'counter'});
var counterModel = mongoose.model('counter',counter);
var startPort = 20000;

dataSchema.pre('save', function(next) {
    let count = 0;
    return counterModel.findOne({_id:'generator'})
    .then(data=>{
        if(data){
            count = data.count+1;
            data.count = count;
            return counterModel.findOneAndUpdate({_id:'generator'},data)
        }
        else{
            count = 1000;
            body = new counterModel({"_id":"generator","count":count});
            return body.save();
        }
    })
    .then(()=>{
        this._id= 'GEN'+count;
        next();
    }) 
});
var model = mongoose.model('model',dataSchema);

getPort = ()=>{
    return model.find({}, null, {sort: {port: 1}})
    .then(data=>{
        if(data.length>0){
            let port = data[0].port+1;
            for(let i=0;i<data.length;i++){
                if(port == data[i].port){
                    port = port+1;
                }
            }
            return port;
        }
        else{
            return startPort;
        }
    })
}

e.getAll=(req,res)=>{
   model.find({})
   .then(result=>{
        res.send(result);
   })
   .catch(err=>{
    res.status(500).json({"message":"error"});
    console.log(err.message);
    })
}

e.getOne=(req,res)=>{
    let id  = req.params.id;
    model.findOne({_id:id})
    .then(result=>{
         res.send(result);
    })
    .catch(err=>{
        res.status(500).json({"message":"error"});
        console.log(err.message);
        
    })
 }

e.create = (req,res)=>{
    let body = new model(req.body); 
    let schema = {};
    getPort()
    .then(port=>{
        body.port = port;
        return body.save()
     })
     .then(data=>{
        schema = data;
        res.send(data);
        return createProject.create(data);
    })
     .then(()=>{
        createProject.dockerise(schema);
    })
    .catch(err=>{
        res.status(500).json({"message":"error"});
        console.log(err.message);
        
    })
}

e.updateOne = (req,res)=>{
    let id  = req.params.id;
    let body = req.body;
    let oldBody = {};
    let newBody={};
    return model.findOne({_id:id}).then(docs=>{
        oldBody = docs;
        return model.findOneAndUpdate({_id:id},body,{new: true})
        .then(data=>{
            newBody = data;
            res.send(data);
            return createProject.update(data,oldBody);
    })
    })
    .then(()=>{
        createProject.updateDeploy(oldBody,newBody);
    })
    .catch(err=>{
        res.status(500).json({"message":"error"});
        console.log(err.message);
        
    })
    
}

e.deleteOne = (req,res)=>{
    let id = req.params.id;
    let oldBody = {};
    model.findOne({_id:id}).then(docs=>{
        oldBody = docs
    model.findOneAndRemove({_id:id})
    .then(()=>{
        res.status(200).json({"message":"Deleted"})
        return createProject.delete(id);
    })
    .then(()=>{

        createProject.undeploy(oldBody);
    })
})
.catch(err=>{
    res.status(500).json({"message":"error"});
    console.log(err.message);
    
})
}

module.exports =e;