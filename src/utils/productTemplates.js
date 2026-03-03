// Product Templates with Print Areas
export const productTemplates = {
  pen: {
    name: "Pen",
    dimensions: { width: 600, height: 150 },
    printAreas: [
      {
        id: "barrel",
        name: "Barrel Print Area",
        x: 80,
        y: 30,
        width: 400,
        height: 50,
        rotation: 0,
        // Approximate print area on pen barrel
        bounds: {
          left: 80,
          top: 30,
          right: 480,
          bottom: 80
        }
      }
    ],
    image: "https://www.carandache.com/products_images/prod_10652/h_stylo-bille-leman-rouge-ecarlate-argente-rhodie-p-intense-et-seduisant-p-caran-d-ache-detail1-0.jpg",
    previewImage: "https://www.carandache.com/products_images/prod_10652/h_stylo-bille-leman-rouge-ecarlate-argente-rhodie-p-intense-et-seduisant-p-caran-d-ache-detail1-0.jpg"
  },
  tshirt: {
    name: "T-Shirt",
    dimensions: { width: 500, height: 600 },
    printAreas: [
      {
        id: "front",
        name: "Front Print Area",
        x: 150,
        y: 200,
        width: 200,
        height: 200,
        bounds: {
          left: 150,
          top: 200,
          right: 350,
          bottom: 400
        }
      },
      {
        id: "back",
        name: "Back Print Area",
        x: 150,
        y: 400,
        width: 200,
        height: 200,
        bounds: {
          left: 150,
          top: 400,
          right: 350,
          bottom: 600
        }
      }
    ],
    image: "/products/tshirt-template.png",
    previewImage: "/products/tshirt-preview.png"
  },
  mug: {
    name: "Mug",
    dimensions: { width: 400, height: 500 },
    printAreas: [
      {
        id: "wrap",
        name: "Wrap Around Area",
        x: 100,
        y: 100,
        width: 200,
        height: 300,
        bounds: {
          left: 100,
          top: 100,
          right: 300,
          bottom: 400
        }
      }
    ],
    image: "/products/mug-template.png",
    previewImage: "/products/mug-preview.png"
  }
};

// Helper function to check if element is within print area
export const isWithinPrintArea = (element, printArea) => {
  const elementBounds = element.getBoundingRect();
  const area = printArea.bounds;
  
  return (
    elementBounds.left >= area.left &&
    elementBounds.top >= area.top &&
    elementBounds.left + elementBounds.width <= area.right &&
    elementBounds.top + elementBounds.height <= area.bottom
  );
};

// Constrain element to print area
export const constrainToPrintArea = (element, printArea) => {
  const bounds = element.getBoundingRect();
  const area = printArea.bounds;
  
  let newLeft = bounds.left;
  let newTop = bounds.top;
  
  // Constrain horizontally
  if (bounds.left < area.left) {
    newLeft = area.left;
  } else if (bounds.left + bounds.width > area.right) {
    newLeft = area.right - bounds.width;
  }
  
  // Constrain vertically
  if (bounds.top < area.top) {
    newTop = area.top;
  } else if (bounds.top + bounds.height > area.bottom) {
    newTop = area.bottom - bounds.height;
  }
  
  element.set({ left: newLeft, top: newTop });
  return element;
};

// Find which print area an element is in
export const findPrintArea = (element, printAreas) => {
  for (const area of printAreas) {
    if (isWithinPrintArea(element, area)) {
      return area;
    }
  }
  return null;
};
