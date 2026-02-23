/* =============================================
   PORTFOLIO – script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  /* ---- Typing animation ---- */
  const typedEl = document.getElementById('typedText');
  const phrases = [
    'Fullstack Developer',
    'MERN Stack Developer',
    'Software Engineer',
    'Junior Full Stack Developer',
    'Java Developer'
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  const TYPING_SPEED = 80;
  const DELETING_SPEED = 40;
  const PAUSE = 1800;

  function type() {
    const current = phrases[phraseIdx];
    if (!deleting) {
      typedEl.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, PAUSE);
        return;
      }
      setTimeout(type, TYPING_SPEED);
    } else {
      typedEl.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
      setTimeout(type, DELETING_SPEED);
    }
  }
  type();

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* ---- Navbar scroll styling ---- */
  const navbar = document.getElementById('navbar');

  function onScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Active nav link ---- */
  const sections = document.querySelectorAll('.section, .hero');

  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  /* ---- Scroll reveal (Intersection Observer) ---- */
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach(el => observer.observe(el));

  /* ---- Force-download handler for CV links ---- */
  async function forceDownload(url, suggestedName) {
    try {
      let blob;
      // If served via file:// some browsers block fetch; try XHR first
      if (location.protocol === 'file:') {
        blob = await new Promise((resolve, reject) => {
          try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.onload = () => {
              if (xhr.status === 200 || xhr.status === 0) resolve(xhr.response);
              else reject(new Error('XHR failed'));
            };
            xhr.onerror = () => reject(new Error('XHR error'));
            xhr.send();
          } catch (e) {
            reject(e);
          }
        });
      } else {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Network response was not ok');
        blob = await res.blob();
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = suggestedName || url.split('/').pop();
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // fallback: navigate to the file (browser default)
      console.warn('forceDownload failed, falling back to navigation', err);
      window.location.href = url;
    }
  }

  // Attach handler to logo and any .btn-cv links
  const cvLinks = [];
  const logo = document.querySelector('.nav-logo');
  if (logo && logo.tagName === 'A' && logo.getAttribute('href') && /\.pdf$/i.test(logo.getAttribute('href'))) cvLinks.push(logo);
  document.querySelectorAll('a').forEach(a => {
    if (a.classList.contains('btn-cv') || a.classList.contains('nav-cv-btn')) {
      if (a.getAttribute('href') && /\.pdf$/i.test(a.getAttribute('href'))) cvLinks.push(a);
    }
  });

  cvLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // allow ctrl/cmd+click or middle-click to open in new tab
      if (e.ctrlKey || e.metaKey || e.button === 1) return;
      const href = link.getAttribute('href');
      console.log('CV link clicked:', href, 'protocol:', location.protocol);
      // If opened from file://, let the browser handle it (some browsers block fetch)
      if (location.protocol === 'file:') return;
      e.preventDefault();
      // Suggest a clean filename
      const suggested = 'Lahiru_Kithsiri_CV.pdf';
      forceDownload(href, suggested);
    });
  });

  /* ---- EmailJS Contact Form ---- */
  // ⚠️ REPLACE these placeholder values with your real EmailJS credentials:
  // 1. Go to https://www.emailjs.com/ and sign up (free)
  // 2. Add an Email Service (connect your Gmail)
  // 3. Create an Email Template with variables: {{from_name}}, {{from_email}}, {{message}}
  // 4. Copy your Public Key, Service ID, and Template ID below:
  const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

  emailjs.init(EMAILJS_PUBLIC_KEY);

  const contactForm = document.getElementById('contactForm');
  const sendBtn = document.getElementById('sendBtn');
  const sendBtnText = document.getElementById('sendBtnText');
  const toast = document.getElementById('toast');

  function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast ' + type;
    // Trigger reflow to restart animation
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Set sending state
    sendBtn.classList.add('sending');
    sendBtnText.textContent = 'Sending...';

    const templateParams = {
      from_name: document.getElementById('fromName').value,
      from_email: document.getElementById('fromEmail').value,
      message: document.getElementById('message').value
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        showToast('Message sent successfully, Lahiru will get back to you soon! ✉️', 'success');
        contactForm.reset();
      })
      .catch(() => {
        showToast('Oops! Something went wrong. Please try again later.', 'error');
      })
      .finally(() => {
        sendBtn.classList.remove('sending');
        sendBtnText.textContent = 'Send Message';
      });
  });
});
