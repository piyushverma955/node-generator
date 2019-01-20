var e = {};

e.schema = (data)=>{ 
return `var model = ${data.definition};
 module.exports = model;`
}

e.schemaCounter = (data)=>{ 

    return `var model = {
        _id: String,
        count: Number
    }
    module.exports = model;`
    }

module.exports = e;