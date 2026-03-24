import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import QRCode from 'qrcode';
import { productTemplates, findPrintArea, constrainToPrintArea } from '../utils/productTemplates';
import { getProductPrintAreas, validatePrintArea, calculateDynamicPrintAreas } from '../config/productPrintAreas';

import { useNavigate, useLocation } from 'react-router-dom';

const ProductDesigner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get props from location state or use defaults
  const productType = location.state?.productType || 'pen';
  const productCategory = location.state?.productCategory || null;
  const uploadedImage = location.state?.uploadedImage || null;
  const canvasRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState('select');
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('text'); // uploads | text | color | qr | elements
  const [elementsUpdate, setElementsUpdate] = useState(0); // Force re-render of elements list
  const [showAllSocials, setShowAllSocials] = useState(false);
  const [showAllEmojis, setShowAllEmojis] = useState(false);
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [showAllShapes, setShowAllShapes] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [qrText, setQrText] = useState('');
  const [qrSize, setQrSize] = useState(160);
  const [qrColor, setQrColor] = useState('#000000');
  const [selectedObject, setSelectedObject] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [currentProductType, setCurrentProductType] = useState(productType);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [dynamicPrintAreas, setDynamicPrintAreas] = useState([]);
  
  // Get print areas from new config based on category, fallback to old templates
  // Normalize category - handle t-shirt variations
  let category = productCategory || currentProductType;
  if (category) {
    category = category.toLowerCase().trim();
    // Handle t-shirt category variations
    if (category === 'tshirt' || category === 't-shirt' || category === 't shirt') {
      category = 'tshirts'; // Use plural form to match config
    }
  }
  const configPrintAreas = getProductPrintAreas(category, currentProductType);
  const productTemplate = configPrintAreas 
    ? { 
        ...configPrintAreas, 
        dimensions: configPrintAreas.dimensions || { width: 500, height: 600 },
        printAreas: configPrintAreas.printAreas?.map(area => validatePrintArea(area, configPrintAreas.dimensions)) || []
      }
    : (productTemplates[currentProductType] || productTemplates.pen);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Use image dimensions if available, otherwise use template dimensions
    const canvasWidth = imageDimensions?.width || productTemplate.dimensions.width;
    const canvasHeight = imageDimensions?.height || productTemplate.dimensions.height;

    // If canvas already exists, check if we need to resize or recreate
    if (canvas) {
      const currentWidth = canvas.getWidth();
      const currentHeight = canvas.getHeight();
      
      // If dimensions match, just resize the canvas without recreating
      if (currentWidth === canvasWidth && currentHeight === canvasHeight) {
        return;
      }
      
      // If dimensions changed, resize the canvas
      try {
        if (canvasRef.current && canvasRef.current.parentNode) {
          canvas.setDimensions({
            width: canvasWidth,
            height: canvasHeight
          });
          canvas.renderAll();
            return;
        }
      } catch (error) {
        console.error('Error resizing canvas:', error);
        // If resize fails, dispose and recreate
        try {
          if (canvasRef.current && canvasRef.current.parentNode) {
            canvas.dispose();
          }
        } catch (disposeError) {
          console.error('Error disposing canvas:', disposeError);
        }
      }
    }

    // Create new canvas with optimized settings for smooth dragging
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: null, // Transparent background to preserve transparency in exports
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      skipTargetFind: false,
      // Enable smooth interactions
      enableRetinaScaling: true,
      // Performance optimizations
      stateful: false
    });

    // Only load product base image if no uploaded image is provided
    // The uploaded image (product image) will be loaded separately
    if (!uploadedImage) {
      // Create a simple background placeholder if no image is provided
      const placeholder = new fabric.Rect({
        width: productTemplate.dimensions.width,
        height: productTemplate.dimensions.height,
        fill: '#f5f5f5',
        selectable: false,
        evented: false,
        name: 'product-placeholder'
      });
      fabricCanvas.add(placeholder);
      fabricCanvas.sendToBack(placeholder);
    }

    // Don't draw print area guides here if we have an uploaded image
    // They will be drawn in the image loading useEffect
    if (!uploadedImage) {
      // Draw print area guides - use dynamic print areas if available, otherwise use template
      const printAreasToUse = dynamicPrintAreas.length > 0 ? dynamicPrintAreas : productTemplate.printAreas;
      
      printAreasToUse.forEach((area) => {
      const guide = new fabric.Rect({
        left: area.bounds.left,
        top: area.bounds.top,
        width: area.bounds.right - area.bounds.left,
        height: area.bounds.bottom - area.bounds.top,
        fill: 'rgba(0, 255, 0, 0.1)',
        stroke: '#00ff00',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        name: `print-area-${area.id}`,
        excludeFromExport: true
      });
      fabricCanvas.add(guide);
      fabricCanvas.sendToBack(guide);
    });
    }

    // Handle object movement - make dragging smooth and optionally constrain to print area
    const printAreasForConstraints = dynamicPrintAreas.length > 0 ? dynamicPrintAreas : productTemplate.printAreas;
    let renderRequestId = null;
    
    // Helper function to check if object is within print area bounds
    const isObjectWithinPrintArea = (obj, printAreas) => {
      if (!printAreas || printAreas.length === 0) return true;
      
      // Skip base image and print area guides
      if (obj.name === 'product-base-image' || (obj.name && obj.name.startsWith('print-area-'))) {
        return true;
      }
      
      const objBounds = obj.getBoundingRect();
      const objLeft = objBounds.left;
      const objTop = objBounds.top;
      const objRight = objBounds.left + objBounds.width;
      const objBottom = objBounds.top + objBounds.height;
      
      // Check if object overlaps with any print area
      for (const area of printAreas) {
        const areaBounds = area.bounds || {
          left: area.x,
          top: area.y,
          right: area.x + area.width,
          bottom: area.y + area.height
        };
        
        // Check if object center is within print area bounds
        const centerX = (objLeft + objRight) / 2;
        const centerY = (objTop + objBottom) / 2;
        
        if (centerX >= areaBounds.left && centerX <= areaBounds.right &&
            centerY >= areaBounds.top && centerY <= areaBounds.bottom) {
          // Also check if most of the object is within bounds (at least 50% of width/height)
          const objWidth = objRight - objLeft;
          const objHeight = objBottom - objTop;
          const widthInBounds = Math.min(objRight, areaBounds.right) - Math.max(objLeft, areaBounds.left);
          const heightInBounds = Math.min(objBottom, areaBounds.bottom) - Math.max(objTop, areaBounds.top);
          
          if (widthInBounds >= objWidth * 0.5 && heightInBounds >= objHeight * 0.5) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    // Enable smooth rendering during movement with optimized rendering
    fabricCanvas.on('object:moving', (e) => {
      const obj = e.target;
      
      // Skip base image and print area guides
      if (obj.name === 'product-base-image' || (obj.name && obj.name.startsWith('print-area-'))) {
        return;
      }
      
      // Check if object is within print area and change cursor accordingly
      const isWithinBounds = isObjectWithinPrintArea(obj, printAreasForConstraints);
      
      if (isWithinBounds) {
        fabricCanvas.defaultCursor = 'move';
        fabricCanvas.hoverCursor = 'move';
        if (fabricCanvas.upperCanvasEl) {
          fabricCanvas.upperCanvasEl.style.cursor = 'move';
        }
        if (fabricCanvas.lowerCanvasEl) {
          fabricCanvas.lowerCanvasEl.style.cursor = 'move';
        }
      } else {
        fabricCanvas.defaultCursor = 'not-allowed';
        fabricCanvas.hoverCursor = 'not-allowed';
        if (fabricCanvas.upperCanvasEl) {
          fabricCanvas.upperCanvasEl.style.cursor = 'not-allowed';
        }
        if (fabricCanvas.lowerCanvasEl) {
          fabricCanvas.lowerCanvasEl.style.cursor = 'not-allowed';
        }
      }
      
      // Use requestAnimationFrame for smooth rendering
      if (renderRequestId) {
        cancelAnimationFrame(renderRequestId);
      }
      renderRequestId = requestAnimationFrame(() => {
        if (fabricCanvas) {
        fabricCanvas.renderAll();
        }
        renderRequestId = null;
      });
    });

    // Handle object modified (after movement) - final constraint check
    fabricCanvas.on('object:modified', (e) => {
      const obj = e.target;
      
      // Reset cursor to default
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.hoverCursor = 'move';
      if (fabricCanvas.upperCanvasEl) {
        fabricCanvas.upperCanvasEl.style.cursor = 'default';
      }
      if (fabricCanvas.lowerCanvasEl) {
        fabricCanvas.lowerCanvasEl.style.cursor = 'default';
      }
      
      // Only constrain if print areas exist
      if (printAreasForConstraints.length > 0) {
        const printArea = findPrintArea(obj, printAreasForConstraints);
      if (printArea) {
        constrainToPrintArea(obj, printArea);
        }
      }
    });
    
    // Handle mouse move to show error cursor when hovering outside print area
    fabricCanvas.on('mouse:move', (e) => {
      const activeObject = fabricCanvas.getActiveObject();
      
      // Only show error cursor if an object is selected and being moved
      if (activeObject && activeObject !== e.target) {
        // Check if the active object would be outside bounds at current mouse position
        const pointer = fabricCanvas.getPointer(e.e);
        const isWithinBounds = isObjectWithinPrintArea(activeObject, printAreasForConstraints);
        
        if (!isWithinBounds && printAreasForConstraints.length > 0) {
          fabricCanvas.defaultCursor = 'not-allowed';
          fabricCanvas.hoverCursor = 'not-allowed';
          if (fabricCanvas.upperCanvasEl) {
            fabricCanvas.upperCanvasEl.style.cursor = 'not-allowed';
          }
        } else {
          fabricCanvas.defaultCursor = 'move';
          fabricCanvas.hoverCursor = 'move';
          if (fabricCanvas.upperCanvasEl) {
            fabricCanvas.upperCanvasEl.style.cursor = 'move';
          }
        }
      }
    });

    // Handle object selection
    fabricCanvas.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
    });

    fabricCanvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected[0]);
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Enable text editing on double-click
    fabricCanvas.on('mouse:dblclick', (e) => {
      const obj = e.target;
      if (obj && obj.type === 'text') {
        obj.enterEditing();
        fabricCanvas.renderAll();
      }
    });

    // Update selected object when text is modified
    fabricCanvas.on('text:changed', (e) => {
      if (e.target === selectedObject) {
        setSelectedObject(e.target);
      }
    });

    // Save state for undo/redo
    const saveState = () => {
      const json = JSON.stringify(fabricCanvas.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(json);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    };

    fabricCanvas.on('object:added', () => {
      saveState();
      setElementsUpdate(prev => prev + 1); // Update elements list
    });
    fabricCanvas.on('object:removed', () => {
      saveState();
      setElementsUpdate(prev => prev + 1); // Update elements list
    });
    fabricCanvas.on('object:modified', () => {
      saveState();
      setElementsUpdate(prev => prev + 1); // Update elements list
    });

    setCanvas(fabricCanvas);

    return () => {
      // Only dispose if canvas still exists and element is still in DOM
      if (fabricCanvas) {
        try {
          // Check if the canvas element still exists in the DOM
          if (canvasRef.current && canvasRef.current.parentNode) {
      fabricCanvas.dispose();
          } else {
            // If element is not in DOM, just clear the canvas state
            try {
              fabricCanvas.clear();
            } catch (clearError) {
              // Ignore clear errors
            }
          }
        } catch (error) {
          // Silently handle disposal errors - canvas might already be disposed
          console.warn('Canvas disposal warning (this is usually safe to ignore):', error.message);
        }
      }
    };
  }, [currentProductType, imageDimensions, dynamicPrintAreas]);

  // Load uploaded image (product image) as the base image if provided
  useEffect(() => {
    if (!uploadedImage) return;
    
    // Create a temporary image to get dimensions first
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    
    tempImg.onload = () => {
      const imgWidth = tempImg.width;
      const imgHeight = tempImg.height;
      
      // Set canvas to a smaller size to fit better on screen (max 500px width, maintain aspect ratio)
      const maxCanvasWidth = 500;
      const maxCanvasHeight = 600;
      let canvasWidth = imgWidth;
      let canvasHeight = imgHeight;
      
      // Scale down if image is too large
      if (imgWidth > maxCanvasWidth || imgHeight > maxCanvasHeight) {
        const scale = Math.min(maxCanvasWidth / imgWidth, maxCanvasHeight / imgHeight);
        canvasWidth = imgWidth * scale;
        canvasHeight = imgHeight * scale;
      }
      
      // Store canvas dimensions (not original image dimensions)
      setImageDimensions({ width: canvasWidth, height: canvasHeight });
      
      // Normalize category for print area lookup
      let normalizedCategory = category || currentProductType;
      if (normalizedCategory) {
        normalizedCategory = normalizedCategory.toLowerCase().trim();
        // Handle t-shirt category variations
        if (normalizedCategory === 'tshirt' || normalizedCategory === 't-shirt' || normalizedCategory === 't shirt') {
          normalizedCategory = 'tshirts'; // Use plural form to match config
        }
      }
      
      // Check if we have configured print areas for this product type
      const configAreas = getProductPrintAreas(normalizedCategory, currentProductType);
      
      // Debug logging
      console.log('Print Area Debug:', {
        originalCategory: category,
        normalizedCategory,
        currentProductType,
        configAreas: configAreas ? 'Found' : 'Not Found',
        imageDimensions: { width: canvasWidth, height: canvasHeight }
      });
      
      let calculatedPrintAreas;
      if (configAreas && configAreas.printAreas && configAreas.printAreas.length > 0) {
        // Use configured print areas, but scale them to match canvas dimensions
        const scaleX = canvasWidth / configAreas.dimensions.width;
        const scaleY = canvasHeight / configAreas.dimensions.height;
        
        calculatedPrintAreas = configAreas.printAreas.map(area => {
          const scaledArea = {
            ...area,
            x: area.x * scaleX,
            y: area.y * scaleY,
            width: area.width * scaleX,
            height: area.height * scaleY,
            bounds: {
              left: area.bounds.left * scaleX,
              top: area.bounds.top * scaleY,
              right: area.bounds.right * scaleX,
              bottom: area.bounds.bottom * scaleY
            }
          };
          return validatePrintArea(scaledArea, { width: canvasWidth, height: canvasHeight });
        });
      } else {
        // Fallback: Use dynamic calculation for products without configured print areas
        calculatedPrintAreas = calculateDynamicPrintAreas(canvasWidth, canvasHeight, 2);
      }
      
      setDynamicPrintAreas(calculatedPrintAreas);
    };
    
    tempImg.onerror = () => {
      console.error('Failed to load image for dimension calculation');
    };
    
    tempImg.src = uploadedImage;
  }, [uploadedImage]);

  // Load the image into canvas once canvas and dimensions are ready
  useEffect(() => {
    if (!uploadedImage || !canvas || !imageDimensions) return;
    
    // Check if canvas is still valid and element exists
    if (!canvasRef.current || !canvasRef.current.parentNode) {
      return;
    }

    // Ensure canvas dimensions match image dimensions
    try {
      const currentWidth = canvas.getWidth();
      const currentHeight = canvas.getHeight();
      if (currentWidth !== imageDimensions.width || currentHeight !== imageDimensions.height) {
        if (canvasRef.current && canvasRef.current.parentNode) {
          canvas.setDimensions({
            width: imageDimensions.width,
            height: imageDimensions.height
          });
        }
      }
    } catch (error) {
      console.error('Error setting canvas dimensions:', error);
      return;
    }

    // Check if canvas is still valid before proceeding
    if (!canvas || !canvasRef.current || !canvasRef.current.parentNode) {
      return;
    }

    try {
      // Remove any existing placeholder or base image
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        if (obj.name === 'product-placeholder' || obj.name === 'product-base' || obj.name === 'product-base-image') {
          canvas.remove(obj);
        }
      });

      // Remove old print area guides
      const oldGuides = canvas.getObjects().filter(obj => obj.name?.startsWith('print-area-'));
      oldGuides.forEach(guide => canvas.remove(guide));

      // Load the image into fabric
      fabric.Image.fromURL(
        uploadedImage,
        (fabricImg) => {
          // Check if canvas is still valid
          if (!canvas || !canvasRef.current || !canvasRef.current.parentNode) {
            return;
          }

          if (!fabricImg) {
            console.error('Failed to load fabric image');
            return;
          }

          // Check if image already exists to avoid duplicates
          const existingBase = canvas.getObjects().find(obj => obj.name === 'product-base-image');
          if (existingBase) {
            canvas.remove(existingBase);
          }

          // Scale image to fit canvas dimensions
          const scaleX = imageDimensions.width / fabricImg.width;
          const scaleY = imageDimensions.height / fabricImg.height;
          const scale = Math.min(scaleX, scaleY);
          
          fabricImg.set({
            left: 0,
            top: 0,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            name: 'product-base-image',
            excludeFromExport: false, // Ensure base image is included in export
            visible: true // Ensure it's visible
          });
          
          canvas.add(fabricImg);
          canvas.sendToBack(fabricImg);
          
          // Add print area guides after image is loaded (make them visible on top of image)
          if (dynamicPrintAreas.length > 0) {
            // Remove existing print area guides first
            const existingGuides = canvas.getObjects().filter(obj => obj.name && obj.name.startsWith('print-area-'));
            existingGuides.forEach(guide => canvas.remove(guide));
            
            dynamicPrintAreas.forEach((area) => {
              const guide = new fabric.Rect({
                left: area.bounds.left,
                top: area.bounds.top,
                width: area.bounds.right - area.bounds.left,
                height: area.bounds.bottom - area.bounds.top,
                fill: 'rgba(0, 255, 0, 0.15)',
                stroke: '#00ff00',
                strokeWidth: 3,
                strokeDashArray: [8, 4],
                selectable: false,
                evented: false,
                name: `print-area-${area.id}`,
                excludeFromExport: true,
                opacity: 0.8
              });
              canvas.add(guide);
              // Keep guides above the base image but below user elements
              canvas.bringToFront(guide);
            });
          }
          
          canvas.renderAll();
        },
        { crossOrigin: 'anonymous' }
      );
    } catch (error) {
      console.error('Error loading image into canvas:', error);
    }
  }, [uploadedImage, canvas, imageDimensions, dynamicPrintAreas]);

  // Handle panning when hand tool is active
  useEffect(() => {
    if (!canvas) return;

    let isDragging = false;
    let lastPanX = 0;
    let lastPanY = 0;

    const handleMouseDown = (e) => {
      // Only handle pan if pan tool is active
      if (activeTool === 'pan') {
        e.e.preventDefault();
        e.e.stopPropagation();
        isDragging = true;
        setIsPanning(true);
        
        // Use screen coordinates for smooth panning
        lastPanX = e.e.clientX;
        lastPanY = e.e.clientY;
        
        // Deselect any active objects when starting to pan
        canvas.discardActiveObject();
        canvas.renderAll();
        
        canvas.defaultCursor = 'grabbing';
        canvas.hoverCursor = 'grabbing';
        canvas.selection = false;
        if (canvas.upperCanvasEl) {
          canvas.upperCanvasEl.style.cursor = 'grabbing';
        }
        if (canvas.lowerCanvasEl) {
          canvas.lowerCanvasEl.style.cursor = 'grabbing';
        }
      }
    };

    const handleMouseMove = (e) => {
      if (activeTool === 'pan') {
        if (isDragging) {
          e.e.preventDefault();
          e.e.stopPropagation();
          
          // Calculate delta in screen coordinates
          const deltaX = e.e.clientX - lastPanX;
          const deltaY = e.e.clientY - lastPanY;
          
          // Update viewport transform
          const vpt = canvas.viewportTransform;
          vpt[4] += deltaX;
          vpt[5] += deltaY;
          
          // Update last position
          lastPanX = e.e.clientX;
          lastPanY = e.e.clientY;
          
          // Render with requestAnimationFrame for smoothness
          canvas.requestRenderAll();
        } else {
          // Show grab cursor when hovering
          canvas.defaultCursor = 'grab';
          canvas.hoverCursor = 'grab';
          if (canvas.upperCanvasEl) {
            canvas.upperCanvasEl.style.cursor = 'grab';
          }
          if (canvas.lowerCanvasEl) {
            canvas.lowerCanvasEl.style.cursor = 'grab';
          }
        }
      }
    };

    const handleMouseUp = (e) => {
      if (activeTool === 'pan' && isDragging) {
        e.e.preventDefault();
        e.e.stopPropagation();
        isDragging = false;
        setIsPanning(false);
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
        if (canvas.upperCanvasEl) {
          canvas.upperCanvasEl.style.cursor = 'grab';
        }
        if (canvas.lowerCanvasEl) {
          canvas.lowerCanvasEl.style.cursor = 'grab';
        }
      }
    };

    // Also handle mouse leave to reset dragging state
    const handleMouseLeave = () => {
      if (isDragging) {
        isDragging = false;
        setIsPanning(false);
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
        if (canvas.upperCanvasEl) {
          canvas.upperCanvasEl.style.cursor = 'grab';
        }
        if (canvas.lowerCanvasEl) {
          canvas.lowerCanvasEl.style.cursor = 'grab';
        }
      }
    };

    // Disable object selection when pan tool is active
    if (activeTool === 'pan') {
      canvas.selection = false;
      canvas.defaultCursor = 'grab';
      canvas.hoverCursor = 'grab';
      if (canvas.upperCanvasEl) {
        canvas.upperCanvasEl.style.cursor = 'grab';
      }
      if (canvas.lowerCanvasEl) {
        canvas.lowerCanvasEl.style.cursor = 'grab';
      }
    } else {
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
      if (canvas.upperCanvasEl) {
        canvas.upperCanvasEl.style.cursor = 'default';
      }
      if (canvas.lowerCanvasEl) {
        canvas.lowerCanvasEl.style.cursor = 'default';
      }
    }

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('mouse:out', handleMouseLeave);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('mouse:out', handleMouseLeave);
    };
  }, [canvas, activeTool]);

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' 
      ? Math.min(zoom + 10, 200) 
      : Math.max(zoom - 10, 25);
    
    setZoom(newZoom);
    if (canvas) {
      const zoomRatio = newZoom / 100;
      const center = canvas.getCenter();
      
      // Apply zoom
      canvas.setZoom(zoomRatio);
      
      // Adjust viewport to keep content centered and visible
      const vpt = canvas.viewportTransform;
      const canvasEl = canvas.getElement();
      const canvasWidth = canvasEl.width;
      const canvasHeight = canvasEl.height;
      
      // Center the viewport after zoom
      vpt[4] = (canvasWidth / 2) - (center.left * zoomRatio);
      vpt[5] = (canvasHeight / 2) - (center.top * zoomRatio);
      
      canvas.renderAll();
    }
  };

  const addText = () => {
    if (!canvas || !textInput.trim()) return;

    const printAreasToUse = dynamicPrintAreas.length > 0 ? dynamicPrintAreas : productTemplate.printAreas;
    const printArea = printAreasToUse[0];
    
    if (!printArea) return;
    
    const text = new fabric.Text(textInput, {
      left: printArea.bounds.left + 10,
      top: printArea.bounds.top + 10,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: textColor,
      editable: true, // Enable text editing
      name: 'user-text',
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockUniScaling: false,
      transparentCorners: false,
      cornerColor: '#4285f4',
      cornerSize: 10,
      borderColor: '#4285f4',
      borderScaleFactor: 1.5,
      padding: 5,
      perPixelTargetFind: true,
      // Optimize for smooth dragging
      objectCaching: false,
      statefullCache: false,
      noScaleCache: false,
      // Cursor settings
      moveCursor: 'move',
      hoverCursor: 'move',
      // Enable free movement
      lockMovementX: false,
      lockMovementY: false,
      // Text editing settings
      editingBorderColor: '#4285f4',
      // No background for text
      textBackgroundColor: 'transparent'
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setTextInput('');
    setActiveTool('select');
  };

  // Text toolbar helpers
  const handleFontFamilyChange = (family) => {
    setFontFamily(family);
    if (selectedObject && selectedObject.type === 'text' && canvas) {
      selectedObject.set('fontFamily', family);
      canvas.renderAll();
    }
  };

  const changeFontSizeStep = (delta) => {
    setFontSize((prev) => {
      const next = Math.min(72, Math.max(8, prev + delta));
      if (selectedObject && selectedObject.type === 'text' && canvas) {
        selectedObject.set('fontSize', next);
        canvas.renderAll();
      }
      return next;
    });
  };

  const toggleTextStyle = (style) => {
    if (!selectedObject || selectedObject.type !== 'text' || !canvas) return;
    if (style === 'bold') {
      const current = selectedObject.fontWeight === 'bold' ? 'normal' : 'bold';
      selectedObject.set('fontWeight', current);
    } else if (style === 'italic') {
      const current = selectedObject.fontStyle === 'italic' ? 'normal' : 'italic';
      selectedObject.set('fontStyle', current);
    } else if (style === 'underline') {
      selectedObject.set('underline', !selectedObject.underline);
    }
    canvas.renderAll();
  };

  const toggleCapitalization = () => {
    if (!selectedObject || selectedObject.type !== 'text' || !canvas) return;
    const currentText = selectedObject.text || '';
    const isUpper = currentText === currentText.toUpperCase();
    selectedObject.set('text', isUpper ? currentText.toLowerCase() : currentText.toUpperCase());
    canvas.renderAll();
  };

  const setTextAlign = (align) => {
    if (!selectedObject || selectedObject.type !== 'text' || !canvas) return;
    selectedObject.set('textAlign', align);
    canvas.renderAll();
  };

  const changeLetterSpacing = (delta) => {
    if (!selectedObject || selectedObject.type !== 'text' || !canvas) return;
    const current = selectedObject.charSpacing || 0;
    const next = Math.max(0, current + delta);
    selectedObject.set('charSpacing', next);
    canvas.renderAll();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        const printAreasToUse = dynamicPrintAreas.length > 0 ? dynamicPrintAreas : productTemplate.printAreas;
        const printArea = printAreasToUse[0];
        
        if (!printArea) return;
        
        img.scaleToWidth(100);
        img.set({
          left: printArea.bounds.left + 10,
          top: printArea.bounds.top + 10,
          name: 'user-image',
          // Optimize for smooth dragging
          objectCaching: false,
          statefullCache: false,
          noScaleCache: false,
          lockMovementX: false,
          lockMovementY: false,
          selectable: true,
          evented: true
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const setPrintingColor = (color) => {
    setTextColor(color);
    if (selectedObject && selectedObject.type === 'text' && canvas) {
      selectedObject.set('fill', color);
      canvas.renderAll();
    }
  };

  const addQrCode = async () => {
    if (!canvas || !qrText.trim()) return;
    
    const printAreasToUse = dynamicPrintAreas.length > 0 ? dynamicPrintAreas : productTemplate.printAreas;
    const printArea = printAreasToUse[0];
    
    if (!printArea) return;

    try {
      const dataUrl = await QRCode.toDataURL(qrText, {
        width: qrSize,
        margin: 0,
        color: {
          dark: qrColor,
          light: '#00000000'
        }
      });

      fabric.Image.fromURL(dataUrl, (img) => {
        const bounds = printArea.bounds;
        img.set({
          left: bounds.left + 10,
          top: bounds.top + 10,
          name: 'qr-code',
          // Optimize for smooth dragging
          objectCaching: false,
          statefullCache: false,
          noScaleCache: false,
          lockMovementX: false,
          lockMovementY: false,
          selectable: true,
          evented: true
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const deleteSelected = () => {
    if (!canvas) return;
    
    // Get the active object from canvas (more reliable than selectedObject state)
    const activeObject = canvas.getActiveObject();
    const activeObjects = canvas.getActiveObjects();
    
    if (activeObjects && activeObjects.length > 0) {
      // Handle multiple selected objects
      activeObjects.forEach(obj => {
        canvas.remove(obj);
      });
      canvas.discardActiveObject();
      canvas.renderAll();
      setSelectedObject(null);
      setElementsUpdate(prev => prev + 1);
    } else if (activeObject) {
      // Handle single selected object
      canvas.remove(activeObject);
      canvas.renderAll();
      setSelectedObject(null);
      setElementsUpdate(prev => prev + 1);
    } else if (selectedObject) {
      // Fallback to selectedObject state
    canvas.remove(selectedObject);
    canvas.renderAll();
    setSelectedObject(null);
      setElementsUpdate(prev => prev + 1);
    }
  };

  // Keyboard event handler for Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Delete or Backspace is pressed
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas) {
        // Don't delete if user is typing in an input field or textarea
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        
        // Don't delete if user is editing text on canvas
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.isEditing) {
          return;
        }
        
        // Prevent default behavior (e.g., going back in browser)
        e.preventDefault();
        
        // Get the active object from canvas
        const obj = canvas.getActiveObject();
        const objs = canvas.getActiveObjects();
        
        if (objs && objs.length > 0) {
          // Handle multiple selected objects
          objs.forEach(object => {
            // Don't delete print area guides or base image
            if (object.name && (object.name.startsWith('print-area-') || object.name === 'product-base-image')) {
              return;
            }
            canvas.remove(object);
          });
          canvas.discardActiveObject();
          canvas.renderAll();
          setSelectedObject(null);
          setElementsUpdate(prev => prev + 1);
        } else if (obj) {
          // Don't delete print area guides or base image
          if (obj.name && (obj.name.startsWith('print-area-') || obj.name === 'product-base-image')) {
            return;
          }
          // Handle single selected object
          canvas.remove(obj);
          canvas.renderAll();
          setSelectedObject(null);
          setElementsUpdate(prev => prev + 1);
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas]);

  // Add icon to canvas
  const addIconToCanvas = (svgString, name) => {
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }
    
    const printAreasToUse = dynamicPrintAreas.length > 0 ? dynamicPrintAreas : productTemplate.printAreas;
    const printArea = printAreasToUse[0];
    
    if (!printArea) {
      console.error('Print area not available');
      return;
    }

    try {
      // Ensure SVG has proper dimensions and replace currentColor
      let svg = svgString;
      
      // Replace currentColor with black for better visibility (case insensitive)
      svg = svg.replace(/currentColor/gi, '#000000');
      
      // Ensure SVG has width and height if not present
      if (!svg.includes('width=') && !svg.includes('height=')) {
        svg = svg.replace('<svg', '<svg width="24" height="24"');
      }

      // Create SVG data URL with proper encoding
      // Use unescape for better compatibility with special characters
      const encodedSvg = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

      fabric.Image.fromURL(
        svgDataUrl,
        (img) => {
          if (!img) {
            console.error('Failed to load image from SVG:', name);
            // Try alternative method using fabric.util.loadImage
            const imgElement = new Image();
            imgElement.crossOrigin = 'anonymous';
            imgElement.onload = () => {
              const fabricImg = new fabric.Image(imgElement, {
                left: printArea.bounds.left + (printArea.bounds.right - printArea.bounds.left) / 2,
                top: printArea.bounds.top + 20,
                scaleX: 60 / imgElement.width,
                scaleY: 60 / imgElement.height,
                originX: 'center',
                originY: 'top',
                name: `icon-${name}`,
                objectCaching: false,
                lockMovementX: false,
                lockMovementY: false,
                selectable: true,
                evented: true,
                hasControls: true,
                hasBorders: true
              });
              canvas.add(fabricImg);
              canvas.setActiveObject(fabricImg);
              canvas.renderAll();
              setElementsUpdate(prev => prev + 1);
            };
            imgElement.onerror = () => {
              console.error('Failed to load SVG as image:', name);
            };
            imgElement.src = svgDataUrl;
            return;
          }

          // Scale the image to a reasonable size
          const targetSize = 60;
          const imgWidth = img.width || 24;
          const imgHeight = img.height || 24;
          const scale = targetSize / Math.max(imgWidth, imgHeight);
          
          img.scale(scale);
          
          // Calculate position to center in print area or offset slightly
          const centerX = printArea.bounds.left + (printArea.bounds.right - printArea.bounds.left) / 2;
          const left = centerX - (imgWidth * scale) / 2;
          const top = printArea.bounds.top + 20;

          img.set({
            left: left,
            top: top,
            name: `icon-${name}`,
            objectCaching: false,
            lockMovementX: false,
            lockMovementY: false,
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          
          // Update elements list
          setElementsUpdate(prev => prev + 1);
        },
        {
          crossOrigin: 'anonymous'
        }
      );
    } catch (error) {
      console.error('Error adding icon to canvas:', error, name);
    }
  };

  // Add emoji to canvas
  const addEmojiToCanvas = (emoji) => {
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }
    
    const printAreasToUse = dynamicPrintAreas.length > 0 ? dynamicPrintAreas : productTemplate.printAreas;
    const printArea = printAreasToUse[0];
    
    if (!printArea) {
      console.error('Print area not available');
      return;
    }

    try {
      const text = new fabric.Text(emoji, {
        left: printArea.bounds.left + (printArea.bounds.right - printArea.bounds.left) / 2,
        top: printArea.bounds.top + 20,
        fontSize: 40,
        fontFamily: 'Arial',
        name: `emoji-${emoji}`,
        selectable: true,
        evented: true,
        objectCaching: false,
        lockMovementX: false,
        lockMovementY: false,
        originX: 'center',
        originY: 'top',
        hasControls: true,
        hasBorders: true
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      
      // Update elements list
      setElementsUpdate(prev => prev + 1);
    } catch (error) {
      console.error('Error adding emoji to canvas:', error);
    }
  };

  // Add shape to canvas
  const addShapeToCanvas = (shapeType) => {
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }
    
    const printAreasToUse = dynamicPrintAreas.length > 0 ? dynamicPrintAreas : productTemplate.printAreas;
    const printArea = printAreasToUse[0];
    
    if (!printArea) {
      console.error('Print area not available');
      return;
    }

    try {
      let shape;
      const centerX = printArea.bounds.left + (printArea.bounds.right - printArea.bounds.left) / 2;
      const topY = printArea.bounds.top + 20;
      
      const baseProps = {
        fill: textColor,
        stroke: textColor,
        strokeWidth: 2,
        name: `shape-${shapeType}`,
        selectable: true,
        evented: true,
        objectCaching: false,
        lockMovementX: false,
        lockMovementY: false,
        hasControls: true,
        hasBorders: true
      };

      switch (shapeType) {
        case 'circle':
          shape = new fabric.Circle({
            ...baseProps,
            radius: 30,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'top'
          });
          break;
        case 'rect':
          shape = new fabric.Rect({
            ...baseProps,
            width: 60,
            height: 60,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'top'
          });
          break;
        case 'triangle':
          shape = new fabric.Triangle({
            ...baseProps,
            width: 60,
            height: 60,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'top'
          });
          break;
        case 'line':
          shape = new fabric.Line([-30, 0, 30, 0], {
            ...baseProps,
            fill: '',
            stroke: textColor,
            strokeWidth: 3,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'center'
          });
          break;
        case 'ellipse':
          shape = new fabric.Ellipse({
            ...baseProps,
            rx: 30,
            ry: 20,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'top'
          });
          break;
        case 'polygon':
          shape = new fabric.Polygon([
            { x: 0, y: 30 },
            { x: 30, y: 0 },
            { x: 60, y: 30 },
            { x: 45, y: 60 },
            { x: 15, y: 60 }
          ], {
            ...baseProps,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'top'
          });
          break;
        case 'star':
          // Create a 5-pointed star
          const points = [];
          const outerRadius = 30;
          const innerRadius = 15;
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            points.push({
              x: radius * Math.cos(angle - Math.PI / 2),
              y: radius * Math.sin(angle - Math.PI / 2)
            });
          }
          shape = new fabric.Polygon(points, {
            ...baseProps,
            left: centerX,
            top: topY + 30,
            originX: 'center',
            originY: 'center'
          });
          break;
        case 'arrow':
          // Create an arrow using a path
          shape = new fabric.Path('M -30 0 L 10 0 L 10 -15 L 30 0 L 10 15 L 10 0 Z', {
            ...baseProps,
            fill: textColor,
            stroke: textColor,
            left: centerX,
            top: topY + 30,
            originX: 'center',
            originY: 'center'
          });
          break;
        default:
          return;
      }

      if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
        
        // Update elements list
        setElementsUpdate(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding shape to canvas:', error);
    }
  };

  const undo = () => {
    if (historyIndex > 0 && canvas) {
      const newIndex = historyIndex - 1;
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && canvas) {
      const newIndex = historyIndex + 1;
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  const exportDesign = () => {
    if (!canvas) return;
    
    // Save current zoom and viewport transform
    const currentZoom = canvas.getZoom();
    const currentVpt = canvas.viewportTransform.slice();
    
    // Reset zoom to 1.0 for export to get full image
    canvas.setZoom(1);
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    
    // Hide only print area guides for export (keep t-shirt image and all design elements visible)
    const objects = canvas.getObjects();
    const hiddenObjects = [];
    
    objects.forEach(obj => {
      // Only hide print area guides, keep everything else (base image, text, icons, etc.)
      if (obj.name && obj.name.startsWith('print-area-')) {
        obj.visible = false;
        hiddenObjects.push(obj);
      }
    });
    
    // Ensure base image is visible, at the back, and included in export
    const baseImage = canvas.getObjects().find(obj => obj.name === 'product-base-image');
    if (baseImage) {
      baseImage.set({
        visible: true,
        excludeFromExport: false
      });
      canvas.sendToBack(baseImage);
    }
    
    // Ensure all user design elements are visible
    objects.forEach(obj => {
      if (obj.name && !obj.name.startsWith('print-area-') && obj.name !== 'product-placeholder') {
        obj.set({
          visible: true,
          excludeFromExport: false
        });
      }
    });
    
    canvas.renderAll();
    
    // Wait a moment for canvas to fully render before exporting
    setTimeout(async () => {
      try {
        // Export with transparency preserved
        // Use toDataURL with format 'png' to preserve transparency
        // Export the full canvas at original size (zoom is reset to 1.0)
        const dataURL = canvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2,
          enableRetinaScaling: true
        });
        
        // Restore zoom and viewport transform BEFORE restoring hidden objects
        canvas.setZoom(currentZoom);
        canvas.setViewportTransform(currentVpt);
        
        // Restore hidden objects
        hiddenObjects.forEach(obj => {
          obj.visible = true;
        });
        
        canvas.renderAll();
        
        if (onSave) {
          onSave(dataURL);
        } else {
          const link = document.createElement('a');
          link.download = `${currentProductType}-design.png`;
          link.href = dataURL;
          link.click();
        }
      } catch (error) {
        console.error('Error exporting design:', error);
        // Restore zoom and viewport on error
        canvas.setZoom(currentZoom);
        canvas.setViewportTransform(currentVpt);
        canvas.renderAll();
        try { const { toast } = await import('react-toastify'); toast.error('Error exporting design. Please try again.'); } catch(_) {}
      }
    }, 100);
  };

  const updateSelectedObject = (property, value) => {
    if (!selectedObject || !canvas) return;
    
    selectedObject.set(property, value);
    canvas.renderAll();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left Sidebar (Icon Rail + Panel) */}
      <div className="flex h-full flex-shrink-0">
        {/* Icon Rail */}
        <div className="w-20 bg-white border-r border-gray-200 py-4 flex flex-col items-center gap-4 overflow-y-auto">
          <button
            onClick={() => {
              setSidebarTab('uploads');
              setActiveTool('select');
            }}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Uploads"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sidebarTab === 'uploads' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V3m0 0l3 3m-3-3L9 6" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Uploads</span>
          </button>

          <button
            onClick={() => {
              setSidebarTab('text');
              setActiveTool('text');
            }}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Text"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sidebarTab === 'text' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 6v14m8-14v14" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Text</span>
          </button>

          <button
            onClick={() => {
              setSidebarTab('color');
              setActiveTool('select');
            }}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Printing color"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sidebarTab === 'color' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11.5a1 1 0 11-2 0 1 1 0 012 0zM12.5 8.5a1 1 0 11-2 0 1 1 0 012 0zM10 12.5a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Color</span>
          </button>

          <button
            onClick={() => {
              setSidebarTab('qr');
              setActiveTool('select');
            }}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="QR code"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sidebarTab === 'qr' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 2v-2h2v2h-2z" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>QR</span>
          </button>

          <button
            onClick={() => {
              setSidebarTab('elements');
              setActiveTool('select');
            }}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Elements"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sidebarTab === 'elements' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Elements</span>
          </button>
        </div>

        {/* Panel */}
        <div className="w-72 bg-white shadow-lg p-4 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">
              {sidebarTab === 'uploads' ? 'Uploads' : sidebarTab === 'text' ? 'Text' : sidebarTab === 'elements' ? 'Elements' : 'Printing color'}
            </h3>
            <button
              onClick={() => setSidebarTab('text')}
              className="text-xs px-2 py-1 rounded hover:bg-gray-100 text-gray-600"
              title="Reset panel"
            >
              Reset
            </button>
          </div>

          {/* Elements Library */}
          {sidebarTab === 'elements' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Browse our free resources"
                  className="w-full p-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Social Icons */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Socials</h4>
                  <button 
                    onClick={() => setShowAllSocials(!showAllSocials)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllSocials ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Instagram', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><linearGradient id="ig-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f09433"/><stop offset="25%" stop-color="#e6683c"/><stop offset="50%" stop-color="#dc2743"/><stop offset="75%" stop-color="#cc2366"/><stop offset="100%" stop-color="#bc1888"/></linearGradient></defs><path fill="url(#ig-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>' },
                    { name: 'WhatsApp', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' },
                    { name: 'WhatsApp Outline', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' },
                    { name: 'X (Twitter)', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
                    { name: 'Facebook', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
                    { name: 'LinkedIn', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0077B5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' },
                    { name: 'YouTube', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
                    { name: 'TikTok', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>' }
                  ].slice(0, showAllSocials ? undefined : 4).map((icon, idx) => (
                    <button
                      key={idx}
                      onClick={() => addIconToCanvas(icon.svg, icon.name)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center"
                      title={icon.name}
                    >
                      <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Emojis */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Emojis</h4>
                  <button 
                    onClick={() => setShowAllEmojis(!showAllEmojis)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllEmojis ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {['😇', '😢', '😊', '😮', '❤️', '👍', '🎉', '⭐', '🔥', '💯', '🎊', '✨', '🌟', '💫', '🎈', '🎁'].slice(0, showAllEmojis ? undefined : 4).map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => addEmojiToCanvas(emoji)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-2xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contacts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Contacts</h4>
                  <button 
                    onClick={() => setShowAllContacts(!showAllContacts)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllContacts ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Globe', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' },
                    { name: 'Thumbs Up', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>' },
                    { name: 'Email', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' },
                    { name: 'Location', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' },
                    { name: 'Phone', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' },
                    { name: 'At Symbol', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>' },
                    { name: 'Calendar', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
                    { name: 'Clock', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>' }
                  ].slice(0, showAllContacts ? undefined : 4).map((icon, idx) => (
                    <button
                      key={idx}
                      onClick={() => addIconToCanvas(icon.svg, icon.name)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center text-gray-700"
                      title={icon.name}
                    >
                      <div className="w-6 h-6" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Shapes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Shapes</h4>
                  <button 
                    onClick={() => setShowAllShapes(!showAllShapes)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllShapes ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Circle', type: 'circle' },
                    { name: 'Rectangle', type: 'rect' },
                    { name: 'Triangle', type: 'triangle' },
                    { name: 'Line', type: 'line' },
                    { name: 'Ellipse', type: 'ellipse' },
                    { name: 'Polygon', type: 'polygon' },
                    { name: 'Star', type: 'star' },
                    { name: 'Arrow', type: 'arrow' }
                  ].slice(0, showAllShapes ? undefined : 4).map((shape, idx) => (
                    <button
                      key={idx}
                      onClick={() => addShapeToCanvas(shape.type)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center text-gray-700"
                      title={shape.name}
                    >
                      {shape.type === 'circle' && <div className="w-8 h-8 rounded-full border-2 border-gray-700"></div>}
                      {shape.type === 'rect' && <div className="w-8 h-8 border-2 border-gray-700"></div>}
                      {shape.type === 'triangle' && <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-gray-700"></div>}
                      {shape.type === 'line' && <div className="w-8 h-0.5 bg-gray-700"></div>}
                      {shape.type === 'ellipse' && <div className="w-8 h-5 rounded-full border-2 border-gray-700"></div>}
                      {shape.type === 'polygon' && <div className="w-8 h-8 border-2 border-gray-700 transform rotate-45"></div>}
                      {shape.type === 'star' && <div className="w-8 h-8 text-gray-700 text-xl">★</div>}
                      {shape.type === 'arrow' && <div className="w-8 h-8 text-gray-700 text-xl">→</div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Uploads */}
          {sidebarTab === 'uploads' && (
            <div className="space-y-4">
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="w-full p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Upload Image
              </button>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Upload artwork (PNG/JPG). Drag and resize it inside the green print area.
              </p>
            </div>
          )}

          {/* Text */}
          {sidebarTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Add text
                </label>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type here..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                />
              </div>
              <button 
                onClick={addText}
                className="w-full p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-semibold"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Add Text
              </button>
              <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Use the top toolbar to change font, size, alignment, spacing, bold/italic/underline.
              </p>
            </div>
          )}

          {/* Printing color */}
          {sidebarTab === 'color' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Color
                </label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setPrintingColor(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-xl cursor-pointer"
                />
              </div>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                This sets the default printing color. If a text object is selected, it updates that text color too.
              </p>
            </div>
          )}

          {/* QR Code */}
          {sidebarTab === 'qr' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  QR content
                </label>
                <textarea
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  rows={3}
                  placeholder="Enter URL or text for QR code"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Size: {qrSize}px
                </label>
                <input
                  type="range"
                  min="80"
                  max="260"
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  QR color
                </label>
                <input
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-xl cursor-pointer"
                />
              </div>
              <button
                onClick={addQrCode}
                className="w-full p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-semibold"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Add QR Code
              </button>
              <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                The QR code will be placed inside the active print area. You can move and resize it like other elements.
              </p>
            </div>
          )}

          {/* Selected object editor */}
          {selectedObject && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Edit Selected</h4>
                <span className="text-xs text-gray-500">{selectedObject.type}</span>
              </div>

              {selectedObject.type === 'text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Edit Text Content
                    </label>
                    <textarea
                      value={selectedObject.text || ''}
                      onChange={(e) => {
                        selectedObject.set('text', e.target.value);
                        canvas.renderAll();
                      }}
                      onBlur={() => canvas.renderAll()}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Type your text here..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Double-click on canvas to edit directly</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Font Family
                    </label>
                    <select
                      value={selectedObject.fontFamily || fontFamily}
                      onChange={(e) => {
                        selectedObject.set('fontFamily', e.target.value);
                        canvas.renderAll();
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Lexend Deca">Lexend Deca</option>
                      <option value="Roboto Serif">Roboto Serif</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Font Size: {Math.round(selectedObject.fontSize)}px
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="120"
                      value={selectedObject.fontSize}
                      onChange={(e) => updateSelectedObject('fontSize', Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>8px</span>
                      <span>120px</span>
                  </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selectedObject.fill || textColor}
                      onChange={(e) => {
                        selectedObject.set('fill', e.target.value);
                        canvas.renderAll();
                      }}
                      className="w-full h-12 border border-gray-300 rounded-xl cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Line Height: {selectedObject.lineHeight ? selectedObject.lineHeight.toFixed(1) : '1.0'}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={selectedObject.lineHeight || 1}
                      onChange={(e) => updateSelectedObject('lineHeight', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        selectedObject.set('fontWeight', selectedObject.fontWeight === 'bold' ? 'normal' : 'bold');
                        canvas.renderAll();
                      }}
                      className={`p-2 rounded-lg border transition-colors ${
                        selectedObject.fontWeight === 'bold' 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-bold">Bold</span>
                    </button>
                    <button
                      onClick={() => {
                        selectedObject.set('fontStyle', selectedObject.fontStyle === 'italic' ? 'normal' : 'italic');
                        canvas.renderAll();
                      }}
                      className={`p-2 rounded-lg border transition-colors ${
                        selectedObject.fontStyle === 'italic' 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="italic">Italic</span>
                    </button>
                    <button
                      onClick={() => {
                        selectedObject.set('underline', !selectedObject.underline);
                        canvas.renderAll();
                      }}
                      className={`p-2 rounded-lg border transition-colors ${
                        selectedObject.underline 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="underline">Underline</span>
                    </button>
                    <button
                      onClick={() => {
                        const current = selectedObject.textAlign || 'left';
                        const next = current === 'left' ? 'center' : current === 'center' ? 'right' : 'left';
                        selectedObject.set('textAlign', next);
                        canvas.renderAll();
                      }}
                      className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Align: {selectedObject.textAlign || 'left'}
                    </button>
                  </div>
                </>
              )}

              {/* Image/Object editing */}
              {(selectedObject.type === 'image' || selectedObject.type === 'i-text') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Opacity: {Math.round((selectedObject.opacity || 1) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(selectedObject.opacity || 1) * 100}
                      onChange={(e) => updateSelectedObject('opacity', Number(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (!canvas || !selectedObject) return;
                    const obj = selectedObject;
                    const cloned = obj.clone();
                    cloned.set({
                      left: obj.left + 20,
                      top: obj.top + 20
                    });
                    canvas.add(cloned);
                    canvas.setActiveObject(cloned);
                    canvas.renderAll();
                    setSelectedObject(cloned);
                  }}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Duplicate
                </button>
              <button
                onClick={deleteSelected}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Delete
              </button>
              </div>

              <div className="pt-2 border-t border-gray-300">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Layer Order
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (!canvas || !selectedObject) return;
                      canvas.bringToFront(selectedObject);
                      canvas.renderAll();
                    }}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Bring to Front
                  </button>
                  <button
                    onClick={() => {
                      if (!canvas || !selectedObject) return;
                      canvas.sendToBack(selectedObject);
                      canvas.renderAll();
                    }}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Send to Back
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              <strong>Print Area:</strong> Green dashed boxes indicate where printing will occur. Keep your design inside them.
            </p>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white shadow-md p-3 flex items-center justify-between gap-2 flex-shrink-0 overflow-hidden">
          {/* Hand tool + Zoom controls + product selector */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Hand/Pan Tool */}
            <button
              onClick={() => setActiveTool(activeTool === 'pan' ? 'select' : 'pan')}
              className={`w-9 h-9 flex items-center justify-center border rounded-lg transition-colors ${
                activeTool === 'pan' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
              title="Hand Tool (Pan)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </button>

            {/* Zoom controls */}
            <button 
              onClick={() => handleZoom('out')}
              className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="font-semibold text-gray-700 min-w-[60px] text-center text-sm" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              {zoom}%
            </span>
            <button 
              onClick={() => handleZoom('in')}
              className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Product selector */}
            <select
              value={currentProductType}
              onChange={(e) => setCurrentProductType(e.target.value)}
              className="ml-4 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              <option value="pen">Pen</option>
              <option value="tshirt">T-Shirt</option>
              <option value="mug">Mug</option>
            </select>
          </div>

          {/* Text formatting toolbar */}
          <div className="flex-1 min-w-0 overflow-x-auto px-2">
            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
            {/* Font family */}
            <select
              value={selectedObject?.type === 'text' ? selectedObject.fontFamily || fontFamily : fontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              <option value="Lexend Deca">Lexend Deca</option>
              <option value="Arial">Arial</option>
              <option value="Roboto Serif">Roboto Serif</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Georgia">Georgia</option>
            </select>

            {/* Font size with +/- */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => changeFontSizeStep(-1)}
                className="px-2 py-1 text-sm hover:bg-gray-100"
              >
                −
              </button>
              <div className="px-3 text-sm border-l border-r border-gray-300 min-w-[60px] text-center">
                {selectedObject?.type === 'text' ? Math.round(selectedObject.fontSize) : fontSize}px
              </div>
              <button
                onClick={() => changeFontSizeStep(1)}
                className="px-2 py-1 text-sm hover:bg-gray-100"
              >
                +
              </button>
            </div>

            {/* Styles: Bold, Italic, Underline */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => toggleTextStyle('bold')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.fontWeight === 'bold' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Bold"
              >
                <span className="font-bold">B</span>
              </button>
              <button
                onClick={() => toggleTextStyle('italic')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.fontStyle === 'italic' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Italic"
              >
                <span className="italic">I</span>
              </button>
              <button
                onClick={() => toggleTextStyle('underline')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.underline ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Underline"
              >
                <span className="underline">U</span>
              </button>
            </div>

            {/* Capitalize */}
            <button
              onClick={toggleCapitalization}
              className="flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700"
              title="Capitalize"
            >
              <span className="font-semibold">AG</span>
              <span className="hidden md:inline">Capitalize</span>
            </button>

            {/* Alignment */}
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => setTextAlign('left')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.textAlign === 'left' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Align Left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h12M4 10h8M4 14h12M4 18h8" />
                </svg>
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.textAlign === 'center' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Align Center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h12M8 10h8M6 14h12M8 18h8" />
                </svg>
              </button>
              <button
                onClick={() => setTextAlign('right')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.textAlign === 'right' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Align Right"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h12M10 10h10M8 14h12M10 18h10" />
                </svg>
              </button>
            </div>

              {/* Letter spacing */}
              <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => changeLetterSpacing(-50)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700"
                title="Decrease spacing"
              >
                <span className="text-xs">A−</span>
              </button>
              <button
                onClick={() => changeLetterSpacing(50)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700"
                title="Increase spacing"
              >
                <span className="text-xs">A+</span>
              </button>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0 ml-2">
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm whitespace-nowrap"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-200 p-3" id="canvas-container">
          <div className="flex items-center justify-center h-full">
            <div className="bg-white shadow-2xl rounded-lg p-2 inline-block" style={{ maxWidth: 'calc(100% - 2rem)', maxHeight: 'calc(100% - 2rem)' }}>
              <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="bg-white shadow-md p-3 flex items-center justify-between flex-shrink-0">
          <div className="text-gray-600 font-medium" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Page 1/1
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
            <button 
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
            <button 
              onClick={exportDesign}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save & Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDesigner;
