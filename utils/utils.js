var fs = require('fs')

function updateConfigFile(newFile){
    fs.writeFile('config.json',JSON.stringify(newFile), (err) => {
        console.log(err)
    })
}

module.exports = {
    updateConfigFile: updateConfigFile
}