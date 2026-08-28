let allProjects = { thesis: [], analytics: [] };

// 1. Horizontal Scroll & Navigation Controller
function scrollToSlide(slideId) {
  const slide = document.getElementById(slideId);
  if (slide) {
    slide.scrollIntoView({ behavior: 'smooth', inline: 'start' });
  }
}

const wrapper = document.getElementById('horizontal-wrapper');
if (wrapper) {
  wrapper.addEventListener('wheel', (e) => {
    const modal = document.getElementById('project-modal');
    if (modal && modal.classList.contains('hidden')) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        wrapper.scrollLeft += e.deltaY;
      }
    }
  }, { passive: false });
}

// 2. Data Fetching
async function loadData() {
  try {
    const res = await fetch("projects.json");
    if (!res.ok) throw new Error("Network response was not ok");
    const json = await res.json();
    
    allProjects.thesis = json.thesis || [];
    allProjects.analytics = json.analytics || [];

    renderAll();
  } catch (err) {
    console.error("Error loading JSON:", err);
  }
}

// 3. Card Renderer
function renderCard(proj) {
  const badges = (proj.tools || [])
    .map(t => `<span class="px-2.5 py-1 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-cyan-300 font-medium">${t}</span>`)
    .join("");

  return `
    <div class="glass rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 relative z-20 border border-slate-800 hover:border-cyan-500/40">
      <div class="space-y-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
          <i data-lucide="book-open" class="w-5 h-5"></i>
        </div>
        <div class="flex flex-wrap gap-1.5">${badges}</div>
        <p class="text-[11px] font-bold uppercase tracking-wider text-cyan-400 pt-1">${proj.category || 'PROJECT'}</p>
        <h3 class="text-base sm:text-lg font-bold text-white leading-snug">${proj.title}</h3>
        <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">${proj.summary}</p>
      </div>

      <div class="pt-5 mt-4 border-t border-slate-800/80">
        <button 
          type="button"
          onclick="openProjectModal('${proj.id}')" 
          class="w-full py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500 hover:text-slate-950 text-xs sm:text-sm font-semibold text-cyan-300 transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm relative z-30">
          View Project <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;
}

function renderAll() {
  const thesisGrid = document.getElementById("thesis-grid");
  const analyticsGrid = document.getElementById("analytics-grid");

  if (thesisGrid) thesisGrid.innerHTML = allProjects.thesis.map(renderCard).join("");
  if (analyticsGrid) analyticsGrid.innerHTML = allProjects.analytics.map(renderCard).join("");

  if (window.lucide) {
    lucide.createIcons();
  }
}

// 4. Modal Handler (Uniform Image Sizes + Bottom Implications)
function openProjectModal(id) {
  const proj = [...allProjects.thesis, ...allProjects.analytics].find(p => String(p.id) === String(id));
  if (!proj) {
    console.warn("Project not found for ID:", id);
    return;
  }

  const modalCategory = document.getElementById("modal-category");
  const modalTitle = document.getElementById("modal-title");
  const modalSummary = document.getElementById("modal-summary");
  const modalDetails = document.getElementById("modal-details");

  if (modalCategory) modalCategory.innerText = proj.category || "";
  if (modalTitle) modalTitle.innerText = proj.title || "";
  if (modalSummary) modalSummary.innerHTML = proj.summary || "";
  if (modalDetails) modalDetails.innerHTML = proj.details || "";

  // Power BI Embed Frame
  const embedContainer = document.getElementById("modal-embed-container");
  const embedFrame = document.getElementById("modal-embed-frame");

  if (embedContainer && embedFrame) {
    if (proj.embedUrl && proj.embedUrl.trim() !== "") {
      embedFrame.src = proj.embedUrl;
      embedContainer.classList.remove("hidden");
    } else {
      embedFrame.src = "";
      embedContainer.classList.add("hidden");
    }
  }

 // Visuals Section: Render Fixed-Height Uniform Image Cards
  const gallery = document.getElementById("modal-gallery");
  const galleryContainer = document.getElementById("modal-gallery-container");
  
  if (gallery && galleryContainer) {
    if (proj.images && proj.images.length > 0 && (!proj.embedUrl || proj.embedUrl.trim() === "")) {
      galleryContainer.classList.remove("hidden");
      gallery.className = "grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch";
      gallery.innerHTML = proj.images
        .map(
          img => `
            <div class="h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 p-3.5 flex flex-col justify-between">
              <!-- Top: Fixed Frame Image & Title -->
              <div class="space-y-2.5">
                <div class="w-full h-44 rounded-xl overflow-hidden bg-slate-900/90 p-2 border border-slate-800/80 flex items-center justify-center">
                  <img 
                    src="${img.src}" 
                    alt="${img.title}" 
                    class="max-h-full max-w-full object-contain mx-auto block" 
                    onerror="this.parentElement.innerHTML='<span class=\\'text-xs text-slate-500\\'>Image preview: ${img.src}</span>'" 
                  />
                </div>
                <p class="text-xs font-bold text-white text-center tracking-tight leading-snug min-h-[32px] flex items-center justify-center">
                  ${img.title}
                </p>
              </div>

              <!-- Bottom: Fixed-Structure Implication Box -->
              ${img.implication ? `
                <div class="mt-3 p-3 rounded-xl bg-slate-900/95 border border-slate-800/80 text-[12px] text-slate-300 leading-relaxed flex-grow flex items-center">
                  <div>${img.implication}</div>
                </div>
              ` : ''}
            </div>
          `
        )
        .join("");
    } else {
      galleryContainer.classList.add("hidden");
    }
  }
    // Tools Badges
  const toolsContainer = document.getElementById("modal-tools");
  if (toolsContainer) {
    toolsContainer.innerHTML = (proj.tools || [])
      .map(t => `<span class="px-3 py-1 text-xs rounded-lg bg-slate-800 text-cyan-300 font-medium">${t}</span>`)
      .join("");
  }

  // Show Modal
  const modal = document.getElementById("project-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

function closeProjectModal() {
  const modal = document.getElementById("project-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  const embedFrame = document.getElementById("modal-embed-frame");
  if (embedFrame) embedFrame.src = "";
}

// 5. Tab Switcher
function switchProjectTab(tab) {
  const dashContainer = document.getElementById("container-dashboards");
  const thesisContainer = document.getElementById("container-thesis");
  const dashBtn = document.getElementById("tab-btn-dashboards");
  const thesisBtn = document.getElementById("tab-btn-thesis");

  if (!dashContainer || !thesisContainer) return;

  if (tab === "dashboards") {
    dashContainer.classList.remove("hidden");
    thesisContainer.classList.add("hidden");
    dashBtn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20";
    thesisBtn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition flex items-center gap-2";
  } else {
    dashContainer.classList.add("hidden");
    thesisContainer.classList.remove("hidden");
    thesisBtn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 bg-indigo-600 text-white shadow-md shadow-indigo-600/20";
    dashBtn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition flex items-center gap-2";
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

// 6. Background Particles
const canvas = document.getElementById('bg-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
  resizeCanvas();

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      if (mouse.x !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 3;
          this.y -= (dy / dist) * force * 3;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 14000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.18 * (1 - dist / 110)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
  }

  initParticles();
  animateParticles();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeProjectModal();
});

document.addEventListener("DOMContentLoaded", loadData);