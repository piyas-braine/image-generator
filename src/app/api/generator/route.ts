 
import { NextResponse } from "next/server";
 

import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    
});
 
const generatedImages: { url: string; prompt: string }[] = [];



export const POST = async (request: Request) => {
  try {
    const { prompt } = await request.json();

    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrls = response.data
      .filter((image: { url?: string }) => image.url !== undefined)
      .map((image: { url?: string }) => ({
        url: image.url as string,
        prompt,
      }));

    generatedImages.push(...imageUrls);

    return NextResponse.json({ message: "Image generated", images: imageUrls });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json({ message: "Request error", error });
  }
};

export const GET = () => {
  return NextResponse.json({ images: generatedImages });
};

