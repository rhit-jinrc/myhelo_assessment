(function() {
  // Helper to create elements
  function create(tag, props) {
    const el = document.createElement(tag);
    if (props) Object.assign(el, props);
    return el;
  }

  function formatTime(date) {
    try {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '' + date;
    }
  }

  function appendMessage(container, message) {
    const wrapper = create('div');
    wrapper.className = 'chat-row ' + (message.role === 'user' ? 'justify-end' : 'justify-start');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '12px';
    wrapper.style.marginBottom = '18px';

    if (message.role === 'assistant') {
      const avatar = create('div');
      avatar.className = 'avatar assistant-avatar';
      Object.assign(avatar.style, {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(90deg,#3b82f6,#7c3aed)'
      });
      const icon = create('i');
      icon.setAttribute('data-lucide', 'bot');
      icon.style.color = '#fff';
      avatar.appendChild(icon);
      wrapper.appendChild(avatar);
    }

    const bubble = create('div');
    bubble.className = 'chat-bubble ' + (message.role === 'user' ? 'user-bubble' : 'assistant-bubble');
    Object.assign(bubble.style, {
      maxWidth: '80%',
      borderRadius: '12px',
      padding: '10px'
    });

    if (message.role === 'user') {
      bubble.style.background = '#2563eb';
      bubble.style.color = '#fff';
    } else {
      bubble.style.background = '#f3f4f6';
      bubble.style.color = '#111827';
    }

    const p = create('p');
    p.style.margin = 0;
    p.style.whiteSpace = 'pre-wrap';
    p.textContent = message.content;

    const ts = create('span');
    Object.assign(ts.style, {
      display: 'block',
      marginTop: '6px',
      fontSize: '12px',
      opacity: '0.8'
    });
    ts.textContent = formatTime(message.timestamp);
    ts.style.color = message.role === 'user' ? '#bfdbfe' : '#6b7280';

    bubble.appendChild(p);
    bubble.appendChild(ts);
    wrapper.appendChild(bubble);

    if (message.role === 'user') {
      const avatar = create('div');
      avatar.className = 'avatar user-avatar';
      Object.assign(avatar.style, {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#2563eb'
      });
      const icon = create('i');
      icon.setAttribute('data-lucide', 'user');
      icon.style.color = '#fff';
      avatar.appendChild(icon);
      wrapper.appendChild(avatar);
    }

    container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
  // Re-lock scroll height in case layout changed (lockScrollHeight defined later)
  if (typeof lockScrollHeight === 'function') lockScrollHeight();

    // ✅ Refresh Lucide icons
    if (window.lucide) lucide.createIcons();
  }

  // Expose attachChatbot to global scope
  window.attachChatbot = function(right, fdaData) {
    right.innerHTML = '';

    // Card
    const card = create('div');
    card.className = 'chat-card';
    Object.assign(card.style, {
      display: 'flex',
      flexDirection: 'column',
      height: '100%', // Ensure card fills parent
      maxHeight: 'none',
      borderRadius: '18px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
    });

    // Header
    const header = create('div');
    Object.assign(header.style, {
      padding: '12px 16px',
      borderBottom: 'none',
      background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
      borderTopLeftRadius: '18px',
      borderTopRightRadius: '18px'
    });

    const headerInner = create('div');
    Object.assign(headerInner.style, {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    });

    const title = create('h3');
    title.textContent = 'FDA Data Assistant';
    Object.assign(title.style, { color: '#fff', margin: 0, fontSize: '16px' });

    headerInner.appendChild(title);
    header.appendChild(headerInner);
    card.appendChild(header);

    // Scroll area
    const scroll = create('div');
    scroll.className = 'chat-scroll';
    Object.assign(scroll.style, {
      flex: '1 1 auto',
      padding: '16px 16px 8px 16px',
      overflowY: 'auto',
      background: '#fff',
      minHeight: '0', // allow flexbox to size correctly
      borderTopLeftRadius: '0',
      borderTopRightRadius: '0',
      borderBottomLeftRadius: '0',
      borderBottomRightRadius: '0',
      marginBottom: '0'
    });

    // Initial assistant message
    const initial = {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your FDA data assistant. I can help you understand the visualizations and answer questions about the adverse event data. What would you like to know?",
      timestamp: new Date()
    };
    appendMessage(scroll, initial);
    card.appendChild(scroll);

    // Footer input
    const footer = create('div');
    footer.className = 'chat-footer';
    Object.assign(footer.style, {
      padding: '12px',
      borderTop: 'none',
      background: '#fff',
      borderBottomLeftRadius: '0',
      borderBottomRightRadius: '0',
      flex: '0 0 auto',
      marginTop: '0'
    });

    const form = create('form');
    Object.assign(form.style, { display: 'flex', gap: '8px' });

    const input = create('input');
    Object.assign(input, {
      type: 'text',
      placeholder: 'Ask about the FDA data...'
    });
    Object.assign(input.style, {
      flex: '1',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid #e6eefc'
    });

    const sendBtn = create('button');
    sendBtn.type = 'submit';
    sendBtn.textContent = 'Send';
    Object.assign(sendBtn.style, {
      padding: '10px 14px',
      borderRadius: '8px',
      background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
      color: '#fff',
      border: 'none'
    });

    form.appendChild(input);
    form.appendChild(sendBtn);
    footer.appendChild(form);
    card.appendChild(footer);

    // Helper to lock the scroll area's pixel height so it never grows
    function lockScrollHeight(){
      // compute available space inside the card for the scroll area (use card-local measurement)
      const total = card.getBoundingClientRect().height || card.clientHeight;
      const headerH = header.getBoundingClientRect().height || header.offsetHeight || 0;
      const footerH = footer.getBoundingClientRect().height || footer.offsetHeight || 0;
      // include paddings on card (top+bottom)
      const style = window.getComputedStyle(card);
      const padTop = parseFloat(style.paddingTop) || 0;
      const padBottom = parseFloat(style.paddingBottom) || 0;
      // available space inside card between header and footer
      const available = Math.max(0, total - headerH - footerH - padTop - padBottom);
      // lock scroll area to that pixel value
      const finalH = Math.max(0, Math.round(available));
      scroll.style.height = finalH + 'px';
      scroll.style.maxHeight = finalH + 'px';
      scroll.style.overflowY = 'auto';
    }

    right.appendChild(card);
    // Expand card to fill parent height (keep as flex child)
    card.style.height = '100%';
    card.style.maxHeight = 'none';
    // If the parent (`right`) has vertical padding, offset the card so it fills into that padding
    (function adjustForParentPadding(){
      try {
        const rStyle = window.getComputedStyle(right);
        const padTop = parseFloat(rStyle.paddingTop) || 0;
        const padBottom = parseFloat(rStyle.paddingBottom) || 0;
        if (padTop || padBottom) {
          // move the card up into the top padding and extend into bottom padding
          card.style.marginTop = (padTop ? ('-' + padTop + 'px') : '0');
          card.style.marginBottom = (padBottom ? ('-' + padBottom + 'px') : '0');
        }
      } catch(e) { /* ignore */ }
    })();
    // Wait for layout then lock the scroll height
    requestAnimationFrame(()=>{ lockScrollHeight(); });
    // Recalculate on window resize
    window.addEventListener('resize', lockScrollHeight);

    // ✅ Refresh Lucide icons immediately after rendering the chatbot
    if (window.lucide) lucide.createIcons();

    let loading = false;

    function showLoadingBubble() {
      const wrapper = create('div');
      wrapper.className = 'chat-row';
      Object.assign(wrapper.style, {
        display: 'flex',
        gap: '12px',
        marginBottom: '18px'
      });

      const avatar = create('div');
      avatar.className = 'avatar assistant-avatar';
      Object.assign(avatar.style, {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(90deg,#3b82f6,#7c3aed)'
      });
      const icon = create('i');
      icon.setAttribute('data-lucide', 'bot');
      icon.style.color = '#fff';
      avatar.appendChild(icon);

      const bubble = create('div');
      bubble.className = 'chat-bubble assistant-bubble loading';
      Object.assign(bubble.style, {
        background: '#f3f4f6',
        padding: '10px',
        borderRadius: '10px'
      });
      bubble.innerHTML = `
        <div style="display:flex;gap:6px">
          <div style="width:8px;height:8px;border-radius:50%;background:#9ca3af;animation:dot 1s infinite"></div>
          <div style="width:8px;height:8px;border-radius:50%;background:#9ca3af;animation:dot 1s .2s infinite"></div>
          <div style="width:8px;height:8px;border-radius:50%;background:#9ca3af;animation:dot 1s .4s infinite"></div>
        </div>`;

      wrapper.appendChild(avatar);
      wrapper.appendChild(bubble);
      scroll.appendChild(wrapper);
  // adjust locked height then scroll
  if (typeof lockScrollHeight === 'function') lockScrollHeight();
  scroll.scrollTop = scroll.scrollHeight;

      // ✅ Refresh icons for loading state
      if (window.lucide) lucide.createIcons();

      return bubble;
    }

    function removeLoadingBubble(bubble) {
      if (bubble && bubble.parentNode) bubble.parentNode.remove();
      if (typeof lockScrollHeight === 'function') lockScrollHeight();
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || loading) return;

      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date()
      };
      appendMessage(scroll, userMsg);
      input.value = '';

      loading = true;
      const loadingBubble = showLoadingBubble();

      fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant. Use the following FDA data: ' + JSON.stringify(fdaData)
            },
            { role: 'user', content: text }
          ]
        })
      })
        .then(r => r.json())
        .then(data => {
          removeLoadingBubble(loadingBubble);
          const reply =
            data.choices?.[0]?.message?.content ||
            data.response ||
            data.message ||
            "I couldn't generate a response.";
          const assistantMsg = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: reply,
            timestamp: new Date()
          };
          appendMessage(scroll, assistantMsg);
        })
        .catch(err => {
          console.error('Chatbot fetch error', err);
          removeLoadingBubble(loadingBubble);
          const fallback = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content:
              "I'm currently unable to connect to the server. Please start your local server. In the meantime, the visualization shows the top adverse drug reactions reported to the FDA.",
            timestamp: new Date()
          };
          appendMessage(scroll, fallback);
        })
        .finally(() => {
          loading = false;
        });
    });
  };
})();
