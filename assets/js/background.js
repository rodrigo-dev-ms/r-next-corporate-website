/**
 * ====================================================================
 *   R-NEXT — BACKGROUND ANIMADO (Google Flow Aesthetics)
 * ====================================================================
 * Rede de nós interconectados em Canvas 2D com animação fluida, 
 * partículas neon (Cyan & Verde) e conexões dinâmicas por proximidade.
 */

(function () {
  'use strict';

  class FlowNetworkBackground {
    constructor() {
      this.canvas = document.getElementById('bg-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.animFrameId = null;

      // Configurações visuais e de comportamento
      this.config = {
        cyanColor: { r: 0, g: 229, b: 255 },     /* #00E5FF */
        greenColor: { r: 0, g: 230, b: 118 },    /* #00E676 */
        maxDistance: 130,                        /* Distância máxima para conectar partículas (px) */
        mouseRadius: 160,                        /* Raio de atração/conexão do mouse (px) */
        baseParticleCount: 70,                   /* Quantidade base de partículas para desktop */
        minParticleCount: 30                     /* Quantidade mínima para telas mobile */
      };

      // Posição do cursor do mouse
      this.mouse = {
        x: null,
        y: null,
        active: false
      };

      // Respeito à preferência de acessibilidade do usuário
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.init();
    }

    init() {
      this.resizeCanvas();
      this.createParticles();
      this.bindEvents();

      if (this.reducedMotion) {
        // Renderiza apenas um frame estático para economizar recursos e evitar enjôo
        this.renderStaticFrame();
      } else {
        this.animate();
      }
    }

    /**
     * Redimensiona o canvas dinamicamente mantendo suporte a High-DPI (Retina Display)
     */
    resizeCanvas() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.ctx.scale(dpr, dpr);

      // Reajusta a contagem de partículas com base na resolução
      if (this.particles.length > 0) {
        this.createParticles();
      }
    }

    /**
     * Calcula e instancia o conjunto de partículas com base na largura da tela
     */
    createParticles() {
      this.particles = [];
      const densityFactor = (this.width * this.height) / (1280 * 720);
      const count = Math.max(
        this.config.minParticleCount,
        Math.floor(this.config.baseParticleCount * densityFactor)
      );

      for (let i = 0; i < count; i++) {
        // Alterna entre Cyan Neon e Verde Tecnológico (70% Cyan, 30% Verde)
        const isCyan = Math.random() > 0.3;
        const color = isCyan ? this.config.cyanColor : this.config.greenColor;

        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: Math.random() * 1.8 + 1.2,
          color: color,
          alpha: Math.random() * 0.4 + 0.25,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          pulseVal: Math.random() * Math.PI
        });
      }
    }

    /**
     * Registra ouvintes de eventos para resize, mousemove e mouseleave
     */
    bindEvents() {
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.resizeCanvas(), 150);
      });

      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.active = true;
      });

      window.addEventListener('mouseleave', () => {
        this.mouse.active = false;
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }

    /**
     * Atualiza o movimento e física de cada partícula
     */
    updateParticles() {
      for (let p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Rebatedor suave nas bordas da janela
        if (p.x < 0 || p.x > this.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.height) p.vy *= -1;

        // Efeito sutil de pulsação no tamanho da partícula
        p.pulseVal += p.pulseSpeed;
      }
    }

    /**
     * Renderiza conexões (linhas de rede) entre partículas próximas
     */
    drawConnections() {
      const len = this.particles.length;

      for (let i = 0; i < len; i++) {
        const p1 = this.particles[i];

        // Conexão entre partículas vizinhas
        for (let j = i + 1; j < len; j++) {
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < this.config.maxDistance) {
            // Opacidade proporcional à proximidade (quanto mais perto, mais visível)
            const alpha = (1 - dist / this.config.maxDistance) * 0.25;
            
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);

            // Gradiente suave de cor entre partículas
            const { r, g, b } = p1.color;
            this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            this.ctx.lineWidth = 0.8;
            this.ctx.stroke();
          }
        }

        // Conexão dinâmica com o ponteiro do mouse
        if (this.mouse.active && this.mouse.x !== null) {
          const mdx = p1.x - this.mouse.x;
          const mdy = p1.y - this.mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < this.config.mouseRadius) {
            const mAlpha = (1 - mdist / this.config.mouseRadius) * 0.4;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(this.mouse.x, this.mouse.y);
            
            const { r, g, b } = this.config.cyanColor;
            this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${mAlpha})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
          }
        }
      }
    }

    /**
     * Desenha os nós/esferas iluminadas
     */
    drawParticles() {
      for (let p of this.particles) {
        const currentRadius = p.radius + Math.sin(p.pulseVal) * 0.4;
        const { r, g, b } = p.color;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
        
        // Glow neon refinado
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
        
        this.ctx.fill();

        // Reseta shadow para otimização de renderização
        this.ctx.shadowBlur = 0;
      }
    }

    /**
     * Loop principal de animação via requestAnimationFrame
     */
    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      this.updateParticles();
      this.drawConnections();
      this.drawParticles();

      this.animFrameId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Frame estático para dispositivos com instrução de acessibilidade 'prefers-reduced-motion'
     */
    renderStaticFrame() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.drawConnections();
      this.drawParticles();
    }
  }

  // Inicialização quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FlowNetworkBackground());
  } else {
    new FlowNetworkBackground();
  }
})();

