import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import OpenAI from "openai";
import ImageModel from "@/models/image";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MONGO_URI = process.env.MONGO_TEST_URI;

const connectToDatabase = async (): Promise<void> => {
  if (mongoose.connections[0].readyState) return; // Already connected
  if (!MONGO_URI) {
    throw new Error("MongoDB connection URI is not defined");
  } else {
    console.log("MongoDB connection URI is defined");
  }
  await mongoose.connect(MONGO_URI); // Connect to MongoDB
};

 

interface ImageResponse {
  url?: string;
}

export const POST = async (request: NextRequest) => {
  try {
    const { prompt } = await request.json();

    // Ensure database connection
    await connectToDatabase();
    console.log("Connected to the database");

    // Generate image from OpenAI
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrls = response.data
      .filter((image: ImageResponse) => {
        if (image.url === undefined) {
          console.warn("Undefined URL:", image);
        }
        return image.url !== undefined;
      })
      .map((image: ImageResponse) => ({
        url: image.url!,
        prompt,
      }));

    // Save images to MongoDB
    for (const image of imageUrls) {
      console.log("Saving image to DB:", image);
      try {
        await ImageModel.create({
          url: image.url,
          prompt: image.prompt,
        });
      } catch (err) {
        console.error("Error saving image:", err);
      }
    }

    return NextResponse.json({
      message: "Image generated and saved",
      images: imageUrls,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json({ message: "Request error", error });
  }
};

export const GET = async () => {
  try {
    // Ensure database connection
    await connectToDatabase();

    // Fetch all generated images from MongoDB
    const images = await ImageModel.find().sort({ createdAt: -1 }); // Sort by most recent

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({ message: "Error fetching images", error });
  }
};
