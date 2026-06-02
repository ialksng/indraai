(function() {
  if (window.IndraWidgetLoaded) return;
  window.IndraWidgetLoaded = true;

  const scriptTag = document.currentScript;
  const projectId = scriptTag.getAttribute('data-project-id') || 'default';

  // --- SHADOW DOM WRAPPER (Prevents host CSS leakage) ---
  const host = document.createElement('div');
  host.id = 'indra-agent-root';
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });

  const container = document.createElement('div');
  container.id = 'indra-widget-container';
  
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    #indra-widget-container { 
      position: fixed; 
      bottom: 24px; 
      right: 24px; 
      z-index: 2147483647; 
      display: flex; 
      flex-direction: column; 
      align-items: flex-end; 
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; 
    }
    #indra-iframe { 
      width: 400px; 
      height: 600px; 
      max-height: calc(100vh - 120px); 
      border: 1px solid rgba(255,255,255,0.1); 
      border-radius: 20px; 
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(245, 158, 11, 0.05); 
      display: none; 
      margin-bottom: 20px; 
      background: #020617; 
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
      overflow: hidden; 
      opacity: 0; 
      transform: translateY(20px) scale(0.95);
      transform-origin: bottom right;
    }
    #indra-iframe.visible { 
      display: block; 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
    #indra-toggle-btn { 
      width: 60px; 
      height: 60px; 
      border-radius: 30px; 
      background: linear-gradient(135deg, #FACC15, #F97316); 
      color: #fff; 
      border: none; 
      cursor: pointer; 
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4); 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s; 
    }
    #indra-toggle-btn:hover { 
      transform: scale(1.08); 
      box-shadow: 0 12px 28px rgba(245, 158, 11, 0.6); 
    }
    #indra-toggle-btn:active {
      transform: scale(0.95);
    }
    #indra-toggle-btn svg { 
      width: 28px; 
      height: 28px; 
      fill: none; 
      stroke: currentColor; 
      stroke-width: 2.2; 
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: transform 0.3s ease, opacity 0.3s ease;
      position: absolute;
    }
    .icon-spin-out { transform: rotate(180deg) scale(0); opacity: 0; }
    .icon-spin-in { transform: rotate(0deg) scale(1); opacity: 1; }
    
    @keyframes indraAgentPulse {
      0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); outline: 2px solid #FACC15; }
      70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); outline: 2px solid rgba(245, 158, 11, 0.5); }
      100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); outline: transparent; }
    }
    .indra-highlight { animation: indraAgentPulse 1s ease-out forwards; border-radius: inherit; }
    
    /* --- MOBILE RESPONSIVE TWEAKS --- */
    @media (max-width: 480px) { 
      #indra-widget-container { 
        bottom: 16px; 
        right: 16px; 
      }
      #indra-iframe { 
        width: calc(100vw - 32px); 
        /* ✅ FIXED: Set a much shorter base height and prevent it from exceeding 75% of the screen */
        height: 500px; 
        max-height: 75vh; 
        border-radius: 16px;
      } 
    }
  `;

  const iframe = document.createElement('iframe');
  iframe.id = 'indra-iframe';
  
  // Fixed routing to match the BrowserRouter in App.jsx
  iframe.src = `https://indra.ialksng.me/widget?projectId=${projectId}`; 
  iframe.allow = "camera; microphone; display-capture; fullscreen; clipboard-read; clipboard-write";
  iframe.frameBorder = "0";

  const button = document.createElement('button');
  button.id = 'indra-toggle-btn';
  
  const chatIcon = `<svg id="icon-chat" class="icon-spin-in" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
  const closeIcon = `<svg id="icon-close" class="icon-spin-out" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  button.innerHTML = chatIcon + closeIcon;

  let isOpen = false;
  button.onclick = () => {
    isOpen = !isOpen;
    const iconChat = button.querySelector('#icon-chat');
    const iconClose = button.querySelector('#icon-close');
    
    if (isOpen) {
      iframe.classList.add('visible');
      iconChat.classList.replace('icon-spin-in', 'icon-spin-out');
      iconClose.classList.replace('icon-spin-out', 'icon-spin-in');
    } else {
      iframe.classList.remove('visible');
      iconClose.classList.replace('icon-spin-in', 'icon-spin-out');
      iconChat.classList.replace('icon-spin-out', 'icon-spin-in');
    }
  };

  shadow.appendChild(style);
  container.appendChild(iframe);
  container.appendChild(button);
  shadow.appendChild(container);

  // --- AUTOMATION UTILITIES ---
  const highlight = (el) => {
    el.classList.add('indra-highlight');
    setTimeout(() => el.classList.remove('indra-highlight'), 1200);
  };

  // --- MESSAGE HUB ---
  window.addEventListener('message', (event) => {
    if (!event.origin.includes('indra.ialksng.me') && !event.origin.includes('localhost') && !event.origin.includes('gurukul.ialksng.me')) return;

    const { type, payload } = event.data;

    if (type === 'OPEN_INDRA_WIDGET') {
      if (!isOpen) button.click(); 
    }

    if (type === 'PREFILL_INDRA') {
      iframe.contentWindow.postMessage({ type: 'PREFILL_MSG', payload }, '*');
    }

    if (type === 'REQUEST_DOM_MAP') {
      const elements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
      const map = Array.from(elements)
        .filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && !el.closest('#indra-agent-root');
        })
        .map((el, i) => {
          const id = `indra-el-${i}`;
          el.setAttribute('data-indra-id', id);
          return {
            type: el.tagName.toLowerCase(),
            text: (el.innerText || el.placeholder || el.value || el.ariaLabel || '').trim().substring(0, 50),
            selector: `[data-indra-id="${id}"]`
          };
        });
      iframe.contentWindow.postMessage({ type: 'DOM_MAP_RESPONSE', payload: map }, '*');
    }

    if (type === 'INDRA_ACTION') {
      const { action, selector, value } = payload;
      const element = document.querySelector(selector);
      if (!element) return console.warn("[Indra] Target lost:", selector);

      highlight(element);
      
      switch (action) {
        case 'click': 
          element.click(); 
          break;
        case 'fill': 
          element.value = value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        case 'scroll': 
          element.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
          break;
        case 'navigate': 
          window.location.href = value; 
          break;
      }
    }

    if (type === 'SET_WIDGET_SIZE') {
        iframe.style.width = payload.width || '400px';
        iframe.style.height = payload.height || '650px';
    }
  });
})();