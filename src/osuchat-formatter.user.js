// ==UserScript==
// @name         osuChat Formatter
// @namespace    https://github.com/rezzvy/osuchat-formatter
// @version      1.1
// @description  Adds BBCode support like [b], [i], [img], [color], [spoiler], [youtube], and more~ for osu!web chat!
// @author       Rezzvy
// @match        *://osu.ppy.sh/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/rezzvy/osuchat-formatter/main/src/osuchat-formatter.user.js
// @updateURL    https://raw.githubusercontent.com/rezzvy/osuchat-formatter/main/src/osuchat-formatter.user.js
// ==/UserScript==

(function () {
  "use strict";

  // BBCode conversion rules list!
  const bbcodeRules = [
    // Basic text styling
    { pattern: /\[b\](.*?)\[\/b\]/gi, replace: "<strong>$1</strong>" },
    { pattern: /\[i\](.*?)\[\/i\]/gi, replace: "<em>$1</em>" },
    { pattern: /\[s\](.*?)\[\/s\]/gi, replace: "<del>$1</del>" },
    { pattern: /\[u\](.*?)\[\/u\]/gi, replace: "<u>$1</u>" },

    // Ordered list [list=1]
    {
      pattern: /\[list=1\]([\s\S]*?)\[\/list\]/gi,
      replace: (match, content) =>
        `<ol>${content
          .split(/\[\*\]/)
          .filter((i) => i.trim())
          .map((i) => `<li>${i.trim()}</li>`)
          .join("")}</ol>`,
    },
    // Unordered list [list]
    {
      pattern: /\[list\]([\s\S]*?)\[\/list\]/gi,
      replace: (match, content) =>
        `<ul>${content
          .split(/\[\*\]/)
          .filter((i) => i.trim())
          .map((i) => `<li>${i.trim()}</li>`)
          .join("")}</ul>`,
    },

    // Audio player
    { pattern: /\[audio\](.*?)\[\/audio\]/gi, replace: "<audio src='$1'></audio>" },

    // Text size (as percentage)
    {
      pattern: /\[size=(\d+)\](.*?)\[\/size\]/gi,
      replace: (match, size, text) => `<span style="font-size: ${size}%">${text}</span>`,
    },

    // Code block
    { pattern: /\[c\](.*?)\[\/c\]/gi, replace: "<code>$1</code>" },

    // Link with anchor
    {
      pattern: /\[url=(.*?)\](.*?)\[\/url\]/gi,
      replace: '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
    },

    // Centered image
    {
      pattern: /\[img\](.*?)\[\/img\]/gi,
      replace: '<div style="text-align:center;"><img src="$1" alt="Image"></div>',
    },

    // Colored text
    {
      pattern: /\[color=(#[0-9a-f]{3,6}|[a-z]+)\](.*?)\[\/color\]/gi,
      replace: (match, color, text) => `<span style="color:${color}">${text}</span>`,
    },

    // Spoiler block (reveals text on click)
    {
      pattern: /\[spoiler\](.*?)\[\/spoiler\]/gi,
      replace: (match, text) =>
        `<span style="background-color: #000 !important; color: #000 !important; cursor: pointer;" onclick="this.style.color='inherit'">${text}</span>`,
    },

    // YouTube embed
    {
      pattern: /\[youtube\](.*?)\[\/youtube\]/gi,
      replace: (match, content) => {
        const urlRegex =
          /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)([a-zA-Z0-9_-]{11}))|https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
        const matchUrl = content.match(urlRegex);
        let videoId = null;

        if (matchUrl) {
          videoId = matchUrl[1] || matchUrl[2];
        } else if (/^[a-zA-Z0-9_-]{11}$/.test(content.trim())) {
          videoId = content.trim();
        }

        if (!videoId) return match; // fallback if nothing matched

        return `<iframe width="320" height="180" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      },
    },
  ];

  // Converts a paragraph's textContent with BBCode to HTML
  function convertBBCode(p) {
    if (p.dataset.converted === "true") return; // Avoid double conversion
    let html = p.textContent;
    bbcodeRules.forEach((rule) => {
      html = html.replace(rule.pattern, rule.replace);
    });
    p.innerHTML = html;
    p.dataset.converted = "true";
  }

  // Apply formatter to all existing messages in container
  function applyToAllExisting(container) {
    container.querySelectorAll("p").forEach(convertBBCode);
  }

  // Observe for new messages in chat panel and convert them
  function observeMessagesIn(chatContainer) {
    const msgObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches("p")) convertBBCode(node);
            else node.querySelectorAll?.("p")?.forEach(convertBBCode);
          }
        }
      }
    });
    msgObserver.observe(chatContainer, { childList: true, subtree: true });
    applyToAllExisting(chatContainer);
  }

  // Inject "Formatter" button with usage instructions
  function injectFormatterButton() {
    const inputContainer = document.querySelector(".chat-input");
    if (!inputContainer || inputContainer.querySelector(".formatter-btn")) return;

    const button = document.createElement("button");
    button.className = "btn-osu-big btn-osu-big--chat-send formatter-btn";
    button.style.cssText = "margin-right:10px;";
    button.textContent = "Formatter";

    const message = `
Hello everyone, this tool is still experimental, and was made in a rush as a prototype. It'll be updated later when I have time.
btw, this tool can make your chat support BBCode!

supported formats:
[b] [i] [s] [u] [color] [audio] [img] [youtube] [url] [c] [spoiler] [size] [list]

how to use?

- type any supported format mentioned above in the input text (e.g [b]Hello World[/b])
- then click send, and the sent text will be converted right away

as I said, this app will be updated later. here’s what I plan to add:

- a live editor (WYSIWYG) that lets you edit and format the message visually, then it'll be converted to BBCode in the input text and can be sent. this editor will be in a separate modal, not directly inside the input box

- integration with existing osu! projects. idk, maybe like an osu! signature, or when someone embeds a beatmap link, it'll show a downloadable button with mirrors too
and for god’s sake I have to stop wasting time even writing this LOL the thesis deadline is near, god help me ;w;

feel free to contact me on https://osu.ppy.sh/users/8804560 if u wanna talk about this project~
`;

    // Modal pop-up for message
    const modal = document.createElement("div");
    modal.style.cssText = "display:none;width:100%;height:100dvh;background-color:rgb(0 0 0 / 60%);position:fixed;top:0;z-index:9999999;";
    modal.innerHTML = `
      <div style="max-width:700px;margin:auto;height:400px;margin-top:30px;">
        <textarea readonly class="chat-input__box" style="width:100%; height:100%">${message}</textarea>
      </div>
    `;
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });

    button.addEventListener("click", () => {
      modal.style.display = "block";
    });

    inputContainer.insertBefore(button, inputContainer.firstChild);
    document.body.appendChild(modal);
  }

  // Main initializer - activates formatter on chat page
  function initChatFormatter() {
    if (!location.pathname.startsWith("/community/chat")) return;

    const tryInit = () => {
      const chatContainer = document.querySelector(".chat-conversation-panel");
      if (chatContainer) {
        observeMessagesIn(chatContainer);
        injectFormatterButton();
        return true;
      }
      return false;
    };

    // If chat not ready yet, wait for it using MutationObserver
    if (!tryInit()) {
      const containerObserver = new MutationObserver((mutations, obs) => {
        if (tryInit()) obs.disconnect();
      });
      containerObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  // SPA detection using pushState and popstate
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    setTimeout(initChatFormatter, 100);
  };
  window.addEventListener("popstate", () => {
    setTimeout(initChatFormatter, 100);
  });

  // Run once on initial page load
  initChatFormatter();
})();
