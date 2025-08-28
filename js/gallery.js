class GalleryManager {
  constructor() {
    this.galleryGrid = document.querySelector('.gallery-grid');
    this.loadingElement = document.querySelector('.loading');
    this.filterBtns = document.querySelectorAll('[data-filter]');
    this.currentFilter = '*';
    this.images = [];
    
    this.categories = {
      'automatizacion': {
        name: 'Automatización',
        color: '#007bff'
      },
      'impresion3D': {
        name: 'Impresión 3D',
        color: '#28a745'
      },
      'desarrolloWeb': {
        name: 'Desarrollo Web',
        color: '#dc3545'
      }
    };

    this.maxImagesToCheck = 50;
    this.maxConsecutiveNotFound = 3;
    this.timeoutDuration = 2000;
    this.imageFormats = [
        '{n}.jpg',
        'imagen{n}.jpg',
        'img{n}.jpg',
        'foto{n}.jpg',
        'project{n}.jpg'
    ];

    this.init();
  }

  async init() {
    try {
      await this.autoDetectImages();
      this.setupFilters();
      this.displayImages();
      this.setupModal();
    } catch (error) {
      console.error('Error inicializando galería:', error);
      this.showError('Error al cargar la galería');
      this.hideLoading();
    }
  }

  async autoDetectImages() {
    this.images = [];
    
    for (const [category, categoryInfo] of Object.entries(this.categories)) {
      this.updateLoadingText(`Cargando imágenes de ${categoryInfo.name}...`);
      
      try {
        const categoryImages = await this.detectImagesInCategory(category);
        
        categoryImages.forEach((filename, index) => {
          this.images.push({
            src: `images/gallery/${category}/${filename}`,
            category: category,
          });
        });
        
      } catch (error) {
        console.warn(`Error cargando categoría ${category}:`, error);
      }
    }
  }

  updateLoadingText(text) {
    const loadingText = this.loadingElement?.querySelector('p');
    if (loadingText) {
      loadingText.textContent = text;
    }
  }

  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
  }

  showError(message) {
    if (this.galleryGrid) {
      this.galleryGrid.innerHTML = `
        <div class="col-12 text-center text-danger">
          <h4>${message}</h4>
          <p>Por favor, verifica la estructura de carpetas y archivos.</p>
        </div>
      `;
    }
  }

  async detectImagesInCategory(category) {
    const foundImages = [];
      
    for (const format of this.imageFormats) {
      try {
        const formatImages = await this.checkImageFormat(category, format);
        if (formatImages.length > 0) {
          foundImages.push(...formatImages);
          break;
        }
      } catch (error) {
        console.warn(`Error verificando formato ${format}:`, error);
      }
    }
      
    return foundImages;
  }

  async checkImageFormat(category, format) {
    const images = [];
    let consecutiveNotFound = 0;
    let currentIndex = 1;
    
    while (currentIndex <= this.maxImagesToCheck && consecutiveNotFound < this.maxConsecutiveNotFound) {
      const filename = format.replace('{n}', currentIndex);
      const imagePath = `images/gallery/${category}/${filename}`;
      
      try {
        const exists = await this.imageExists(imagePath);
        if (exists) {
          images.push(filename);
          consecutiveNotFound = 0;
        } else {
          consecutiveNotFound++;
        }
      } catch (error) {
        consecutiveNotFound++;
      }
      
      currentIndex++;
      
      if (currentIndex % 5 === 0) {
        await this.sleep(50);
      }
    }
        
    return images;
  }

  imageExists(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
      };
      
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout'));
      }, this.timeoutDuration);
      
      img.onload = () => {
        cleanup();
        clearTimeout(timeoutId);
        resolve(true);
      };
      
      img.onerror = () => {
        cleanup();
        clearTimeout(timeoutId);
        resolve(false);
      };
      
      img.src = src + '?t=' + Date.now();
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  formatImageTitle(filename, number) {
    if (/^\d+\.jpg$/.test(filename)) {
        return `Imagen ${number}`;
    }
    
    if (/^(imagen|img|foto|project)\d+\.jpg$/i.test(filename)) {
        const prefix = filename.match(/^([a-zA-Z]+)/)[1];
        return `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${number}`;
    }
    
    return filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  displayImages() {
    this.hideLoading();

    if (this.images.length === 0) {
      this.galleryGrid.innerHTML = `
        <div class="no-images col-12">
          <h4>No se encontraron imágenes</h4>
          <p>Verifica que las imágenes estén en la ruta correcta</p>
          <small>Formatos esperados: 1.jpg, 2.jpg... o imagen1.jpg, imagen2.jpg...</small>
          <br><small>Categorías: automatizacion, impresion3D, desarrolloWeb</small>
        </div>
      `;
      return;
    }

    const imageElements = this.images.map(image => this.createImageElement(image)).join('');
    this.galleryGrid.innerHTML = imageElements;
    
    setTimeout(() => {
      this.applyFilter(this.currentFilter);
    }, 100);
  }

  createImageElement(image) {
    const categoryInfo = this.categories[image.category];
    return `
      <div class="gallery-item ${image.category}" data-category="${image.category}">
        <img src="${image.src}" alt="${image.title}" loading="lazy" onclick="openModal('${image.src}', '${image.title}')" onerror="this.style.display='none';">
        <div class="category-badge" style="background-color: ${categoryInfo.color}">
          ${categoryInfo.name}
        </div>
      </div>
    `;
  }

  setupFilters() {
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        this.applyFilter(filter);
      });
    });
  }

  applyFilter(filter) {
    this.currentFilter = filter;
    const items = document.querySelectorAll('.gallery-item');
    
    items.forEach(item => {
      const category = item.dataset.category;
      const shouldShow = filter === '*' || filter === `.${category}` || item.classList.contains(filter.replace('.', ''));
      
      if (shouldShow) {
        item.classList.remove('hidden');
        item.style.display = 'block';
      } else {
        item.classList.add('hidden');
        item.style.display = 'none';
      }
    });
    
    const visibleItems = document.querySelectorAll('.gallery-item:not(.hidden)');
  }

  setupModal() {
    if (!window.modalController) {
      window.modalController = new ModalController();
    }
  }
}


