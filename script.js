// ==========================================================================
// Pie de Manzana - JavaScript Logic
// ==========================================================================

// Initial sample data
const defaultBooks = [
  {
    id: 1,
    title: "Cien Años de Soledad",
    author: "Gabriel García Márquez",
    reviewer: "Sofía M.",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    comment: "Una obra maestra indiscutible. La atmósfera del Macondo mágico te atrapa desde la primera página hasta la última.",
    date: "2026-03-15"
  },
  {
    id: 2,
    title: "El Principito",
    author: "Antoine de Saint-Exupéry",
    reviewer: "Carlos Read",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    comment: "Un libro corto pero infinitamente profundo. Lo leo una vez al año y siempre aprendo algo nuevo sobre el amor y la amistad.",
    date: "2026-03-18"
  },
  {
    id: 3,
    title: "La Sombra del Viento",
    author: "Carlos Ruiz Zafón",
    reviewer: "Elena G.",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
    rating: 4,
    comment: "Barcelona, el Cementerio de los Libros Olvidados y una intriga fascinante. Muy recomendado para los amantes del misterio.",
    date: "2026-03-20"
  }
];

// State Management
let books = JSON.parse(localStorage.getItem('pie_de_manzana_books')) || defaultBooks;
let currentImageBase64 = null;
let currentTab = 'file';

// DOM Elements
const bookForm = document.getElementById('book-form');
const starPicker = document.getElementById('star-picker');
const ratingInput = document.getElementById('rating-value');
const booksGrid = document.getElementById('books-grid');
const bookCount = document.getElementById('book-count');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const coverFile = document.getElementById('cover-file');
const coverUrl = document.getElementById('cover-url');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const modal = document.getElementById('book-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.querySelector('.close-modal');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  renderBooks();
  setupStarPicker();
  setupImageHandlers();
  setupEventListeners();
});

// --- Save to LocalStorage ---
function saveBooks() {
  localStorage.setItem('pie_de_manzana_books', JSON.stringify(books));
}

// --- Star Picker Logic ---
function setupStarPicker() {
  const stars = starPicker.querySelectorAll('.star');
  
  function updateStars(val) {
    stars.forEach(star => {
      const starVal = parseInt(star.getAttribute('data-value'));
      if (starVal <= val) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  // Initial set
  updateStars(parseInt(ratingInput.value));

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-value'));
      ratingInput.value = val;
      updateStars(val);
    });

    star.addEventListener('mouseover', () => {
      const val = parseInt(star.getAttribute('data-value'));
      updateStars(val);
    });
  });

  starPicker.addEventListener('mouseleave', () => {
    updateStars(parseInt(ratingInput.value));
  });
}

// --- Image Upload & Tab Logic ---
window.switchTab = function(type) {
  currentTab = type;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  if (type === 'file') {
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.getElementById('file-input-container').classList.add('active');
  } else {
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('url-input-container').classList.add('active');
  }
  updatePreview();
};

function setupImageHandlers() {
  coverFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        currentImageBase64 = evt.target.result;
        previewImg.src = currentImageBase64;
        imagePreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  coverUrl.addEventListener('input', () => {
    updatePreview();
  });
}

function updatePreview() {
  if (currentTab === 'url' && coverUrl.value.trim() !== '') {
    previewImg.src = coverUrl.value.trim();
    imagePreview.classList.remove('hidden');
  } else if (currentTab === 'file' && currentImageBase64) {
    previewImg.src = currentImageBase64;
    imagePreview.classList.remove('hidden');
  } else {
    imagePreview.classList.add('hidden');
  }
}

// Default Cover Placeholder
const defaultCover = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80";

// --- Form Submission ---
bookForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const reviewer = document.getElementById('reviewer').value.trim();
  const rating = parseInt(ratingInput.value);
  const comment = document.getElementById('comment').value.trim();

  let cover = defaultCover;
  if (currentTab === 'file' && currentImageBase64) {
    cover = currentImageBase64;
  } else if (currentTab === 'url' && coverUrl.value.trim() !== '') {
    cover = coverUrl.value.trim();
  }

  const newBook = {
    id: Date.now(),
    title,
    author,
    reviewer,
    cover,
    rating,
    comment,
    date: new Date().toISOString().split('T')[0]
  };

  books.unshift(newBook);
  saveBooks();
  renderBooks();

  // Reset Form
  bookForm.reset();
  currentImageBase64 = null;
  imagePreview.classList.add('hidden');
  ratingInput.value = 5;
  setupStarPicker();
  switchTab('file');
});

// --- Render Helper: Stars HTML ---
function renderStarsHTML(rating) {
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) {
    starsHTML += i <= rating ? '★' : '☆';
  }
  return starsHTML;
}

// --- Render Books ---
function renderBooks() {
  const query = searchInput.value.toLowerCase().trim();
  const sortBy = sortSelect.value;

  // Filter
  let filtered = books.filter(b => 
    b.title.toLowerCase().includes(query) || 
    b.author.toLowerCase().includes(query)
  );

  // Sort
  if (sortBy === 'rating-desc') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'rating-asc') {
    filtered.sort((a, b) => a.rating - b.rating);
  } else if (sortBy === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // newest
    filtered.sort((a, b) => b.id - a.id);
  }

  bookCount.textContent = filtered.length;

  if (filtered.length === 0) {
    booksGrid.innerHTML = `
      <div class="empty-state">
        <span>🥧</span>
        <h3>No se encontraron novelas</h3>
        <p>Sé el primero en compartir una reseña para esta categoría.</p>
      </div>
    `;
    return;
  }

  booksGrid.innerHTML = filtered.map(book => `
    <article class="book-card">
      <div class="card-cover">
        <img src="${book.cover}" alt="Portada de ${book.title}" onerror="this.src='${defaultCover}'">
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHTML(book.title)}</h3>
        <p class="card-author">de ${escapeHTML(book.author)}</p>
        <div class="card-stars">
          <span>${renderStarsHTML(book.rating)}</span>
          <span class="card-rating-num">(${book.rating}/5)</span>
        </div>
        <p class="card-comment">"${escapeHTML(book.comment)}"</p>
        <div class="card-footer">
          <span>Por: <strong>${escapeHTML(book.reviewer)}</strong></span>
          <button class="btn-detail" onclick="openModal(${book.id})">Ver Más</button>
        </div>
      </div>
    </article>
  `).join('');
}

// --- Helper Escape HTML ---
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// --- Modal Functionality ---
window.openModal = function(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  modalBody.innerHTML = `
    <div class="modal-detail-grid">
      <div class="modal-detail-cover">
        <img src="${book.cover}" alt="${book.title}" onerror="this.src='${defaultCover}'">
      </div>
      <div class="modal-detail-info">
        <h2>${escapeHTML(book.title)}</h2>
        <p class="author">Por <strong>${escapeHTML(book.author)}</strong></p>
        <div class="stars">
          ${renderStarsHTML(book.rating)} <span style="font-size: 0.9rem; color: var(--text-primary);">(${book.rating} de 5 estrellas)</span>
        </div>
        <div class="comment-box">
          <p>"${escapeHTML(book.comment)}"</p>
        </div>
        <div class="reviewer-info">
          <p>Reseña publicada por <strong>${escapeHTML(book.reviewer)}</strong> el ${book.date}</p>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
};

function setupEventListeners() {
  searchInput.addEventListener('input', renderBooks);
  sortSelect.addEventListener('change', renderBooks);

  closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
}
