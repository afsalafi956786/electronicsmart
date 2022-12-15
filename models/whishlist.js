const mongoose=require('mongoose');
const schema=mongoose.Schema

const wishlistSchema = new mongoose.Schema({
    user:{type:mongoose.Types.ObjectId,
    ref:'user',
    required:true
    },
    products:[{
        item:{type: mongoose.Types.ObjectId,
        ref:'products',
        required: true
     },
        }],

},
{
  timestamps:true,
}
);

const wishlistModel = mongoose.model("wishlist",wishlistSchema)
module.exports = wishlistModel