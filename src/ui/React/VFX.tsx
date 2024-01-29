import React, { useEffect, useRef, useState } from "react";
import mask from "../../../assets/Steam/logo_transparent.svg";

export type DeadPixels = Map<number, number>;

export type DeadPixelProps = {
    size: number;
    pixels: DeadPixels,
}

export function DeadPixels({pixels, size}: DeadPixelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [logo, setLogo] = useState<HTMLImageElement>(document.createElement('img'));
    let logoSize = 0;
    let center = {
        x: 0,
        y: 0,
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d')!;
        setup(ctx);

        const animation = () => {
            draw(ctx);
            if (canvasRef?.current?.isConnected) requestAnimationFrame(animation);
        };

        animation();
    }, [canvasRef]);



    function getHue(offset: number, periodMillis: number) {
        const MAX_HUE = 360;
        const HUE_STEPS = 120;
        return Math.floor(((performance.now() * MAX_HUE / periodMillis + offset * MAX_HUE) % MAX_HUE) / HUE_STEPS) * HUE_STEPS;
    }

    function setup(ctx: CanvasRenderingContext2D) {
        logo.src = mask;

        logoSize = Math.min(ctx.canvas.width, ctx.canvas.height);
        center = {
            x: ctx.canvas.width * 0.5, 
            y: ctx.canvas.height * 0.5
        }
        
        logo.onload = () => {   
            // Change composite mode to use that shape
            ctx.globalCompositeOperation = 'source-atop';
            
            // Turn off smoothing
            ctx.canvas.style.imageRendering = 'pixelated';
        }
    }

    function draw(ctx: CanvasRenderingContext2D) {
        const pixel_w = Math.ceil(ctx.canvas.width / size);
        const pixel_h = Math.ceil(ctx.canvas.height / size);
        ctx.globalCompositeOperation = 'source-over';

        for (const [i, offset] of pixels) {
            const x = i % size;
            const y = Math.floor(i / size);

            ctx.beginPath();
            ctx.fillStyle = `HSL(${getHue(offset, 500)}deg, 100%, 50%)`;
            ctx.rect(x * pixel_w, y * pixel_h, pixel_w, pixel_h);
            ctx.fill();
        }

        // To fill everything but the logo
        //ctx.globalCompositeOperation = 'destination-out';
        
        // To fill the logo
        ctx.globalCompositeOperation = 'destination-in';

        // Draw the shape we want to use for masking (Bitburner logo)
        ctx.drawImage(logo, center.x - logoSize * 0.5, center.y - logoSize * 0.5, logoSize, logoSize);
        
        ctx.globalCompositeOperation = 'source-over';
    };

    return <canvas
        ref={canvasRef}
        style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: '0',
            top: '0',
            pointerEvents: "none"
            }}
    ></canvas>;
}

export interface BlackScreenProps {
    fadeInMs?: number,
    fadeOutMs?: number,
    isFadingIn: boolean,
    onDone?: () => any,
}

function clamp01(x: number) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return x;
}

function smoothstep(edge0: number, edge1: number, x: number) {
    // Scale and clamp x to 0..1 range
    x = clamp01((x - edge0) / (edge1 - edge0));
 
    return x * x * (3.0 - 2.0 * x);
}

export function BlackScreen({fadeInMs = undefined, fadeOutMs = undefined, isFadingIn, onDone}: BlackScreenProps) {
    const [opacity, setOpacity] = useState(isFadingIn ? 1 : 0);
    const [timer, setTimer] = useState<NodeJS.Timeout | undefined>(undefined);
    let isAnimationRunning = timer !== undefined;
    let done = (opacity <= 0 && (isFadingIn || fadeOutMs === undefined)) || (opacity >= 1 && !isFadingIn)
    const interval = 10;

    if (!isAnimationRunning && !done) {
        if (fadeInMs === 0 && isFadingIn) {
            setOpacity(0);
            isAnimationRunning = true;
            done = true;
        } else if (fadeOutMs === 0 && !isFadingIn) {
            setOpacity(1);
            isAnimationRunning = true;
            done = true;
        } else {
            setTimer(setInterval(() => {
                let animationMs = 1;
                if (isFadingIn) {
                    if (fadeInMs === undefined) {
                        setOpacity(0);
                        return;
                    }
                    animationMs = -fadeInMs;
                } else {
                    if (fadeOutMs === undefined) {
                        setOpacity(0);
                        return;
                    }
                    animationMs = fadeOutMs;
                }

                setOpacity(prevOpacity => prevOpacity + interval / animationMs);
            }, interval));
        }
    }
    
    if (isAnimationRunning && done) {
        clearInterval(timer);
        setTimer(undefined);
        if (onDone) {
            onDone();
        }
    }

    return <div style={{
        backgroundColor: "black",
        zIndex: 999999,
        position: "fixed",
        opacity: smoothstep(0, 1, opacity),
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        pointerEvents: "none"
    }}></div>
}