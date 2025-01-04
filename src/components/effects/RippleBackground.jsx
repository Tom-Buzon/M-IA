import React, { useEffect, useRef } from 'react';

const rippleSettings = {
  maxSize: 100,
  animationSpeed: 2,
  strokeColor: [148, 217, 255],
};

const canvasSettings = {
  blur: 40,
  ratio: 1,
};

function Coords(x, y) {
  this.x = x || null;
  this.y = y || null;
}

class Ripple {
  constructor(x, y, circleSize, ctx) {
    this.position = new Coords(x, y);
    this.circleSize = circleSize;
    this.maxSize = rippleSettings.maxSize;
    this.opacity = 1;
    this.ctx = ctx;
    this.strokeColor = `rgba(${rippleSettings.strokeColor[0]},
      ${rippleSettings.strokeColor[1]},
      ${rippleSettings.strokeColor[2]},
      ${this.opacity})`;
    this.animationSpeed = rippleSettings.animationSpeed;
    this.opacityStep = (this.animationSpeed / (this.maxSize - circleSize)) / 2;
  }

  update() {
    this.circleSize = this.circleSize + this.animationSpeed;
    this.opacity = this.opacity - this.opacityStep;
    this.strokeColor = `rgba(${rippleSettings.strokeColor[0]},
      ${rippleSettings.strokeColor[1]},
      ${rippleSettings.strokeColor[2]},
      ${this.opacity})`;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = 2;
    this.ctx.arc(this.position.x, this.position.y, this.circleSize, 0, 2 * Math.PI);
    this.ctx.stroke();
  }
}

const RippleBackground = () => {
  const canvasRef = useRef(null);
  const ripplesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width * canvasSettings.ratio;
      canvas.height = height * canvasSettings.ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX) * canvasSettings.ratio;
      const y = (e.clientY) * canvasSettings.ratio;
      ripplesRef.current.unshift(new Ripple(x, y, 2, ctx));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.update();
        r.draw();

        if (r.opacity <= 0) {
          ripples.splice(i, 1);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    document.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1554876278-9a90ab84197d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80')`,
          opacity: 0.8,
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          filter: `blur(${canvasSettings.blur}px)`,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default RippleBackground;
