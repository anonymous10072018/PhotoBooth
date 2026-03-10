import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Download, 
  RefreshCw, 
  Timer as TimerIcon, 
  Layout, 
  Filter, 
  X, 
  Check, 
  CameraOff,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Share2,
  Upload,
  Image as ImageIcon,
  Grid,
  GalleryVertical,
  Edit3,
  Printer,
  Settings,
  ChevronDown,
  Loader2,
  AlertCircle,
  Folder
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
// Removed cloud API import

// --- Types ---
type Photo = {
  id: string;
  dataUrl: string;
  timestamp: number;
  rotation?: number;
};

type Frame = {
  id: string;
  name: string;
  color: string;
  borderWidth: string;
  overlay?: string;
  imageUrl?: string;
};

type FilterType = {
  id: string;
  name: string;
  css: string;
};

type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

type Template = {
  id: string;
  name: string;
  url: string;
  boxes?: Box[];
};

// --- Constants ---
const FRAMES: Frame[] = [
  { id: 'none', name: 'None', color: 'transparent', borderWidth: '0px' },
  { id: 'classic', name: 'Classic White', color: 'white', borderWidth: '12px' },
  { id: 'neon', name: 'Neon Pink', color: '#FF3B6B', borderWidth: '8px' },
  { id: 'retro', name: 'Retro Yellow', color: '#FFD700', borderWidth: '16px' },
  { id: 'dark', name: 'Dark Mode', color: '#18181b', borderWidth: '12px' },
];

const TEMPLATES: Template[] = [
  { id: 'none', name: 'No Template', url: '' },
  { 
    id: 'polaroid', 
    name: 'Polaroid', 
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDkwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjkwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iODIwIiBoZWlnaHQ9IjQ4MCIgZmlsbD0iYmxhY2siIGZpbGwtb3BhY2l0eT0iMCIvPjwvc3ZnPg==',
    boxes: [{ x: 40, y: 40, width: 820, height: 480 }]
  },
  { 
    id: 'magazine', 
    name: 'Vibe Mag', 
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDkwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRleHQgeD0iNDAiIHk9IjgwIiBmaWxsPSIjRkYzQjZCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjQiIGZvbnQtd2VpZ2h0PSJib2xkIj5WSUJFLjwvdGV4dD48dGV4dCB4PSI0MCIgeT0iNTYwIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0Ij5JU1NVRSBOTy4gMDEgLy8gMjAyNjwvdGV4dD48L3N2Zz4=' 
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDkwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMEg5MDBWNjAwSDBWME0yMCAyMEg4ODBWTTVEOFoiIGZpbGw9IiMwMEZGRkYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PHRleHQgeD0iNzAwIiB5PSI1ODAiIGZpbGw9IiMwMEZGRkYiIGZvbnQtZmFtaWx5PSJNb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiPlNZU1RFTV9SRUFEWTwvdGV4dD48L3N2Zz4=',
    boxes: [{ x: 20, y: 20, width: 860, height: 538 }]
  },
  {
    id: 'minimal',
    name: 'Minimal',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDkwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iODIwIiBoZWlnaHQ9IjUyMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iNDUwIiB5PSI1ODAiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iU2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtc3R5bGU9Iml0YWxpYyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TW9tZW50cyBpbiBUaW1lPC90ZXh0Pjwvc3ZnPg==',
    boxes: [{ x: 40, y: 40, width: 820, height: 520 }]
  }
];

const FILTERS: FilterType[] = [
  { id: 'none', name: 'Normal', css: 'none' },
  { id: 'grayscale', name: 'B&W', css: 'grayscale(100%)' },
  { id: 'sepia', name: 'Vintage', css: 'sepia(80%)' },
  { id: 'vibrant', name: 'Vibrant', css: 'saturate(150%) contrast(110%)' },
  { id: 'cool', name: 'Cool', css: 'hue-rotate(180deg) brightness(1.1)' },
  { id: 'warm', name: 'Warm', css: 'sepia(30%) saturate(120%)' },
];

// --- Components ---

