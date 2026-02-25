import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crop, Loader2, Check } from 'lucide-react';

const RATIOS = {
    horizontal: { ratio: 1.91, w: 1200, h: 628, label: '1200×628 (1.91:1)' },
    square: { ratio: 1, w: 1080, h: 1080, label: '1080×1080 (1:1)' },
};

interface ImageCropModalProps {
    open: boolean;
    onClose: () => void;
    imageUrl: string;
    aspectRatio?: 'horizontal' | 'square';
    onCropped: (blob: Blob) => void;
    isSaving?: boolean;
}

export function ImageCropModal({ open, onClose, imageUrl, aspectRatio = 'horizontal', onCropped, isSaving }: ImageCropModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [blobUrl, setBlobUrl] = useState('');
    const [imgLoaded, setImgLoaded] = useState(false);

    // Crop frame state (in % of container)
    const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 });
    const [dragging, setDragging] = useState(false);
    const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0 });

    // Load image as blob (bypass CORS)
    useEffect(() => {
        if (!imageUrl || !open) return;
        setImgLoaded(false);
        let revoke = '';
        (async () => {
            try {
                const res = await fetch(imageUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                revoke = url;
                setBlobUrl(url);
            } catch {
                setBlobUrl(imageUrl);
            }
        })();
        return () => { if (revoke) URL.revokeObjectURL(revoke); };
    }, [imageUrl, open]);

    // When image loads, fit crop frame to aspect ratio
    const onImgLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        imgRef.current = e.currentTarget;
        setImgLoaded(true);

        const container = containerRef.current;
        if (!container) return;

        const cW = container.offsetWidth;
        const cH = container.offsetHeight;
        const r = RATIOS[aspectRatio].ratio;

        // Calculate max crop frame that fits inside container with correct aspect ratio
        let frameW: number, frameH: number;
        if (cW / cH > r) {
            // Container is wider — frame limited by height
            frameH = cH * 0.85;
            frameW = frameH * r;
        } else {
            // Container is taller — frame limited by width
            frameW = cW * 0.85;
            frameH = frameW / r;
        }

        const pctW = (frameW / cW) * 100;
        const pctH = (frameH / cH) * 100;
        setCropBox({
            x: (100 - pctW) / 2,
            y: (100 - pctH) / 2,
            w: pctW,
            h: pctH,
        });
    }, [aspectRatio]);

    // Drag crop frame
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
        dragStart.current = { mx: e.clientX, my: e.clientY, cx: cropBox.x, cy: cropBox.y };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [cropBox]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragging || !containerRef.current) return;
        const cW = containerRef.current.offsetWidth;
        const cH = containerRef.current.offsetHeight;
        const dx = ((e.clientX - dragStart.current.mx) / cW) * 100;
        const dy = ((e.clientY - dragStart.current.my) / cH) * 100;
        const nx = Math.max(0, Math.min(100 - cropBox.w, dragStart.current.cx + dx));
        const ny = Math.max(0, Math.min(100 - cropBox.h, dragStart.current.cy + dy));
        setCropBox(prev => ({ ...prev, x: nx, y: ny }));
    }, [dragging, cropBox.w, cropBox.h]);

    const handlePointerUp = useCallback(() => setDragging(false), []);

    // Resize via scroll wheel
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        if (!containerRef.current) return;
        const cW = containerRef.current.offsetWidth;
        const cH = containerRef.current.offsetHeight;
        const r = RATIOS[aspectRatio].ratio;
        const delta = -e.deltaY * 0.05; // % change

        setCropBox(prev => {
            const newW = Math.max(20, Math.min(100, prev.w + delta));
            const newH = (newW / 100 * cW) / r / cH * 100;

            if (newH > 100) return prev;

            const nx = Math.max(0, Math.min(100 - newW, prev.x - delta / 2));
            const ny = Math.max(0, Math.min(100 - newH, prev.y - (newH - prev.h) / 2));
            return { x: nx, y: ny, w: newW, h: newH };
        });
    }, [aspectRatio]);

    // Apply crop
    const handleApply = useCallback(() => {
        const img = imgRef.current;
        const container = containerRef.current;
        if (!img || !container) return;

        const cW = container.offsetWidth;
        const cH = container.offsetHeight;

        // How image is rendered (object-fit: contain)
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const containerRatio = cW / cH;

        let renderW: number, renderH: number, offsetX: number, offsetY: number;
        if (imgRatio > containerRatio) {
            renderW = cW;
            renderH = cW / imgRatio;
            offsetX = 0;
            offsetY = (cH - renderH) / 2;
        } else {
            renderH = cH;
            renderW = cH * imgRatio;
            offsetX = (cW - renderW) / 2;
            offsetY = 0;
        }

        // Crop box in pixels
        const boxX = (cropBox.x / 100) * cW;
        const boxY = (cropBox.y / 100) * cH;
        const boxW = (cropBox.w / 100) * cW;
        const boxH = (cropBox.h / 100) * cH;

        // Map to source image coordinates
        const scaleX = img.naturalWidth / renderW;
        const scaleY = img.naturalHeight / renderH;

        const srcX = Math.max(0, (boxX - offsetX) * scaleX);
        const srcY = Math.max(0, (boxY - offsetY) * scaleY);
        const srcW = Math.min(img.naturalWidth - srcX, boxW * scaleX);
        const srcH = Math.min(img.naturalHeight - srcY, boxH * scaleY);

        const r = RATIOS[aspectRatio];
        const canvas = document.createElement('canvas');
        canvas.width = r.w;
        canvas.height = r.h;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, r.w, r.h);
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, r.w, r.h);

        canvas.toBlob(blob => {
            if (blob) onCropped(blob);
        }, 'image/jpeg', 0.92);
    }, [cropBox, aspectRatio, onCropped]);

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl">
                <DialogHeader className="p-4 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-sm">
                        <Crop className="h-4 w-4 text-primary" />
                        Chỉnh sửa ảnh Carousel
                        <span className="text-[10px] text-muted-foreground font-normal ml-auto">
                            Facebook: {RATIOS[aspectRatio].label}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                {/* Image + crop frame */}
                <div className="px-4">
                    <div
                        ref={containerRef}
                        className="relative w-full overflow-hidden rounded-xl bg-neutral-900 select-none"
                        style={{ height: '420px' }}
                        onWheel={handleWheel}
                    >
                        {/* Fixed image */}
                        {blobUrl && (
                            <img
                                src={blobUrl}
                                alt="Source"
                                draggable={false}
                                onLoad={onImgLoad}
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                            />
                        )}

                        {/* Dark overlay outside crop */}
                        {imgLoaded && (
                            <>
                                {/* Top */}
                                <div className="absolute left-0 right-0 top-0 bg-black/60 pointer-events-none"
                                    style={{ height: `${cropBox.y}%` }} />
                                {/* Bottom */}
                                <div className="absolute left-0 right-0 bottom-0 bg-black/60 pointer-events-none"
                                    style={{ height: `${100 - cropBox.y - cropBox.h}%` }} />
                                {/* Left */}
                                <div className="absolute left-0 bg-black/60 pointer-events-none"
                                    style={{ top: `${cropBox.y}%`, height: `${cropBox.h}%`, width: `${cropBox.x}%` }} />
                                {/* Right */}
                                <div className="absolute right-0 bg-black/60 pointer-events-none"
                                    style={{ top: `${cropBox.y}%`, height: `${cropBox.h}%`, width: `${100 - cropBox.x - cropBox.w}%` }} />

                                {/* Crop frame (draggable) */}
                                <div
                                    className="absolute border-2 border-white/90 rounded-sm cursor-move"
                                    style={{
                                        left: `${cropBox.x}%`,
                                        top: `${cropBox.y}%`,
                                        width: `${cropBox.w}%`,
                                        height: `${cropBox.h}%`,
                                        boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                                    }}
                                    onPointerDown={handlePointerDown}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerLeave={handlePointerUp}
                                >
                                    {/* Rule of thirds */}
                                    <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/25" />
                                    <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/25" />
                                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white/25" />
                                    <div className="absolute top-2/3 left-0 right-0 h-px bg-white/25" />

                                    {/* Corner handles */}
                                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
                                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="px-4 py-2 text-center">
                    <span className="text-[11px] text-muted-foreground">
                        Kéo khung để chọn vùng cắt • Scroll để phóng to/thu nhỏ khung
                    </span>
                </div>

                <DialogFooter className="p-4 pt-0">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>Hủy</Button>
                    <Button onClick={handleApply} disabled={isSaving || !imgLoaded} className="gap-2 px-6">
                        {isSaving ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</>
                        ) : (
                            <><Check className="h-4 w-4" /> Áp dụng</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
