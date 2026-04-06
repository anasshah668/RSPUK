import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

const SIZE_PRESETS = [
  { id: 'a4-portrait', label: 'A4 Portrait (794 x 1123)', width: 794, height: 1123 },
  { id: 'a4-landscape', label: 'A4 Landscape (1123 x 794)', width: 1123, height: 794 },
  { id: 'instagram-post', label: 'Instagram Post (1080 x 1080)', width: 1080, height: 1080 },
  { id: 'story', label: 'Story (1080 x 1920)', width: 1080, height: 1920 },
  { id: 'youtube-thumb', label: 'YouTube Thumbnail (1280 x 720)', width: 1280, height: 720 },
  { id: 'presentation', label: 'Presentation (1920 x 1080)', width: 1920, height: 1080 }
];

const emptyPage = (index, size = { width: 500, height: 500 }) => ({
  id: Date.now() + index,
  name: `Page ${index + 1}`,
  width: size.width,
  height: size.height,
  json: null,
  thumbnail: null
});

const QUICK_ICONS = [
  { name: 'Instagram', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#111111" d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5A5.5 5.5 0 1112 18.5 5.5 5.5 0 0112 7.5zm0 2A3.5 3.5 0 1012 16.5 3.5 3.5 0 0012 9.5zm6-3.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/></svg>' },
  { name: 'WhatsApp', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#111111" d="M20.52 3.48A11.92 11.92 0 0012.05 0C5.49 0 .16 5.34.16 11.9c0 2.09.54 4.12 1.57 5.9L0 24l6.36-1.67A11.9 11.9 0 0012.05 24c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.43-8.62zM12.05 21.98a9.9 9.9 0 01-5.04-1.39l-.36-.22-3.77.99 1.01-3.68-.23-.38a9.88 9.88 0 01-1.51-5.25c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.03 7.01 2.9a9.85 9.85 0 012.9 7.01c0 5.47-4.45 9.92-9.92 9.92zm5.46-7.47c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.16-.17.2-.35.23-.65.08-.3-.15-1.25-.46-2.39-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.89 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.58-.09 1.76-.72 2.01-1.42.25-.69.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35z"/></svg>' },
  { name: 'Facebook', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#111111" d="M22 12a10 10 0 10-11.56 9.88v-6.99H8.08V12h2.36V9.8c0-2.33 1.39-3.62 3.52-3.62 1.02 0 2.08.18 2.08.18v2.28h-1.17c-1.15 0-1.5.71-1.5 1.44V12h2.56l-.41 2.89h-2.15v6.99A10 10 0 0022 12z"/></svg>' },
  { name: 'Location', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#111111" d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"/></svg>' }
];

const QUICK_EMOJIS = ['😇', '😊', '😮', '❤️', '👍', '🎉', '⭐', '🔥', '💯', '✨', '🎁', '🚀'];

const GenericProductDesigner = () => {
  const navigate = useNavigate();
  const canvasElRef = useRef(null);
  const uploadRef = useRef(null);
  const projectLoadRef = useRef(null);

  const [canvas, setCanvas] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState('insert');
  const [selectedObject, setSelectedObject] = useState(null);
  const [textInput, setTextInput] = useState('Add your text');
  const [textColor, setTextColor] = useState('#111111');
  const [fontSize, setFontSize] = useState(42);
  const [fontFamily, setFontFamily] = useState('Lexend Deca');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [qrText, setQrText] = useState('');
  const [qrSize, setQrSize] = useState(180);
  const [qrColor, setQrColor] = useState('#111111');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [webAssets, setWebAssets] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [customWidth, setCustomWidth] = useState(500);
  const [customHeight, setCustomHeight] = useState(500);
  const [pages, setPages] = useState([emptyPage(0)]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [showAllEmojis, setShowAllEmojis] = useState(false);
  const [showAllShapes, setShowAllShapes] = useState(false);
  const [openInsertSection, setOpenInsertSection] = useState(null);

  const currentPage = pages[currentPageIndex];

  const getCanvasThumbnail = () => {
    if (!canvas) return null;
    const width = canvas.getWidth() || 500;
    const height = canvas.getHeight() || 500;
    const maxSide = Math.max(width, height);
    const multiplier = Math.min(1, 180 / maxSide);
    return canvas.toDataURL({
      format: 'png',
      quality: 0.9,
      multiplier
    });
  };

  const saveHistoryState = (targetCanvas) => {
    const serialized = JSON.stringify(targetCanvas.toJSON());
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      trimmed.push(serialized);
      return trimmed.slice(-50);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  };

  const applyCanvasSize = (width, height) => {
    if (!canvas) return;
    canvas.setDimensions({ width, height });
    canvas.renderAll();
    setPages((prev) =>
      prev.map((page, idx) =>
        idx === currentPageIndex ? { ...page, width, height } : page
      )
    );
  };

  const saveCurrentPageSnapshot = () => {
    if (!canvas) return;
    const json = canvas.toJSON();
    const thumbnail = getCanvasThumbnail();
    setPages((prev) =>
      prev.map((page, idx) => (idx === currentPageIndex ? { ...page, json, thumbnail } : page))
    );
  };

  const loadPage = (index) => {
    if (!canvas) return;
    const target = pages[index];
    if (!target) return;

    canvas.clear();
    canvas.backgroundColor = backgroundColor;
    canvas.setDimensions({ width: target.width, height: target.height });

    if (target.json) {
      canvas.loadFromJSON(target.json, () => {
        canvas.renderAll();
      });
    } else {
      canvas.renderAll();
    }
  };

  useEffect(() => {
    if (!canvasElRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasElRef.current, {
      width: 500,
      height: 500,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true
    });

    fabricCanvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
    fabricCanvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
    fabricCanvas.on('selection:cleared', () => setSelectedObject(null));
    fabricCanvas.on('object:added', () => saveHistoryState(fabricCanvas));
    fabricCanvas.on('object:modified', () => saveHistoryState(fabricCanvas));
    fabricCanvas.on('object:removed', () => saveHistoryState(fabricCanvas));

    setCanvas(fabricCanvas);
    saveHistoryState(fabricCanvas);

    return () => {
      try {
        fabricCanvas.dispose();
      } catch (_) {}
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;
    canvas.backgroundColor = backgroundColor;
    canvas.renderAll();
  }, [canvas, backgroundColor]);

  const switchToPage = (index) => {
    if (index === currentPageIndex) return;
    saveCurrentPageSnapshot();
    setCurrentPageIndex(index);
  };

  useEffect(() => {
    if (!canvas) return;
    loadPage(currentPageIndex);
  }, [canvas, currentPageIndex]);

  useEffect(() => {
    if (!canvas) return;

    let timer = null;
    const updateThumb = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const thumbnail = getCanvasThumbnail();
        setPages((prev) =>
          prev.map((page, idx) => (idx === currentPageIndex ? { ...page, thumbnail } : page))
        );
      }, 120);
    };

    canvas.on('object:added', updateThumb);
    canvas.on('object:modified', updateThumb);
    canvas.on('object:removed', updateThumb);
    updateThumb();

    return () => {
      if (timer) clearTimeout(timer);
      canvas.off('object:added', updateThumb);
      canvas.off('object:modified', updateThumb);
      canvas.off('object:removed', updateThumb);
    };
  }, [canvas, currentPageIndex]);

  const addPage = () => {
    saveCurrentPageSnapshot();
    const newPage = emptyPage(pages.length, {
      width: currentPage?.width || 500,
      height: currentPage?.height || 500
    });
    setPages((prev) => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const duplicatePage = () => {
    saveCurrentPageSnapshot();
    const source = pages[currentPageIndex];
    const clone = {
      ...source,
      id: Date.now(),
      name: `${source.name} Copy`,
      json: source.json
    };
    setPages((prev) => [...prev, clone]);
    setCurrentPageIndex(pages.length);
  };

  const deletePage = () => {
    if (pages.length <= 1) return;
    const nextPages = pages.filter((_, i) => i !== currentPageIndex);
    setPages(nextPages);
    setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
  };

  const handleZoom = (value) => {
    if (!canvas) return;
    const nextZoom = Math.max(25, Math.min(300, value));
    setZoom(nextZoom);
    canvas.setZoom(nextZoom / 100);
    canvas.renderAll();
  };

  const addText = () => {
    if (!canvas || !textInput.trim()) return;
    const text = new fabric.Textbox(textInput, {
      left: 80,
      top: 80,
      width: 360,
      fontSize,
      fill: textColor,
      fontFamily
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addShape = (type) => {
    if (!canvas) return;
    let obj;
    if (type === 'rect') {
      obj = new fabric.Rect({ left: 120, top: 120, width: 180, height: 120, fill: textColor, rx: 8, ry: 8 });
    } else if (type === 'circle') {
      obj = new fabric.Circle({ left: 160, top: 120, radius: 70, fill: textColor });
    } else if (type === 'triangle') {
      obj = new fabric.Triangle({ left: 180, top: 130, width: 140, height: 130, fill: textColor });
    } else if (type === 'ellipse') {
      obj = new fabric.Ellipse({ left: 160, top: 120, rx: 90, ry: 55, fill: textColor });
    } else if (type === 'polygon') {
      obj = new fabric.Polygon(
        [{ x: 0, y: 30 }, { x: 30, y: 0 }, { x: 70, y: 10 }, { x: 90, y: 45 }, { x: 40, y: 90 }, { x: 0, y: 70 }],
        { left: 160, top: 120, fill: textColor }
      );
    } else if (type === 'star') {
      const points = [];
      const outerRadius = 52;
      const innerRadius = 24;
      for (let i = 0; i < 10; i += 1) {
        const angle = (i * Math.PI) / 5;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({
          x: radius * Math.cos(angle - Math.PI / 2),
          y: radius * Math.sin(angle - Math.PI / 2)
        });
      }
      obj = new fabric.Polygon(points, { left: 220, top: 220, fill: textColor, originX: 'center', originY: 'center' });
    } else if (type === 'arrow') {
      obj = new fabric.Path('M -30 0 L 10 0 L 10 -15 L 30 0 L 10 15 L 10 0 Z', {
        left: 220,
        top: 220,
        fill: textColor,
        stroke: textColor
      });
    } else {
      obj = new fabric.Line([0, 0, 220, 0], { left: 100, top: 220, stroke: textColor, strokeWidth: 4 });
    }
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.renderAll();
  };

  const addEmojiToCanvas = (emoji) => {
    if (!canvas) return;
    const text = new fabric.Text(emoji, {
      left: 180,
      top: 160,
      fontSize: 44,
      selectable: true,
      evented: true
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addIconToCanvas = (svgString, name) => {
    if (!canvas || !svgString) return;
    fabric.loadSVGFromString(svgString, (objects, options) => {
      if (!objects?.length) return;
      const group = fabric.util.groupSVGElements(objects, options);
      const maxDim = Math.max(group.width || 1, group.height || 1);
      const scale = 70 / maxDim;
      group.set({
        left: 160,
        top: 130,
        name: `icon-${name}`,
        fill: '#111111',
        stroke: '#111111',
        scaleX: scale,
        scaleY: scale
      });
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
    });
  };

  const addQrCode = async () => {
    if (!canvas || !qrText.trim()) return;
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
        if (!img) return;
        img.set({ left: 120, top: 120, name: 'qr-code' });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    } catch (error) {
      console.error('Unable to generate QR code', error);
    }
  };

  const placeImageOnCanvas = (url, left = 100, top = 100) => {
    if (!canvas || !url) return;
    fabric.Image.fromURL(
      url,
      (img) => {
        if (!img) return;
        img.scaleToWidth(300);
        img.set({ left, top });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      },
      { crossOrigin: 'anonymous' }
    );
  };

  const uploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      placeImageOnCanvas(ev.target?.result, 100, 100);
    };
    reader.readAsDataURL(file);
  };

  const searchWebAssets = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      let mapped = [];
      const openverseResponse = await fetch(
        `https://api.openverse.org/v1/images/?q=${encodeURIComponent(searchQuery)}&page_size=20`
      );
      if (openverseResponse.ok) {
        const ovData = await openverseResponse.json();
        mapped = (ovData?.results || []).map((item) => ({
          id: item.id,
          title: item.title || item.creator || 'Image',
          thumb: item.thumbnail,
          url: item.url
        }));
      }

      if (!mapped.length) {
        const wikimediaEndpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
          `${searchQuery} filetype:bitmap`
        )}&gsrlimit=16&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json&origin=*`;
        const response = await fetch(wikimediaEndpoint);
        const data = await response.json();
        const pagesData = data?.query?.pages ? Object.values(data.query.pages) : [];
        mapped = pagesData
          .map((item) => ({
            id: item.pageid,
            title: item.title?.replace('File:', '') || 'Image',
            thumb: item.imageinfo?.[0]?.thumburl || item.imageinfo?.[0]?.url,
            url: item.imageinfo?.[0]?.url
          }))
          .filter((item) => item.url);
      }
      setWebAssets(mapped);
    } catch (error) {
      console.error('Web search failed', error);
      setWebAssets([]);
    } finally {
      setSearching(false);
    }
  };

  const addWebAssetToCanvas = (url) => {
    placeImageOnCanvas(url, 140, 140);
  };

  useEffect(() => {
    if (!canvas || !canvas.upperCanvasEl) return;

    const isLikelyImageUrl = (value) => {
      if (!value || typeof value !== 'string') return false;
      const trimmed = value.trim();
      if (!/^https?:\/\//i.test(trimmed) && !/^data:image\//i.test(trimmed)) return false;
      return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(trimmed) || /^data:image\//i.test(trimmed);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const pointer = canvas.getPointer(e);
      const left = pointer?.x ?? 100;
      const top = pointer?.y ?? 100;

      const file = e.dataTransfer?.files?.[0];
      if (file && file.type?.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => placeImageOnCanvas(ev.target?.result, left, top);
        reader.readAsDataURL(file);
        return;
      }

      const uri = e.dataTransfer?.getData('text/uri-list') || '';
      const text = e.dataTransfer?.getData('text/plain') || '';
      const candidate = (uri || text).trim();
      if (isLikelyImageUrl(candidate)) {
        placeImageOnCanvas(candidate, left, top);
      }
    };

    const upperEl = canvas.upperCanvasEl;
    const lowerEl = canvas.lowerCanvasEl;
    upperEl.addEventListener('dragover', handleDragOver);
    upperEl.addEventListener('drop', handleDrop);
    if (lowerEl) {
      lowerEl.addEventListener('dragover', handleDragOver);
      lowerEl.addEventListener('drop', handleDrop);
    }

    return () => {
      upperEl.removeEventListener('dragover', handleDragOver);
      upperEl.removeEventListener('drop', handleDrop);
      if (lowerEl) {
        lowerEl.removeEventListener('dragover', handleDragOver);
        lowerEl.removeEventListener('drop', handleDrop);
      }
    };
  }, [canvas]);

  const removeSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects?.length) {
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      return;
    }
    const obj = canvas.getActiveObject();
    if (!obj) return;
    canvas.remove(obj);
    canvas.renderAll();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key !== 'Delete' && e.key !== 'Backspace') || !canvas) return;

      const target = e.target;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      const activeObject = canvas.getActiveObject();
      if (activeObject?.isEditing) return;

      e.preventDefault();
      removeSelected();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas, removeSelected]);

  const undo = () => {
    if (!canvas || historyIndex <= 0) return;
    const next = historyIndex - 1;
    canvas.loadFromJSON(history[next], () => {
      canvas.renderAll();
      setHistoryIndex(next);
    });
  };

  const redo = () => {
    if (!canvas || historyIndex >= history.length - 1) return;
    const next = historyIndex + 1;
    canvas.loadFromJSON(history[next], () => {
      canvas.renderAll();
      setHistoryIndex(next);
    });
  };

  const renderPageToCanvas = (pageData) => {
    if (!canvas || !pageData) return Promise.resolve();
    return new Promise((resolve) => {
      canvas.clear();
      canvas.backgroundColor = backgroundColor;
      canvas.setDimensions({ width: pageData.width, height: pageData.height });
      if (pageData.json) {
        canvas.loadFromJSON(pageData.json, () => {
          canvas.renderAll();
          resolve();
        });
      } else {
        canvas.renderAll();
        resolve();
      }
    });
  };

  const exportCurrentPage = async () => {
    if (!canvas || pages.length === 0) return;
    const { jsPDF } = await import('jspdf');

    const currentThumbnail = getCanvasThumbnail();
    const pagesSnapshot = pages.map((page, idx) =>
      idx === currentPageIndex ? { ...page, json: canvas.toJSON(), thumbnail: currentThumbnail } : page
    );

    setPages(pagesSnapshot);

    const previousPage = pagesSnapshot[currentPageIndex];
    const firstPage = pagesSnapshot[0];
    const initialOrientation = firstPage.width >= firstPage.height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation: initialOrientation,
      unit: 'px',
      format: [firstPage.width, firstPage.height]
    });

    for (let i = 0; i < pagesSnapshot.length; i += 1) {
      const page = pagesSnapshot[i];
      await renderPageToCanvas(page);
      const image = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      });

      if (i > 0) {
        const orientation = page.width >= page.height ? 'landscape' : 'portrait';
        pdf.addPage([page.width, page.height], orientation);
      }
      pdf.addImage(image, 'PNG', 0, 0, page.width, page.height, undefined, 'FAST');
    }

    await renderPageToCanvas(previousPage);
    pdf.save('design.pdf');
  };

  const saveProject = () => {
    saveCurrentPageSnapshot();
    const payload = JSON.stringify({ pages, currentPageIndex }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'generic-designer-project.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadProject = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data?.pages?.length) return;
        setPages(data.pages);
        setCurrentPageIndex(data.currentPageIndex || 0);
      } catch (error) {
        console.error('Invalid project file', error);
      }
    };
    reader.readAsText(file);
  };

  const onPresetSizeChange = (presetId) => {
    const preset = SIZE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setCustomWidth(preset.width);
    setCustomHeight(preset.height);
    applyCanvasSize(preset.width, preset.height);
  };

  const updateSelectedObject = (property, value) => {
    if (!canvas || !selectedObject) return;
    selectedObject.set(property, value);
    canvas.renderAll();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="flex h-full flex-shrink-0">
        <div className="w-20 bg-white border-r border-gray-200 py-4 flex flex-col items-center gap-4 overflow-y-auto">
          {[
            { key: 'insert', label: 'Insert' },
            { key: 'qr', label: 'QR' },
            { key: 'pages', label: 'Pages' },
            { key: 'web', label: 'Web' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="w-full flex flex-col items-center gap-2 px-2"
              title={tab.label}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeTab === tab.key ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
                <span className="text-xs font-semibold text-emerald-700">{tab.label.slice(0, 2)}</span>
              </div>
              <span className="text-[10px] text-gray-700">{tab.label}</span>
            </button>
          ))}
        </div>

        <aside className="w-80 bg-white shadow-lg p-4 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-gray-900">Generic Designer</h1>
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Back
            </button>
          </div>

        {activeTab === 'insert' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={addText} className="p-2 rounded-lg bg-gray-900 text-white text-sm">Add Text</button>
              <button onClick={() => uploadRef.current?.click()} className="p-2 rounded-lg border border-gray-300 text-sm">Upload Image</button>
              <input ref={uploadRef} onChange={uploadImage} type="file" accept="image/*" className="hidden" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setOpenInsertSection((prev) => (prev === 'icons' ? null : 'icons'))}
                  className="text-sm font-semibold text-gray-900 hover:text-emerald-700"
                >
                  Quick Icons
                </button>
                {openInsertSection === 'icons' && (
                  <button
                    onClick={() => setShowAllIcons(!showAllIcons)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllIcons ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>
              {openInsertSection === 'icons' && (
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_ICONS.slice(0, showAllIcons ? undefined : 4).map((icon) => (
                    <button
                      key={icon.name}
                      onClick={() => addIconToCanvas(icon.svg, icon.name)}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                      title={icon.name}
                    >
                      <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setOpenInsertSection((prev) => (prev === 'emojis' ? null : 'emojis'))}
                  className="text-sm font-semibold text-gray-900 hover:text-emerald-700"
                >
                  Emojis
                </button>
                {openInsertSection === 'emojis' && (
                  <button
                    onClick={() => setShowAllEmojis(!showAllEmojis)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllEmojis ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>
              {openInsertSection === 'emojis' && (
                <div className="grid grid-cols-6 gap-2">
                  {QUICK_EMOJIS.slice(0, showAllEmojis ? undefined : 6).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmojiToCanvas(emoji)}
                      className="p-1.5 rounded-lg border border-gray-300 text-lg hover:bg-gray-50"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setOpenInsertSection((prev) => (prev === 'shapes' ? null : 'shapes'))}
                  className="text-sm font-semibold text-gray-900 hover:text-emerald-700"
                >
                  Shapes
                </button>
                {openInsertSection === 'shapes' && (
                  <button
                    onClick={() => setShowAllShapes(!showAllShapes)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllShapes ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>
              {openInsertSection === 'shapes' && (
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'rect', label: 'Rect' },
                    { id: 'circle', label: 'Circle' },
                    { id: 'triangle', label: 'Triangle' },
                    { id: 'line', label: 'Line' },
                    { id: 'ellipse', label: 'Ellipse' },
                    { id: 'polygon', label: 'Polygon' },
                    { id: 'star', label: 'Star' },
                    { id: 'arrow', label: 'Arrow' }
                  ].slice(0, showAllShapes ? undefined : 4).map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => addShape(shape.id)}
                      className="p-2 rounded-lg border border-gray-300 text-xs hover:bg-gray-50"
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-700 block mb-1">Text</label>
              <textarea
                rows={3}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-gray-700 block mb-1">Font Size</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 block mb-1">Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 block mb-1">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="Lexend Deca">Lexend Deca</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700 block mb-1">QR Content</label>
              <textarea
                rows={3}
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="URL / text / contact info"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">QR Size: {qrSize}px</label>
              <input
                type="range"
                min="80"
                max="320"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">QR Color</label>
              <input
                type="color"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
            <button onClick={addQrCode} className="w-full p-2 rounded-lg bg-gray-900 text-white text-sm">
              Add QR Code
            </button>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={addPage} className="p-2 rounded-lg bg-blue-600 text-white text-sm">Add Page</button>
              <button onClick={duplicatePage} className="p-2 rounded-lg border border-gray-300 text-sm">Duplicate</button>
              <button onClick={deletePage} className="p-2 rounded-lg border border-red-300 text-red-600 text-sm">Delete</button>
            </div>
            <div className="space-y-2">
              {pages.map((page, idx) => (
                <button
                  key={page.id}
                  onClick={() => switchToPage(idx)}
                  className={`w-full p-2 rounded-lg border text-left ${
                    idx === currentPageIndex ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{page.name}</div>
                  <div className="text-xs text-gray-500">{page.width} x {page.height}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'web' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images from web..."
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={searchWebAssets}
                className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm"
              >
                {searching ? '...' : 'Search'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[460px] overflow-auto">
              {webAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => addWebAssetToCanvas(asset.url)}
                  className="border border-gray-200 rounded-lg p-1 text-left hover:bg-gray-50"
                  title={asset.title}
                >
                  <img src={asset.thumb || asset.url} alt={asset.title} className="w-full h-24 object-cover rounded" />
                  <div className="text-[11px] mt-1 text-gray-600 line-clamp-2">{asset.title}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
      </div>

      <main className="flex-1 flex flex-col">
        <div className="bg-white shadow-md p-3 flex items-center justify-between gap-3 flex-shrink-0 overflow-hidden">
          <div className="flex items-center gap-3">
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
              onClick={removeSelected}
              className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete Selected"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12h8l1-12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Zoom</span>
            <input
              type="range"
              min="25"
              max="300"
              value={zoom}
              onChange={(e) => handleZoom(Number(e.target.value))}
            />
            <span className="text-sm font-semibold w-14 text-right">{zoom}%</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <select onChange={(e) => onPresetSizeChange(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Canvas Size Presets</option>
              {SIZE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>{preset.label}</option>
              ))}
            </select>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              className="w-24 p-2 border border-gray-300 rounded-lg text-sm"
              title="Width"
            />
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              className="w-24 p-2 border border-gray-300 rounded-lg text-sm"
              title="Height"
            />
            <button
              onClick={() => applyCanvasSize(customWidth, customHeight)}
              className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white"
            >
              Apply Size
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-200 p-3">
          <div className="flex items-center justify-center h-full">
            <div className="bg-white shadow-2xl rounded-lg p-2 inline-block" style={{ maxWidth: 'calc(100% - 2rem)', maxHeight: 'calc(100% - 2rem)' }}>
              <canvas ref={canvasElRef} style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md p-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">Page {currentPageIndex + 1}/{pages.length}</span>
            <button
              onClick={deletePage}
              disabled={pages.length <= 1}
              className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove Current Page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12h8l1-12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Background</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-10 border border-gray-300 rounded"
              />
            </div>

            {selectedObject && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Opacity</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(selectedObject.opacity ?? 1) * 100}
                  onChange={(e) => updateSelectedObject('opacity', Number(e.target.value) / 100)}
                />
              </div>
            )}

            <button onClick={saveProject} className="px-3 py-2 text-sm border border-gray-300 rounded-lg">Save Project</button>
            <button onClick={() => projectLoadRef.current?.click()} className="px-3 py-2 text-sm border border-gray-300 rounded-lg">Load Project</button>
            <input ref={projectLoadRef} type="file" accept="application/json" className="hidden" onChange={loadProject} />
            <button onClick={exportCurrentPage} className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">Save & Download</button>
          </div>
        </div>
      </main>

      <aside className="w-56 bg-white border-l border-gray-200 p-3 overflow-y-auto flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Pages</h3>
          <span className="text-xs text-gray-500">{pages.length}</span>
        </div>

        <div className="space-y-3">
          {pages.map((page, idx) => (
            <button
              key={page.id}
              onClick={() => switchToPage(idx)}
              className={`w-full text-left rounded-lg border p-2 transition-colors ${
                idx === currentPageIndex ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              title={`Go to ${page.name}`}
            >
              <div className="w-full h-24 rounded border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                {page.thumbnail ? (
                  <img
                    src={page.thumbnail}
                    alt={page.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No preview</span>
                )}
              </div>
              <div className="mt-2 text-xs font-medium text-gray-700">{page.name}</div>
              <div className="text-[11px] text-gray-500">{page.width} x {page.height}</div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default GenericProductDesigner;
