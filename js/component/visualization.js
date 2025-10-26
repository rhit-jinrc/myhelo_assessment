/**
 * Visualize the results of an API call to the FDA.
 */
component.visualization = function() {
  component.apply(this, arguments);

  this.openai_data = null;
  this.fda_data = null;
};
assessment.extend(component.visualization, component);

/**
 * Decorate.
 *
 * @param {HTMLDivElement} parent
 */
component.visualization.prototype.decorate = function(parent) {
  const self = this;
  // Create two-column layout
  const layout = document.createElement('div');
  layout.className = 'main-layout';
  parent.appendChild(layout);

  // Left: Visualization
  const left = document.createElement('div');
  left.className = 'main-left';
  layout.appendChild(left);

  // Right: Chatbot
  const right = document.createElement('div');
  right.className = 'main-right';
  layout.appendChild(right);

  // Loading text for visualization
  const loading = document.createElement('div');
  loading.innerText = 'Loading...';
  left.appendChild(loading);

  // Chatbot UI
  right.innerHTML = `
    <h2>Drug Data Chatbot</h2>
    <div id="chat-history" class="chat-history"></div>
    <form id="chat-form" class="chat-form">
      <input type="text" id="chat-input" class="chat-input" placeholder="Ask about the drug data..." autocomplete="off" />
      <button type="submit" class="chat-send">Send</button>
    </form>
  `;

  // Fetch FDA data first
  assessment.fda_api(
    'https://api.fda.gov/drug/label.json?search=openfda.product_type.exact:"HUMAN PRESCRIPTION DRUG"&count=openfda.route.exact',
    function(data) {
      self.fda_data = data;
      // render visualization using the vanilla FDA visualization component
      if (typeof attachFDAVisualization === 'function') {
        // attach FDA visualization into left panel
        left.innerHTML = '';
        attachFDAVisualization(left);
      } else {
        self.decorate_data(left);
      }
      // Enable chatbot after FDA data is loaded
      if (typeof attachChatbot === 'function') {
        // Clear any previous right content and attach new chatbot
        right.innerHTML = '';
        attachChatbot(right, data);
      } else {
        self.setup_chatbot(right, data);
      }
    }
  );
/**
 * Setup chatbot UI and logic
 */
component.visualization.prototype.setup_chatbot = function(right, fdaData) {
  const chatHistory = right.querySelector('#chat-history');
  const chatForm = right.querySelector('#chat-form');
  const chatInput = right.querySelector('#chat-input');

  // Helper to add message to chat
  function addMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + role;
    msg.innerHTML = `<span>${role === 'user' ? 'You' : 'Chatbot'}:</span> ${text}`;
    chatHistory.appendChild(msg);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    if (window.lucide) lucide.createIcons();
    
    return msg;
  }

  // Helper to add/remove loading animation
  function showLoading() {
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'chat-msg assistant loading';
    loadingMsg.innerHTML = `<span>Chatbot:</span> <span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>`;
    chatHistory.appendChild(loadingMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return loadingMsg;
  }
  function removeLoading(loadingMsg) {
    if (loadingMsg && loadingMsg.parentNode) {
      loadingMsg.parentNode.removeChild(loadingMsg);
    }
  }

  // Initial system context
  const systemContext = `You are a helpful medical assistant. Here is a summary of drug administration routes for human prescription drugs: ${JSON.stringify(fdaData)}. Use this data to answer questions about drug routes, explain medical terms, or provide related information.`;

  chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;
    addMessage('user', userMsg);
    chatInput.value = '';

    // Show loading animation and force DOM update before API call
    const loadingMsg = showLoading();
    setTimeout(function() {
      assessment.openai_api([
        { role: 'system', content: systemContext },
        { role: 'user', content: userMsg }
      ], function(response) {
        removeLoading(loadingMsg);
        addMessage('assistant', response);
      });
    }, 50);
  });
};
};

/**
 * TODO
 *
 * @param {HTMLElement} parent
 */
component.visualization.prototype.decorate_data = function(parent) {
  parent.innerHTML = '<h2>Drug Administration Routes: Human Prescription Drugs</h2>';
  // Chart container for ApexCharts
  const chartDiv = document.createElement('div');
  chartDiv.id = 'fda-route-chart';
  chartDiv.style.maxWidth = '700px';
  chartDiv.style.margin = '32px auto';
  parent.appendChild(chartDiv);

  if (Array.isArray(this.fda_data)) {
    // Show top 10 routes for clarity
    const topRoutes = this.fda_data.slice(0, 10);
    const categories = topRoutes.map(item => item.term);
    const counts = topRoutes.map(item => item.count);

    var options = {
      series: [{
        data: counts
      }],
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            fontSize: '13px',
            colors: Array(categories.length).fill('#333')
          }
        }
      }
    };

    // Render chart after DOM update
    setTimeout(function() {
      var chart = new ApexCharts(document.querySelector('#fda-route-chart'), options);
      chart.render();
    }, 0);
  } else {
    parent.innerHTML += '<pre>' + JSON.stringify(this.fda_data, null, '  ') + '</pre>';
  }
};
