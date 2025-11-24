document.addEventListener('DOMContentLoaded', () => {
  // --- LOADER ---
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 300);
  });

  // --- MODO OSCURO ---
  const $html = document.documentElement;
  const $toggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) $html.classList.toggle('light', savedTheme === 'light');
  if ($toggle) {
    $toggle.textContent = $html.classList.contains('light') ? '☀️' : '🌙';
    $toggle.addEventListener('click', () => {
      $html.classList.toggle('light');
      const mode = $html.classList.contains('light') ? 'light' : 'dark';
      localStorage.setItem('theme', mode);
      $toggle.textContent = mode === 'light' ? '☀️' : '🌙';
    });
  }

  // --- ANIMACIÓN DE TEXTO ---
  const headline = document.querySelector('.headline');
  const cursor = document.querySelector('.cursor');
  function typeEffect(element, text, speed = 100) {
    if (!element) return;
    let i = 0;
    element.textContent = '';
    function typing() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typing, speed);
      }
    }
    typing();
  }
  typeEffect(headline, 'Construyo webs rápidas y claras', 100);
  if (cursor) cursor.style.display = 'inline-block';

  // --- CARGA DE PROYECTOS + FILTROS ---
  const $grid = document.getElementById('gridProyectos');
  const filterBtns = document.querySelectorAll('.filter-btn');
  let allProjects = [];
  let currentIndex = 0;

  function renderProjects(projects) {
    if (!$grid) return;
    $grid.innerHTML = '';
    projects.forEach((p, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${p.titulo}</h3>
        <p>${p.descripcion}</p>
        <div class="badges">
          ${p.tecnologias.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      `;
      card.addEventListener('click', () => {
        currentIndex = index;
        openModal(p);
      });
      $grid.appendChild(card);
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.card').forEach(card => observer.observe(card));
  }

  fetch('data/proyectos.json')
    .then(res => res.json())
    .then(proyectos => {
      allProjects = proyectos;
      renderProjects(allProjects);
    })
    .catch(err => console.error('Error cargando proyectos:', err));

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tech = btn.dataset.tech;
      if (tech === 'all') {
        renderProjects(allProjects);
      } else {
        const filtered = allProjects.filter(p => p.tecnologias.includes(tech));
        renderProjects(filtered);
      }
    });
  });

  // --- FONDO 3D CON PARTÍCULAS ---
  const canvas = document.getElementById('bg3d');
  if (canvas && window.THREE) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 400;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 12;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 8;

    function animate() {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.0008;
      particles.rotation.x += 0.0004;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
    // --- CONTADORES ANIMADOS ---
  function animateCounter(el) {
    const target = +el.getAttribute('data-target');
    let count = 0;
    const increment = Math.max(1, Math.floor(target / 100));
    function update() {
      count += increment;
      if (count < target) {
        el.textContent = count;
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }
    update();
  }
  const counters = document.querySelectorAll('.number');
  const observerCounters = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observerCounters.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(counter => observerCounters.observe(counter));

  // --- FORMULARIO DE CONTACTO CON EMAILJS ---
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      formStatus.textContent = "Enviando mensaje...";
      try {
        const serviceID = "service_y95t4ks";
        const templateID = "template_fsjo89q";
        const publicKey = "f70sxGybBMO0tcB7y";
        const params = {
          from_name: document.getElementById('name').value,
          from_email: document.getElementById('email').value,
          message: document.getElementById('message').value
        };
        await emailjs.send(serviceID, templateID, params, publicKey);
        formStatus.textContent = "✅ Mensaje enviado correctamente.";
        contactForm.reset();
      } catch (err) {
        console.error("Error enviando mensaje:", err);
        formStatus.textContent = "❌ Error al enviar. Intenta de nuevo.";
      }
    });
  }

  // --- SCROLL REVEAL ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealElements.forEach(el => revealObserver.observe(el));

  // --- MENÚ LATERAL CON DOTS ---
  const dots = document.querySelectorAll('#sideNav .dot');
  const sections = document.querySelectorAll('.section');
  function activateDot(sectionId) {
    dots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.section === sectionId);
    });
  }
  const observerDots = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activateDot(entry.target.id);
      }
    });
  }, { threshold: 0.6 });
  sections.forEach(sec => observerDots.observe(sec));

  // --- MODAL DE GALERÍA CON NAVEGACIÓN ---
  const modal = document.getElementById('projectModal');
  const closeModal = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTech = document.getElementById('modalTech');
  const modalImg = document.getElementById('modalImg');
  const prevBtn = document.getElementById('prevProject');
  const nextBtn = document.getElementById('nextProject');

  function openModal(project) {
    if (!modal) return;
    modalTitle.textContent = project.titulo;
    modalDesc.textContent = project.descripcion;
    modalTech.innerHTML = project.tecnologias.map(t => `<span class="tag">${t}</span>`).join('');
    modalImg.src = project.imagen || '';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  if (closeModal) closeModal.addEventListener('click', hideModal);
  window.addEventListener('click', (e) => { if (modal && e.target === modal) hideModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display === 'flex') hideModal(); });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + allProjects.length) % allProjects.length;
      openModal(allProjects[currentIndex]);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % allProjects.length;
      openModal(allProjects[currentIndex]);
    });
  }

  // --- BOTÓN VOLVER ARRIBA ---
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
 
// Crear cursor
const cursor = document.createElement("div");
cursor.classList.add("cursor");
document.body.appendChild(cursor);

// Mover el cursor como el ratón
document.addEventListener("mousemove", (e) => {
  cursor.style.top = e.clientY + "px";
  cursor.style.left = e.clientX + "px";
});

// Efecto de clic
document.addEventListener("click", () => {
  cursor.style.transform = "translate(-50%, -50%) scale(1.4)";
  setTimeout(() => {
    cursor.style.transform = cursor.classList.contains("active")
      ? "translate(-50%, -50%) scale(1.2)"
      : "translate(-50%, -50%)";
  }, 150);
});

// Activar estado amarillo en TODOS los elementos interactivos
document.querySelectorAll("button, a, [role='button'], .stat, #closeStatsModal")
  .forEach(el => {
    el.addEventListener("mouseenter", () => cursor.classList.add("active"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
  });


// Modal: abrir desde las tarjetas de stats
const statsModal = document.getElementById('statsModal');
const closeStatsModal = document.getElementById('closeStatsModal');
const statsTitle = document.getElementById('statsTitle');
const statsList = document.getElementById('statsList');

const statsData = {
  proyectos: ["Sensor de huella", "Web personal"],
  tecnologias: ["HTML","CSS","JavaScript","Arduino","ESP32","Impresión 3D","Git","EmailJS","Unity"],
  desarrollo: ["Casco Iron Man","Webs modernas","Videojuego Unity"]
};

// Delegación por seguridad: funciona aunque se rendericen después
document.addEventListener('click', (e) => {
  const stat = e.target.closest('.stat');
  if (stat) {
    const type = stat.dataset.type;
    statsTitle.textContent = stat.querySelector('p')?.textContent || 'Detalle';
    statsList.innerHTML = (statsData[type] || []).map(i => `<div class="item">${i}</div>`).join('');
    statsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
});

// Cerrar modal con X o clic en overlay
if (closeStatsModal) {
  closeStatsModal.addEventListener('click', () => {
    statsModal.style.display = 'none';
    document.body.style.overflow = '';
  });
}
window.addEventListener('click', (e) => {
  if (statsModal && e.target === statsModal) {
    statsModal.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// 🔥 Coloca el cursor en el centro al iniciar
cursor.style.top = `${window.innerHeight / 2}px`;
cursor.style.left = `${window.innerWidth / 2}px`;

document.addEventListener('mousemove', e => {
  cursor.style.top = `${e.clientY}px`;
  cursor.style.left = `${e.clientX}px`;
});

window.addEventListener("load", () => {
  setTimeout(() => {
    document.body.classList.add("loaded"); 
    // 🔥 ahora se activa el cursor y se oculta la intro
    document.querySelector(".intro").style.display = "none";
  }, 4000); // espera 4 segundos (duración de la intro)
});
 const sparksContainer = document.querySelector('.sparks');

function createSpark() {
  const spark = document.createElement('div');
  spark.classList.add('spark');
  sparksContainer.appendChild(spark);

  // posición inicial en el centro
  spark.style.left = window.innerWidth / 2 + 'px';
  spark.style.top = window.innerHeight / 2 + 'px';

  // dirección aleatoria
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * 200 + 50; // hasta 250px
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  spark.animate([
    { transform: 'translate(0,0)', opacity: 1 },
    { transform: `translate(${x}px, ${y}px)`, opacity: 0 }
  ], {
    duration: 1000 + Math.random() * 500,
    easing: 'ease-out',
    fill: 'forwards'
  });

  setTimeout(() => spark.remove(), 1500);
}

// Genera varias chispas al explotar el logo
setTimeout(() => {
  for (let i = 0; i < 40; i++) {
    createSpark();
  }
}, 2000); // justo cuando el logo explota






