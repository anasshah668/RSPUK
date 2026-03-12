import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import QRCode from 'qrcode';
import { productTemplates, findPrintArea, constrainToPrintArea } from '../utils/productTemplates';

const ProductDesigner = ({ productType = 'pen', uploadedImage = null, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState('select');
  const [sidebarTab, setSidebarTab] = useState('text'); // uploads | text | color | qr
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
  const productTemplate = productTemplates[currentProductType] || productTemplates.pen;

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: productTemplate.dimensions.width,
      height: productTemplate.dimensions.height,
      backgroundColor: '#f5f5f5',
      preserveObjectStacking: true
    });

    // Load product base image
    try {
      fabric.Image.fromURL(
        productTemplate.image,
        (img) => {
          if (!img) {
            // If image failed to load, create placeholder
            const placeholder = new fabric.Rect({
              width: productTemplate.dimensions.width,
              height: productTemplate.dimensions.height,
              fill: '#e5e7eb',
              selectable: false,
              evented: false,
              name: 'product-placeholder'
            });
            fabricCanvas.add(placeholder);
            fabricCanvas.sendToBack(placeholder);
            return;
          }

          // Calculate scale to fit width while maintaining aspect ratio
          const scale = productTemplate.dimensions.width / img.width;
          img.scale(scale);
          img.set({ 
            left: 0,
            top: (productTemplate.dimensions.height - (img.height * scale)) / 2,
            selectable: false, 
            evented: false,
            name: 'product-base'
          });
          fabricCanvas.add(img);
          fabricCanvas.sendToBack(img);
          fabricCanvas.renderAll();
        },
        { crossOrigin: 'anonymous' }
      );
    } catch (error) {
      console.error('Error loading product image:', error);
      // Fallback: create a placeholder
      const placeholder = new fabric.Rect({
        width: productTemplate.dimensions.width,
        height: productTemplate.dimensions.height,
        fill: '#e5e7eb',
        selectable: false,
        evented: false,
        name: 'product-placeholder'
      });
      fabricCanvas.add(placeholder);
      fabricCanvas.sendToBack(placeholder);
    }

    // Draw print area guides
    productTemplate.printAreas.forEach((area) => {
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

    // Handle object movement - constrain to print area with optimized rendering
    let renderRequestId = null;
    fabricCanvas.on('object:moving', (e) => {
      const obj = e.target;
      const printArea = findPrintArea(obj, productTemplate.printAreas);
      
      if (printArea) {
        constrainToPrintArea(obj, printArea);
      }
      
      // Throttle rendering for smooth dragging
      if (renderRequestId) {
        cancelAnimationFrame(renderRequestId);
      }
      renderRequestId = requestAnimationFrame(() => {
        fabricCanvas.renderAll();
        renderRequestId = null;
      });
    });

    // Handle object modified (after movement) - final constraint check
    fabricCanvas.on('object:modified', (e) => {
      const obj = e.target;
      const printArea = findPrintArea(obj, productTemplate.printAreas);
      
      if (printArea) {
        constrainToPrintArea(obj, printArea);
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

    // Save state for undo/redo
    const saveState = () => {
      const json = JSON.stringify(fabricCanvas.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(json);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    };

    fabricCanvas.on('object:added', saveState);
    fabricCanvas.on('object:removed', saveState);
    fabricCanvas.on('object:modified', saveState);

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [currentProductType]);

  // Load uploaded image if provided
  useEffect(() => {
    if (uploadedImage && canvas) {
      fabric.Image.fromURL(
        uploadedImage,
        (img) => {
          if (img) {
            const printArea = productTemplate.printAreas[0];
            if (printArea) {
              const areaWidth = printArea.bounds.right - printArea.bounds.left;
              const areaHeight = printArea.bounds.bottom - printArea.bounds.top;
              const scale = Math.min(areaWidth / img.width, areaHeight / img.height) * 0.9;
              img.scale(scale);
              img.set({
                left: printArea.bounds.left + (areaWidth - img.width * scale) / 2,
                top: printArea.bounds.top + (areaHeight - img.height * scale) / 2,
                selectable: true,
                evented: true,
                name: 'uploaded-image'
              });
              canvas.add(img);
              canvas.setActiveObject(img);
              canvas.renderAll();
            }
          }
        },
        { crossOrigin: 'anonymous' }
      );
    }
  }, [uploadedImage, canvas, productTemplate]);

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

    const printArea = productTemplate.printAreas[0];
    
    const text = new fabric.Text(textInput, {
      left: printArea.bounds.left + 10,
      top: printArea.bounds.top + 10,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: textColor,
      editable: true,
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
      objectCaching: false,
      moveCursor: 'move'
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
        const printArea = productTemplate.printAreas[0];
        img.scaleToWidth(100);
        img.set({
          left: printArea.bounds.left + 10,
          top: printArea.bounds.top + 10,
          name: 'user-image'
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
    const printArea = productTemplate.printAreas[0];

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
          name: 'qr-code'
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
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.renderAll();
    setSelectedObject(null);
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
    
    // Hide print area guides for export
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.name && obj.name.startsWith('print-area-')) {
        obj.visible = false;
      }
    });
    
    canvas.renderAll();
    
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    
    // Restore guides
    objects.forEach(obj => {
      if (obj.name && obj.name.startsWith('print-area-')) {
        obj.visible = true;
      }
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
  };

  const updateSelectedObject = (property, value) => {
    if (!selectedObject || !canvas) return;
    
    selectedObject.set(property, value);
    canvas.renderAll();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-x-auto overflow-y-hidden">
      {/* Left Sidebar (Icon Rail + Panel) */}
      <div className="flex h-full">
        {/* Icon Rail */}
        <div className="w-24 bg-white border-r border-gray-200 py-6 flex flex-col items-center gap-6">
          <button
            onClick={() => {
              setSidebarTab('uploads');
              setActiveTool('select');
            }}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Uploads"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sidebarTab === 'uploads' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V3m0 0l3 3m-3-3L9 6" />
              </svg>
            </div>
            <span className="text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Uploads</span>
          </button>

          <button
            onClick={() => {
              setSidebarTab('text');
              setActiveTool('text');
            }}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Text"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sidebarTab === 'text' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 6v14m8-14v14" />
              </svg>
            </div>
            <span className="text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Text</span>
          </button>

          <button
            onClick={() => {
              setSidebarTab('color');
              setActiveTool('select');
            }}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Printing color"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sidebarTab === 'color' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11.5a1 1 0 11-2 0 1 1 0 012 0zM12.5 8.5a1 1 0 11-2 0 1 1 0 012 0zM10 12.5a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <span className="text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Printing color</span>
          </button>

          <button
            onClick={() => {
              setSidebarTab('qr');
              setActiveTool('select');
            }}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="QR code"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sidebarTab === 'qr' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 2v-2h2v2h-2z" />
              </svg>
            </div>
            <span className="text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>QR code</span>
          </button>
        </div>

        {/* Panel */}
        <div className="w-80 bg-white shadow-lg p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              {sidebarTab === 'uploads' ? 'Uploads' : sidebarTab === 'text' ? 'Text' : 'Printing color'}
            </h3>
            <button
              onClick={() => setSidebarTab('text')}
              className="text-xs px-2 py-1 rounded hover:bg-gray-100 text-gray-600"
              title="Reset panel"
            >
              Reset
            </button>
          </div>

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
                <h4 className="font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Edit Selected</h4>
                <span className="text-xs text-gray-500">{selectedObject.type}</span>
              </div>

              {selectedObject.type === 'text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Font Size: {Math.round(selectedObject.fontSize)}px
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="72"
                      value={selectedObject.fontSize}
                      onChange={(e) => updateSelectedObject('fontSize', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Color
                    </label>
                    <input
                      type="color"
                      value={selectedObject.fill}
                      onChange={(e) => setPrintingColor(e.target.value)}
                      className="w-full h-12 border border-gray-300 rounded-xl cursor-pointer"
                    />
                  </div>
                </>
              )}

              <button
                onClick={deleteSelected}
                className="w-full p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Delete
              </button>
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
        <div className="bg-white shadow-md p-4 flex items-center justify-between gap-4">
          {/* Zoom controls + product selector */}
          <div className="flex items-center gap-3">
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
          <div className="flex-1 min-w-0 overflow-x-auto">
            <div className="flex items-center justify-center gap-4 whitespace-nowrap">
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
          <div className="flex gap-2 flex-shrink-0">
            <button 
              onClick={onClose || (() => window.history.back())}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-200 p-8" id="canvas-container">
          <div className="flex items-center justify-center min-h-full py-8">
            <div className="bg-white shadow-2xl rounded-lg p-4 inline-block">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="bg-white shadow-md p-4 flex items-center justify-between">
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
