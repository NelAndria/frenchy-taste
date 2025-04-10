import CONFIG from "./config.js";

// Récupérer l'ID de l'article depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

async function fetchBlogPost(id) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/blog/${id}`);
    if (!response.ok) throw new Error("Blog post not found");
    const post = await response.json();
    const postContainer = document.getElementById("blog-post");

    // Convertir le Markdown en HTML
    const converter = new showdown.Converter();
    const formattedContent = converter.makeHtml(post.content);

    const postImage = post.image && post.image.startsWith('http')
      ? post.image
      : `${CONFIG.API_BASE_URL}${post.image}`;

    postContainer.innerHTML = `
      <h2>${post.title}</h2>
      <p><em>By ${post.author} on ${new Date(post.createdAt).toLocaleDateString()}</em></p>
      <img src="${postImage}" alt="${post.title}" style="max-width:100%; border-radius: 8px; margin: 10px 0;"/>
      <div class="article">${formattedContent}</div>
      <a id="back-btn" href="blog.html" aria-label="Back to Blog">Back to Blog</a>
    `;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    document.getElementById("blog-post").innerHTML = `<p>Error loading blog post.</p>`;
  }
}

if (postId) {
  fetchBlogPost(postId);
} else {
  document.getElementById("blog-post").innerHTML = `<p>No blog post selected.</p>`;
}
