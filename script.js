document.addEventListener('DOMContentLoaded', ()=>{
  const STORAGE_KEY = 'galleryItemsV1';
  const gallery = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lb-image');
  const lbCaption = document.getElementById('lb-caption');
  const btnClose = lightbox.querySelector('.lb-close');
  const btnPrev = lightbox.querySelector('.lb-prev');
  const btnNext = lightbox.querySelector('.lb-next');
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const effectSelect = document.getElementById('effectSelect');
  const thumbStrip = document.getElementById('thumbStrip');
  const downloadBtn = document.getElementById('downloadBtn');
  const openAdd = document.getElementById('openAdd');
  const imageModal = document.getElementById('imageModal');
  const imageForm = document.getElementById('imageForm');
  const editingIndexInput = document.getElementById('editingIndex');
  const imgSrcInput = document.getElementById('imgSrc');
  const imgHighInput = document.getElementById('imgHigh');
  const imgTitleInput = document.getElementById('imgTitle');
  const imgPhotogInput = document.getElementById('imgPhotog');
  const imgCategoryInput = document.getElementById('imgCategory');
  const cancelModal = document.getElementById('cancelModal');
  const deleteConfirm = document.getElementById('deleteConfirm');
  const loadMoreBtn = document.getElementById('loadMore');

  let items = [];
  let cards = [];
  let currentIndex = 0;
  let currentFilter = 'all';
  const pageSize = 36;
  let visibleCount = pageSize;

  function saveToStorage(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function loadFromStorage(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    }catch(e){return null}
  }

  function serializeDOMToItems(){
    const domCards = Array.from(document.querySelectorAll('.gallery .card'));
    return domCards.map((c,i)=>({
      src: c.querySelector('img').src,
      high: c.dataset.highres || c.querySelector('img').src,
      title: c.querySelector('.title') ? c.querySelector('.title').textContent : (`Photo ${i+1}`),
      photog: c.dataset.photographer || '',
      category: c.dataset.category || 'nature',
    }));
  }

  function createCardElement(item, idx){
    const fig = document.createElement('figure');
    fig.className = 'card';
    fig.dataset.category = item.category || 'nature';
    fig.dataset.index = idx;
    if(item.photog) fig.dataset.photographer = item.photog;
    if(item.high) fig.dataset.highres = item.high;

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = item.src;
    img.alt = item.title || '';

    const cap = document.createElement('figcaption');
    cap.innerHTML = `<span class="title">${item.title || ''}</span><span class="meta">${item.photog || ''} · ${item.category || ''}</span>`;

    // controls
    const controls = document.createElement('div');
    controls.className = 'card-controls';
    const editBtn = document.createElement('button'); editBtn.className = 'edit'; editBtn.title = 'Edit'; editBtn.textContent = '✎';
    const delBtn = document.createElement('button'); delBtn.className = 'delete'; delBtn.title = 'Delete'; delBtn.textContent = '🗑';
    controls.appendChild(editBtn); controls.appendChild(delBtn);

    fig.appendChild(img);
    fig.appendChild(cap);
    fig.appendChild(controls);

    // events
    fig.addEventListener('click', (e)=>{
      // if clicked control, ignore openLightbox
      if(e.target === editBtn || e.target === delBtn || e.target.closest('.card-controls')) return;
      openLightbox(idx);
    });

    editBtn.addEventListener('click',(e)=>{
      e.stopPropagation();
      openModalForEdit(idx);
    });
    delBtn.addEventListener('click',(e)=>{
      e.stopPropagation();
      openDeleteConfirmation(idx); // show delete confirmation only
    });

    return fig;
  }

  function renderItems(){
    gallery.innerHTML = '';
    const frag = document.createDocumentFragment();
    items.forEach((it,i)=>{
      const el = createCardElement(it,i);
      // pagination: hide beyond visibleCount
      if(i >= visibleCount) el.classList.add('page-hidden');
      frag.appendChild(el);
    });
    gallery.appendChild(frag);
    updateCards();
    updateResultCount();
    updateLoadMoreVisibility();
  }

  function updateCards(){
    cards = Array.from(gallery.querySelectorAll('.card'));
  }

  function updateResultCount(){
    const visible = cards.filter(c=>!c.classList.contains('hidden') && !c.classList.contains('page-hidden')).length;
  }

  function updateLoadMoreVisibility(){
    if(!loadMoreBtn) return;
    loadMoreBtn.style.display = (items.length > visibleCount) ? 'inline-block' : 'none';
  }

  function openLightbox(index){
    const card = gallery.querySelector(`.card[data-index="${index}"]`);
    if(!card) return;
    const high = card.dataset.highres || card.querySelector('img').src;
    lbImage.src = high;
    lbImage.alt = card.querySelector('img').alt || '';
    lbCaption.textContent = `${card.querySelector('.title').textContent} — ${card.dataset.photographer || ''}`;
    currentIndex = Number(index);
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden','false');
    downloadBtn.href = high;
    document.body.style.overflow = 'hidden';
    buildThumbs();
    highlightThumb(currentIndex);
    preloadAdjacent();
  }

  function closeLightbox(){
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  function visibleIndexes(){
    return cards.filter(c=>!c.classList.contains('hidden') && !c.classList.contains('page-hidden')).map(c=>Number(c.dataset.index));
  }

  function showNext(){
    const visible = visibleIndexes();
    if(visible.length===0) return;
    const pos = visible.indexOf(currentIndex);
    const nextPos = (pos + 1) % visible.length;
    openLightbox(visible[nextPos]);
  }

  function showPrev(){
    const visible = visibleIndexes();
    if(visible.length===0) return;
    const pos = visible.indexOf(currentIndex);
    const prevPos = (pos - 1 + visible.length) % visible.length;
    openLightbox(visible[prevPos]);
  }

  function preloadImage(url){
    const i = new Image(); i.src = url;
  }

  function preloadAdjacent(){
    const visible = visibleIndexes();
    const pos = visible.indexOf(currentIndex);
    const next = visible[(pos+1)%visible.length];
    const prev = visible[(pos-1+visible.length)%visible.length];
    const nextCard = gallery.querySelector(`.card[data-index="${next}"]`);
    const prevCard = gallery.querySelector(`.card[data-index="${prev}"]`);
    if(nextCard) preloadImage(nextCard.dataset.highres || nextCard.querySelector('img').src);
    if(prevCard) preloadImage(prevCard.dataset.highres || prevCard.querySelector('img').src);
  }

  // Build thumbnail strip in lightbox
  function buildThumbs(){
    thumbStrip.innerHTML = '';
    const visible = cards.filter(c => !c.classList.contains('hidden') && !c.classList.contains('page-hidden'));
    visible.forEach(c=>{
      const t = document.createElement('button');
      t.className = 'thumb';
      t.dataset.index = c.dataset.index;
      const title = c.querySelector('.title') ? c.querySelector('.title').textContent : '';
      t.title = title;
      t.innerHTML = `<img src="${c.querySelector('img').src}" alt="${title}">`;
      t.addEventListener('click', ()=> openLightbox(t.dataset.index));
      thumbStrip.appendChild(t);
    });
  }

  function highlightThumb(index){
    const thumbs = Array.from(thumbStrip.children);
    thumbs.forEach(t=>t.classList.toggle('active', Number(t.dataset.index)===Number(index)));
    const active = thumbs.find(t=>Number(t.dataset.index)===Number(index));
    if(active) active.scrollIntoView({behavior:'smooth',inline:'center'});
    const idx = visibleIndexes().indexOf(Number(index));
    const total = visibleIndexes().length;
    const dispIndex = (idx === -1) ? 0 : idx + 1;
    document.getElementById('lb-index').textContent = `${dispIndex} / ${total}`;
  }

  // Filters
  filterBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  function applyFilter(){
    cards.forEach(c=>{
      const cat = c.dataset.category;
      if(currentFilter==='all' || currentFilter===cat){
        c.classList.remove('hidden');
      } else {
        c.classList.add('hidden');
      }
    });
    updateResultCount();
  }

  // Effects
  if(effectSelect){
    effectSelect.addEventListener('change',()=>{
      const val = effectSelect.value;
      gallery.classList.remove('filter-grayscale','filter-sepia','filter-blur');
      if(val==='grayscale') gallery.classList.add('filter-grayscale');
      if(val==='sepia') gallery.classList.add('filter-sepia');
      if(val==='blur') gallery.classList.add('filter-blur');
    });
  }

  // Lightbox buttons
  btnClose.addEventListener('click', closeLightbox);
  btnNext.addEventListener('click', showNext);
  btnPrev.addEventListener('click', showPrev);
  lightbox.addEventListener('click',(e)=>{ if(e.target===lightbox) closeLightbox(); });
  document.addEventListener('keydown',(e)=>{
    if(lightbox.classList.contains('show')){
      if(e.key==='ArrowRight') showNext();
      if(e.key==='ArrowLeft') showPrev();
      if(e.key==='Escape') closeLightbox();
    }
  });

  // Modal helpers
  function openModalForEdit(idx, showDelete=false){
    const item = items[idx];
    editingIndexInput.value = idx;
    imgSrcInput.value = item.src;
    imgHighInput.value = item.high || '';
    imgTitleInput.value = item.title || '';
    imgPhotogInput.value = item.photog || '';
    imgCategoryInput.value = item.category || '';
    deleteConfirm.style.display = showDelete ? 'inline-block' : 'none';
    imageModal.setAttribute('aria-hidden','false');
  }

  function openModalForAdd(){
    editingIndexInput.value = '';
    imgSrcInput.value = '';
    imgHighInput.value = '';
    imgTitleInput.value = '';
    imgPhotogInput.value = '';
    imgCategoryInput.value = '';
    deleteConfirm.style.display = 'none';
    imageModal.setAttribute('aria-hidden','false');
  }

  function closeModal(){
    imageModal.setAttribute('aria-hidden','true');
  }

  // Delete confirmation modal
  function openDeleteConfirmation(idx){
    const item = items[idx];
    if(confirm(`Delete "${item.title}" permanently?`)){
      items.splice(idx,1);
      saveToStorage();
      renderItems();
    }
  }

  // Form submit (add or edit)
  imageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const editing = editingIndexInput.value !== '';
    const data = {
      src: imgSrcInput.value.trim(),
      high: imgHighInput.value.trim() || imgSrcInput.value.trim(),
      title: imgTitleInput.value.trim(),
      photog: imgPhotogInput.value.trim(),
      category: imgCategoryInput.value.trim() || 'uncategorized'
    };
    if(editing){
      const idx = Number(editingIndexInput.value);
      items[idx] = data;
    } else {
      items.push(data);
    }
    saveToStorage();
    // keep visibleCount so user sees newly added item if within range
    renderItems();
    closeModal();
  });

  cancelModal.addEventListener('click', ()=> closeModal());
  deleteConfirm.addEventListener('click', ()=>{
    const idx = Number(editingIndexInput.value);
    if(Number.isFinite(idx)){
      items.splice(idx,1);
      // reindex handled by render
      saveToStorage();
      renderItems();
      closeModal();
    }
  });

  openAdd.addEventListener('click', ()=> openModalForAdd());

  // Load more
  if(loadMoreBtn){
    loadMoreBtn.addEventListener('click', ()=>{
      visibleCount += pageSize;
      // reveal next batch
      const all = Array.from(gallery.children);
      all.forEach((el,i)=> el.classList.toggle('page-hidden', i >= visibleCount));
      updateResultCount();
      updateLoadMoreVisibility();
    });
  }

  // generate images utility (used if storage empty)
  function generateImages(n, startIndex=0){
    const categories = ['nature','architecture','people','animals'];
    const photographers = ['Ava','Liam','Emma','Noah','Olivia','Mason','Sophia','Lucas','Mia','Ethan'];
    for(let i=0;i<n;i++){
      const idx = startIndex + i;
      const seed = `img-${idx}`;
      const cat = categories[idx % categories.length];
      const photog = photographers[idx % photographers.length];
      const src = `https://picsum.photos/seed/${seed}/600/400`;
      const high = `https://picsum.photos/seed/${seed}/1800/1200`;
      const title = `Photo ${idx+1}`;
      items.push({src,high,title,photog,category:cat});
    }
  }

  // Initial load: prefer stored items
  const stored = loadFromStorage();
  if(stored && Array.isArray(stored) && stored.length>0){
    items = stored;
  } else {
    // capture any existing DOM items if present
    const fromDOM = serializeDOMToItems();
    if(fromDOM.length>0) items = fromDOM;
    // ensure at least 120 items
    if(items.length < 120) generateImages(120 - items.length, items.length);
    saveToStorage();
  }

  // finally render
  renderItems();

  // Add real Tamil actor images with sequential names
  (function addRealActorImages(){
    const realImages = [
      {src:'https://m.media-amazon.com/images/I/51n9pkzS4vL._AC_UF894,1000_QL80_.jpg',high:'https://m.media-amazon.com/images/I/51n9pkzS4vL._AC_UF894,1000_QL80_.jpg',title:'img001'},
      {src:'https://m.media-amazon.com/images/I/61mORLy5PrL._AC_UF894,1000_QL80_.jpg',high:'https://m.media-amazon.com/images/I/61mORLy5PrL._AC_UF894,1000_QL80_.jpg',title:'img002'},
      {src:'https://images.news18.com/ibnlive/uploads/2021/12/tamil-actor-arya.jpg?impolicy=website&width=0&height=0',high:'https://images.news18.com/ibnlive/uploads/2021/12/tamil-actor-arya.jpg?impolicy=website&width=0&height=0',title:'img003'},
      {src:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb9wEBOG4DhIXRIiXiB74gRDU4Uw-n-Q53SQ&s',high:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb9wEBOG4DhIXRIiXiB74gRDU4Uw-n-Q53SQ&s',title:'img004'},
      {src:'https://bsmedia.business-standard.com/_media/bs/img/article/2024-03/09/full/1709975724-4637.jpeg',high:'https://bsmedia.business-standard.com/_media/bs/img/article/2024-03/09/full/1709975724-4637.jpeg',title:'img005'}
    ];

    let added = 0;
    realImages.forEach((img, i)=>{
      if(items.some(it=>it.title === img.title)) return;
      items.push({src:img.src,high:img.high,title:img.title,photog:'Tamil Cinema',category:'people'});
      added++;
    });
    if(added>0){
      saveToStorage();
      renderItems();
    }
  })();

  // Rename all images to sequential format (img001, img002, etc.)
  (function renameInOrder(){
    // Rename all items in order
    items.forEach((item, idx)=>{
      item.title = `img${String(idx+1).padStart(3,'0')}`;
    });

    saveToStorage();
    renderItems();
  })();

  // make sure thumbs & interactions update when window resizes (keeps indexes stable)
  window.addEventListener('resize', ()=>{
    updateCards();
  });

});

