import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of the BLOG section and the end of the main tag
start_blog = content.find('<!-- ========== BLOG ========== -->')
end_main = content.find('  </main>')

if start_blog != -1 and end_main != -1:
    community_html = """
    <!-- ========== COMMUNITY ========== -->
    <section class="page" id="page-community">
      <div class="page-header">
        <div>
          <h1 class="page-title"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
              style="margin-right: 8px; vertical-align: bottom;">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>Community & Guilds</h1>
          <p class="page-subtitle">Connect with friends, join guilds, and conquer roadmap challenges together</p>
        </div>
        <button class="btn-primary" id="addFriendBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Friend
        </button>
      </div>

      <div class="community-tabs" style="display: flex; gap: 1rem; margin-bottom: 24px; overflow-x: auto;">
        <button class="blog-tab active" data-tab="friends" id="tabFriends">Friends</button>
        <button class="blog-tab" data-tab="guilds" id="tabGuilds">Guilds</button>
      </div>

      <!-- Friends Section -->
      <div id="communityFriends" style="display: block;">
        <div class="glass-card">
          <div class="chart-header">
            <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: bottom;">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>Your Friends List</h3>
            <span class="chart-badge">5 Online</span>
          </div>
          <div class="friends-list" id="friendsList" style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
            <!-- Rendered via JS -->
          </div>
        </div>
      </div>

      <!-- Guilds Section -->
      <div id="communityGuilds" style="display: none;">
        <div class="glass-card" style="margin-bottom: 24px;">
          <div class="chart-header">
            <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: bottom;">
                <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z"></path>
              </svg>Your Guilds</h3>
            <button class="btn-small">Find New Guild</button>
          </div>
          <div class="guilds-list" id="guildsList" style="display: flex; gap: 16px; margin-top: 16px; overflow-x: auto;">
            <!-- Rendered via JS -->
          </div>
        </div>

        <div class="glass-card guild-chat-card">
          <div class="chart-header">
            <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: bottom;">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>Guild Chat: <span id="activeGuildName">Iron Lifters</span></h3>
            <span class="chart-badge ai-badge">12 Members Online</span>
          </div>
          <div class="guild-chat-window" id="guildChatWindow" style="height: 300px; overflow-y: auto; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 16px; margin-top: 16px; display: flex; flex-direction: column; gap: 12px;">
            <!-- Rendered via JS -->
          </div>
          <div class="guild-chat-input" style="display: flex; gap: 12px; margin-top: 16px;">
            <input type="text" id="guildMessageInput" placeholder="Message your guild..." style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff;">
            <button class="btn-primary" id="sendGuildMessageBtn">Send</button>
          </div>
        </div>
      </div>

    </section>
"""
    new_content = content[:start_blog] + community_html + "\n" + content[end_main:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced Blog and Arena with Community section.")
else:
    print("Could not find start_blog or end_main markers in index.html.")
