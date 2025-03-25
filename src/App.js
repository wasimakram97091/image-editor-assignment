import React, { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import axios from "axios";

// If API is not working , Replace with your Pexels API key
const API_KEY = "HQp1vLCJWP1Y0SDqKY8c3EquKpJITZjKPpogIVMB02d5zkr7IfzpwQQj";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);

  // Initialize Fabric.js Canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvas.current) {
      fabricCanvas.current = new fabric.Canvas(canvasRef.current);
    }
  }, []);

  // Handle Image Selection
  // const handleImageSelect = (imageURL) => {
  //   setSelectedImage(imageURL);
  //   loadImageToCanvas(imageURL);
  // };

  const handleImageSelect = (imageURL) => {
    setSelectedImage(imageURL);
  };

  // Run loadImageToCanvas only after selectedImage is updated
  useEffect(() => {
    if (selectedImage) {
      loadImageToCanvas(selectedImage);
    }
  }, [selectedImage]);

  // Load Selected Image into Canvas
  const loadImageToCanvas = (imageURL) => {
    console.log(imageURL);

    if (!fabricCanvas.current) return;

    const canvas = fabricCanvas.current;
    canvas.clear(); // Clear previous image before adding a new one

    fabric.Image.fromURL(
      imageURL,
      (img) => {
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const scaleFactor = Math.min(
          canvasWidth / img.width,
          canvasHeight / img.height
        );

        img.set({
          left: 0,
          top: 0,
          scaleX: scaleFactor,
          scaleY: scaleFactor,
          selectable: true,
        });

        canvas.add(img);
        canvas.sendToBack(img);
        canvas.requestRenderAll();
      },
      { crossOrigin: "anonymous" }
    );
  };

  // Fetch Images from Pexels API
  const handleSearch = async () => {
    try {
      const response = await axios.get("https://api.pexels.com/v1/search", {
        headers: { Authorization: API_KEY },
        params: { query: searchQuery, per_page: 4 },
      });
      setImages(response.data.photos.map((photo) => photo.src.medium));
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // Add Editable Text Caption
  const handleAddText = () => {
    if (!fabricCanvas.current) return;
    const text = new fabric.Textbox("Type here...", {
      left: 50,
      top: 50,
      fontSize: 24,
      fill: "white",
      backgroundColor: "black",
      editable: true,
      hasControls: true,
    });

    fabricCanvas.current.add(text);
    fabricCanvas.current.setActiveObject(text);
    fabricCanvas.current.renderAll();
  };

  // Add Shape to Canvas
  const handleAddShape = (shapeType) => {
    if (!fabricCanvas.current) return;

    let shape;
    switch (shapeType) {
      case "circle":
        shape = new fabric.Circle({
          radius: 50,
          fill: "red",
          left: 100,
          top: 100,
        });
        break;
      case "rectangle":
        shape = new fabric.Rect({
          width: 120,
          height: 60,
          fill: "blue",
          left: 100,
          top: 100,
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          width: 100,
          height: 100,
          fill: "green",
          left: 100,
          top: 100,
        });
        break;
      default:
        return;
    }

    fabricCanvas.current.add(shape);
    fabricCanvas.current.renderAll();
  };

  // Download Edited Image
  const handleDownload = () => {
    if (!fabricCanvas.current) return;
    const dataURL = fabricCanvas.current.toDataURL({ format: "png" });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "edited_image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // console.log(selectedImage);
  // console.log("refrence", canvasRef);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Image Editor</h1>
      <h2>Name : Wasim Akram</h2>
      <h2>Email : wasimakram97091@gmail.com</h2>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search images..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.input}
        />
        <button style={styles.button} onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Display Search Results */}
      <div style={styles.imageGrid}>
        {images.map((img, index) => (
          <div key={index} style={styles.imageCard}>
            <img src={img} alt="Search result" style={styles.image} />
            <button
              style={styles.button}
              onClick={() => handleImageSelect(img)}
            >
              Edit Images
            </button>
          </div>
        ))}
      </div>

      {/* Canvas  */}

      <div style={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={500}
          height={400}
          style={{
            ...styles.canvas,
            display: !selectedImage ? "none" : "block",
          }}
        />

        {selectedImage && (
          <div style={styles.buttonGroup}>
            <button style={styles.button} onClick={handleAddText}>
              Add Caption
            </button>
            <button
              style={styles.button}
              onClick={() => handleAddShape("circle")}
            >
              Add Circle
            </button>
            <button
              style={styles.button}
              onClick={() => handleAddShape("rectangle")}
            >
              Add Rectangle
            </button>
            <button
              style={styles.button}
              onClick={() => handleAddShape("triangle")}
            >
              Add Triangle
            </button>
            <button style={styles.downloadButton} onClick={handleDownload}>
              Download Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

//  CSS Styles
const styles = {
  container: {
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    backgroundColor: "#f7f7f7",
    minHeight: "100vh",
  },
  heading: {
    color: "#333",
    fontSize: "28px",
    marginBottom: "20px",
  },
  searchContainer: {
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    width: "250px",
    marginRight: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 15px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
    margin: "5px",
  },
  downloadButton: {
    padding: "10px 15px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#28a745",
    color: "white",
    cursor: "pointer",
    margin: "5px",
  },
  imageGrid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  },
  imageCard: {
    textAlign: "center",
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
  },
  image: {
    width: "150px",
    height: "100px",
    borderRadius: "5px",
  },
  canvasContainer: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
    display: "inline-block",
  },
  canvas: {
    border: "1px solid black",
  },
  buttonGroup: {
    marginTop: "10px",
  },
};
