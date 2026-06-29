/**
 * ARK Infra AI Chatbot Widget
 * Integrates an elegant, interactive client-side assistant.
 * Dual-Mode:
 * 1. Dedicated Support Page (statically embedded chat panel)
 * 2. General Page Launcher (premium glowing gold AI orb launcher redirecting to about-ark.html)
 */

(function () {
  // 1. Projects Dataset (synchronized with projects.html data)
  const chatbotProjects = [
    {
      title: "Alakananda - Highway City",
      desc: "VMRDA & AP RERA Approved Layout at Tallapalem. 40' Black Top Roads, drainage, gated community.",
      image: "images/highway-city-layout.jpg",
      status: "Ongoing",
      category: "Plots Layout",
      link: "projects.html"
    },
    {
      title: "Education City - Phase 1",
      desc: "VMRDA Proposed Plotted Development at Sabbavaram. Facing 100m road, gated community, 24hr security.",
      image: "images/education-city-layout.jpg",
      status: "Ongoing",
      category: "Plots Layout",
      link: "projects.html"
    },
    {
      title: "Luxury Residence",
      desc: "Premium apartments in a prime location. Completed with world-class amenities.",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
      status: "Completed",
      category: "Apartments",
      link: "projects.html"
    },
    {
      title: "Skyline Towers",
      desc: "Ongoing high-rise residential living right in the urban core.",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
      status: "Ongoing",
      category: "Apartments",
      link: "projects.html"
    },
    {
      title: "Green Meadows Layout",
      desc: "Completed plotted gated community development ready for construction.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
      status: "Completed",
      category: "Plots Layout",
      link: "projects.html"
    },
    {
      title: "Business Park",
      desc: "Ongoing Grade-A commercial spaces in the prime business district.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
      status: "Ongoing",
      category: "Commercial",
      link: "projects.html"
    },
    {
      title: "Waterfront Living",
      desc: "Luxury homes in a scenic waterfront location. Completed with premium specifications.",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
      status: "Completed",
      category: "Apartments",
      link: "projects.html"
    },
    {
      title: "Harmony Villas",
      desc: "Ongoing independent luxury villas development in a gated community.",
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa0a6a3?w=600&q=80",
      status: "Ongoing",
      category: "Apartments",
      link: "projects.html"
    }
  ];

  // Modern robot face SVG path representing a premium AI assistant
  const premiumAiIconSvg = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2a10 10 0 0 1 7.54 16.59A2 2 0 0 1 18 20h-1.3a2 2 0 0 0-1.7 1H9a2 2 0 0 0-1.7-1H6a2 2 0 0 1-1.54-1.41A10 10 0 0 1 12 2z"/>
      <path d="M8 11h.01M16 11h.01M9 16h6"/>
    </svg>
  `;

  // Inject WhatsApp float button dynamically if not present
  function injectWhatsAppFloat() {
    if (document.querySelector('.whatsapp-float')) return;

    let waText = "Hello Mr. Hanumantharao (Arun), I would like to inquire about ARK Infra properties.";
    let label = "WhatsApp CEO Konathala Hanumantharao (Arun) — +91 81255 47801";

    const waButton = document.createElement('a');
    waButton.href = `https://wa.me/918125547801?text=${encodeURIComponent(waText)}`;
    waButton.className = "whatsapp-float";
    waButton.target = "_blank";
    waButton.rel = "noopener noreferrer";
    waButton.setAttribute("aria-label", label);
    waButton.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    `;
    document.body.appendChild(waButton);
  }

  // 2. Inject Chatbot HTML Markup based on page mode
  function injectChatbot() {
    injectWhatsAppFloat();
    const showcaseContainer = document.getElementById('arkShowcaseChatContainer');

    if (showcaseContainer) {
      // MODE A: Embedded full-page dashboard (about-ark.html)
      if (document.getElementById('arkChatbotContainer')) return;

      const chatbotContainer = document.createElement('div');
      chatbotContainer.id = 'arkChatbotContainer';
      chatbotContainer.className = 'ark-chatbot';
      chatbotContainer.style.width = '100%';
      chatbotContainer.style.height = '100%';

      chatbotContainer.innerHTML = `
        <!-- Embedded Chat Panel -->
        <div class="ark-chatbot-window open" style="position:static; width:100%; height:100%; max-height:100%;" role="region" aria-label="ARK AI Assistant">
          <!-- Header -->
          <div class="ark-chatbot-header">
            <div class="ark-chatbot-header-info">
              <div class="ark-chatbot-avatar">ARK</div>
              <div class="ark-chatbot-header-text">
                <h3>ARK AI Assistant</h3>
                <div class="ark-chatbot-status">Online</div>
              </div>
            </div>
          </div>

          <!-- Messages Area -->
          <div class="ark-chatbot-messages" id="chatbotMessages">
            <!-- Greeting loaded here -->
          </div>

          <!-- Input Area -->
          <div class="ark-chatbot-input-area">
            <form class="ark-chatbot-form" id="chatbotForm">
              <input type="text" class="ark-chatbot-input" id="chatbotInput" placeholder="Type a message..." autocomplete="off" aria-label="Write a message to the assistant">
              <button type="submit" class="ark-chatbot-send-btn" aria-label="Send Message">
                <svg viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      `;

      showcaseContainer.appendChild(chatbotContainer);
      setupEmbeddedChatListeners();
      addInitialGreeting();
    } else {
      // MODE B: Glowing gold launcher linking to about-ark.html (index, ceo, md, bm pages)
      if (document.getElementById('arkChatbotLauncherContainer')) return;

      const launcherContainer = document.createElement('div');
      launcherContainer.id = 'arkChatbotLauncherContainer';
      launcherContainer.className = 'ark-chatbot';

      launcherContainer.innerHTML = `
        <!-- Floating Launcher Link redirecting to about-ark.html -->
        <a href="about-ark.html" class="ark-chatbot-launcher" id="chatbotRedirectLauncher" title="Help &amp; AI Support" aria-label="Go to AI Support Page">
          ${premiumAiIconSvg}
          <span class="ark-chatbot-launcher-badge"></span>
        </a>
      `;

      document.body.appendChild(launcherContainer);
    }
  }

  // 4. Listeners setup for embedded chat mode
  function setupEmbeddedChatListeners() {
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotInput');

    if (form && input) {
      // Focus input field immediately on about-ark.html
      setTimeout(() => {
        input.focus();
        scrollToBottom();
      }, 400);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = input.value.trim();
        if (!messageText) return;

        appendUserMessage(messageText);
        input.value = '';
        
        // AI Response with simulated typing delay
        showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          processAIResponse(messageText);
        }, 1000);
      });
    }
  }

  // 5. Message rendering helpers
  function scrollToBottom() {
    const msgArea = document.getElementById('chatbotMessages');
    if (msgArea) {
      msgArea.scrollTop = msgArea.scrollHeight;
    }
  }

  function appendUserMessage(text) {
    const msgArea = document.getElementById('chatbotMessages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const wrapper = document.createElement('div');
    wrapper.className = 'ark-chatbot-msg-wrapper user';
    wrapper.innerHTML = `
      <div class="ark-chatbot-msg">${escapeHtml(text)}</div>
      <div class="ark-chatbot-timestamp">${time}</div>
    `;
    msgArea.appendChild(wrapper);
    scrollToBottom();
  }

  function appendAssistantResponse(htmlContent, showChips = true) {
    const msgArea = document.getElementById('chatbotMessages');
    if (!msgArea) return;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const wrapper = document.createElement('div');
    wrapper.className = 'ark-chatbot-msg-wrapper assistant';
    wrapper.innerHTML = `
      <div class="ark-chatbot-msg">${htmlContent}</div>
      <div class="ark-chatbot-timestamp">${time}</div>
    `;
    msgArea.appendChild(wrapper);

    if (showChips) {
      appendSuggestionChips();
    }
    
    scrollToBottom();
  }

  function showTypingIndicator() {
    const msgArea = document.getElementById('chatbotMessages');
    if (!msgArea || document.getElementById('chatbotTyping')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'ark-chatbot-msg-wrapper assistant';
    wrapper.id = 'chatbotTyping';
    wrapper.innerHTML = `
      <div class="ark-chatbot-msg ark-chatbot-typing">
        <span class="ark-chatbot-typing-dot"></span>
        <span class="ark-chatbot-typing-dot"></span>
        <span class="ark-chatbot-typing-dot"></span>
      </div>
    `;
    msgArea.appendChild(wrapper);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const typingIndicator = document.getElementById('chatbotTyping');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  function addInitialGreeting() {
    appendAssistantResponse("Hello! Welcome to the <strong>ARK Support Center</strong>. I am your virtual AI assistant. How can I assist you with your real estate needs today? You can choose one of the quick options below or write your own question.");
  }

  function appendSuggestionChips() {
    // Remove existing chips first
    const existingChips = document.querySelectorAll('.ark-chatbot-chips');
    existingChips.forEach(c => c.remove());

    const msgArea = document.getElementById('chatbotMessages');
    if (!msgArea) return;
    
    const chipsWrapper = document.createElement('div');
    chipsWrapper.className = 'ark-chatbot-chips';

    const chips = [
      { text: "Plot Enquiries 🏞️", value: "plots" },
      { text: "Ongoing Projects 🏗️", value: "ongoing" },
      { text: "Contact Details 📞", value: "contact" },
      { text: "Office Location 📍", value: "location" }
    ];

    chips.forEach(chip => {
      const button = document.createElement('button');
      button.className = 'ark-chatbot-chip';
      button.textContent = chip.text;
      button.addEventListener('click', () => {
        appendUserMessage(chip.text);
        showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          processAIResponse(chip.value);
        }, 800);
      });
      chipsWrapper.appendChild(button);
    });

    msgArea.appendChild(chipsWrapper);
  }

  // 6. Intelligent AI Response logic
  function processAIResponse(query) {
    const cleanQuery = query.toLowerCase().trim();
    
    // Greeting triggers
    if (/^(hello|hi|hey|greetings|good morning|good afternoon|good evening|yo)$/.test(cleanQuery)) {
      appendAssistantResponse("Hello there! It's a pleasure to chat with you. How can I assist you with your real estate goals today?");
      return;
    }

    // Plots Trigger (e.g., plot, plots, land, layout, sabbavaram, tallapalem)
    const isPlots = /plot|land|layout|tallapalem|sabbavaram|alakananda|education/i.test(cleanQuery);
    
    // Contact Trigger (including typos like contack, contacj, conatct, etc.)
    const isContact = /contact|contac|contak|contacj|contack|conatct|contatc|phone|call|number|whatsapp|email|mail|enquiry|enquire|reach|connect|inquiry|inquire/i.test(cleanQuery);
    
    // Location Trigger
    const isLocation = /location|address|office|where|gajuwaka|vizag|visakhapatnam|direction/i.test(cleanQuery);

    // Ongoing Trigger
    const isOngoing = /ongoing|current|progress|under/i.test(cleanQuery);

    // Completed Trigger
    const isCompleted = /completed|finished|done|past/i.test(cleanQuery);

    // Projects general Trigger
    const isProjects = /project|apartment|villa|commercial|building/i.test(cleanQuery);

        // Leader bio Triggers
    const isCeo = /ceo|arun|hanumantharao|founder/i.test(cleanQuery);
    const isMd = /md|ramakrishna|director|adari/i.test(cleanQuery);
    const isTeam = /team|leader|leadership|management/i.test(cleanQuery);
    const isVenkataRao = /venkata|v\.rao|v\s+rao/i.test(cleanQuery);
    const isVignesh = /vignesh|y\.vignesh|y\s+vignesh/i.test(cleanQuery);

    // Process triggers in order of priority:
    if (isContact) {
      appendAssistantResponse(`
        <p>You can get in touch with our team directly. The CEO's direct contact handles phone calls and WhatsApp:</p>
        <p><strong>CEO Mobile/WhatsApp:</strong><br><a href="tel:+918125547801" style="color:var(--gold);text-decoration:underline;font-weight:600;">+91 81255 47801</a></p>
        <p><strong>Direct Email:</strong><br><a href="mailto:arkinfraproperties@gmail.com" style="color:var(--gold);text-decoration:underline;">arkinfraproperties@gmail.com</a></p>
        <p><strong>Corporate Office Address:</strong><br>
          <span style="color:var(--white);font-size:0.85rem;">
            ARK Infra, Beside Diamond Luxury Thai Spa,<br>
            80 Feet Road, Gajuwaka, Visakhapatnam, AP 530026
          </span>
        </p>
        <p style="margin-top:0.5rem;"><a href="https://wa.me/918125547801?text=Hello%20Mr.%20Hanumantharao%20(Arun)%2C%20I%20would%20like%20to%20inquire%20about%20ARK%20Infra%20properties." target="_blank" rel="noopener noreferrer" class="ark-chatbot-project-btn" style="display:inline-block;padding:0.4rem 0.8rem;text-decoration:none;">Chat on WhatsApp</a></p>
      `);
      return;
    }

    if (isPlots) {
      const plots = chatbotProjects.filter(p => p.category === "Plots Layout" || p.title.toLowerCase().includes('city') || p.title.toLowerCase().includes('layout'));
      let plotsHtml = `<p>We offer premium, legally clear layouts in high-growth corridors around Visakhapatnam. Here are our featured plotted developments:</p>`;
      plotsHtml += renderProjectCards(plots);
      appendAssistantResponse(plotsHtml);
      return;
    }

    if (isLocation) {
      appendAssistantResponse(`
        <p><strong>ARK Infra Corporate Office:</strong></p>
        <p style="color:var(--white);font-size:0.85rem;">
          3rd Floor, RV Square Building,<br>
          Beside Diamond Luxury Thai Spa,<br>
          80 Feet Road, Gajuwaka,<br>
          Visakhapatnam, Andhra Pradesh 530026
        </p>
        <p><strong>Office Hours:</strong> Monday - Saturday (9:00 AM - 6:00 PM)</p>
        <a href="https://maps.google.com/maps?q=17.6840412,83.2045973&z=18" target="_blank" rel="noopener noreferrer" class="ark-chatbot-project-btn" style="display:inline-block;padding:0.4rem 0.8rem;text-decoration:none;text-align:center;">Open Google Maps</a>
      `);
      return;
    }

    if (isOngoing) {
      const ongoing = chatbotProjects.filter(p => p.status === "Ongoing");
      let ongoingHtml = `<p>Here are our ongoing premium developments currently under construction and layout development:</p>`;
      ongoingHtml += renderProjectCards(ongoing);
      appendAssistantResponse(ongoingHtml);
      return;
    }

    if (isCompleted) {
      const completed = chatbotProjects.filter(p => p.status === "Completed");
      let completedHtml = `<p>Here are some of our successfully completed projects:</p>`;
      completedHtml += renderProjectCards(completed);
      appendAssistantResponse(completedHtml);
      return;
    }

        if (isVenkataRao) {
      appendAssistantResponse(`
        <p>Adari Venkata Rao is no longer associated with ARK Infra. For any corporate inquiries, please contact our CEO & Founder, <strong>Konathala Hanumantharao (Arun)</strong>:</p>
        <p>📞 Phone/WhatsApp: <a href="tel:+918125547801" style="color:var(--gold);text-decoration:underline;">+91 81255 47801</a></p>
      `);
      return;
    }

    if (isVignesh) {
      appendAssistantResponse(`
        <p>Yenamadala Vignesh is no longer the Branch Manager of ARK Infra. For layout visits, site execution, or sales inquiries, please contact our CEO, <strong>Konathala Hanumantharao (Arun)</strong>:</p>
        <p>📞 Phone/WhatsApp: <a href="tel:+918125547801" style="color:var(--gold);text-decoration:underline;">+91 81255 47801</a></p>
      `);
      return;
    }

    if (isCeo) {
      appendAssistantResponse(`
        <p><strong>Konathala Hanumantharao (Arun)</strong> is the CEO & Founder of ARK Infra. He has nearly 20 years of real estate experience and leads our strategic vision.</p>
        <p>📞 Phone/WhatsApp: <a href="tel:+918125547801" style="color:var(--gold);text-decoration:underline;">+91 81255 47801</a></p>
        <p><a href="ceo-details.html" style="color:var(--gold);font-weight:600;text-decoration:underline;">Read his Full Bio &rarr;</a></p>
      `);
      return;
    }

    if (isMd) {
      appendAssistantResponse(`
        <p><strong>Adari Ramakrishna</strong> is our Managing Director, focusing on joint ventures, clear titles, land procurement, and strategic growth locations.</p>
        <p>📞 Contact: <a href="tel:+919848498070" style="color:var(--gold);text-decoration:underline;">+91 98484 98070</a></p>
        <p><a href="md-details.html" style="color:var(--gold);font-weight:600;text-decoration:underline;">Read his Full Bio &rarr;</a></p>
      `);
      return;
    }

    if (isTeam) {
      appendAssistantResponse(`
        <p>Our core leadership team at ARK Infra comprises:</p>
                <ul>
          <li><strong>Adari Ramakrishna</strong> - Managing Director</li>
          <li><strong>Konathala Hanumantharao (Arun)</strong> - CEO</li>
        </ul>
        <p>You can ask me about any team member to see their bio, or view details on the main cards above.</p>
      `);
      return;
    }

    if (isProjects) {
      let projectsHtml = `<p>ARK Infra delivers landmark residential and commercial projects. Select a category below or view our featured list:</p>`;
      projectsHtml += renderProjectCards(chatbotProjects.slice(0, 3));
      appendAssistantResponse(projectsHtml);
      return;
    }

    // Thank you Trigger
    if (/thank|thanks|great|awesome|perfect|good|ok/i.test(cleanQuery)) {
      appendAssistantResponse("You are very welcome! I'm here to help. Let me know if there's anything else about our plots or projects you'd like to know.");
      return;
    }

    // Fallback response
    appendAssistantResponse("I want to make sure I give you the correct information. I can help with:<br>&bull; Plot layouts (Tallapalem, Sabbavaram)<br>&bull; Ongoing & Completed projects<br>&bull; Leader bios (CEO Arun, MD Ramakrishna)<br>&bull; Contact details & Office location.<br><br>Feel free to select one of the quick options below or rephrase your request!");
  }

  // 7. Card list rendering helper
  function renderProjectCards(projects) {
    let cardsHtml = '<div class="ark-chatbot-project-list">';
    
    projects.forEach(project => {
      cardsHtml += `
        <div class="ark-chatbot-project-card">
          <img src="${project.image}" alt="${project.title}" class="ark-chatbot-project-img" onerror="this.src='https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80'">
          <div class="ark-chatbot-project-details">
            <div class="ark-chatbot-project-header">
              <span class="ark-chatbot-project-title">${project.title}</span>
              <span class="ark-chatbot-project-status">${project.status}</span>
            </div>
            <p class="ark-chatbot-project-desc">${project.desc}</p>
            <div class="ark-chatbot-project-meta">
              <span>${project.category}</span>
            </div>
            <a href="${project.link}" class="ark-chatbot-project-btn">Inquire / View Details</a>
          </div>
        </div>
      `;
    });
    
    cardsHtml += '</div>';
    return cardsHtml;
  }

  // 8. Security Helper (escape HTML to prevent XSS from inputs)
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // 9. Auto-load on load event
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatbot);
  } else {
    injectChatbot();
  }
})();
