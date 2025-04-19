import React, { useEffect, useRef } from "react";

const QRCodePattern = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = 50;
    canvas.height = 50;

    // Define colors and styles
    const backgroundColor = ""; // Dark blue background
    const squareColor = "#ff0000"; // Cyan blue for figures
    const glowColor = "rgba(0, 221, 235, 0.5)"; // Glow effect color

    // Grid settings
    const gridSize = 5; // 5x5 grid
    const squareSize = 8; // Size of each rounded square (adjusted for smaller canvas)
    const padding = 2; // Space between figures (scaled down)
    const offsetX = (canvas.width - (gridSize * (squareSize + padding) - padding)) / 2;
    const offsetY = (canvas.height - (gridSize * (squareSize + padding) - padding)) / 2;
    const cornerRadius = 2; // Radius for rounded corners

    // Clear canvas and set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Function to draw a glowing rounded square
    const drawGlowingRoundedSquare = (x, y) => {
      // Create radial gradient for glow effect
      const gradient = ctx.createRadialGradient(
        x + squareSize / 2,
        y + squareSize / 2,
        0,
        x + squareSize / 2,
        y + squareSize / 2,
        squareSize
      );
      gradient.addColorStop(0, squareColor);
      gradient.addColorStop(1, glowColor);

      // Draw the rounded square with glow
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x + cornerRadius, y);
      ctx.lineTo(x + squareSize - cornerRadius, y);
      ctx.arcTo(x + squareSize, y, x + squareSize, y + cornerRadius, cornerRadius);
      ctx.lineTo(x + squareSize, y + squareSize - cornerRadius);
      ctx.arcTo(x + squareSize, y + squareSize, x + squareSize - cornerRadius, y + squareSize, cornerRadius);
      ctx.lineTo(x + cornerRadius, y + squareSize);
      ctx.arcTo(x, y + squareSize, x, y + squareSize - cornerRadius, cornerRadius);
      ctx.lineTo(x, y + cornerRadius);
      ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
      ctx.closePath();
      ctx.fill();

      // Add a subtle inner border for depth
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    // Generate random pattern
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        // Randomly decide whether to draw a rounded square (50% chance)
        if (Math.random() > 0.5) {
          const x = offsetX + col * (squareSize + padding);
          const y = offsetY + row * (squareSize + padding);
          drawGlowingRoundedSquare(x, y);
        }
      }
    }
  }, []); // Empty dependency array to run once on mount

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
     </div>
  );
};

// Inline styles for the container and canvas
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "auto",
    // backgroundColor: "#000",
  },
  canvas: {
    border: "0px solid #333",
  },
};

export default QRCodePattern;