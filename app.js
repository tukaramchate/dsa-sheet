(() => {
  const $ = (id) => document.getElementById(id);
  const usersKey = "dsa_users";
  const activeKey = "dsa_active_user";
  const readUsers = () => { try { return JSON.parse(localStorage.getItem(usersKey) || "{}"); } catch (error) { return {}; } };
  const saveUsers = (users) => localStorage.setItem(usersKey, JSON.stringify(users));
  const hash = async (value) => {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };
  const toast = (message) => {
    const node = $("toast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2200);
  };

  let mode = "login";
  const auth = $("auth");
  const shell = document.querySelector(".app-shell");
  const users = readUsers();
  const activeUser = localStorage.getItem(activeKey);

  const showApp = (username) => {
    const user = readUsers()[username];
    if (!user) return;
    auth.classList.add("hide");
    shell.classList.remove("hide");
    $("accountName").textContent = `Signed in as ${username}`;
    $("guestActions").classList.add("hide");
    if (user.role === "admin") $("admin").classList.remove("hide");
  };

  const openAuth = (nextMode) => {
    setAuthMode(nextMode);
    auth.classList.remove("hide");
    $("authUsername").focus();
  };

  const renderAdmin = () => {
    const entries = Object.entries(readUsers());
    $("adminUsers").innerHTML = entries.length ? entries.map(([username, user]) => {
      const progress = Object.keys(user.progress || {}).length;
      return `<div class="admin-user"><div><strong>${username}</strong><small>${user.role || "student"} · joined ${new Date(user.createdAt).toLocaleDateString()}</small></div><strong>${progress} solved</strong></div>`;
    }).join("") : "<p class=auth-copy>No accounts yet.</p>";
    $("adminPanel").classList.remove("hide");
  };

  const setAuthMode = (nextMode) => {
    mode = nextMode;
    $("loginTab").classList.toggle("active", mode === "login");
    $("registerTab").classList.toggle("active", mode === "register");
    $("authForm").querySelector(".auth-submit").textContent = mode === "login" ? "Login" : "Create account";
    $("authPassword").autocomplete = mode === "login" ? "current-password" : "new-password";
    $("authError").textContent = "";
  };

  $("loginTab").addEventListener("click", () => setAuthMode("login"));
  $("registerTab").addEventListener("click", () => setAuthMode("register"));
  $("login").addEventListener("click", () => openAuth("login"));
  $("register").addEventListener("click", () => openAuth("register"));
  $("closeAuth").addEventListener("click", () => auth.classList.add("hide"));
  auth.addEventListener("click", (event) => { if (event.target === auth) auth.classList.add("hide"); });
  $("authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = $("authUsername").value.trim().toLowerCase();
    const password = $("authPassword").value;
    const currentUsers = readUsers();
    if (!/^[a-z0-9_-]{3,24}$/.test(username)) { $("authError").textContent = "Use 3-24 letters, numbers, _ or -."; return; }
    if (password.length < 6) { $("authError").textContent = "Password must be at least 6 characters."; return; }
    if (mode === "register" && currentUsers[username]) { $("authError").textContent = "That username already exists."; return; }
    const passwordHash = await hash(password);
    if (mode === "login") {
      if (!currentUsers[username] || currentUsers[username].passwordHash !== passwordHash) { $("authError").textContent = "Incorrect username or password."; return; }
    } else {
      currentUsers[username] = { passwordHash, role: username === "admin" ? "admin" : "student", progress: {}, createdAt: new Date().toISOString(), lastActive: new Date().toISOString() };
      saveUsers(currentUsers);
    }
    localStorage.setItem(activeKey, username);
    location.reload();
  });

  if (activeUser && users[activeUser]) showApp(activeUser);
  $("logout").addEventListener("click", () => { localStorage.removeItem(activeKey); location.reload(); });
  $("admin").addEventListener("click", renderAdmin);
  $("closeAdmin").addEventListener("click", () => $("adminPanel").classList.add("hide"));

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement.tagName !== "INPUT") {
      event.preventDefault();
      $("q").focus();
    }
    if (event.key === "Escape" && document.activeElement === $("q")) {
      $("q").value = "";
      $("q").dispatchEvent(new Event("input"));
      $("q").blur();
    }
  });
})();
