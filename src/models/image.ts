import mongoose, { Schema, Document } from "mongoose";

interface Image extends Document {
  url: string;
  prompt: string;
}

const ImageSchema = new Schema<Image>({
  url: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
});

const ImageModel = mongoose.models.Image || mongoose.model<Image>("Image", ImageSchema);

export default ImageModel;
