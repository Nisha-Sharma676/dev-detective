const searchForm = document.getElementById("search-form");
const usernameInput = document.getElementById("username");
const statusMessage = document.getElementById("status");
const profileSection = document.getElementById("profile");
const repositoriesSection = document.getElementById("repositories");
const searchButton = searchForm.querySelector("button");

searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = usernameInput.value.trim();

  if (!username) {
    statusMessage.textContent = "Please enter a GitHub username.";
    return;
  }

  statusMessage.textContent = "Loading...";
  profileSection.replaceChildren();
  repositoriesSection.replaceChildren();
  searchButton.disabled = true;

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`
    );

    if (response.status === 404) {
      statusMessage.textContent = "User Not Found";
      return;
    }

    if (!response.ok) {
      throw new Error("Unable to fetch GitHub user.");
    }

    const user = await response.json();

    showProfile(user);
    statusMessage.textContent = "Profile loaded successfully!";

    await showRepositories(user.repos_url);
 } catch (error) {
  statusMessage.textContent = error.message;
  console.error("Error details:", error);
} finally {
    searchButton.disabled = false;
  }
});

function showProfile(user) {
  const card = document.createElement("div");
  card.className = "profile-card";

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = user.avatar_url;
  avatar.alt = `${user.login}'s GitHub avatar`;

  const name = document.createElement("h2");
  name.textContent = user.name || user.login;

  const bio = document.createElement("p");
  bio.textContent = user.bio || "No bio available.";

  const joined = document.createElement("p");
  const joinDate = new Date(user.created_at);
  joined.textContent =
    "Joined GitHub: " +
    joinDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  card.append(avatar, name, bio, joined);

  if (user.blog) {
    const portfolio = document.createElement("a");
    const blogUrl = /^https?:\/\//i.test(user.blog)
      ? user.blog
      : `https://${user.blog}`;

    portfolio.href = blogUrl;
    portfolio.textContent = "Visit Portfolio";
    portfolio.target = "_blank";
    portfolio.rel = "noopener noreferrer";
    card.append(portfolio);
  }

  profileSection.append(card);
}

async function showRepositories(reposUrl) {
  const heading = document.createElement("h2");
  heading.textContent = "Latest Repositories";
  repositoriesSection.append(heading);

  const response = await fetch(reposUrl);

  if (!response.ok) {
    const message = document.createElement("p");
    message.textContent = "Could not load repositories.";
    repositoriesSection.append(message);
    return;
  }

  const repositories = await response.json();

  repositories.sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );

  const latestRepositories = repositories.slice(0, 5);

  if (latestRepositories.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No public repositories found.";
    repositoriesSection.append(message);
    return;
  }

  latestRepositories.forEach(function (repo) {
    const card = document.createElement("div");
    card.className = "repo-card";

    const link = document.createElement("a");
    link.href = repo.html_url;
    link.textContent = repo.name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const description = document.createElement("p");
    description.textContent =
      repo.description || "No description available.";

    card.append(link, description);
    repositoriesSection.append(card);
  });
}
