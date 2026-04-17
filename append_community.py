with open('src/main.ts', 'a', encoding='utf-8') as f:
    f.write("""

// ===== COMMUNITY & GUILDS =====
function initCommunity() {
  const tabFriends = document.getElementById('tabFriends');
  const tabGuilds = document.getElementById('tabGuilds');
  const secFriends = document.getElementById('communityFriends');
  const secGuilds = document.getElementById('communityGuilds');

  if (tabFriends && tabGuilds && secFriends && secGuilds) {
    tabFriends.addEventListener('click', () => {
      tabFriends.classList.add('active');
      tabGuilds.classList.remove('active');
      secFriends.style.display = 'block';
      secGuilds.style.display = 'none';
    });
    tabGuilds.addEventListener('click', () => {
      tabGuilds.classList.add('active');
      tabFriends.classList.remove('active');
      secGuilds.style.display = 'block';
      secFriends.style.display = 'none';
    });
  }

  renderFriends();
  renderGuilds();
  renderGuildChat();

  const sendBtn = document.getElementById('sendGuildMessageBtn');
  const msgInput = document.getElementById('guildMessageInput') as HTMLInputElement;
  if (sendBtn && msgInput) {
    sendBtn.addEventListener('click', () => {
      const msg = msgInput.value.trim();
      if (!msg) return;
      const chatWin = document.getElementById('guildChatWindow');
      if (chatWin) {
        chatWin.innerHTML += \`
          <div class="chat-message self">
            <div class="msg-bubble">\${msg}</div>
          </div>
        \`;
        chatWin.scrollTop = chatWin.scrollHeight;
      }
      msgInput.value = '';
    });
  }
}

function renderFriends() {
  const list = document.getElementById('friendsList');
  if (!list) return;
  const friends = [
    { name: "Alex R.", status: "online", statusText: "Online" },
    { name: "Sarah M.", status: "in-game", statusText: "Working out right now" },
    { name: "Jake T.", status: "offline", statusText: "Last seen 2h ago" },
    { name: "Emily W.", status: "online", statusText: "Online" },
    { name: "Mike D.", status: "offline", statusText: "Last seen 1d ago" },
  ];

  list.innerHTML = friends.map(f => \`
    <div class="friend-item">
      <div class="friend-avatar">\${f.name.charAt(0)}</div>
      <div class="friend-info">
        <div class="friend-name">\${f.name}</div>
        <div class="friend-status"><span class="status-dot \${f.status}"></span>\${f.statusText}</div>
      </div>
      <button class="btn-small">Message</button>
    </div>
  \`).join('');
}

function renderGuilds() {
  const list = document.getElementById('guildsList');
  if (!list) return;
  const guilds = [
    { name: "Iron Lifters", icon: "🏋️", members: "124/150", active: true },
    { name: "Cardio Kings", icon: "🏃", members: "89/100", active: false },
    { name: "Yoga Mystics", icon: "🧘", members: "250/250", active: false },
  ];

  list.innerHTML = guilds.map(g => \`
    <div class="guild-card \${g.active ? 'active-guild' : ''}">
      <div class="guild-header">
        <span class="guild-icon">\${g.icon}</span>
        <div>
          <div class="guild-title">\${g.name}</div>
          <div class="guild-members">\${g.members} members</div>
        </div>
      </div>
      <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">\${g.active ? 'Your Primary Guild' : 'Joined'}</p>
      <button class="btn-small" style="width: 100%">\${g.active ? 'View Guild' : 'Switch Active'}</button>
    </div>
  \`).join('');
}

function renderGuildChat() {
  const chatWin = document.getElementById('guildChatWindow');
  if (!chatWin) return;
  chatWin.innerHTML = \`
    <div style="text-align: center; color: var(--text-muted); font-size: 0.75rem; margin-bottom: 10px;">Today</div>
    <div class="chat-message">
      <div class="msg-author">Alex R.</div>
      <div class="msg-bubble">Hit a new PR on bench today! Let's go!</div>
    </div>
    <div class="chat-message">
      <div class="msg-author">Sarah M.</div>
      <div class="msg-bubble">Nice job! Make sure to take your protein!</div>
    </div>
    <div class="chat-message self">
      <div class="msg-bubble">Thanks! Yeah, grabbing a shake right now.</div>
    </div>
  \`;
  chatWin.scrollTop = chatWin.scrollHeight;
}
""")
print("Successfully appended initCommunity to src/main.ts")