export default function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [individualPhotos, setIndividualPhotos] = useState<Photo[]>([]);
  const [galleryTab, setGalleryTab] = useState<'composites' | 'individual'>('composites');
  const [currentFrame, setCurrentFrame] = useState<Frame>(FRAMES[0]);
  const [currentFilter, setCurrentFilter] = useState<FilterType>(FILTERS[0]);
  const [currentTemplate, setCurrentTemplate] = useState<Template>(TEMPLATES[0]);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [tempTemplateImage, setTempTemplateImage] = useState<string | null>(null);
  const [completedBoxes, setCompletedBoxes] = useState<{ x: number, y: number, w: number, h: number, rotation: number }[]>([]);
  const [drawingBox, setDrawingBox] = useState<{ x: number, y: number, w: number, h: number, rotation: number } | null>(null);
  const [isRotating, setIsRotating] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState<number | null>(null);
  const [isDraggingBox, setIsDraggingBox] = useState<number | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0, boxX: 0, boxY: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [rotateStartAngle, setRotateStartAngle] = useState(0);
  const [initialBoxRotation, setInitialBoxRotation] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPreparingShot, setIsPreparingShot] = useState(false);
  const [preparingShotIndex, setPreparingShotIndex] = useState<number | null>(null);
  const [boothName, setBoothName] = useState("VIBEBOOTH");
  const [timerSetting, setTimerSetting] = useState(3);
  const [sequenceCount, setSequenceCount] = useState(4);
  const [flash, setFlash] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [autoPrint, setAutoPrint] = useState(false);
  const [autoDownload, setAutoDownload] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraRetryCount, setCameraRetryCount] = useState(0);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isOperationMode, setIsOperationMode] = useState(false);
  const [saveDirectoryHandle, setSaveDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const getDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      // If we have devices but none selected, select the first one
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    getDevices();
  }, [getDevices]);

  useEffect(() => {
    let active = true;
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      // Clear previous error and stream state
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      try {
        const constraints: MediaStreamConstraints = { 
          video: { 
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        };
        
        if (!selectedDeviceId) {
          (constraints.video as MediaTrackConstraints).facingMode = 'user';
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!active) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        currentStream = mediaStream;
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Explicitly call play to ensure the preview starts
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Video play interrupted:", playErr);
          }
        }
        setCameraError(null);
        
        // Refresh devices to get labels
        getDevices();
      } catch (err) {
        if (active) {
          console.error("Camera access error:", err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
            setCameraError("Camera access denied. Please enable permissions in your browser settings.");
          } else if (errorMessage.includes("Could not start video source") || errorMessage.includes("NotReadableError")) {
            setCameraError("Camera is already in use by another application or is not responding.");
          } else {
            setCameraError("Could not connect to camera. Please check your connection.");
          }
        }
      }
    };

    startCamera();

    return () => {
      active = false;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId, getDevices, cameraRetryCount]);

  const refreshCamera = () => setCameraRetryCount(prev => prev + 1);

  const getDefaultBoxes = (count: number, canvasWidth: number, canvasHeight: number) => {
    const boxes = [];
    if (count === 3) {
      // Vertical strip
      const padding = canvasWidth * 0.05;
      const availableHeight = canvasHeight - (padding * 2);
      const boxHeight = availableHeight / 3;
      const boxWidth = boxHeight * (3/2); // Maintain 3:2 ratio for each shot
      const x = (canvasWidth - boxWidth) / 2;
      
      for (let i = 0; i < 3; i++) {
        boxes.push({ 
          x, 
          y: padding + (i * boxHeight), 
          width: boxWidth, 
          height: boxHeight * 0.95 
        });
      }
    } else if (count === 4) {
      // 2x2 grid
      const padding = canvasWidth * 0.05;
      const gap = 20;
      const boxWidth = (canvasWidth - (padding * 2) - gap) / 2;
      const boxHeight = (canvasHeight - (padding * 2) - gap) / 2;
      
      for (let i = 0; i < 4; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        boxes.push({ 
          x: padding + (col * (boxWidth + gap)), 
          y: padding + (row * (boxHeight + gap)), 
          width: boxWidth, 
          height: boxHeight 
        });
      }
    }
    return boxes;
  };

  // Capture Logic
  const capturePhoto = async (index: number, rawPhotos: string[]) => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Set canvas dimensions to 3:2 (4R) - 1800x1200 for high quality
    const targetRatio = 3 / 2;
    canvas.width = 1800;
    canvas.height = 1200;

    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;
    const sourceRatio = sourceWidth / sourceHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (sourceRatio > targetRatio) {
      drawHeight = sourceHeight;
      drawWidth = sourceHeight * targetRatio;
      offsetX = (sourceWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = sourceWidth;
      drawHeight = sourceWidth / targetRatio;
      offsetX = 0;
      offsetY = (sourceHeight - drawHeight) / 2;
    }

    // 1. Capture the RAW shot first (mirrored and filtered)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1800;
    tempCanvas.height = 1200;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.save();
      tempCtx.translate(tempCanvas.width, 0);
      tempCtx.scale(-1, 1);
      tempCtx.filter = currentFilter.css;
      tempCtx.drawImage(
        video, 
        offsetX, offsetY, drawWidth, drawHeight,
        0, 0, tempCanvas.width, tempCanvas.height
      );
      tempCtx.restore();
    }
    const rawDataUrl = tempCanvas.toDataURL('image/png');
    rawPhotos.push(rawDataUrl);

    // 2. Determine Layout
    let boxes = currentTemplate.boxes;
    const isMultiShot = sequenceCount > 1;
    
    if ((!boxes || boxes.length === 0 || (boxes.length < sequenceCount && isMultiShot)) && isMultiShot) {
      boxes = getDefaultBoxes(sequenceCount, canvas.width, canvas.height);
    }

    // 3. Assemble Composite
    if (boxes && boxes.length > 0) {
      // Always start with a clean white background
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw all raw photos collected so far into their boxes
      for (let i = 0; i <= index; i++) {
        if (rawPhotos[i] && boxes[i]) {
          const img = new Image();
          img.src = rawPhotos[i];
          await new Promise(resolve => img.onload = resolve);
          
          context.save();
          // Move to the center of the box
          const centerX = boxes[i].x + boxes[i].width / 2;
          const centerY = boxes[i].y + boxes[i].height / 2;
          context.translate(centerX, centerY);
          
          // Rotate if needed
          if (boxes[i].rotation) {
            context.rotate((boxes[i].rotation * Math.PI) / 180);
          }
          
          // Draw the image centered at the translated origin
          context.drawImage(
            img, 
            -boxes[i].width / 2, 
            -boxes[i].height / 2, 
            boxes[i].width, 
            boxes[i].height
          );
          context.restore();
        }
      }

      // Draw Template as OVERLAY (last)
      if (currentTemplate.url) {
        const templateImg = new Image();
        templateImg.src = currentTemplate.url;
        await new Promise(resolve => templateImg.onload = resolve);
        context.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
      }
    } else {
      // Single shot / Overlay mode
      const img = new Image();
      img.src = rawDataUrl;
      await new Promise(resolve => img.onload = resolve);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw template as overlay
      if (currentTemplate.url) {
        const templateImg = new Image();
        templateImg.src = currentTemplate.url;
        await new Promise(resolve => templateImg.onload = resolve);
        context.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
      }
    }

    // Draw Frame on top of everything
    if (currentFrame.id !== 'none') {
      const bWidth = parseInt(currentFrame.borderWidth) * (canvas.width / video.clientWidth);
      context.strokeStyle = currentFrame.color;
      context.lineWidth = bWidth;
      context.strokeRect(bWidth / 2, bWidth / 2, canvas.width - bWidth, canvas.height - bWidth);
    }

    // Trigger Flash UI
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    return canvas.toDataURL('image/png');
  };

  const finishSequence = () => {
    setIsCapturing(false);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF3B6B', '#6B3BFF', '#FFD700']
    });
    setShowGallery(true);
  };

  const selectSaveFolder = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert("Your browser does not support direct folder saving. Please use a modern browser like Chrome or Edge.");
        return;
      }
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      setSaveDirectoryHandle(handle);
    } catch (err: any) {
      console.error("Directory selection failed:", err);
      if (err.name === 'SecurityError' || err.message?.includes('Cross origin sub frames')) {
        alert("Security restriction: This feature cannot be used inside the preview window. Please open the app in a new tab using the 'Open in new tab' button in the top right.");
      } else if (err.name !== 'AbortError') {
        alert("Failed to select folder: " + err.message);
      }
    }
  };

  const saveToLocalFolder = async (dataUrl: string, filename: string) => {
    if (!saveDirectoryHandle) return;
    try {
      const blob = dataURLtoBlob(dataUrl);
      const fileHandle = await saveDirectoryHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (err) {
      console.error("Failed to save file locally:", err);
    }
  };

  const startSequence = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    const rawPhotos: string[] = [];
    let lastComposite = '';

    for (let i = 0; i < sequenceCount; i++) {
      // Preparation phase
      setPreparingShotIndex(i + 1);
      setIsPreparingShot(true);
      await new Promise(r => setTimeout(r, 2000));
      setIsPreparingShot(false);
      setPreparingShotIndex(null);

      // Countdown
      for (let c = timerSetting; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(null);
      
      // Capture and Assemble
      const composite = await capturePhoto(i, rawPhotos);
      if (composite) {
        lastComposite = composite;
      }
      
      // Short pause between shots
      if (i < sequenceCount - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // strictly add ONLY the final composite to the gallery
    if (lastComposite) {
      const finalPhoto: Photo = {
        id: Math.random().toString(36).substr(2, 9),
        dataUrl: lastComposite,
        timestamp: Date.now(),
        rotation: 0,
      };
      setPhotos(prev => [...prev, finalPhoto]);

      // Save individual raw photos to the individual gallery
      const newIndividualPhotos = rawPhotos.map(dataUrl => ({
        id: Math.random().toString(36).substr(2, 9),
        dataUrl,
        timestamp: Date.now(),
        rotation: 0,
      }));
      setIndividualPhotos(prev => [...prev, ...newIndividualPhotos]);

      // Auto Download / Local Save
      if (autoDownload || saveDirectoryHandle) {
        const triggerDownload = (url: string, filename: string) => {
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        const timestamp = new Date().getTime();
        const compositeName = `vibebooth-composite-${finalPhoto.id}-${timestamp}.png`;

        // Save to local folder if selected
        if (saveDirectoryHandle) {
          await saveToLocalFolder(lastComposite, compositeName);
          for (let i = 0; i < rawPhotos.length; i++) {
            await saveToLocalFolder(rawPhotos[i], `vibebooth-photo-${i + 1}-${finalPhoto.id}-${timestamp}.png`);
          }
        } else if (autoDownload) {
          // Fallback to standard download if no folder selected
          triggerDownload(lastComposite, compositeName);
          rawPhotos.forEach((dataUrl, index) => {
            setTimeout(() => {
              triggerDownload(dataUrl, `vibebooth-photo-${index + 1}-${finalPhoto.id}-${timestamp}.png`);
            }, (index + 1) * 200);
          });
        }
      }

      // Auto Print
      if (autoPrint) {
        printPhoto(lastComposite);
      }
    }

    finishSequence();
  };

  const printPhoto = (dataUrl: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.write(`
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; display: block; }
              @page { margin: 0; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print();" />
          </body>
        </html>
      `);
      doc.close();
      
      // Cleanup after printing
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  };

  const downloadAll = () => {
    const targetPhotos = galleryTab === 'composites' ? photos : individualPhotos;
    targetPhotos.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.dataUrl;
        link.download = `vibebooth-${galleryTab}-${photo.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 200);
    });
  };

  const rotateGalleryPhoto = (id: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === id ? { ...p, rotation: (p.rotation || 0) + 90 } : p
    ));
    setIndividualPhotos(prev => prev.map(p => 
      p.id === id ? { ...p, rotation: (p.rotation || 0) + 90 } : p
    ));
  };

  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    setIndividualPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setTempTemplateImage(url);
        setIsCreatingTemplate(true);
        setCompletedBoxes([]);
        setDrawingBox(null);
      };
      reader.readAsDataURL(file);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCreatingTemplate || !tempTemplateImage || completedBoxes.length >= sequenceCount) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setIsDrawing(true);
    setDrawingBox({ x, y, w: 0, h: 0, rotation: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const w = Math.min(x - startPos.x, rect.width - startPos.x);
    const h = Math.min(y - startPos.y, rect.height - startPos.y);
    
    const finalX = Math.max(0, w < 0 ? x : startPos.x);
    const finalY = Math.max(0, h < 0 ? y : startPos.y);
    const finalW = Math.min(Math.abs(w), rect.width - finalX);
    const finalH = Math.min(Math.abs(h), rect.height - finalY);

    setDrawingBox({
      x: finalX,
      y: finalY,
      w: finalW,
      h: finalH,
      rotation: 0
    });
  };

  const handleMouseUp = () => {
    if (isDrawing && drawingBox && drawingBox.w > 20 && drawingBox.h > 20) {
      setCompletedBoxes(prev => [...prev, drawingBox]);
    }
    setIsDrawing(false);
    setDrawingBox(null);
  };

  const handleRotateStart = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const rect = document.getElementById('template-creator-container')?.getBoundingClientRect();
    if (!rect) return;
    
    const box = completedBoxes[index];
    const centerX = box.x + box.w / 2;
    const centerY = box.y + box.h / 2;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    
    setIsRotating(index);
    setRotateStartAngle(angle);
    setInitialBoxRotation(box.rotation || 0);
  };

  const handleResizeStart = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const box = completedBoxes[index];
    setIsResizing(index);
    setResizeStartPos({ x: e.clientX, y: e.clientY, w: box.w, h: box.h });
  };

  const handleDragStart = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const box = completedBoxes[index];
    setIsDraggingBox(index);
    setDragStartPos({ x: e.clientX, y: e.clientY, boxX: box.x, boxY: box.y });
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    const rect = document.getElementById('template-creator-container')?.getBoundingClientRect();
    if (!rect) return;

    if (isRotating !== null) {
      const box = completedBoxes[isRotating];
      const centerX = box.x + box.w / 2;
      const centerY = box.y + box.h / 2;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX);
      const angleDiff = currentAngle - rotateStartAngle;
      
      const newRotation = initialBoxRotation + (angleDiff * 180 / Math.PI);
      
      setCompletedBoxes(prev => prev.map((b, i) => 
        i === isRotating ? { ...b, rotation: newRotation } : b
      ));
    } else if (isResizing !== null) {
      const dx = e.clientX - resizeStartPos.x;
      const dy = e.clientY - resizeStartPos.y;
      
      setCompletedBoxes(prev => prev.map((b, i) => {
        if (i === isResizing) {
          const newW = Math.max(20, Math.min(resizeStartPos.w + dx, rect.width - b.x));
          const newH = Math.max(20, Math.min(resizeStartPos.h + dy, rect.height - b.y));
          return { ...b, w: newW, h: newH };
        }
        return b;
      }));
    } else if (isDraggingBox !== null) {
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      
      setCompletedBoxes(prev => prev.map((b, i) => {
        if (i === isDraggingBox) {
          const newX = Math.max(0, Math.min(dragStartPos.boxX + dx, rect.width - b.w));
          const newY = Math.max(0, Math.min(dragStartPos.boxY + dy, rect.height - b.h));
          return { ...b, x: newX, y: newY };
        }
        return b;
      }));
    }
  };

  const handleGlobalMouseUp = () => {
    setIsRotating(null);
    setIsResizing(null);
    setIsDraggingBox(null);
  };

  useEffect(() => {
    if (isRotating !== null || isResizing !== null || isDraggingBox !== null) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isRotating, isResizing, isDraggingBox, rotateStartAngle, initialBoxRotation, resizeStartPos, dragStartPos]);

  const saveCustomTemplate = () => {
    if (!tempTemplateImage || completedBoxes.length === 0) return;

    // Scale drawing boxes to 1800x1200
    const container = document.getElementById('template-creator-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scaleX = 1800 / rect.width;
    const scaleY = 1200 / rect.height;

    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: `Custom ${completedBoxes.length} Shots`,
      url: tempTemplateImage,
      boxes: completedBoxes.map(box => ({
        x: box.x * scaleX,
        y: box.y * scaleY,
        width: box.w * scaleX,
        height: box.h * scaleY,
        rotation: box.rotation
      }))
    };

    setCustomTemplates(prev => [...prev, newTemplate]);
    setCurrentTemplate(newTemplate);
    setIsCreatingTemplate(false);
    setTempTemplateImage(null);
    setCompletedBoxes([]);
    setDrawingBox(null);
  };

  const editCustomTemplate = (template: Template) => {
    setTempTemplateImage(template.url);
    setCompletedBoxes(template.boxes.map(box => {
      // We need to scale back from 1800x1200 to the container size
      // But we don't know the container size yet.
      // Actually, the drawing logic uses pixels relative to the container.
      // This is tricky because the container size might change.
      // For now, let's just use the 1800x1200 values and scale them in the editor.
      // Wait, the editor uses absolute pixels from the bounding rect.
      // Let's just store the original drawing boxes if possible, or re-calculate.
      
      const container = document.getElementById('template-creator-container');
      const rect = container?.getBoundingClientRect() || { width: 800, height: 600 }; // Fallback
      const scaleX = rect.width / 1800;
      const scaleY = rect.height / 1200;
      
      return {
        x: box.x * scaleX,
        y: box.y * scaleY,
        w: box.width * scaleX,
        h: box.height * scaleY,
        rotation: box.rotation || 0
      };
    }));
    setIsCreatingTemplate(true);
  };

  const deleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
    if (currentTemplate.id === id) {
      setCurrentTemplate(TEMPLATES[0]);
    }
  };

  const generateStrip = async (layoutType: 'strip' | 'grid' = 'strip') => {
    if (photos.length === 0) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stripPhotos = photos.slice(-4); // Take up to 4 photos
    const photoWidth = 800;
    const photoHeight = 600;
    const padding = 40;
    const headerHeight = 100;
    const footerHeight = 100;

    if (layoutType === 'strip') {
      canvas.width = photoWidth + (padding * 2);
      canvas.height = (photoHeight * stripPhotos.length) + (padding * (stripPhotos.length + 1)) + headerHeight + footerHeight;
    } else {
      // 2x2 Grid
      canvas.width = (photoWidth * 2) + (padding * 3);
      canvas.height = (photoHeight * 2) + (padding * 3) + headerHeight + footerHeight;
    }

    // Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Photos
    for (let i = 0; i < stripPhotos.length; i++) {
      const img = new Image();
      img.src = stripPhotos[i].dataUrl;
      await new Promise(resolve => img.onload = resolve);
      
      let x = padding;
      let y = headerHeight + padding;

      if (layoutType === 'strip') {
        y += i * (photoHeight + padding);
      } else {
        // Grid 2x2
        x += (i % 2) * (photoWidth + padding);
        y += Math.floor(i / 2) * (photoHeight + padding);
      }
      
      ctx.drawImage(img, x, y, photoWidth, photoHeight);
      
      // Optional: Add a subtle border to each photo
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, photoWidth, photoHeight);
    }

    // Header/Footer Text
    ctx.fillStyle = '#FF3B6B';
    ctx.font = 'bold 40px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('VIBEBOOTH', canvas.width / 2, 60);
    
    ctx.fillStyle = '#888';
    ctx.font = '24px JetBrains Mono';
    ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, canvas.height - 40);

    const stripUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = stripUrl;
    link.download = `vibebooth-${layoutType}-${Date.now()}.png`;
    link.click();
    
    confetti({
      particleCount: 100,
      spread: 50,
      origin: { y: 0.8 }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-12 flex flex-col items-center overflow-y-auto">
      {/* Template Creator Modal */}
      <AnimatePresence>
        {isCreatingTemplate && tempTemplateImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
          >
            <div className="w-full max-w-5xl flex flex-col items-center gap-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">Define Photo Areas</h2>
                <p className="text-zinc-400">
                  Draw {sequenceCount} boxes on the template. 
                  {completedBoxes.length < sequenceCount ? (
                    <span className="text-brand font-bold ml-2">Drawing Box {completedBoxes.length + 1} of {sequenceCount}</span>
                  ) : (
                    <span className="text-emerald-500 font-bold ml-2">All boxes drawn!</span>
                  )}
                </p>
              </div>

              <div 
                id="template-creator-container"
                className="relative aspect-[3/2] w-full max-w-4xl bg-zinc-900 rounded-2xl overflow-hidden cursor-crosshair border-2 border-white/10 shadow-2xl select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img 
                  src={tempTemplateImage} 
                  className="w-full h-full object-fill pointer-events-none" 
                  alt="Template Preview" 
                  referrerPolicy="no-referrer"
                />
                
                {completedBoxes.map((box, idx) => (
                  <div 
                    key={idx}
                    className="absolute border-2 border-emerald-500 bg-emerald-500/10 cursor-move pointer-events-auto"
                    onMouseDown={(e) => handleDragStart(e, idx)}
                    style={{
                      left: box.x,
                      top: box.y,
                      width: box.w,
                      height: box.h,
                      transform: `rotate(${box.rotation}deg)`
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                      Box {idx + 1}
                    </div>
                    
                    {/* Rotation Handle */}
                    <div 
                      className="absolute -top-10 left-1/2 -translate-x-1/2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto shadow-lg"
                      onMouseDown={(e) => handleRotateStart(e, idx)}
                    >
                      <RefreshCw className="w-3 h-3 text-white" />
                    </div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-emerald-500" />

                    {/* Resize Handle */}
                    <div 
                      className="absolute -bottom-2 -right-2 w-5 h-5 bg-emerald-500 rounded-sm cursor-nwse-resize pointer-events-auto shadow-lg flex items-center justify-center"
                      onMouseDown={(e) => handleResizeStart(e, idx)}
                    >
                      <div className="w-2 h-2 border-r-2 border-b-2 border-white/50" />
                    </div>
                  </div>
                ))}

                {drawingBox && (
                  <div 
                    className="absolute border-4 border-brand bg-brand/20 shadow-[0_0_30px_rgba(255,59,107,0.5)] pointer-events-none"
                    style={{
                      left: drawingBox.x,
                      top: drawingBox.y,
                      width: drawingBox.w,
                      height: drawingBox.h
                    }}
                  >
                    <div className="absolute -top-8 left-0 bg-brand text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                      Drawing Box {completedBoxes.length + 1}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setIsCreatingTemplate(false);
                    setTempTemplateImage(null);
                    setCompletedBoxes([]);
                  }}
                  className="px-8 py-4 bg-zinc-800 text-white rounded-full font-bold hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setCompletedBoxes([])}
                  disabled={completedBoxes.length === 0}
                  className="px-8 py-4 bg-zinc-800 text-white rounded-full font-bold hover:bg-zinc-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  Reset Boxes
                </button>
                <button 
                  onClick={saveCustomTemplate}
                  disabled={completedBoxes.length !== sequenceCount}
                  className={`
                    px-12 py-4 rounded-full font-black text-lg transition-all cursor-pointer
                    ${completedBoxes.length !== sequenceCount
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'bg-brand text-white hover:bg-brand-dark neon-glow'}
                  `}
                >
                  Save Template
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      {!isOperationMode && (
        <header className="w-full max-w-6xl flex items-center justify-between mb-12 relative z-[60]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg neon-glow rotate-3">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter leading-none">{boothName}</h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Digital Photo Experience</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsOperationMode(true)}
              className="flex items-center gap-2 px-6 py-3 bg-brand/10 border border-brand/30 text-brand rounded-full font-bold text-sm hover:bg-brand hover:text-white transition-all cursor-pointer shadow-lg"
              title="Picture Time Mode"
            >
              <Camera className="w-4 h-4" />
              Picture Time
            </button>
            <button 
              onClick={() => setShowGallery(true)}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-white/10 rounded-full font-bold text-sm hover:bg-zinc-800 transition-all cursor-pointer shadow-lg"
            >
              <GalleryVertical className="w-4 h-4 text-brand" />
              Gallery
              {photos.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-brand text-white text-[10px] rounded-full">
                  {photos.length}
                </span>
              )}
            </button>
          </div>
        </header>
      )}

      {isOperationMode && (
        <div className="fixed top-8 right-8 z-[100]">
          <button 
            onClick={() => setIsOperationMode(false)}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900/80 backdrop-blur-md border border-white/10 text-white rounded-full font-bold text-sm hover:bg-red-500 transition-all cursor-pointer shadow-2xl"
          >
            <X className="w-4 h-4" />
            Exit Picture Time
          </button>
        </div>
      )}

      <div className={`w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-start relative z-10 ${isOperationMode ? 'justify-center' : ''}`}>
        {/* Left: Camera View */}
        <div className={`flex-1 w-full space-y-8 relative z-10 transition-all duration-500 ${isSidebarMinimized || isOperationMode ? 'lg:max-w-none' : ''}`}>
          <div className={`relative aspect-[3/2] rounded-[2rem] overflow-hidden bg-zinc-900 border-4 border-zinc-800 shadow-2xl ${isOperationMode ? 'max-w-4xl mx-auto' : ''}`}>
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-zinc-900 z-20">
                <CameraOff className="w-16 h-16 text-zinc-700 mb-4" />
                <p className="text-zinc-500 max-w-xs">{cameraError}</p>
                <button 
                  onClick={refreshCamera}
                  className="mt-8 px-8 py-3 bg-brand rounded-full font-bold hover:bg-brand-dark transition-colors cursor-pointer"
                >
                  Reconnect Camera
                </button>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1] pointer-events-none relative z-0"
                  style={{ filter: currentFilter.css }}
                />
                
                {/* Frame Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{ 
                    border: `${currentFrame.borderWidth} solid ${currentFrame.color}`,
                  }}
                />

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    <span className="text-[12rem] font-black text-white drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Preparation Overlay */}
                <AnimatePresence>
                  {isPreparingShot && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40 bg-black/40 backdrop-blur-sm"
                    >
                      <motion.span 
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        className="text-2xl font-black text-brand uppercase tracking-[0.3em] mb-4"
                      >
                        Get Ready!
                      </motion.span>
                      <motion.span 
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl font-black text-white uppercase tracking-tight text-center px-8"
                      >
                        Shot {preparingShotIndex} of {sequenceCount}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Flash Effect */}
                {flash && <div className="absolute inset-0 bg-white z-50" />}

                {/* Status Indicator */}
                <div className="absolute top-6 left-6 z-20">
                  <div className="px-4 py-2 rounded-full bg-black/60 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isCapturing ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    {isCapturing ? 'Capturing...' : 'Live'}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex flex-wrap items-center justify-center gap-6 relative z-20">
            {!isOperationMode && (
              <>
                <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 px-6 py-3 rounded-2xl shadow-lg">
                  <TimerIcon className="w-5 h-5 text-brand" />
                  <select 
                    value={timerSetting} 
                    onChange={(e) => setTimerSetting(Number(e.target.value))}
                    className="bg-transparent text-base font-bold focus:outline-none cursor-pointer text-white"
                    disabled={isCapturing}
                  >
                    <option value={3} className="bg-zinc-900">3s Timer</option>
                    <option value={5} className="bg-zinc-900">5s Timer</option>
                    <option value={10} className="bg-zinc-900">10s Timer</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 px-6 py-3 rounded-2xl shadow-lg">
                  <Layout className="w-5 h-5 text-brand" />
                    <select 
                      value={sequenceCount} 
                      onChange={(e) => setSequenceCount(Number(e.target.value))}
                      className="bg-transparent text-base font-bold focus:outline-none cursor-pointer text-white"
                      disabled={isCapturing}
                    >
                      <option value={1} className="bg-zinc-900">1 Shot</option>
                      <option value={2} className="bg-zinc-900">2 Shots</option>
                      <option value={3} className="bg-zinc-900">3 Shots</option>
                      <option value={4} className="bg-zinc-900">4 Shots</option>
                      <option value={5} className="bg-zinc-900">5 Shots</option>
                      <option value={6} className="bg-zinc-900">6 Shots</option>
                    </select>
                </div>
              </>
            )}

            <button 
              onClick={startSequence}
              disabled={isCapturing || !!cameraError}
              className={`
                px-12 py-5 rounded-full font-black text-xl flex items-center gap-4 transition-all cursor-pointer shadow-2xl
                ${isCapturing 
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : 'bg-brand hover:bg-brand-dark text-white neon-glow hover:scale-105 active:scale-95'}
                ${isOperationMode ? 'scale-125' : ''}
              `}
            >
              {isCapturing ? (
                <>
                  <RefreshCw className="w-7 h-7 animate-spin" />
                  Capturing
                </>
              ) : (
                <>
                  <Camera className="w-7 h-7" />
                  Take Photos
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Customization Sidebar */}
        {!isOperationMode && (
          <AnimatePresence mode="wait">
            {!isSidebarMinimized ? (
              <motion.div 
                key="sidebar"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full lg:w-96 space-y-10 bg-zinc-900 p-8 rounded-[2rem] border border-white/10 shadow-2xl relative z-50"
              >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black italic tracking-tight text-white">CUSTOMIZE</h2>
                <button 
                  onClick={() => setIsSidebarMinimized(true)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Minimize Sidebar"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Booth Name */}
          <section className="relative z-50">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Booth Name
            </h3>
            <div className="relative">
              <input 
                type="text"
                value={boothName}
                onChange={(e) => setBoothName(e.target.value.toUpperCase())}
                placeholder="Enter Booth Name"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-bold focus:border-brand focus:outline-none transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600 pointer-events-none">
                EDITABLE
              </div>
            </div>
          </section>

          {/* Camera Selection */}
          {devices.length > 1 && (
            <section className="relative z-50">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Select Camera
              </h3>
              <div className="relative">
                <select 
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-bold focus:border-brand focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </section>
          )}

          {/* Automation Settings */}
          <section className="relative z-50">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Automation
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-brand/50 transition-all group">
                <div className="flex items-center gap-3">
                  <Printer className="w-4 h-4 text-zinc-500 group-hover:text-brand transition-colors" />
                  <span className="text-sm font-bold">Auto Print</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoPrint} 
                  onChange={(e) => setAutoPrint(e.target.checked)}
                  className="w-5 h-5 accent-brand cursor-pointer"
                />
              </label>
              
              <label className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-brand/50 transition-all group">
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-zinc-500 group-hover:text-brand transition-colors" />
                  <span className="text-sm font-bold">Auto Download</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoDownload} 
                  onChange={(e) => setAutoDownload(e.target.checked)}
                  className="w-5 h-5 accent-brand cursor-pointer"
                />
              </label>
            </div>
          </section>

          {/* Frames */}
          <section className="relative z-50">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Select Frame
            </h3>
            <div className="grid grid-cols-3 gap-3 relative z-50">
              {FRAMES.map((frame) => (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => setCurrentFrame(frame)}
                  className={`
                    aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-center p-2 cursor-pointer relative z-50
                    ${currentFrame.id === frame.id ? 'border-brand bg-brand/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'}
                  `}
                >
                  <div 
                    className="w-6 h-6 rounded-md mb-2 pointer-events-none" 
                    style={{ 
                      background: frame.color,
                      border: frame.id === 'none' ? '1px dashed #333' : 'none'
                    }} 
                  />
                  <span className="text-[10px] font-bold text-center leading-tight pointer-events-none">{frame.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Save Settings */}
          <section className="relative z-50">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Storage Settings
            </h3>
            <div className="space-y-4">
              <button
                onClick={selectSaveFolder}
                className={`w-full py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold text-sm cursor-pointer ${saveDirectoryHandle ? 'border-brand bg-brand/10 text-brand' : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800'}`}
              >
                <Folder className="w-5 h-5" />
                {saveDirectoryHandle ? 'Change Save Folder' : 'Set Save Folder'}
              </button>
              {window.self !== window.top && !saveDirectoryHandle && (
                <p className="text-[10px] text-amber-500 font-medium text-center px-2">
                  Note: To use this feature, open the app in a new tab.
                </p>
              )}
              {saveDirectoryHandle && (
                <p className="text-[10px] text-brand font-mono uppercase text-center">
                  Saving directly to local folder
                </p>
              )}
            </div>
          </section>

          {/* Templates */}
          <section className="relative z-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Select Template
              </h3>
              <button 
                onClick={() => {
                  setTempTemplateImage(currentTemplate.url);
                  setCompletedBoxes([]); // Start fresh or could load existing
                  setIsCreatingTemplate(true);
                }}
                className="text-[10px] font-bold text-brand hover:underline cursor-pointer"
              >
                Adjust Layout
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 relative z-50">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setCurrentTemplate(template)}
                  className={`
                    aspect-video rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-4 cursor-pointer relative z-50
                    ${currentTemplate.id === template.id ? 'border-brand bg-brand/10 shadow-[0_0_20px_rgba(255,59,107,0.2)]' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-800'}
                  `}
                >
                  <span className="text-xs font-bold text-center leading-tight pointer-events-none">{template.name}</span>
                </button>
              ))}

              {customTemplates.map((template) => (
                <div key={template.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => setCurrentTemplate(template)}
                    className={`
                      w-full aspect-video rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-4 cursor-pointer relative z-50
                      ${currentTemplate.id === template.id ? 'border-brand bg-brand/10 shadow-[0_0_20px_rgba(255,59,107,0.2)]' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-800'}
                    `}
                  >
                    <span className="text-xs font-bold text-center leading-tight pointer-events-none">{template.name}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      editCustomTemplate(template);
                    }}
                    className="absolute -top-2 -right-10 w-6 h-6 bg-zinc-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-[60] hover:bg-zinc-700 shadow-lg"
                    title="Edit Boxes"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => deleteCustomTemplate(template.id, e)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-[60] hover:bg-red-600 shadow-lg"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {/* Custom Template Upload Button */}
              <label className={`
                aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 cursor-pointer relative z-50
                ${isCreatingTemplate ? 'border-brand bg-brand/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-800'}
              `}>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleTemplateUpload} 
                />
                <Upload className="w-6 h-6 text-zinc-600 mb-2 pointer-events-none" />
                <span className="text-xs font-bold text-center leading-tight pointer-events-none">Create Template</span>
              </label>
            </div>
          </section>

          {/* Filters */}
          <section className="relative z-50">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Photo Filters
            </h3>
            <div className="grid grid-cols-2 gap-4 relative z-50">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setCurrentFilter(filter)}
                  className={`
                    aspect-video rounded-2xl border-2 transition-all flex items-center justify-center p-3 cursor-pointer relative z-50
                    ${currentFilter.id === filter.id ? 'border-brand bg-brand/10 shadow-[0_0_20px_rgba(255,59,107,0.2)]' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-800'}
                  `}
                >
                  <span className="text-xs font-bold text-center leading-tight pointer-events-none">{filter.name}</span>
                </button>
              ))}
            </div>
          </section>
        </motion.div>
      ) : (
        <motion.div 
          key="minimized-sidebar"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="hidden lg:flex flex-col gap-4 relative z-50"
        >
          <button 
            onClick={() => setIsSidebarMinimized(false)}
            className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-brand hover:bg-zinc-800 transition-all cursor-pointer shadow-xl group"
            title="Expand Sidebar"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex flex-col gap-3">
            <div className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-500 shadow-lg" title="Settings">
              <Settings className="w-6 h-6" />
            </div>
            <div className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-500 shadow-lg" title="Filters">
              <Filter className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )}
