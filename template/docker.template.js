var e ={};
e.docker = (data) =>{
    return `FROM node:8-alpine
    WORKDIR /app
    
    COPY app.js /app
    COPY package.json /app
    RUN npm install
    COPY controller /app/controller
    COPY helper /app/helper
    
    EXPOSE ${data.port}
    
    CMD node app.js`
}

module.exports =e;