import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true }, // ou si tu veux faire une référence à l'utilisateur : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  image: { type: String }, // URL d'une image illustrant l'article
  //image: String ,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

export default BlogPost;
