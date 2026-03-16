/**
 * Product Print Area Coordinates Configuration
 * 
 * This file defines the print area coordinates for each product category.
 * You can easily add or modify print areas by editing the coordinates below.
 * 
 * Structure:
 * - Categories are organized by product type (e.g., "pens", "tshirts", "mugs")
 * - Each product has dimensions (width, height) and printAreas array
 * - Each print area has: id, name, x, y, width, height, and calculated bounds
 * 
 * Coordinates are in pixels and relative to the product image dimensions.
 */

export const productPrintAreas = {
  // Pen Category
  pens: {
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
          bounds: {
            left: 80,
            top: 30,
            right: 480,
            bottom: 80
          }
        }
      ]
    },
    // Add more pen types here
    // customPen: { ... }
  },

  // T-Shirt Category
  tshirts: {
    tshirt: {
      name: "T-Shirt",
      dimensions: { width: 500, height: 500 }, // Match actual image dimensions (500x500 transparent PNG)
      printAreas: [
        {
          id: "front",
          name: "Front Print Area",
          x: 200,        // Centered: (500 - 100) / 2 = 200
          y: 220,        // Chest area position (below neckline, centered on chest)
          width: 100,    // Print area width: 100px (chest area)
          height: 100,   // Print area height: 100px (square print area)
          bounds: {
            left: 200,
            top: 220,
            right: 300,  // 200 + 100
            bottom: 320  // 220 + 100
          }
        }
      ]
    },
    // Add more t-shirt types here
    // polo: { ... }
    // hoodie: { ... }
  },

  // Mug Category
  mugs: {
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
      ]
    },
    // Add more mug types here
    // travelMug: { ... }
  },

  // Business Cards Category
  businessCards: {
    "business-card": {
      name: "Business Card",
      dimensions: { width: 350, height: 200 },
      printAreas: [
        {
          id: "front",
          name: "Front Print Area",
          x: 20,
          y: 20,
          width: 310,
          height: 160,
          bounds: {
            left: 20,
            top: 20,
            right: 330,
            bottom: 180
          }
        }
      ]
    }
  },

  // Add more categories here
  // banners: { ... }
  // signs: { ... }
  // stickers: { ... }
};

/**
 * Helper function to get print areas for a product by category and type
 * @param {string} category - The product category (e.g., "pens", "tshirts")
 * @param {string} productType - The product type (e.g., "pen", "tshirt")
 * @returns {Object|null} - Product configuration with print areas or null if not found
 */
export const getProductPrintAreas = (category, productType) => {
  // Normalize category and productType to lowercase
  const normalizedCategory = category?.toLowerCase().trim();
  const normalizedType = productType?.toLowerCase().trim();

  // Helper to pluralize/singularize for matching
  const pluralize = (str) => {
    if (str.endsWith('s')) return str;
    return str + 's';
  };
  const singularize = (str) => {
    if (str.endsWith('s')) return str.slice(0, -1);
    return str;
  };

  // Try exact match first
  if (normalizedCategory && productPrintAreas[normalizedCategory]) {
    const categoryProducts = productPrintAreas[normalizedCategory];
    if (categoryProducts[normalizedType]) {
      return categoryProducts[normalizedType];
    }
  }

  // Try pluralized/singularized category match
  if (normalizedCategory) {
    const pluralCategory = pluralize(normalizedCategory);
    const singularCategory = singularize(normalizedCategory);
    
    // Try plural form
    if (productPrintAreas[pluralCategory]) {
      const categoryProducts = productPrintAreas[pluralCategory];
      if (categoryProducts[normalizedType]) {
        return categoryProducts[normalizedType];
      }
    }
    
    // Try singular form
    if (productPrintAreas[singularCategory]) {
      const categoryProducts = productPrintAreas[singularCategory];
      if (categoryProducts[normalizedType]) {
        return categoryProducts[normalizedType];
      }
    }
  }

  // Fallback: search all categories for the product type
  for (const catKey in productPrintAreas) {
    const categoryProducts = productPrintAreas[catKey];
    if (categoryProducts[normalizedType]) {
      return categoryProducts[normalizedType];
    }
  }

  // If not found, return null
  return null;
};

/**
 * Helper function to get all products in a category
 * @param {string} category - The product category
 * @returns {Object} - Object containing all products in the category
 */
export const getCategoryProducts = (category) => {
  const normalizedCategory = category?.toLowerCase();
  return productPrintAreas[normalizedCategory] || {};
};

/**
 * Helper function to validate print area coordinates
 * @param {Object} printArea - Print area object to validate
 * @param {Object} dimensions - Product dimensions { width, height }
 * @returns {Object} - Validated print area with calculated bounds
 */
export const validatePrintArea = (printArea, dimensions) => {
  const { x, y, width, height } = printArea;

  // Validate coordinates are within product dimensions
  const validatedX = Math.max(0, Math.min(x, dimensions.width));
  const validatedY = Math.max(0, Math.min(y, dimensions.height));
  const validatedWidth = Math.max(0, Math.min(width, dimensions.width - validatedX));
  const validatedHeight = Math.max(0, Math.min(height, dimensions.height - validatedY));

  // Calculate bounds
  const bounds = {
    left: validatedX,
    top: validatedY,
    right: validatedX + validatedWidth,
    bottom: validatedY + validatedHeight
  };

  return {
    ...printArea,
    x: validatedX,
    y: validatedY,
    width: validatedWidth,
    height: validatedHeight,
    bounds
  };
};

/**
 * Helper function to calculate print areas for dynamic images
 * Creates a print area that covers most of the image with a margin
 * @param {number} imageWidth - Width of the image
 * @param {number} imageHeight - Height of the image
 * @param {number} marginPercent - Margin percentage (default: 2%)
 * @returns {Array} - Array of print area objects
 */
export const calculateDynamicPrintAreas = (imageWidth, imageHeight, marginPercent = 2) => {
  const marginX = (imageWidth * marginPercent) / 100;
  const marginY = (imageHeight * marginPercent) / 100;
  const printAreaWidth = imageWidth - (marginX * 2);
  const printAreaHeight = imageHeight - (marginY * 2);

  return [
    {
      id: 'main',
      name: 'Main Print Area',
      x: marginX,
      y: marginY,
      width: printAreaWidth,
      height: printAreaHeight,
      bounds: {
        left: marginX,
        top: marginY,
        right: marginX + printAreaWidth,
        bottom: marginY + printAreaHeight
      }
    }
  ];
};
