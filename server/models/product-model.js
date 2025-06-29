const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true
  },
  expire:{
    type:string
  },
  specification:{
    type:string
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: 0,
  },
  stock: {
    type: Number,
    required: [true, "Product stock is required"],
    default: 0,
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
  },
  brand: {
    type: String,
  },
  size:{
    type:String
  },
  primaryImg:{
    url: {
        type: String,
        required: true,
      },
     publicId:{
            type:String,
        }
  },
  images: [
    {
      url: {
        type: String,
       
      },
        publicId:{
            type:String,
        },
      altText: String
    }
  ],
  ratings: {
    type: Number,
    default: 0,
  },
  
  reviews: [reviewSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);