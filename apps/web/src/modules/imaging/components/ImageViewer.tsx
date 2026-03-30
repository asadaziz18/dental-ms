import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  Text,
  Button,
  IconButton,
  Input,
  VStack,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import type { ImagingRecord, ImagingAnnotation } from '@dental-ms/shared-types';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const BRIGHTNESS_DEFAULT = 100;
const CONTRAST_DEFAULT = 100;

interface ImageViewerProps {
  imageUrl: string;
  imaging: ImagingRecord;
  annotations: ImagingAnnotation[] | null;
  onSaveAnnotations?: (annotations: ImagingAnnotation[]) => void;
  onClose?: () => void;
}

export function ImageViewer({
  imageUrl,
  imaging,
  annotations,
  onSaveAnnotations,
  onClose,
}: ImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(BRIGHTNESS_DEFAULT);
  const [contrast, setContrast] = useState(CONTRAST_DEFAULT);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [localAnnotations, setLocalAnnotations] = useState<ImagingAnnotation[]>(annotations ?? []);
  const [drawing, setDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<number[][]>([]);
  const [newText, setNewText] = useState('');
  const [isTextOpen, setIsTextOpen] = useState(false);

  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const loadImage = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete || imgSize.w === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = Math.min(containerSize.w / imgSize.w, containerSize.h / imgSize.h, 1) * zoom;
    const drawW = imgSize.w * scale;
    const drawH = imgSize.h * scale;
    const offsetX = (containerSize.w - drawW) / 2 + pan.x;
    const offsetY = (containerSize.h - drawH) / 2 + pan.y;

    canvas.width = containerSize.w;
    canvas.height = containerSize.h;
    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    ctx.restore();
  }, [imgSize, containerSize, zoom, pan, brightness, contrast, imageUrl]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !containerSize.w) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    overlay.width = containerSize.w;
    overlay.height = containerSize.h;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    localAnnotations.forEach((a) => {
      if (a.type === 'draw' && a.points?.length) {
        ctx.strokeStyle = a.color ?? '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        a.points.forEach(([x, y], i) => {
          const px = x * overlay.width;
          const py = y * overlay.height;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
      if (a.type === 'text' && a.text != null && a.x != null && a.y != null) {
        ctx.fillStyle = a.color ?? '#000';
        ctx.font = `${a.fontSize ?? 14}px sans-serif`;
        ctx.fillText(a.text, a.x * overlay.width, a.y * overlay.height);
      }
    });
    if (drawPoints.length > 1) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      drawPoints.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [localAnnotations, drawPoints, containerSize]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawing) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDrawPoints((p) => [...p, [e.clientX - rect.left, e.clientY - rect.top]]);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (drawing) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDrawPoints((p) => {
        const next = [...p];
        next.push([e.clientX - rect.left, e.clientY - rect.top]);
        return next;
      });
    }
  };

  const handleMouseUp = () => {
    if (drawing && drawPoints.length > 1) {
      const normalized = drawPoints.map(([x, y]) => [x / containerSize.w, y / containerSize.h]);
      setLocalAnnotations((a) => [
        ...a,
        { id: `draw-${Date.now()}`, type: 'draw', points: normalized, color: '#ff0000' },
      ]);
      setDrawPoints([]);
    }
    setIsDragging(false);
  };

  const addText = () => {
    if (!newText.trim()) return;
    setLocalAnnotations((a) => [
      ...a,
      {
        id: `text-${Date.now()}`,
        type: 'text',
        text: newText,
        x: 0.1,
        y: 0.1,
        fontSize: 16,
        color: '#000',
      },
    ]);
    setNewText('');
    setIsTextOpen(false);
  };

  return (
    <VStack align="stretch" spacing={2} h="full">
      <HStack justify="space-between" flexShrink={0}>
        <HStack>
          {onClose && (
            <IconButton aria-label="Close" size="sm" icon={<CloseIcon />} onClick={onClose} />
          )}
          <Text fontSize="sm">Zoom: {(zoom * 100).toFixed(0)}%</Text>
          <Slider
            aria-label="Zoom"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.1}
            value={zoom}
            onChange={(v) => setZoom(v)}
            w="24"
          />
          <Text fontSize="sm">Brightness</Text>
          <Slider
            aria-label="Brightness"
            min={0}
            max={200}
            value={brightness}
            onChange={(v) => setBrightness(v)}
            w="24"
          />
          <Text fontSize="sm">Contrast</Text>
          <Slider
            aria-label="Contrast"
            min={0}
            max={200}
            value={contrast}
            onChange={(v) => setContrast(v)}
            w="24"
          />
        </HStack>
        <HStack>
          <Button
            size="sm"
            variant={drawing ? 'solid' : 'outline'}
            colorScheme="teal"
            leftIcon={<AddIcon />}
            onClick={() => setDrawing((d) => !d)}
          >
            Draw
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsTextOpen(true)}>
            Add text
          </Button>
          {onSaveAnnotations && (
            <Button
              size="sm"
              colorScheme="teal"
              onClick={() => onSaveAnnotations(localAnnotations)}
            >
              Save annotations
            </Button>
          )}
        </HStack>
      </HStack>

      {isTextOpen && (
        <HStack>
          <Input
            placeholder="Text label"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            size="sm"
            w="48"
          />
          <Button size="sm" onClick={addText}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsTextOpen(false)}>
            Cancel
          </Button>
        </HStack>
      )}

      <Box
        ref={containerRef}
        flex={1}
        minH="400px"
        overflow="hidden"
        bg="black"
        position="relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: drawing ? 'crosshair' : isDragging ? 'grabbing' : 'grab' }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
        />
        <canvas
          ref={overlayRef}
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
        />
      </Box>

      {imaging.toothNumber && (
        <Text fontSize="sm" color="gray.500">
          Tagged to tooth: {imaging.toothNumber}
        </Text>
      )}
    </VStack>
  );
}
