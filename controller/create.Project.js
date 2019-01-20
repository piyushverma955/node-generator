var e = {};
var fs = require('fs');
var aapTemplate = require('../template/app.template');
var controllerTemplate = require('../template/controllere.template');
var pkgTemplate = require('../template/pkg.tempate');
var definitionTemplate = require('../template/schema.template');
var dockerTemplate = require('../template/docker.template');
var rimraf = require("rimraf");
var mongoose = require('mongoose');
let exec = require('child_process').exec;
const execSync = require('child_process').execSync;
var path = require('path');

e.create=(data)=>{
    return new Promise((resolve, reject) => {
    var path = __dirname;
    var dir = path+'/..' + '/generatedProject';
    var project = dir+'/'+data._id;
    var controller = project +'/'+"controller";
    var helper = project +'/'+"helper";
    if (!fs.existsSync(dir) ){
        fs.mkdirSync(dir);
    }

    if (!fs.existsSync(project) ){
        fs.mkdirSync(project);
    }

    if (!fs.existsSync(controller) ){
        fs.mkdirSync(controller);
    }

    if (!fs.existsSync(helper) ){
        fs.mkdirSync(helper);
    }
    
    writeFilePromise(project+'/app.js',aapTemplate.app(data))
    .then(()=>{
        console.log('saved');
        return fs.writeFile(controller+'/controller.js',controllerTemplate.controller(data))
    })
    .then(()=>{
        console.log('saved');
        return writeFilePromise(controller+'/controller.js',controllerTemplate.controller(data))
        })
    .then(()=>{
        console.log('saved');
            return writeFilePromise(project+'/package.json',pkgTemplate.pkg())
        })
    .then(()=>{
        console.log('saved');
            return writeFilePromise(helper+'/definition.js',definitionTemplate.schema(data))
        })
    .then(()=>{
        console.log('saved');
            return writeFilePromise(helper+'/counter.js',definitionTemplate.schemaCounter())
    })
    .then(()=>{
        console.log('saved');
        return writeFilePromise(project+'/Dockerfile',dockerTemplate.docker(data))
    })
    .then(()=>{
        resolve();
    })
})
}

e.delete=(name)=>{
    var path = __dirname;
    var dir = path+'/..' + '/generatedProject/'+name;
    console.log('dir is',dir);
    
    rimraf(dir, function () { console.log("done"); });
}

e.update = (data,oldBody)=>{
    var path = __dirname;
    var dir = path+'/..' + '/generatedProject/'+data._id; 
    return new Promise((resolve, reject) => {rimraf(dir, function () { 
        e.create(data);
    }); 
    resolve();})
    .then(()=>{
        if(oldBody.name != data.name){
            return mongoose.connection.db.collection(oldBody.name).rename(data.name)
            .then(()=>{
                console.log('renamed');
                
            })
         }
    })
    
}

e.dockerise = (data) =>{
    var jsonPath = path.join(__dirname, '..', 'generatedProject', data._id);
    console.log('json path is',jsonPath);
    console.log('docker build -t '+data.name+' .');
    return execCommand('cd '+jsonPath +'; docker build -t '+data.name+' .', 'error in building')
    .then(()=>{
        console.log('docker run -p '+data.port+':'+data.port+' --network host '+data.name);
        execCommand('cd '+jsonPath +'; docker run -p '+data.port+':'+data.port+' --network host '+data.name,'error in running')
    })
    
}

const writeFilePromise = (file, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, error => {
            if (error) reject(error);
            resolve("file created successfully with handcrafted Promise!");
        });
    });
};

e.undeploy = (data) =>{
    console.log('docker rmi -f '+data.name+':latest');
    execCommand('docker rmi -f '+data.name+':latest ','error in undeploy');
}

e.updateDeploy = (oldBody,newBody)=>{
    return execCommand('docker rmi -f '+oldBody.name+':latest ','error in update deploy')
    .then(()=>{
        e.dockerise(newBody);
    })
    
}

function execCommand(command, errMsg) {
	return new Promise((resolve, reject) => {
		exec(command, (_err, _stdout) => {
			if (_err) {
				console.log(`ERROR :: ${command}`);
				console.log(_err);
				return reject(new Error(errMsg));
			}
			console.log(`SUCCESS :: ${command}`);
			console.log(_stdout);
			return resolve(_stdout);
		});
	});
}

module.exports =e;
