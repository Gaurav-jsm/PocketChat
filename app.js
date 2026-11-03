
// 1. Supabase project credentials
const SUPABASE_URL = "https://hdksluudcugbdaxwamxf.supabase.co";
const SUPABASE_KEY = "sb_publishable_LskwJ5Fuhk9ltKIvmKZcgA_hvt8jAoQ";

// 2. Connect to Supabase
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Page elements
const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");
const authMessage = document.getElementById("auth-message");
const welcomeMessage = document.getElementById("welcome-message");

// 4. Registration
document.getElementById("signup-button").addEventListener("click", async () => {
  const name = document.getElementById("display-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!name || !email || !password) {
    authMessage.textContent = "Please fill in all registration fields.";
    return;
  }

  if (password.length < 6) {
    authMessage.textContent = "Password must be at least 6 characters.";
    return;
  }

  authMessage.textContent = "Creating your account...";

  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: {
      data: { name: name }
    }
  });

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  if (data.session) {
    showChat(data.user);
  } else {
    authMessage.textContent =
      "Registration successful! Check your email to confirm your account, then log in.";
  }
});

// 5. Login
document.getElementById("login-button").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    authMessage.textContent = "Please enter email and password.";
    return;
  }

  authMessage.textContent = "Logging in...";

  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  showChat(data.user);
});

// 6. Display logged-in screen
async function showChat(user) {
  authSection.hidden = true;
  chatSection.hidden = false;

  const { data } = await db
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .single();

  const name = data?.display_name || user.email;
  welcomeMessage.textContent = "Welcome, " + name + "!";
}

// 7. Logout
document.getElementById("logout-button").addEventListener("click", async () => {
  const { error } = await db.auth.signOut();

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  chatSection.hidden = true;
  authSection.hidden = false;
  authMessage.textContent = "You have logged out.";
});

// 8. Restore an existing login
async function checkExistingSession() {
  const { data, error } = await db.auth.getSession();

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  if (data.session) {
    showChat(data.session.user);
  }
}

checkExistingSession();
