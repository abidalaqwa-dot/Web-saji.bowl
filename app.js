/**
 * SAJI — Official Brand & Product Showcase
 * Interactive Application Logic & State Management
 */

document.addEventListener('DOMContentLoaded', () => {
  // Lifecycle AbortController & Active Resource Registry (Zero Memory Leak)
  const lifecycle = new AbortController();
  const sig = lifecycle.signal;
  const activeTimeouts = new Set();
  const activeObservers = new Set();
  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      activeTimeouts.delete(id);
      fn();
    }, ms);
    activeTimeouts.add(id);
    return id;
  };
  const $ = id => document.getElementById(id);
  const clampInt = (v, min, max) => {
    const n = Math.trunc(Number(v));
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min;
  };
  const stripCtl = s => String(s || '').replace(/[\x00-\x1F\x7F<>]/g, '');
  const sanitizeField = (str, maxLen = 120) => stripCtl(str).trim().slice(0, maxLen);
  const setOverlayActive = (el, open, bodyCls) => {
    if (!el) return;
    el.classList.toggle('active', open);
    el.setAttribute('aria-hidden', String(!open));
    if (bodyCls) document.body.classList.toggle(bodyCls, open);
    syncBodyScroll();
  };
  const PHONE_RE = /^(?:\+62|62|0)8[1-9][0-9]{6,10}$/;
  const fadeTimers = {};
  const fadeSwap = (el, key, fn) => {
    if (!el) return;
    clearTimeout(fadeTimers[key]);
    el.style.opacity = '0';
    fadeTimers[key] = safeTimeout(() => { fn(); el.style.opacity = '1'; }, 150);
  };
  const smoothScrollEl = (el, offset = 96) => {
    if (!el) return;
    window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - offset), behavior: 'smooth' });
  };
  const bindCleanInput = (el, maxLen, onExtra) => {
    if (!el) return;
    el.addEventListener('input', () => {
      const clean = stripCtl(el.value).slice(0, maxLen);
      if (clean !== el.value) el.value = clean;
      if (onExtra) onExtra();
    }, { signal: sig });
  };

  const onPassiveResize = () => {};
  window.addEventListener('pagehide', () => {
    lifecycle.abort();
    activeTimeouts.forEach(clearTimeout);
    activeTimeouts.clear();
    activeObservers.forEach(obs => obs.disconnect());
    activeObservers.clear();
    window.removeEventListener('resize', onPassiveResize, { passive: true });
  }, { once: true });

  // --------------------------------------------------------------------------
  // 0. IMAGE ASSET INTEGRITY & SILENT FALLBACK SYSTEM
  // --------------------------------------------------------------------------
  function applyImgFallback(img) {
    if (!img || String(img.getAttribute('src') || '').endsWith('assets/logo.svg')) return;
    img.src = 'assets/logo.svg';
    img.alt = 'SAJI Healthy Bowl';
    img.style.objectFit = 'contain';
    img.style.padding = '6px';
    img.style.backgroundColor = 'var(--c-soft-oatmeal)';
  }

  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function onImgError() {
      applyImgFallback(this);
    }, { once: true, signal: sig });
    if (img.complete && img.naturalWidth === 0) applyImgFallback(img);
  });

  // --------------------------------------------------------------------------
  // 1. DATA DEFINITIONS
  // --------------------------------------------------------------------------

  // Products Data
  const products = [
    {
      id: 'bogor',
      name: 'SAJIAN BOGOR',
      category: 'SAJI BOWL',
      image: 'assets/saji_bogor.jpg',
      badge: 'SUMBER ENERGI',
      subbadge: 'Rp 38.000',
      badgeColor: 'sage',
      components: 'Kimpul/singkong, dada ayam fillet, selada romaine, wortel, jagung, timun, jamur oyster, tempe',
      price: 38000,
      macros: { kkal: 420, protein: 26, carbs: 66, fat: 7, fiber: 7 }
    },
    {
      id: 'sumba',
      name: 'SAJIAN SUMBA',
      category: 'SAJI BOWL',
      image: 'assets/saji_sumba.jpg',
      badge: 'BEBAS GLUTEN',
      subbadge: 'Rp 42.000',
      badgeColor: 'terracotta',
      components: 'Beras sorgum, dada ayam fillet, selada romaine, wortel, jagung, timun, jamur oyster, tempe',
      price: 42000,
      macros: { kkal: 425, protein: 31, carbs: 67, fat: 7, fiber: 9 }
    },
    {
      id: 'yogya',
      name: 'SAJIAN YOGYA',
      category: 'SAJI BOWL',
      image: 'assets/saji_yogya.jpg',
      badge: 'UBI UNGU',
      subbadge: 'Rp 39.000',
      badgeColor: 'sage',
      components: 'Ubi ungu, dada ayam fillet, selada romaine, wortel, jagung, timun, jamur oyster, tempe',
      price: 39000,
      macros: { kkal: 360, protein: 24, carbs: 57, fat: 5, fiber: 10 }
    },
    {
      id: 'gulung',
      name: 'SAJIAN GULUNG YOGYA',
      category: 'SAJI WRAP',
      image: 'assets/saji_gulung_menu.png',
      badge: 'WRAP SEHAT',
      subbadge: 'Rp 35.000',
      badgeColor: 'terracotta',
      components: 'Ubi ungu (bahan dasar wrap), dada ayam fillet, selada romaine, wortel, jagung, timun, jamur oyster, tempe',
      price: 35000,
      macros: { kkal: 340, protein: 22, carbs: 52, fat: 5, fiber: 8 }
    }
  ];

  // Craft Steps Data (Section 2A) — About Us Interactive Cards
  const craftSteps = [
    {
      step: '01',
      title: 'WHAT IS SAJI?',
      copy: 'SAJI menghadirkan makanan sehat yang memadukan bahan pangan lokal, nutrisi seimbang, dan cita rasa yang familiar. Melalui bowl dan wrap yang dapat disesuaikan dengan preferensi konsumen, kami ingin menjadikan pilihan makan sehat lebih menarik, praktis, dan dekat dengan keseharian.',
      image: 'assets/saji_sumba.jpg'
    },
    {
      step: '02',
      title: 'OUR STORY',
      copy: 'SAJI berangkat dari gagasan bahwa makanan sehat tidak harus membosankan atau selalu bergantung pada bahan pangan yang umum digunakan. Kami ingin memperkenalkan pilihan makanan yang memanfaatkan potensi pangan lokal, seperti ubi ungu dan sorgum, dalam sajian modern yang praktis dan lezat. Melalui SAJI, kami ingin membuat makanan sehat terasa lebih dekat, fleksibel, dan mudah dinikmati dalam kehidupan sehari-hari',
      image: 'assets/saji_yogya.jpg'
    },
    {
      step: '03',
      title: 'WHAT MAKES DIFFERENT',
      items: [
        ['Local Food, Modern Style', ' — Mengangkat ubi ungu dan sorgum dalam sajian modern.'],
        ['Bowl & Wrap', ' — Dua format penyajian untuk kebutuhan makan yang berbeda.'],
        ['Your Choice Matters', ' — Opsi penyesuaian bahan tertentu sesuai preferensi konsumen.'],
        ['Sauces with Character', ' — Pilihan saus untuk memberikan variasi cita rasa.']
      ],
      image: 'assets/saji_bogor.jpg'
    },
    {
      step: '04',
      title: 'PEOPLE BEHIND SAJI',
      copy: 'Di balik SAJI, ada tim yang sama-sama suka belajar, mencoba resep baru, dan mencari cara agar makanan sehat tetap enak dan menarik. Kami ingin menghadirkan makanan yang bukan hanya baik untuk tubuh, tetapi juga bisa dinikmati setiap hari. Lewat SAJI, kami ingin mengajak lebih banyak orang untuk mengenal dan menikmati pangan lokal dengan cara yang lebih seru.',
      image: 'assets/people_behind_saji.png'
    }
  ];

  // Spotlight Testimonials Data (Section 4 - Coming Soon)
  const testimonials = [
    {
      quote: "ULASAN SEGERA HADIR",
      name: "SAJI Healthy Bowl",
      role: "Ulasan Pelanggan Segera Hadir",
      avatar: "assets/logo.svg",
      stars: 5
    }
  ];

  // Cart State (Starts at 0 empty state)
  const cart = {
    bogor: 0,
    sumba: 0,
    yogya: 0,
    gulung: 0
  };

  // --------------------------------------------------------------------------
  // 2. KATALOG PRODUCT CARD CAROUSEL & NAVIGATION
  // --------------------------------------------------------------------------
  let activeProductIndex = 1; // Default to Card 1 (Sajian Sumba)
  const productCards = document.querySelectorAll('.product-card');

  function updateActiveProduct(newIndex) {
    if (newIndex < 0) newIndex = products.length - 1;
    if (newIndex >= products.length) newIndex = 0;
    activeProductIndex = newIndex;

    productCards.forEach((card, idx) => {
      if (idx === activeProductIndex) {
        card.classList.add('active');
        if (window.innerWidth < 768) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        card.classList.remove('active');
      }
    });
  }

  productCards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      // Don't override if clicking inner buttons
      if (e.target.closest('.btn-pill') || e.target.closest('.btn-order-modal')) return;
      updateActiveProduct(idx);
    });
  });

  // --------------------------------------------------------------------------
  // 2B. PRODUCT CUSTOMIZER MODAL & FLYING BOWL TO CART ANIMATION (Instruksi 4)
  // --------------------------------------------------------------------------
  const customizerModal = $('sajiCustomizerModal');
  const btnCloseCustomizer = $('closeCustomizerModal');
  const modalImg = $('modalProductImg');
  const modalBadge = $('modalProductBadge');
  const modalMacroKkal = $('modalMacroKkal');
  const modalMacroPro = $('modalMacroPro');
  const modalMacroCarb = $('modalMacroCarb');
  const modalMacroFiber = $('modalMacroFiber');
  const modalTitle = $('modalProductTitle');
  const modalDesc = $('modalProductDesc');
  const modalPrice = $('modalProductPrice');
  const selectCarbPortion = $('selectCarbPortion');
  const selectDressing = $('selectDressing');
  const addonChecks = document.querySelectorAll('.saji-addon-check');
  const inputSpecialNotes = $('modalSpecialNotes');
  const modalQtyMinus = $('modalQtyMinus');
  const modalQtyPlus = $('modalQtyPlus');
  const modalQtyNum = $('modalQtyNum');
  const modalAddToCartBtn = $('modalAddToCartBtn');
  const modalBtnTotal = $('modalBtnTotal');

  let activeModalProduct = products[1];
  let modalQuantity = 1;
  let isAddingToCart = false;
  let customOrders = [];

  bindCleanInput(inputSpecialNotes, 120);

  function calculateModalTotal() {
    if (!activeModalProduct) return;
    const basePrice = Math.max(0, clampInt(activeModalProduct.price, 0, 1000000));
    const carbExtra = selectCarbPortion ? clampInt(selectCarbPortion.selectedOptions[0]?.getAttribute('data-extra') || 0, 0, 100000) : 0;

    let addonsExtra = 0;
    addonChecks.forEach(chk => {
      if (chk && chk.checked) {
        addonsExtra += clampInt(chk.getAttribute('data-price') || 0, 0, 100000);
      }
    });

    const safeQty = clampInt(modalQuantity, 1, 99);
    const itemUnitTotal = basePrice + carbExtra + addonsExtra;
    const grandTotal = itemUnitTotal * safeQty;

    if (modalPrice) {
      modalPrice.textContent = 'Rp ' + itemUnitTotal.toLocaleString('id-ID');
    }
    if (modalBtnTotal) {
      modalBtnTotal.textContent = 'Rp ' + grandTotal.toLocaleString('id-ID');
    }
  }

  function syncBodyScroll() {
    const anyOpen = [customizerModal, privacyModal].some(m => m && m.classList.contains('active')) ||
      (drawerBackdrop && drawerBackdrop.classList.contains('active')) ||
      (mobileNavMenu && mobileNavMenu.classList.contains('open'));
    document.body.style.overflow = anyOpen ? 'hidden' : '';
  }

  function openCustomizerModal(productId) {
    const product = products.find(p => p.id === productId) || products[0];
    activeModalProduct = product;
    modalQuantity = 1;

    if (modalImg) modalImg.src = product.image;
    if (modalBadge) {
      modalBadge.textContent = product.subbadge || ('Rp ' + Number(product.price).toLocaleString('id-ID'));
      modalBadge.style.backgroundColor = product.badgeColor === 'sage' ? 'var(--c-sage-green)' : 'var(--c-terracotta)';
    }
    if (modalMacroKkal) modalMacroKkal.textContent = `±${product.macros?.kkal || 400}`;
    if (modalMacroPro) modalMacroPro.textContent = `${product.macros?.protein || 25}g`;
    if (modalMacroCarb) modalMacroCarb.textContent = `${product.macros?.carbs || 60}g`;
    if (modalMacroFiber) modalMacroFiber.textContent = `${product.macros?.fiber || 8}g`;
    if (modalTitle) modalTitle.textContent = product.name;
    if (modalDesc) modalDesc.textContent = product.components;
    if (modalQtyNum) modalQtyNum.textContent = '1';

    // Reset options
    if (selectCarbPortion) selectCarbPortion.selectedIndex = 0;
    if (selectDressing) selectDressing.selectedIndex = 0;
    addonChecks.forEach(chk => { if (chk) chk.checked = false; });
    if (inputSpecialNotes) inputSpecialNotes.value = '';

    calculateModalTotal();
    setOverlayActive(customizerModal, true, 'modal-open');
  }

  function closeCustomizerModal() {
    setOverlayActive(customizerModal, false, 'modal-open');
  }

  // Trigger modal when clicking ORDER BOWL / ORDER WRAP buttons
  document.querySelectorAll('.btn-order-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const pId = btn.getAttribute('data-product-id');
      openCustomizerModal(pId);
    });
  });

  if (btnCloseCustomizer) {
    btnCloseCustomizer.addEventListener('click', closeCustomizerModal);
  }

  if (customizerModal) {
    customizerModal.addEventListener('click', (e) => {
      if (e.target === customizerModal) closeCustomizerModal();
    });
  }

  // Quantity handlers
  if (modalQtyMinus) {
    modalQtyMinus.addEventListener('click', () => {
      if (modalQuantity > 1) {
        modalQuantity--;
        if (modalQtyNum) modalQtyNum.textContent = modalQuantity;
        calculateModalTotal();
      }
    });
  }

  if (modalQtyPlus) {
    modalQtyPlus.addEventListener('click', () => {
      if (modalQuantity < 99) {
        modalQuantity++;
        if (modalQtyNum) modalQtyNum.textContent = modalQuantity;
        calculateModalTotal();
      }
    });
  }

  // Option change listeners
  if (selectCarbPortion) {
    selectCarbPortion.addEventListener('change', calculateModalTotal);
  }

  addonChecks.forEach(chk => {
    if (chk) chk.addEventListener('change', calculateModalTotal);
  });

  // --------------------------------------------------------------------------
  // DYNAMIC CART RELOCATION CONTROLLER (Navbar Top-Right <-> Screen Bottom-Right)
  // --------------------------------------------------------------------------
  function setFloatingCart(isFloating) {
    const targetCartBtn = document.querySelector('.btn-cart');
    const navActions = document.querySelector('.mobile-nav-actions');
    const mobileToggle = $('mobileToggle');
    if (!targetCartBtn) return;

    if (isFloating) {
      targetCartBtn.classList.add('is-floating-bottom');
      if (document.body && targetCartBtn.parentElement !== document.body) document.body.appendChild(targetCartBtn);
    } else {
      targetCartBtn.classList.remove('is-floating-bottom');
      if (navActions && mobileToggle && targetCartBtn.parentElement !== navActions) navActions.insertBefore(targetCartBtn, mobileToggle);
    }
  }

  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      const hpField = $('sajiHpField');
      if (hpField && hpField.value.trim()) return;

      if (isAddingToCart || !activeModalProduct) return;
      isAddingToCart = true;
      modalAddToCartBtn.style.pointerEvents = 'none';
      modalAddToCartBtn.style.opacity = '0.7';

      const resetModalBtn = () => {
        isAddingToCart = false;
        if (modalAddToCartBtn) {
          modalAddToCartBtn.style.pointerEvents = '';
          modalAddToCartBtn.style.opacity = '';
        }
      };

      // Extract and sanitize customizations for clear WhatsApp order
      const safeQty = clampInt(modalQuantity, 1, 99);
      const currentCartQty = clampInt(cart[activeModalProduct.id], 0, 99);
      if (currentCartQty + safeQty > 99) {
        resetModalBtn();
        return showToast('Maksimal 99 porsi per menu dalam satu pesanan.');
      }

      const selectedExclude = sanitizeField(selectCarbPortion?.options[selectCarbPortion.selectedIndex]?.text || 'Tidak Ada (Sajikan Lengkap)', 80);
      const carbExtra = selectCarbPortion ? clampInt(selectCarbPortion.selectedOptions[0]?.getAttribute('data-extra') || 0, 0, 100000) : 0;
      const selectedSauce = sanitizeField(selectDressing?.options[selectDressing.selectedIndex]?.text.split('(')[0] || 'Signature', 60);
      const selectedAddons = [];
      let addonsTotalPrice = 0;
      addonChecks.forEach(chk => {
        if (chk && chk.checked) {
          const name = sanitizeField(chk.getAttribute('data-name') || 'Topping Extra', 60);
          const price = clampInt(chk.getAttribute('data-price') || 0, 0, 100000);
          selectedAddons.push({ name, price });
          addonsTotalPrice += price;
        }
      });
      const sanitizedNotes = inputSpecialNotes ? sanitizeField(inputSpecialNotes.value, 120) : '';
      const basePrice = clampInt(activeModalProduct.price, 0, 1000000);
      const unitPrice = basePrice + carbExtra + addonsTotalPrice;
      const subtotal = unitPrice * safeQty;

      customOrders.push({
        productId: activeModalProduct.id,
        productName: activeModalProduct.name,
        qty: safeQty,
        basePrice: basePrice,
        addonsTotalPrice: addonsTotalPrice,
        unitPrice: unitPrice,
        subtotal: subtotal,
        exclude: selectedExclude,
        sauce: selectedSauce,
        addons: selectedAddons,
        notes: sanitizedNotes,
        macros: activeModalProduct.macros
      });

      const commitCartAdd = (targetBtn) => {
        if (targetBtn) {
          targetBtn.classList.remove('cart-bounce-pop');
          void targetBtn.offsetWidth;
          targetBtn.classList.add('cart-bounce-pop');
          safeTimeout(() => targetBtn.classList.remove('cart-bounce-pop'), 700);
        }
        cart[activeModalProduct.id] = clampInt((cart[activeModalProduct.id] || 0) + safeQty, 0, 99);
        updateCartUI();
        showToast(`+${safeQty} ${activeModalProduct.name} masuk ke keranjang! 🥗`);
      };

      const targetCartBtn = document.querySelector('.btn-cart');
      const startImg = modalImg;

      if (startImg && targetCartBtn && /^assets\/[a-zA-Z0-9_.-]+$/.test(activeModalProduct.image)) {
        setFloatingCart(true);

        const startRect = startImg.getBoundingClientRect();
        const cartRect = targetCartBtn.getBoundingClientRect();

        const flyer = document.createElement('div');
        flyer.className = 'flying-bowl-clone';
        flyer.style.backgroundImage = `url("${encodeURI(activeModalProduct.image)}")`;
        const flyerSize = Math.min(startRect.width || 160, 160);
        flyer.style.width = `${flyerSize}px`;
        flyer.style.height = `${flyerSize}px`;
        flyer.style.left = `${startRect.left + (startRect.width - flyerSize) / 2}px`;
        flyer.style.top = `${startRect.top + (startRect.height - flyerSize) / 2}px`;
        document.body.appendChild(flyer);

        const deltaX = (cartRect.left + cartRect.width / 2) - (startRect.left + startRect.width / 2);
        const deltaY = (cartRect.top + cartRect.height / 2) - (startRect.top + startRect.height / 2);

        let finished = false;
        const finalizeFlight = (applyAdd) => {
          if (finished) return;
          finished = true;
          flyer.remove();
          resetModalBtn();
          if (applyAdd) commitCartAdd(targetCartBtn);
        };

        try {
          const anim = flyer.animate([
            { transform: 'translate(0px, 0px) scale(1) rotate(0deg)', opacity: 1 },
            { transform: `translate(${deltaX * 0.42}px, ${deltaY * 0.22 - 60}px) scale(0.78) rotate(120deg)`, opacity: 0.95, offset: 0.4 },
            { transform: `translate(${deltaX * 0.8}px, ${deltaY * 0.72 - 20}px) scale(0.42) rotate(240deg)`, opacity: 0.9, offset: 0.8 },
            { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.12) rotate(360deg)`, opacity: 0.1, offset: 1 }
          ], {
            duration: 760,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
          });
          anim.oncancel = () => finalizeFlight(false);
          anim.onfinish = () => finalizeFlight(true);
          safeTimeout(() => finalizeFlight(true), 950);
        } catch (err) {
          finalizeFlight(true);
        }
      } else {
        resetModalBtn();
        setFloatingCart(true);
        commitCartAdd(targetCartBtn);
      }

      // Close modal gracefully
      safeTimeout(closeCustomizerModal, 220);
    });
  }

  // --------------------------------------------------------------------------
  // 3. ABOUT US: THE CRAFT INTERACTIVE 4-STEP SELECTOR WITH WORD-BY-WORD TYPING
  // --------------------------------------------------------------------------
  const craftStepButtons = document.querySelectorAll('.step-selector-btn');
  const craftTag = $('craftStepTag');
  const craftTitle = $('craftStepTitle');
  const craftCopy = $('craftStepCopy');
  const craftImage = $('craftStepImg');
  const craftBadgeNum = $('craftBadgeNum');

  let craftTypingTimeouts = [];
  let craftHasAnimatedOnce = false;

  const mkEl = (tag, cls, txt) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (txt) node.textContent = txt;
    return node;
  };

  function clearCraftTyping() {
    craftTypingTimeouts.forEach(clearTimeout);
    craftTypingTimeouts = [];
  }

  function appendWordSpans(parent, text, words) {
    String(text || '').split(/(\s+)/).forEach(part => {
      if (/\s+/.test(part)) parent.appendChild(document.createTextNode(part));
      else if (part) {
        const span = mkEl('span', 'saji-type-word', part);
        parent.appendChild(span);
        words.push(span);
      }
    });
  }

  function prepareWordByWord(container, dataOrText) {
    if (!container) return [];
    container.textContent = '';
    const words = [];

    if (Array.isArray(dataOrText)) {
      const ul = mkEl('ul', 'craft-bullet-list');
      dataOrText.forEach(([lead, rest]) => {
        const li = mkEl('li', 'craft-bullet-item');
        const dot = mkEl('span', 'craft-bullet-dot saji-type-word', '•');
        const div = mkEl('div', 'craft-bullet-text');
        const strong = mkEl('strong');
        words.push(dot);
        appendWordSpans(strong, lead, words);
        div.appendChild(strong);
        appendWordSpans(div, rest, words);
        li.append(dot, div);
        ul.appendChild(li);
      });
      container.appendChild(ul);
    } else {
      appendWordSpans(container, dataOrText, words);
    }
    return words;
  }

  function playCraftTyping(index) {
    clearCraftTyping();
    const data = craftSteps[index];
    if (!data) return;

    if (craftBadgeNum) craftBadgeNum.textContent = data.step;
    fadeSwap(craftImage, 'craft', () => {
      craftImage.src = data.image;
      craftImage.style.objectPosition = data.step === '04' ? 'center 20%' : 'center center';
    });

    if (!craftTitle || !craftCopy) return;

    const titleWords = prepareWordByWord(craftTitle, data.title);
    const copyWords = prepareWordByWord(craftCopy, data.items || data.copy);

    let currentDelay = 40;
    titleWords.forEach(word => {
      craftTypingTimeouts.push(safeTimeout(() => word.classList.add('is-visible'), currentDelay));
      currentDelay += 50;
    });

    currentDelay += 70;
    copyWords.forEach(word => {
      craftTypingTimeouts.push(safeTimeout(() => word.classList.add('is-visible'), currentDelay));
      currentDelay += 28;
    });
  }

  craftStepButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      craftStepButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playCraftTyping(index);
    });
  });

  // --------------------------------------------------------------------------
  // 4. ABOUT US: BRAND LIFESTYLE IMAGE SWITCHER (SECTION 2B)
  // --------------------------------------------------------------------------
  const lifestyleDots = document.querySelectorAll('.lifestyle-dot-btn');
  const lifestyleMainImg = $('lifestyleMainImg');
  const lifestyleCard = document.querySelector('.lifestyle-main-card');
  const lifestyleTagCluster = $('lifestyleTagCluster');
  const lifestyleSaucesPanel = $('lifestyleSaucesPanel');

  function restartAnim(el) {
    if (!el) return;
    el.classList.remove('animate-in');
    void el.offsetWidth;
    el.classList.add('animate-in');
  }

  const lifestyleImages = ['assets/lifestyle_1.svg', 'assets/lifestyle_2.svg', 'assets/lifestyle_3.svg'];

  restartAnim(lifestyleTagCluster);
  if (lifestyleCard) lifestyleCard.setAttribute('data-active-slide', '1');

  lifestyleDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      lifestyleDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      if (lifestyleCard) {
        lifestyleCard.setAttribute('data-active-slide', String(idx + 1));
        lifestyleCard.style.backgroundColor = idx === 2 ? '#2b5e35' : '';
      }

      if (lifestyleTagCluster && lifestyleSaucesPanel) {
        const isThird = idx === 2;
        lifestyleTagCluster.style.display = isThird ? 'none' : 'flex';
        lifestyleSaucesPanel.style.display = isThird ? 'flex' : 'none';
        restartAnim(isThird ? lifestyleSaucesPanel : lifestyleTagCluster);
      }

      fadeSwap(lifestyleMainImg, 'life', () => { lifestyleMainImg.src = lifestyleImages[idx]; });
    });
  });

  // --------------------------------------------------------------------------
  // 5. CUSTOMER EXPERIENCE TESTIMONIAL SLIDER (SECTION 4)
  // --------------------------------------------------------------------------
  let currentReviewIndex = 0;
  const quoteText = $('spotlightQuote');
  const reviewerName = $('reviewerName');
  const reviewerRole = $('reviewerRole');
  const reviewerPhoto = $('reviewerPhoto');
  const btnReviewPrev = $('reviewPrev');
  const btnReviewNext = $('reviewNext');

  function updateReview(index) {
    if (index < 0) index = testimonials.length - 1;
    if (index >= testimonials.length) index = 0;
    currentReviewIndex = index;

    const data = testimonials[currentReviewIndex];
    fadeSwap(quoteText, 'rev', () => { quoteText.textContent = data.quote; });
    if (reviewerName) reviewerName.textContent = data.name;
    if (reviewerRole) reviewerRole.textContent = data.role;
    if (reviewerPhoto) reviewerPhoto.src = data.avatar;
  }

  if (btnReviewPrev) {
    btnReviewPrev.addEventListener('click', () => updateReview(currentReviewIndex - 1));
  }
  if (btnReviewNext) {
    btnReviewNext.addEventListener('click', () => updateReview(currentReviewIndex + 1));
  }

  // --------------------------------------------------------------------------
  // 6. ORDER DRAWER, 3-STEP CHECKOUT & CART MANAGEMENT
  // --------------------------------------------------------------------------
  const drawerBackdrop = $('drawerBackdrop');
  const drawerTitle = $('drawerTitle');
  const drawerBackBtn = $('drawerBackBtn');
  const drawerScrollBody = $('drawerScrollBody');
  const stepIndicators = document.querySelectorAll('.drawer-step-pill');
  const stepPanels = [$('drawerStepCart'), $('drawerStepShipping'), $('drawerStepPayment')];
  const btnProceedToShipping = $('btnProceedToShipping');
  const btnProceedToPayment = $('btnProceedToPayment');
  const btnCheckoutWA = $('checkoutWhatsApp');
  const stepFooters = [btnProceedToShipping, btnProceedToPayment, btnCheckoutWA];
  const shipRecipientName = $('shipRecipientName');
  const shipRecipientPhone = $('shipRecipientPhone');
  const errRecipientName = $('errRecipientName');
  const errRecipientPhone = $('errRecipientPhone');
  const paySummaryRecipient = $('paySummaryRecipient');
  const paySummaryTotal = $('paySummaryTotal');

  const btnCartTriggers = document.querySelectorAll('[data-open-cart]');
  const btnCloseDrawer = $('closeDrawer');
  const cartBadges = document.querySelectorAll('.cart-count');
  const totalKkalElem = $('tallyKkal');
  const totalProteinElem = $('tallyProtein');
  const totalFiberElem = $('tallyFiber');
  const totalPriceElem = $('totalPrice');
  const drawerEmptyState = $('drawerEmptyState');
  const drawerMacroTally = $('drawerMacroTally');
  const btnBrowseMenuFromDrawer = $('btnBrowseMenuFromDrawer');

  let currentDrawerStep = 1;
  let latestTotalItems = 0;
  let latestTotalPrice = 0;
  let isSubmittingCheckout = false;
  const checkoutSubmitHistory = [];

  const cleanInput = (el, maxLen = 80) => sanitizeField(el ? el.value : '', maxLen);

  function setFieldState(inputEl, errEl, msg) {
    if (inputEl) inputEl.classList.toggle('is-error', Boolean(msg));
    if (errEl) {
      errEl.textContent = msg || '';
      errEl.classList.toggle('is-visible', Boolean(msg));
    }
  }

  function setDrawerStep(step) {
    currentDrawerStep = step;
    const titles = ['SAJI ORDER BAG 🥗', 'DATA PENGIRIMAN 📦', 'PEMBAYARAN QRIS 💳'];
    if (drawerTitle) drawerTitle.textContent = titles[step - 1] || titles[0];
    if (drawerBackBtn) drawerBackBtn.hidden = (step === 1);

    stepIndicators.forEach((pill, i) => {
      pill.classList.toggle('is-active', i + 1 === step);
      pill.classList.toggle('is-done', i + 1 < step);
    });
    stepPanels.forEach((el, i) => {
      if (!el) return;
      const active = i + 1 === step;
      el.hidden = !active;
      el.classList.toggle('is-active', active);
    });
    stepFooters.forEach((el, i) => {
      if (el) el.hidden = (i + 1 !== step);
    });
    if (drawerScrollBody) drawerScrollBody.scrollTop = 0;

    if (step === 3) {
      const rName = cleanInput(shipRecipientName, 80);
      const rPhone = cleanInput(shipRecipientPhone, 20);
      if (paySummaryRecipient) paySummaryRecipient.textContent = `${rName || '-'} (${rPhone || '-'})`;
      if (paySummaryTotal) paySummaryTotal.textContent = 'Rp ' + latestTotalPrice.toLocaleString('id-ID');
      refreshWhatsAppHref(latestTotalItems, latestTotalPrice);
    }
  }

  function validateShippingForm() {
    const shipHp = $('shipHpField');
    if (shipHp && shipHp.value.trim().length > 0) return false;

    const rawName = cleanInput(shipRecipientName, 80);
    const cleanPhone = cleanInput(shipRecipientPhone, 20).replace(/[\s\-().]/g, '');
    let firstInvalid = null;

    let nameErr = '';
    if (rawName.length < 2) nameErr = 'Nama penerima wajib diisi (minimal 2 huruf).';
    else if (!/[A-Za-z\u00C0-\u024F]/.test(rawName)) nameErr = 'Nama penerima harus memuat huruf yang valid.';
    setFieldState(shipRecipientName, errRecipientName, nameErr);
    if (nameErr) firstInvalid = shipRecipientName;

    let phoneErr = '';
    if (!cleanPhone) phoneErr = 'Nomor telepon / WhatsApp wajib diisi.';
    else if (!PHONE_RE.test(cleanPhone)) phoneErr = 'Masukkan nomor HP aktif yang valid (contoh: 081234567890).';
    setFieldState(shipRecipientPhone, errRecipientPhone, phoneErr);
    if (phoneErr && !firstInvalid) firstInvalid = shipRecipientPhone;

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  [[shipRecipientName, errRecipientName, 80], [shipRecipientPhone, errRecipientPhone, 20]].forEach(([input, err, maxL]) => {
    bindCleanInput(input, maxL, () => {
      setFieldState(input, err, '');
      if (currentDrawerStep === 3) refreshWhatsAppHref(latestTotalItems, latestTotalPrice);
    });
  });

  function openDrawer() {
    setDrawerStep(1);
    setOverlayActive(drawerBackdrop, true, 'drawer-open');
  }

  function closeDrawer() {
    setOverlayActive(drawerBackdrop, false, 'drawer-open');
  }

  if (drawerBackBtn) drawerBackBtn.addEventListener('click', () => { if (currentDrawerStep > 1) setDrawerStep(currentDrawerStep - 1); });
  if (btnProceedToShipping) {
    btnProceedToShipping.addEventListener('click', () => {
      if (latestTotalItems === 0) return showToast('Keranjang masih kosong, pilih menu dulu yuk! 🥗');
      setDrawerStep(2);
    });
  }
  if (btnProceedToPayment) btnProceedToPayment.addEventListener('click', () => { if (validateShippingForm()) setDrawerStep(3); });

  btnCartTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = btn.getAttribute('data-product-id');
      if (productId && cart[productId] !== undefined) {
        cart[productId] = clampInt((cart[productId] || 0) + 1, 0, 99);
        updateCartUI();
        showToast(`+1 ${productId.toUpperCase()} ditambahkan! 🥗`);
      }
      openDrawer();
    });
  });

  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', (e) => { if (e.target === drawerBackdrop) closeDrawer(); });

  if (btnBrowseMenuFromDrawer) {
    btnBrowseMenuFromDrawer.addEventListener('click', (e) => {
      e.preventDefault();
      closeDrawer();
      smoothScrollEl($('catalog'), 96);
    });
  }

  // Drawer Quantity Handlers (Strictly bounded 0..99, zero NaN/negative)
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-item');
      const action = btn.getAttribute('data-action');
      if (!id || cart[id] === undefined) return;
      const cur = clampInt(cart[id], 0, 99);

      if (action === 'plus') {
        if (cur >= 99) return showToast('Maksimal 99 porsi per menu.');
        cart[id] = cur + 1;
        const tallied = customOrders.filter(co => co.productId === id).reduce((s, co) => s + clampInt(co.qty, 1, 99), 0);
        if (tallied === cur && customOrders.length > 0) {
          const existingOrder = customOrders.find(co => co.productId === id);
          if (existingOrder) {
            existingOrder.qty = clampInt(existingOrder.qty + 1, 1, 99);
            existingOrder.subtotal = clampInt(existingOrder.unitPrice, 0, 10000000) * existingOrder.qty;
          }
        }
      } else if (action === 'minus') {
        if (cur > 0) {
          cart[id] = cur - 1;
          for (let i = customOrders.length - 1; i >= 0; i--) {
            if (customOrders[i].productId === id) {
              if (customOrders[i].qty > 1) {
                customOrders[i].qty = clampInt(customOrders[i].qty - 1, 1, 99);
                customOrders[i].subtotal = clampInt(customOrders[i].unitPrice, 0, 10000000) * customOrders[i].qty;
              } else {
                customOrders.splice(i, 1);
              }
              break;
            }
          }
          if (cart[id] === 0) {
            customOrders = customOrders.filter(co => co.productId !== id);
          }
        }
      }
      updateCartUI();
    });
  });

  function buildOrderLines() {
    const orderList = [];
    const talliedQty = {};

    customOrders.forEach(item => {
      const qty = clampInt(item.qty, 1, 99);
      const unitPrice = clampInt(item.unitPrice, 0, 10000000);
      const itemTotal = Math.max(0, unitPrice * qty);
      const isExcluded = item.exclude && item.exclude !== 'Tidak Ada (Sajikan Lengkap)' && item.exclude !== 'none' && item.exclude.trim() !== '';
      const addonsVal = (item.addons && item.addons.length > 0)
        ? item.addons.map(a => (typeof a === 'object' && a.name) ? `${sanitizeField(a.name, 60)} (+Rp ${clampInt(a.price, 0, 100000).toLocaleString('id-ID')})` : sanitizeField(a, 60)).join(', ')
        : '-';
      const notesVal = (item.notes && sanitizeField(item.notes, 120)) ? `"${sanitizeField(item.notes, 120)}"` : '-';

      orderList.push({
        name: item.productName,
        qty,
        totalPrice: itemTotal,
        exclude: isExcluded ? sanitizeField(item.exclude, 80) : '-',
        sauce: sanitizeField(item.sauce || 'Saus Kemangi', 60),
        addons: addonsVal,
        notes: notesVal
      });
      talliedQty[item.productId] = (talliedQty[item.productId] || 0) + qty;
    });

    products.forEach(p => {
      const extraQty = Math.max(0, clampInt(cart[p.id], 0, 99) - (talliedQty[p.id] || 0));
      if (extraQty > 0) {
        orderList.push({
          name: p.name,
          qty: extraQty,
          totalPrice: extraQty * clampInt(p.price, 0, 1000000),
          exclude: '-',
          sauce: 'Saus Kemangi',
          addons: '-',
          notes: '-'
        });
      }
    });

    return orderList;
  }

  function refreshWhatsAppHref(totalItems, totalPrice) {
    if (!btnCheckoutWA) return;
    let waMessage = '';

    if (totalItems === 0) {
      waMessage = `Halo SAJI (@saji.bowl)! 🥗\nSaya ingin bertanya seputar menu Sajian Healthy Bowl hari ini.\nMohon info rekomendasi menu dan cara pemesanannya ya. Terima kasih! 🙏✨`;
    } else {
      waMessage = `Halo SAJI! 🥗 Saya mau order menu sehat untuk hari ini :\n\n*Detail Pesanan :*\n`;
      buildOrderLines().forEach((item, idx) => {
        waMessage += `${idx + 1}. ${item.qty}x *${item.name}* — Rp ${item.totalPrice.toLocaleString('id-ID')}\n`;
        waMessage += `   • Pilihan Tanpa Bahan: ${item.exclude}\n`;
        waMessage += `   • Pilihan Saus: ${item.sauce}\n`;
        waMessage += `   • Pilihan Tambahan (Adds On): ${item.addons}\n`;
        waMessage += `   • Catatan Khusus: ${item.notes}\n\n`;
      });

      const rName = cleanInput(shipRecipientName, 80);
      const rPhone = cleanInput(shipRecipientPhone, 20);

      waMessage += `*Data Penerima :*\n`;
      waMessage += `• Nama Penerima: ${rName || '-'}\n`;
      waMessage += `• Nomor Telepon: ${rPhone || '-'}\n\n`;
      waMessage += `*Total Pembayaran :* Rp ${Math.max(0, Number(totalPrice) || 0).toLocaleString('id-ID')}\n`;
      waMessage += `💳 Metode Pembayaran: QRIS SAJI (Bukti transfer terlampir)\n\n`;
      waMessage += `Mohon konfirmasi pesanannya ya, bukti pembayaran QRIS saya kirimkan bersama pesan ini. Terima kasih! 🙏✨`;
    }

    btnCheckoutWA.href = `https://wa.me/62811423799?text=${encodeURIComponent(waMessage)}`;
  }

  function updateCartUI() {
    let totalItems = 0;
    let totalKkal = 0;
    let totalProtein = 0;
    let totalFiber = 0;

    products.forEach(p => {
      const qty = clampInt(cart[p.id], 0, 99);
      cart[p.id] = qty;
      totalItems += qty;
      totalKkal += qty * clampInt(p.macros?.kkal, 0, 5000);
      totalProtein += qty * clampInt(p.macros?.protein, 0, 500);
      totalFiber += qty * clampInt(p.macros?.fiber, 0, 500);

      const qtySpan = $(`qty-${p.id}`);
      if (qtySpan) qtySpan.textContent = qty;

      const itemCard = document.querySelector(`.drawer-item-card[data-card-id="${p.id}"]`);
      if (itemCard) {
        itemCard.style.display = qty > 0 ? 'flex' : 'none';
      }
    });

    cartBadges.forEach(badge => {
      badge.textContent = totalItems;
    });

    const totalPrice = buildOrderLines().reduce((sum, item) => sum + clampInt(item.totalPrice, 0, 100000000), 0);
    latestTotalItems = totalItems;
    latestTotalPrice = totalPrice;

    const empty = totalItems === 0;
    setFloatingCart(!empty);
    if (drawerEmptyState) drawerEmptyState.style.display = empty ? 'flex' : 'none';
    if (drawerMacroTally) drawerMacroTally.style.display = empty ? 'none' : 'grid';
    if (btnProceedToShipping) btnProceedToShipping.disabled = empty;
    if (empty) {
      if (totalPriceElem) totalPriceElem.textContent = 'Rp 0';
      if (currentDrawerStep > 1) setDrawerStep(1);
    } else {
      if (totalKkalElem) totalKkalElem.textContent = totalKkal;
      if (totalProteinElem) totalProteinElem.textContent = totalProtein + 'g';
      if (totalFiberElem) totalFiberElem.textContent = totalFiber + 'g';
      if (totalPriceElem) totalPriceElem.textContent = 'Rp ' + totalPrice.toLocaleString('id-ID');
    }

    refreshWhatsAppHref(totalItems, totalPrice);
  }

  if (btnCheckoutWA) {
    btnCheckoutWA.addEventListener('click', (e) => {
      if ($('sajiHpField')?.value.trim() || $('shipHpField')?.value.trim() || isSubmittingCheckout) return e.preventDefault();
      if (latestTotalItems === 0) {
        e.preventDefault();
        return showToast('Keranjang masih kosong, pilih menu dulu yuk! 🥗');
      }
      if (!validateShippingForm()) {
        e.preventDefault();
        return setDrawerStep(2);
      }
      const now = Date.now();
      while (checkoutSubmitHistory.length && now - checkoutSubmitHistory[0] > 300000) checkoutSubmitHistory.shift();
      if (checkoutSubmitHistory.length >= 5) {
        e.preventDefault();
        return showToast('Terlalu banyak percobaan pengiriman. Tunggu sebentar ya.');
      }
      checkoutSubmitHistory.push(now);
      isSubmittingCheckout = true;
      btnCheckoutWA.style.opacity = '0.75';
      refreshWhatsAppHref(latestTotalItems, latestTotalPrice);
      safeTimeout(() => {
        isSubmittingCheckout = false;
        if (btnCheckoutWA) btnCheckoutWA.style.opacity = '';
      }, 1800);
      closeDrawer();
    });
  }

  // Initial cart calculation
  updateCartUI();

  // --------------------------------------------------------------------------
  // 7. TOAST NOTIFICATION
  // --------------------------------------------------------------------------
  const toast = $('toastAlert');
  const toastMsg = $('toastMsg');
  let toastTimeout;

  function showToast(message) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = safeTimeout(() => toast.classList.remove('show'), 2500);
  }

  // --------------------------------------------------------------------------
  // 8. NAVIGATION DRAWER SIDEBAR & ACCESSIBLE TOGGLE
  // --------------------------------------------------------------------------
  const mobileToggle = $('mobileToggle');
  const mobileNavMenu = $('mobileNavMenu');
  const navDrawerBackdrop = $('navDrawerBackdrop');
  const closeNavDrawer = $('closeNavDrawer');

  const setNavOpen = (open) => {
    if (!mobileNavMenu || !mobileToggle) return;
    mobileNavMenu.classList.toggle('open', open);
    mobileToggle.classList.toggle('active', open);
    mobileToggle.setAttribute('aria-expanded', String(open));
    mobileNavMenu.setAttribute('aria-hidden', String(!open));
    if (navDrawerBackdrop) {
      navDrawerBackdrop.classList.toggle('open', open);
      navDrawerBackdrop.setAttribute('aria-hidden', String(!open));
    }
    syncBodyScroll();
  };
  const closeMobileNav = () => setNavOpen(false);

  if (mobileToggle && mobileNavMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setNavOpen(!mobileNavMenu.classList.contains('open'));
    });

    if (closeNavDrawer) {
      closeNavDrawer.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileNav();
      });
    }

    if (navDrawerBackdrop) navDrawerBackdrop.addEventListener('click', closeMobileNav);

    const scrollToTargetId = (targetId) => {
      if (targetId === 'hero' || targetId === 'home') return window.scrollTo({ top: 0, behavior: 'smooth' });
      const mapped = { menu: 'catalog', contacts: 'contact' };
      smoothScrollEl($(targetId) || $(mapped[targetId]), 84);
    };

    mobileNavMenu.querySelectorAll('.nav-drawer-link, .nav-drawer-brand').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('data-target') || (link.getAttribute('href') || '').replace(/^#/, '');
        if (!targetId) return;
        e.preventDefault();
        closeMobileNav();
        scrollToTargetId(targetId);
        safeTimeout(() => scrollToTargetId(targetId), 120);
      });
    });

    const drawerWaBtn = mobileNavMenu.querySelector('.nav-drawer-wa-btn');
    if (drawerWaBtn) drawerWaBtn.addEventListener('click', () => safeTimeout(closeMobileNav, 300));

    document.addEventListener('click', (e) => {
      if (mobileNavMenu.classList.contains('open') && !mobileNavMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileNav();
      }
    }, { signal: sig });

    // Passive listener for lag-free touch and scroll (Zero INP blocking)
    window.addEventListener('resize', onPassiveResize, { passive: true });
  }

  // Unified Escape Key Overlay Controller (Single cleaned-up listener)
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (privacyModal && privacyModal.classList.contains('active')) return closePrivacyModal();
    if (customizerModal && customizerModal.classList.contains('active')) return closeCustomizerModal();
    if (drawerBackdrop && drawerBackdrop.classList.contains('active')) return closeDrawer();
    if (mobileNavMenu && mobileNavMenu.classList.contains('open')) return closeMobileNav();
  }, { signal: sig });

  // --------------------------------------------------------------------------
  // 9. HERO SECTION: STATS NUMBER COUNT-UP ANIMATION (0 -> 4+, 300+, 100%)
  // --------------------------------------------------------------------------
  function initHeroCounters() {
    const counterElements = document.querySelectorAll('.hero-stats-row .metric-num[data-target]');
    if (!counterElements.length) return;

    let hasAnimated = false;
    let observer = null;

    function runCounters() {
      if (hasAnimated) return;
      hasAnimated = true;
      if (observer) {
        observer.disconnect();
        activeObservers.delete(observer);
      }

      counterElements.forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';

        let duration = 1600;
        if (target <= 10) duration = 1350;
        else if (target <= 100) duration = 1500;
        else duration = 1750;

        const startTime = performance.now();

        function step(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOutProgress = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(easeOutProgress * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }

        requestAnimationFrame(step);
      });
    }

    safeTimeout(runCounters, 850);

    const statsRow = document.querySelector('.hero-stats-row');
    if (statsRow && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) runCounters();
      }, { threshold: 0.2 });
      activeObservers.add(observer);
      observer.observe(statsRow);
    }
  }

  initHeroCounters();

  // --------------------------------------------------------------------------
  // 10. UNIVERSAL INTERNAL SMOOTH SCROLL WITH PRECISE NAVBAR OFFSET
  // --------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetHash = this.getAttribute('href');
      if (!targetHash || targetHash === '#') return;

      const targetElem = $(targetHash.slice(1));
      if (targetElem) {
        e.preventDefault();
        if (drawerBackdrop && drawerBackdrop.classList.contains('active')) closeDrawer();
        if (mobileNavMenu && mobileNavMenu.classList.contains('open')) closeMobileNav();
        smoothScrollEl(targetElem, 96);
        if (history.pushState && /^#[a-zA-Z0-9_-]+$/.test(targetHash)) history.pushState(null, null, targetHash);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 11. LUXURY FULL-PAGE SCROLL-REVEAL ANIMATION SYSTEM
  // --------------------------------------------------------------------------
  function initScrollReveal() {
    const selectors = [
      '.reveal-on-scroll',
      '.about-header-split',
      '.craft-container',
      '.lifestyle-showcase',
      '.catalog-header-wrap',
      '.product-card',
      '.catalog-nav-arrows',
      '.reviews-header-center',
      '.spotlight-review-grid',
      '.footer-marquee-ribbon',
      '.footer-floating-composition',
      '.bento-card-location',
      '.bento-card-sayhello',
      '.bento-card-hours',
      '.footer-nav-row',
      '.footer-bottom-bar'
    ];

    const targets = document.querySelectorAll(selectors.join(', '));

    targets.forEach((el) => {
      el.classList.add('reveal-init');
      if (el.classList.contains('product-card')) {
        const cardIndex = Array.from(el.parentNode.children).indexOf(el);
        el.style.transitionDelay = `${cardIndex * 0.12}s`;
      }
      if (el.classList.contains('bento-card-location')) el.style.transitionDelay = '0.08s';
      else if (el.classList.contains('bento-card-sayhello')) el.style.transitionDelay = '0.18s';
      else if (el.classList.contains('bento-card-hours')) el.style.transitionDelay = '0.24s';
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            if (entry.target.classList.contains('lifestyle-showcase')) restartAnim(lifestyleTagCluster);
            if (entry.target.classList.contains('craft-container') && !craftHasAnimatedOnce) {
              craftHasAnimatedOnce = true;
              playCraftTyping(0);
            }
            observer.unobserve(entry.target);
          }
        });
      }, { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.12 });

      activeObservers.add(observer);
      targets.forEach((el) => observer.observe(el));
    } else {
      targets.forEach((el) => el.classList.add('is-revealed'));
      if (!craftHasAnimatedOnce) {
        craftHasAnimatedOnce = true;
        playCraftTyping(0);
      }
    }
  }

  initScrollReveal();

  // --------------------------------------------------------------------------
  // 12. DEVSECOPS & PRIVACY POLICY MODAL CONTROLLER (UU PDP No. 27/2022)
  // --------------------------------------------------------------------------
  const privacyModal = $('sajiPrivacyModal');
  const btnClosePrivacyModal = $('closePrivacyModal');
  const btnDismissPrivacyModal = $('btnDismissPrivacyModal');
  const linkOpenPrivacy = $('openPrivacyLink');
  const linkOpenPrivacyBottom = $('footerPrivacyBottomLink');

  const togglePrivacyModal = (open) => {
    if (!privacyModal) return;
    privacyModal.classList.toggle('active', open);
    privacyModal.setAttribute('aria-hidden', String(!open));
    syncBodyScroll();
  };
  const closePrivacyModal = () => togglePrivacyModal(false);

  [linkOpenPrivacy, linkOpenPrivacyBottom].forEach(link => {
    if (link) link.addEventListener('click', (e) => {
      if (privacyModal) { e.preventDefault(); togglePrivacyModal(true); }
    });
  });

  if (btnClosePrivacyModal) btnClosePrivacyModal.addEventListener('click', closePrivacyModal);
  if (btnDismissPrivacyModal) btnDismissPrivacyModal.addEventListener('click', closePrivacyModal);
  if (privacyModal) privacyModal.addEventListener('click', (e) => { if (e.target === privacyModal) closePrivacyModal(); });

  window.SajiSecurity = {
    validateIndonesianPhone: p => PHONE_RE.test(String(p || '').replace(/[\s\-().]/g, '')),
    validateEmail: e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim().slice(0, 100)),
    sanitizeText: (t, maxLen = 120) => sanitizeField(t, maxLen),
    clampQty: q => clampInt(q, 0, 99),
    isTurnstileReady: () => typeof window.turnstile !== 'undefined' || Boolean($('sajiHpField'))
  };
});

