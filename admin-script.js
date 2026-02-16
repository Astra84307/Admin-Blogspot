// --- CONFIG ---
const GITHUB_TOKEN = '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';
const REPO = 'astra84307/Blogspot'; // e.g., 'astra84307/blogspot'
const FILE_PATH = 'posts.json';
const BRANCH = 'main';

// --- FETCH POSTS ---
async function fetchPosts() {
    const res = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${FILE_PATH}`);
    return await res.json();
}

// --- SAVE POSTS ---
async function savePosts(posts) {
    const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;
    const getRes = await fetch(url, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const data = await getRes.json();
    const sha = data.sha;

    await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Update posts',
            content: btoa(JSON.stringify(posts, null, 2)),
            sha: sha,
            branch: BRANCH
        })
    });
}

// --- RENDER POSTS ---
async function renderAdminPosts() {
    const posts = await fetchPosts();
    const container = document.getElementById('admin-posts');
    container.innerHTML = '';
    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post';
        div.innerHTML = `
            <h2>${post.title}</h2>
            <small>${post.date}</small>
            ${post.image ? `<img src="${post.image}">` : ''}
            <p>${post.content}</p>
            <button onclick="deletePost(${post.id})">Delete</button>
        `;
        container.appendChild(div);
    });
}

// --- ADD POST WITH IMAGE ---
async function addPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const fileInput = document.getElementById('post-image');
    let imageUrl = '';

    if(fileInput.files.length > 0){
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onloadend = async function() {
            imageUrl = reader.result; // Base64
            await saveNewPost(title, content, imageUrl);
        };
        reader.readAsDataURL(file);
    } else {
        await saveNewPost(title, content, '');
    }
}

async function saveNewPost(title, content, image) {
    if(!title || !content) return alert('Title and content required');
    const posts = await fetchPosts();
    const newPost = {
        id: posts.length ? posts[posts.length-1].id + 1 : 1,
        title,
        content,
        date: new Date().toLocaleDateString(),
        image
    };
    posts.push(newPost);
    await savePosts(posts);
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('post-image').value = '';
    renderAdminPosts();
}

// --- DELETE POST ---
async function deletePost(id){
    const posts = await fetchPosts();
    const updated = posts.filter(p => p.id !== id);
    await savePosts(updated);
    renderAdminPosts();
}

// --- INIT ---
renderAdminPosts();
window.deletePost = deletePost;
window.addPost = addPost;