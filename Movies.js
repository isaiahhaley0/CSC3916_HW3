var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

//connect method
//mongoose.connect(process.env.DB, { useNewUrlParser: true });
try {
    mongoose.connect( process.env.MONGODB_URI, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);


var MovieSchema = new Schema({
    title: { type: String},
    year: {type: Number, min:[1900, 'Must be greater than 1899'], max:[2100,'Must be less than 2100'], required: true },
    genre: { type:String},
    actors: [{ actorName: String, characterName: String}]
});
MovieSchema.methods.find = function (err, movies)
{

  return movies

}


//return the model to server
module.exports = mongoose.model('Movie', MovieSchema);