class ModalController {
  constructor() {
    this.modal = document.getElementById('imageModal');
    this.modalContainer = document.getElementById('modalContainer');
    this.modalImg = document.getElementById('modalImage');
    this.closeBtn = document.querySelector('.close');
    
    this.isOpen = false;
    this.scale = 1;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.scrollLeft = 0;
    this.scrollTop = 0;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.modal || !this.modalImg || !this.closeBtn) {
      console.error('Elementos del modal no encontrados');
      return;
    }

    this.closeBtn.addEventListener('click', () => this.close());
    
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal || e.target === this.modalContainer) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    this.modal.addEventListener('wheel', (e) => {
      if (this.isOpen) {
        e.preventDefault();
        this.handleZoom(e);
      }
    });

    this.modal.addEventListener('mousedown', (e) => {
      if (e.target === this.modalImg) {
        this.startDrag(e);
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.drag(e);
      }
    });

    document.addEventListener('mouseup', () => {
      this.stopDrag();
    });

    this.modal.addEventListener('touchstart', (e) => {
      if (e.target === this.modalImg && e.touches.length === 1) {
        this.startDrag(e.touches[0]);
      }
    });

    this.modal.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        e.preventDefault();
        this.drag(e.touches[0]);
      }
    });

    this.modal.addEventListener('touchend', () => {
      this.stopDrag();
    });
  }

  open(src, title = '') {
    if (!this.modal || !this.modalImg) return;
    
    document.body.classList.add('modal-open');
    
    this.modal.style.display = 'flex';
    this.modal.classList.add('show');
    this.isOpen = true;
    
    this.modalImg.src = src;
    this.modalImg.alt = title;
    
    this.scale = 1;
    this.modalImg.style.transform = 'scale(1)';
    
    if (this.modalContainer) {
      this.modalContainer.scrollLeft = 0;
      this.modalContainer.scrollTop = 0;
    }
  }

  close() {
    if (!this.modal) return;
    
    document.body.classList.remove('modal-open');
    
    this.modal.classList.remove('show');
    setTimeout(() => {
      this.modal.style.display = 'none';
    }, 300);
    
    this.isOpen = false;
  }

  handleZoom(e) {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    this.scale = Math.max(0.5, Math.min(3, this.scale + delta));
    
    this.modalImg.style.transform = `scale(${this.scale})`;
  }

  startDrag(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    
    if (this.modalContainer) {
      this.scrollLeft = this.modalContainer.scrollLeft;
      this.scrollTop = this.modalContainer.scrollTop;
    }
    
    this.modalImg.style.cursor = 'grabbing';
  }

  drag(e) {
    if (!this.isDragging || !this.modalContainer) return;
    
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    const walkX = (x - this.startX) * 2;
    const walkY = (y - this.startY) * 2;
    
    this.modalContainer.scrollLeft = this.scrollLeft - walkX;
    this.modalContainer.scrollTop = this.scrollTop - walkY;
  }

  stopDrag() {
    this.isDragging = false;
    this.modalImg.style.cursor = 'grab';
  }
}


function openModal(src, title = '') {
  if (!window.modalController) {
    window.modalController = new ModalController();
  }
  window.modalController.open(src, title);
}

document.addEventListener('DOMContentLoaded', () => {
  new GalleryManager();
});