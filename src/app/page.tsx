"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<{ url: string; prompt: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);  

  // Fetch all stored images on page load
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("api/generator", { method: "GET" });
        const data = await response.json();
        if (data.images) {
          setImages(data.images);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  // Generate a new image
  const generateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await fetch("api/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.images) setImages((prev) => [...data.images, ...prev]);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open selected image in modal
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  // Handle image download
  const downloadImage = (imageUrl: string) => {
    try {
      // Open the image URL in a new tab
      window.open(imageUrl, '_blank');
    } catch (error) {
      console.error("Error opening the image:", error);
    }
  };
  
  
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-8 transition duration-300">
      <header className="flex flex-col items-center mb-8 animate-fade-in">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
          AI Image Generator
        </h1>
      </header>

      <main className="w-full max-w-2xl flex flex-col items-center gap-8 animate-fade-in-up">
        {/* Prompt Input and Generate Button */}
        <div className="flex flex-col items-center w-full">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to generate an image"
            className="text-black w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition duration-200"
          />
          <button
            onClick={generateImage}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition duration-300 transform hover:scale-105"
          >
            {loading ? "Generating..." : "Generate Image"}
          </button>
        </div>

        {/* Generated Images Section */}
        <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 animate-fade-in-up">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg shadow-xl bg-white dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:shadow-2xl"
            >
              <Image
                src={image.url}
                alt={image.prompt}
                className="w-full h-64 object-cover transition-transform duration-300 cursor-pointer"
                onClick={() => openImageModal(image.url)} // Open image in modal on click
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-sm p-4 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out">
                {image.prompt}
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* All Saved Images Section */}
      <footer className="w-full max-w-5xl mt-12 animate-fade-in-up">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
          All Generated Images
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg shadow-xl bg-white dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:shadow-2xl"
            >
              <Image
                src={image.url}
                alt={image.prompt}
                className="w-full h-40 object-cover transition-transform duration-300 cursor-pointer"
                onClick={() => openImageModal(image.url)} // Open image in modal on click
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out">
                {image.prompt}
              </div>
            </div>
          ))}
        </div>
      </footer>

      {/* Modal for Full Image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal} // Close modal when clicked outside
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside the modal
          >
            <div className="relative">
              <Image
                src={selectedImage}
                alt="Full Size"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <button
                className="absolute top-4 right-4 text-white bg-blue-600 p-2 rounded-md shadow-lg hover:bg-blue-700 transition duration-200"
                onClick={() => downloadImage(selectedImage)} // Trigger download on click
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
