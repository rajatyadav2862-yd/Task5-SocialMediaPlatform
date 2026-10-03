const API = "http://localhost:5000/api";
let token = localStorage.getItem("social_token");
let currentUser = JSON.parse(localStorage.getItem("social_user") || "null");

const $ = id => document.getElementById(id);
const toast = msg => {
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2500);
};

async function request(path, options = {}) {
  const headers = {"Content-Type":"application/json", ...(options.headers || {})};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API + path, {...options, headers});
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function showApp() {
  $("authView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  renderUser();
  loadFeed();
}
function showAuth() {
  $("appView").classList.add("hidden");
  $("authView").classList.remove("hidden");
}
function renderUser() {
  if (!currentUser) return;
  $("miniName").textContent = currentUser.name;
  $("miniUsername").textContent = "@" + currentUser.username;
  const avatar = currentUser.avatar || "https://i.pravatar.cc/100";
  $("miniAvatar").src = avatar;
  $("composerAvatar").src = avatar;
}

document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
  btn.classList.add("active");
  $("loginForm").classList.toggle("hidden", btn.dataset.tab !== "login");
  $("registerForm").classList.toggle("hidden", btn.dataset.tab !== "register");
}));

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const data = await request("/auth/login", {method:"POST", body:JSON.stringify({
      email:$("loginEmail").value, password:$("loginPassword").value
    })});
    token=data.token; currentUser=data.user;
    localStorage.setItem("social_token",token); localStorage.setItem("social_user",JSON.stringify(currentUser));
    showApp(); toast("Login successful");
  } catch(e){ toast(e.message); }
});

$("registerForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const data = await request("/auth/register", {method:"POST", body:JSON.stringify({
      name:$("regName").value, username:$("regUsername").value,
      email:$("regEmail").value, password:$("regPassword").value
    })});
    token=data.token; currentUser=data.user;
    localStorage.setItem("social_token",token); localStorage.setItem("social_user",JSON.stringify(currentUser));
    showApp(); toast("Account created");
  } catch(e){ toast(e.message); }
});

$("logoutBtn").onclick = () => {
  localStorage.removeItem("social_token"); localStorage.removeItem("social_user");
  token=null; currentUser=null; showAuth();
};

$("refreshBtn").onclick = loadFeed;

$("postForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await request("/posts", {method:"POST", body:JSON.stringify({
      text:$("postText").value, mediaUrl:$("mediaUrl").value, mediaType:$("mediaType").value
    })});
    $("postForm").reset(); loadFeed(); toast("Post published");
  } catch(e){ toast(e.message); }
});

function escapeHtml(s="") {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function timeAgo(date) {
  const sec=Math.floor((Date.now()-new Date(date))/1000);
  if(sec<60) return "just now"; if(sec<3600) return Math.floor(sec/60)+"m";
  if(sec<86400) return Math.floor(sec/3600)+"h"; return Math.floor(sec/86400)+"d";
}

async function loadFeed() {
  try {
    const data = await request("/posts");
    $("feed").innerHTML = data.posts.length ? data.posts.map(postHtml).join("") : '<div class="empty">No posts yet. Be the first to post!</div>';
  } catch(e) { $("feed").innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`; }
}
function postHtml(p) {
  const liked = (p.likes || []).some(id => String(id) === String(currentUser?.id));
  let media = "";
  if (p.mediaUrl) {
    if (p.mediaType === "image") media = `<img class="post-media" src="${escapeHtml(p.mediaUrl)}" alt="Post media" onerror="this.style.display='none'">`;
    else if (p.mediaType === "video") media = `<video class="post-media" controls src="${escapeHtml(p.mediaUrl)}"></video>`;
    else media = `<p><a href="${escapeHtml(p.mediaUrl)}" target="_blank" rel="noopener">${escapeHtml(p.mediaUrl)}</a></p>`;
  }
  const comments=(p.comments||[]).map(c=>`<div class="comment"><b>${escapeHtml(c.user?.name||"User")}</b>${escapeHtml(c.text)}</div>`).join("");
  const own = currentUser && String(p.author?._id) === String(currentUser.id);
  return `<article class="post">
    <div class="post-head"><div class="author"><img src="${escapeHtml(p.author?.avatar||"https://i.pravatar.cc/100")}" alt=""><div><b>${escapeHtml(p.author?.name||"User")}</b><small>@${escapeHtml(p.author?.username||"user")} · ${timeAgo(p.createdAt)}</small></div></div>
    ${own?`<button class="delete-btn" onclick="deletePost('${p._id}')">Delete</button>`:""}</div>
    ${p.text?`<div class="post-text">${escapeHtml(p.text)}</div>`:""}${media}
    <div class="post-actions"><button class="action ${liked?"liked":""}" onclick="toggleLike('${p._id}')">♥ ${p.likes?.length||0}</button><button class="action" onclick="focusComment('${p._id}')">💬 ${p.comments?.length||0}</button></div>
    <div class="comments">${comments||'<span style="color:#8a94a6;font-size:13px">No comments yet.</span>'}
      <div class="comment-form"><input id="comment-${p._id}" placeholder="Write a comment..."><button onclick="addComment('${p._id}')">Send</button></div>
    </div>
  </article>`;
}
window.toggleLike = async id => { try { await request(`/posts/${id}/like`,{method:"POST"}); loadFeed(); } catch(e){toast(e.message)} };
window.addComment = async id => { const input=$(`comment-${id}`); try { await request(`/posts/${id}/comments`,{method:"POST",body:JSON.stringify({text:input.value})}); loadFeed(); } catch(e){toast(e.message)} };
window.focusComment = id => $(`comment-${id}`)?.focus();
window.deletePost = async id => { if(!confirm("Delete this post?")) return; try { await request(`/posts/${id}`,{method:"DELETE"}); loadFeed(); toast("Post deleted"); } catch(e){toast(e.message)} };

function openProfile() {
  $("profileName").value=currentUser.name||"";
  $("profileBio").value=currentUser.bio||"";
  $("profileAvatar").value=currentUser.avatar||"";
  $("profileDialog").showModal();
}
$("profileBtn").onclick=openProfile;
$("editProfileBtn").onclick=openProfile;
$("closeProfile").onclick=()=>$("profileDialog").close();
$("profileForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const data=await request("/users/me",{method:"PUT",body:JSON.stringify({
      name:$("profileName").value,bio:$("profileBio").value,avatar:$("profileAvatar").value
    })});
    currentUser={...currentUser,...data.user,id:data.user._id};
    localStorage.setItem("social_user",JSON.stringify(currentUser));
    renderUser(); $("profileDialog").close(); toast("Profile updated");
  } catch(e){toast(e.message)}
});

if(token && currentUser) showApp(); else showAuth();
