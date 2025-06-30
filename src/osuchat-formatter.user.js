// ==UserScript==
// @name         osuChat Formatter
// @namespace    https://github.com/rezzvy/osuchat-formatter
// @version      1.0
// @description  Adds BBCode support like [b], [i], [img], [color], [spoiler], [youtube], and more~ for osu!web chat!
// @author       Rezzvy
// @match        *://osu.ppy.sh/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/rezzvy/osuchat-formatter/main/src/osuchat-formatter.user.js
// @updateURL    https://raw.githubusercontent.com/rezzvy/osuchat-formatter/main/src/osuchat-formatter.user.js
// ==/UserScript==

(function () {
  "use strict";

  const bbcodeRules = [
    {
      pattern: /\[b\](.*?)\[\/b\]/gi,
      replace: "<strong>$1</strong>",
    },
    {
      pattern: /\[i\](.*?)\[\/i\]/gi,
      replace: "<em>$1</em>",
    },
    {
      pattern: /\[s\](.*?)\[\/s\]/gi,
      replace: "<del>$1</del>",
    },
    {
      pattern: /\[u\](.*?)\[\/u\]/gi,
      replace: "<u>$1</u>",
    },

    {
      pattern: /\[list=1\]([\s\S]*?)\[\/list\]/gi,
      replace: (match, content) => {
        const items = content
          .split(/\[\*\]/)
          .filter((item) => item.trim())
          .map((item) => `<li>${item.trim()}</li>`)
          .join("");
        return `<ol>${items}</ol>`;
      },
    },

    {
      pattern: /\[list\]([\s\S]*?)\[\/list\]/gi,
      replace: (match, content) => {
        const items = content
          .split(/\[\*\]/)
          .filter((item) => item.trim())
          .map((item) => `<li>${item.trim()}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      },
    },
    {
      pattern: /\[audio\](.*?)\[\/audio\]/gi,
      replace: "<audio src='$1'></audio>",
    },
    {
      pattern: /\[size=(\d+)\](.*?)\[\/size\]/gi,
      replace: (match, size, text) => {
        return `<span style="font-size: ${size}%">${text}</span>`;
      },
    },

    {
      pattern: /\[c\](.*?)\[\/c\]/gi,
      replace: "<code>$1</code>",
    },
    {
      pattern: /\[url=(.*?)\](.*?)\[\/url\]/gi,
      replace: '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
    },
    {
      pattern: /\[img\](.*?)\[\/img\]/gi,
      replace: '<div style="text-align:center;"><img src="$1" alt="Image"></div>',
    },
    {
      pattern: /\[color=(#[0-9a-f]{3,6}|[a-z]+)\](.*?)\[\/color\]/gi,
      replace: (match, color, text) => {
        return `<span style="color:${color}">${text}</span>`;
      },
    },
    {
      pattern: /\[spoiler\](.*?)\[\/spoiler\]/gi,
      replace: (match, text) => {
        return `<span style="background-color: #000 !important; color: #000 !important; cursor: pointer;" onclick="this.style.color='inherit'">${text}</span>`;
      },
    },
    {
      pattern: /\[youtube\](.*?)\[\/youtube\]/gi,
      replace: (match, id) => {
        const cleanId = id.trim().split("v=")[1] || id.trim();
        return `
          <iframe
            width="320"
            height="180"
            src="https://www.youtube.com/embed/${cleanId}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>`;
      },
    },
  ];

  function convertBBCode(p) {
    if (p.dataset.converted === "true") return;

    let html = p.textContent;
    bbcodeRules.forEach((rule) => {
      html = html.replace(rule.pattern, rule.replace);
    });

    p.innerHTML = html;
    p.dataset.converted = "true";
  }

  function applyToAllExisting(container) {
    container.querySelectorAll("p").forEach(convertBBCode);
  }

  function observeMessagesIn(osuMdContainer) {
    const msgObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches("p")) {
              convertBBCode(node);
            } else {
              node.querySelectorAll?.("p")?.forEach(convertBBCode);
            }
          }
        }
      }
    });

    msgObserver.observe(osuMdContainer, { childList: true, subtree: true });
    applyToAllExisting(osuMdContainer);
  }

  const containerObserver = new MutationObserver((mutations, obs) => {
    const chatContainer = document.querySelector(".chat-conversation-panel");
    if (chatContainer) {
      observeMessagesIn(chatContainer);
      obs.disconnect();
    }
  });

  containerObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
