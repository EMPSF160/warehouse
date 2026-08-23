/* ==========================================================================
   WAREHOUSE - INTERACTIVE CONTROLLER SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isExpanded = navMenu.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('open');
      }
    });
  }

  // Animated KPI Counters
  const counters = document.querySelectorAll('.counter-val');
  if (counters.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const countTo = parseFloat(target.getAttribute('data-target'));
          const decimals = parseInt(target.getAttribute('data-decimals') || '0', 10);
          const prefix = target.getAttribute('data-prefix') || '';
          const suffix = target.getAttribute('data-suffix') || '';
          const duration = 1800; // ms
          const stepTime = 25;
          const totalSteps = duration / stepTime;
          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / totalSteps;
            // Ease out cubic
            const currentVal = countTo * (1 - Math.pow(1 - progress, 3));

            if (currentStep >= totalSteps) {
              target.textContent = prefix + (decimals > 0 ? countTo.toFixed(decimals) : Math.round(countTo).toLocaleString()) + suffix;
              clearInterval(timer);
            } else {
              target.textContent = prefix + (decimals > 0 ? currentVal.toFixed(decimals) : Math.round(currentVal).toLocaleString()) + suffix;
            }
          }, stepTime);

          obs.unobserve(target);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(c => observer.observe(c));
  }

  // Interactive Quote Calculator (for contact.html / index.html widget)
  const sqftRange = document.getElementById('calc-sqft');
  const durationSelect = document.getElementById('calc-duration');
  const tempSelect = document.getElementById('calc-temp');
  const crossdockCheck = document.getElementById('calc-crossdock');
  const hazmatCheck = document.getElementById('calc-hazmat');

  const sqftDisplay = document.getElementById('disp-sqft');
  const palletDisplay = document.getElementById('disp-pallets');
  const totalPriceDisplay = document.getElementById('disp-total-price');

  function calculateQuote() {
    if (!sqftRange || !totalPriceDisplay) return;

    const sqft = parseInt(sqftRange.value, 10);
    const months = parseInt(durationSelect ? durationSelect.value : '1', 10);
    const tempMultiplier = tempSelect ? parseFloat(tempSelect.value) : 1.0;
    
    // Estimate pallets based on standard high-bay racking: ~25 sq ft per pallet position
    const estimatedPallets = Math.round(sqft / 25);
    
    // Base rate: $1.45 per sq ft / month
    let baseMonthlyCost = sqft * 1.45 * tempMultiplier;
    
    // Extra add-on services
    if (crossdockCheck && crossdockCheck.checked) {
      baseMonthlyCost += sqft * 0.25;
    }
    if (hazmatCheck && hazmatCheck.checked) {
      baseMonthlyCost += sqft * 0.40;
    }

    // Volume discount for long duration
    let discount = 0;
    if (months >= 12) discount = 0.15;
    else if (months >= 6) discount = 0.08;

    const finalMonthly = baseMonthlyCost * (1 - discount);
    const totalContract = finalMonthly * months;

    // Update displays
    if (sqftDisplay) sqftDisplay.textContent = sqft.toLocaleString() + ' SQ. FT.';
    if (palletDisplay) palletDisplay.textContent = estimatedPallets.toLocaleString() + ' Pallet Positions';
    totalPriceDisplay.textContent = '$' + Math.round(finalMonthly).toLocaleString() + '/mo';
  }

  if (sqftRange) {
    sqftRange.addEventListener('input', calculateQuote);
    if (durationSelect) durationSelect.addEventListener('change', calculateQuote);
    if (tempSelect) tempSelect.addEventListener('change', calculateQuote);
    if (crossdockCheck) crossdockCheck.addEventListener('change', calculateQuote);
    if (hazmatCheck) hazmatCheck.addEventListener('change', calculateQuote);
    calculateQuote();
  }

  // Interactive Service Filter (services.html)
  const filterButtons = document.querySelectorAll('.filter-btn');
  const serviceCards = document.querySelectorAll('.service-filterable-card');

  if (filterButtons.length > 0 && serviceCards.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');

        serviceCards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (category === 'all' || cardCat === category) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  }

  // Interactive Facility Zone Visualizer (facilities.html)
  const zoneButtons = document.querySelectorAll('.zone-btn');
  const zoneTitle = document.getElementById('zone-active-title');
  const zoneDesc = document.getElementById('zone-active-desc');
  const zoneClearHeight = document.getElementById('zone-active-height');
  const zoneCapacity = document.getElementById('zone-active-capacity');
  const zoneEquip = document.getElementById('zone-active-equip');
  const zoneImage = document.getElementById('zone-active-img');

  const zoneData = {
    asrs: {
      title: 'ZONE A: Automated High-Bay Racking (ASRS)',
      desc: 'Precision robotic automated storage system with 14 computer-controlled cranes delivering sub-90-second pallet retrieval cycles.',
      height: '48 FT Clear Height',
      capacity: '65,000 High-Bay Pallet Slots',
      equip: '14x Automated Rail Cranes, LiDAR Guidance, Conveyor Loop',
      img: 'image/service-asrs-fisheye.jpg'
    },
    heavy: {
      title: 'ZONE B: Heavy Machinery & Industrial Staging',
      desc: 'Reinforced slab capacity engineered for Caterpillar-class excavators, turbine assemblies, and oversized industrial freight.',
      height: '38 FT Clear Height',
      capacity: '12,000 Lbs / Sq. Ft. Slab Load',
      equip: '2x 50-Ton Overhead Gantry Cranes, Ramped Drive-In Docks',
      img: 'image/service-heavy-machinery.jpg'
    },
    cold: {
      title: 'ZONE C: Multi-Temp Cold Chain Enclosure',
      desc: 'Hermetically sealed, ISO 22000 compliant sub-zero deep freeze and ambient chill storage with multi-redundant ammonia refrigeration.',
      height: '32 FT Clear Height',
      capacity: '-25°C to +15°C Range',
      equip: 'Rapid-Roll Insulated High-Speed Doors, 24/7 Telemetry Logs',
      img: 'image/service-autostore-grid.jpg'
    },
    dispatch: {
      title: 'ZONE D: Rapid Intermodal Cross-Dock & Dispatch',
      desc: '64 hydraulic dock doors featuring automatic vehicle restraint systems and integrated weigh-in-motion conveyor scales.',
      height: '28 FT Clear Height',
      capacity: '450+ Trailer Turnarounds / Day',
      equip: '64 Leveler Docks, Yard Management RFID Scanner, EV Shunters',
      img: 'image/facility-terminal-aerial.jpg'
    }
  };

  if (zoneButtons.length > 0 && zoneTitle) {
    zoneButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        zoneButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const key = btn.getAttribute('data-zone');
        const data = zoneData[key];

        if (data) {
          zoneTitle.textContent = data.title;
          zoneDesc.textContent = data.desc;
          if (zoneClearHeight) zoneClearHeight.textContent = data.height;
          if (zoneCapacity) zoneCapacity.textContent = data.capacity;
          if (zoneEquip) zoneEquip.textContent = data.equip;
          if (zoneImage && data.img) {
            zoneImage.src = data.img;
          }
        }
      });
    });
  }

  // Interactive Form Submission (Contact Page)
  const contactForm = document.getElementById('contact-form');
  const toastMsg = document.getElementById('form-toast');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = 'TRANSMITTING REQUEST...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = 'DISPATCH CONFIRMED ✓';
        submitBtn.style.backgroundColor = '#2ecc71';
        submitBtn.style.color = '#ffffff';

        if (toastMsg) {
          toastMsg.style.display = 'block';
          toastMsg.textContent = 'Operational inquiry submitted successfully. A logistics director will respond within 60 minutes.';
        }

        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.backgroundColor = '';
          submitBtn.style.color = '';
          submitBtn.disabled = false;
        }, 4000);
      }, 900);
    });
  }
});