</div>

      {/* Full Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col p-4 md:p-8 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto flex flex-col h-full relative z-[110]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black italic tracking-tighter">YOUR GALLERY</h2>
                <div className="flex items-center gap-6 mt-2">
                  <button 
                    onClick={() => setGalleryTab('composites')}
                    className={`text-sm font-mono uppercase tracking-widest transition-all cursor-pointer pb-1 border-b-2 ${galleryTab === 'composites' ? 'text-brand border-brand' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
                  >
                    Composites ({photos.length})
                  </button>
                  <button 
                    onClick={() => setGalleryTab('individual')}
                    className={`text-sm font-mono uppercase tracking-widest transition-all cursor-pointer pb-1 border-b-2 ${galleryTab === 'individual' ? 'text-brand border-brand' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
                  >
                    Individual ({individualPhotos.length})
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {(galleryTab === 'composites' ? photos : individualPhotos).length > 0 && (
                  <>
                    {galleryTab === 'composites' && (
                      <div className="flex bg-zinc-900 border border-white/10 rounded-full p-1">
                        <button 
                          onClick={() => generateStrip('strip')}
                          className="flex items-center gap-2 px-4 py-2 text-white rounded-full font-bold text-xs hover:bg-brand transition-all cursor-pointer"
                          title="Vertical Strip"
                        >
                          <Layout className="w-3 h-3" />
                          Strip
                        </button>
                        <button 
                          onClick={() => generateStrip('grid')}
                          className="flex items-center gap-2 px-4 py-2 text-white rounded-full font-bold text-xs hover:bg-brand transition-all cursor-pointer"
                          title="2x2 Grid"
                        >
                          <Grid className="w-3 h-3" />
                          Grid
                        </button>
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        if (galleryTab === 'composites') setPhotos([]);
                        else if (galleryTab === 'individual') setIndividualPhotos([]);
                      }}
                      className="flex items-center gap-2 px-4 py-3 rounded-full bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white font-bold text-sm transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Tab
                    </button>
                    <button 
                      onClick={downloadAll}
                      className="flex items-center gap-2 px-6 py-3 bg-brand rounded-full font-bold text-sm hover:bg-brand-dark transition-all neon-glow cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download All
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setShowGallery(false)}
                  className="p-3 rounded-full bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {(galleryTab === 'composites' ? photos : individualPhotos).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Camera className="w-20 h-20 text-zinc-800 mb-6" />
                <h3 className="text-xl font-bold text-zinc-400">No {galleryTab} yet!</h3>
                <p className="text-zinc-600 max-w-xs mt-2">Start a booth sequence to capture some memories.</p>
                <button 
                  onClick={() => setShowGallery(false)}
                  className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Go Back to Camera
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(galleryTab === 'composites' ? photos : individualPhotos).slice().reverse().map((photo) => (
                    <div 
                      key={photo.id}
                      className="group relative"
                    >
                      <div 
                        className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 transition-transform group-hover:scale-[1.02]"
                        style={{ 
                          border: galleryTab === 'composites' ? `${currentFrame.borderWidth} solid ${currentFrame.color}` : 'none',
                          transform: `rotate(${photo.rotation || 0}deg)`
                        }}
                      >
                        <img src={photo.dataUrl} alt="Booth Capture" className="w-full h-full object-cover" />
                        
                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                          <button 
                            onClick={() => setPreviewPhoto(photo)}
                            className="p-3 bg-white text-black rounded-full hover:bg-brand hover:text-white transition-colors cursor-pointer"
                            title="Preview Photo"
                          >
                            <ImageIcon className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => rotateGalleryPhoto(photo.id)}
                            className="p-3 bg-white text-black rounded-full hover:bg-brand hover:text-white transition-colors cursor-pointer"
                            title="Rotate Photo"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                          <a 
                            href={photo.dataUrl} 
                            download={`vibebooth-${photo.id}.png`}
                            className="p-3 bg-white text-black rounded-full hover:bg-brand hover:text-white transition-colors cursor-pointer"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                          <button 
                            onClick={() => deletePhoto(photo.id)}
                            className="p-3 bg-white text-black rounded-full hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between px-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          {new Date(photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button className="text-zinc-500 hover:text-brand transition-colors cursor-pointer">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
          >
            <div className="w-full max-w-4xl flex flex-col items-center gap-8">
              <div className="relative w-full aspect-[3/2] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src={previewPhoto.dataUrl} 
                  className="w-full h-full object-contain" 
                  style={{ transform: `rotate(${previewPhoto.rotation || 0}deg)` }}
                  alt="Preview" 
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setPreviewPhoto(null)}
                  className="px-8 py-4 bg-zinc-800 text-white rounded-full font-bold hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button 
                  onClick={() => printPhoto(previewPhoto.dataUrl)}
                  className="px-12 py-4 bg-brand text-white rounded-full font-black text-lg hover:bg-brand-dark transition-all cursor-pointer neon-glow flex items-center gap-3"
                >
                  <Printer className="w-6 h-6" />
                  Print Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Footer Branding */}
      <footer className="mt-12 text-zinc-600 text-[10px] font-mono uppercase tracking-[0.3em] flex items-center gap-4">
        <span>Built for Memories</span>
        <div className="w-1 h-1 rounded-full bg-zinc-800" />
        <span>VibeBooth v1.0</span>
        <div className="w-1 h-1 rounded-full bg-zinc-800" />
        <span>© 2026</span>
      </footer>
    </div>
  );
}
