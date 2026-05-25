'use client';

import React, { useEffect, useRef } from 'react';
import { useMoodTheme } from './MoodThemeContext';

export const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const { activeMood, themeStyles } = useMoodTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Base Class definition
    class Particle {
      constructor(type) {
        this.type = type;
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        
        if (this.type === 'rain' || this.type === 'roses') {
          this.y = -20 - Math.random() * 100;
        } else if (this.type === 'fire' || this.type === 'sparks' || this.type === 'bubbles' || this.type === 'balloons') {
          this.y = height + 20 + Math.random() * 100;
        } else {
          // Stars: distribute anywhere
          this.x = Math.random() * width;
          this.y = Math.random() * height;
        }

        this.size = Math.random() * 6 + 2;
        this.speedX = Math.random() * 2 - 1;
        
        if (this.type === 'rain') {
          this.speedY = Math.random() * 8 + 8;
          this.size = Math.random() * 2 + 1;
        } else if (this.type === 'roses') {
          this.speedY = Math.random() * 1.5 + 1;
          this.speedX = Math.random() * 1 - 0.5;
          this.angle = Math.random() * Math.PI * 2;
          this.spinSpeed = Math.random() * 0.02 - 0.01;
          this.size = Math.random() * 8 + 6;
        } else if (this.type === 'fire') {
          this.speedY = -(Math.random() * 2 + 2);
          this.speedX = Math.random() * 1.2 - 0.6;
          this.size = Math.random() * 4 + 1.5;
        } else if (this.type === 'sparks') {
          this.speedY = -(Math.random() * 3 + 3);
          this.speedX = Math.random() * 2 - 1;
          this.size = Math.random() * 3 + 1;
        } else if (this.type === 'bubbles') {
          this.speedY = -(Math.random() * 1 + 0.5);
          this.speedX = Math.random() * 0.6 - 0.3;
          this.size = Math.random() * 15 + 8;
        } else if (this.type === 'balloons') {
          this.speedY = -(Math.random() * 0.8 + 0.8);
          this.speedX = Math.sin(Math.random()) * 0.5;
          this.size = Math.random() * 20 + 15;
          this.hue = Math.random() * 360;
        } else {
          // Stars
          this.speedY = 0;
          this.speedX = 0;
          this.size = Math.random() * 2.5 + 0.5;
          this.alpha = Math.random();
          this.alphaSpeed = Math.random() * 0.02 + 0.005;
        }
        
        this.life = 1.0;
        this.decay = Math.random() * 0.01 + 0.003;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.type === 'roses') {
          this.angle += this.spinSpeed;
        }

        if (this.type === 'fire' || this.type === 'sparks') {
          this.life -= this.decay;
          if (this.life <= 0) this.reset();
        }

        // Wrap around boundaries
        if (this.type === 'rain' && this.y > height) this.reset();
        if (this.type === 'roses' && this.y > height) this.reset();
        if ((this.type === 'bubbles' || this.type === 'balloons') && this.y < -50) this.reset();
        if (this.x < -20 || this.x > width + 20) this.reset();

        if (this.type === 'stars') {
          this.alpha += this.alphaSpeed;
          if (this.alpha > 1 || this.alpha < 0) {
            this.alphaSpeed = -this.alphaSpeed;
          }
        }
      }

      draw() {
        ctx.save();
        if (this.type === 'roses') {
          // Draw falling rose petal (heart-ish or curved oval)
          ctx.translate(this.x, this.y);
          ctx.rotate(this.angle);
          ctx.fillStyle = Math.random() > 0.5 ? '#f43f5e' : '#fda4af';
          ctx.shadowColor = '#be123c';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size / 1.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 'rain') {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.speedX * 0.5, this.y + 15);
          ctx.stroke();
        } else if (this.type === 'fire') {
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 10;
          const r = Math.floor(Math.random() * 100) + 155;
          const g = Math.floor(Math.random() * 100);
          ctx.fillStyle = `rgba(${r}, ${g}, 0, ${this.life})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 'sparks') {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
          ctx.fillStyle = `rgba(253, 224, 71, ${this.life})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 'bubbles') {
          ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
          ctx.fillStyle = 'rgba(20, 184, 166, 0.05)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Draw bubble reflection glint
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.15, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 'balloons') {
          // Draw balloon
          ctx.fillStyle = `hsla(${this.hue}, 85%, 60%, 0.65)`;
          ctx.strokeStyle = `hsla(${this.hue}, 85%, 45%, 0.8)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(this.x, this.y, this.size / 1.3, this.size, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Draw balloon string
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y + this.size);
          ctx.quadraticCurveTo(this.x - 5, this.y + this.size + 15, this.x + 5, this.y + this.size + 30);
          ctx.stroke();
        } else {
          // Stars (alone mood)
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Initialize particles
    const particleCount = activeMood === 'rain' ? 120 : 60;
    particles = [];
    const type = themeStyles.particleType || 'roses';
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(type));
    }

    let frame = 0;
    let isSadMood = activeMood === 'sad';
    
    // Animation loop
    const animate = () => {
      frame++;
      
      // Clearing with a translucent fill to create slight trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.clearRect(0, 0, width, height);

      // Sad theme lightning flash simulator
      if (isSadMood && Math.random() < 0.003) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(0, 0, width, height);
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [activeMood, themeStyles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ opacity: 0.85 }}
    />
  );
};
export default ParticleCanvas;
