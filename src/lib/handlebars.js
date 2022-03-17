const {format} = require('timeago.js')


const helpers = {}

helpers.timeago = (timestam) =>{
    return format(timestam)
}
module.exports =helpers;


