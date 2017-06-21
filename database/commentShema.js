var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentShema = new Schema ({
//  imgPath : {type : String , require : true },
  filename : {type : String , require : true },
  body : {type : String , require : true },
  author : {type : String , require : true },
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Commentaire',commentShema);
