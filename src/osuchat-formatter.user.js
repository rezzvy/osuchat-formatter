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
      const inputContainer = document.querySelector(".chat-input");

      const formatterButton = document.createElement("button");
      formatterButton.className = "btn-osu-big btn-osu-big--chat-send";
      formatterButton.style.cssText = "margin-right:10px;";
      formatterButton.textContent = "Formatter";

      inputContainer.insertBefore(formatterButton, inputContainer.firstChild);

      formatterButton.addEventListener("click", (e) => {
        modal.style.display = "block";
      });
      const formatterMessage = `
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
      const modal = document.createElement("div");
      modal.style.cssText = "display:none;width:100%;height:100dvh;background-color:rgb(0 0 0 / 60%);position:fixed;top:0;z-index:9999999;";
      modal.innerHTML = `
        <div style="max-width:700px;margin:auto;height:400px; margin-top:30px;">
            <textarea readonly=true class="chat-input__box" style="width:100%; height:100%">${formatterMessage}</textarea>
</div>
`;

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none";
        }
      });

      document.body.appendChild(modal);

      observeMessagesIn(chatContainer);
      obs.disconnect();
    }
  });

  containerObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
