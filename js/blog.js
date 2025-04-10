
import CONFIG from "./config.js";

async function fetchBlogPosts() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/blog`);
    if (!response.ok) throw new Error("Failed to fetch blog posts");
    const posts = await response.json();
    const postsContainer = document.getElementById("blog-posts");
    postsContainer.innerHTML = ""; // Vider le container

    posts.forEach(post => {
      const postImage = post.image && post.image.startsWith('http')
        ? post.image
        : `${CONFIG.API_BASE_URL}${post.image}`;
      postsContainer.innerHTML += `
        <article class="blog-post" role="article" aria-label="Blog post: ${post.title}">
          <h2>${post.title}</h2>
          <img src="${postImage}" alt="${post.title}" onerror="this.onerror=null; this.src='fallback.jpg';" />
          <p><em>By ${post.author} on ${new Date(post.createdAt).toLocaleDateString()}</em></p>
          <p>${post.content.substring(0, 150)}...</p>
          <a href="blogPost.html?id=${post._id}" aria-label="Read more about ${post.title}">Read More</a>
        </article>
      `;
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    document.getElementById("blog-posts").innerHTML = `<p>Error loading blog posts.</p>`;
  }
}

fetchBlogPosts();
