const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// In-memory data store
let nextPostId = 1;
const posts = [];

function findPostById(postId) {
  return posts.find((p) => p.id === postId);
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { pageTitle: 'Home', posts });
});

app.get('/posts/new', (req, res) => {
  res.render('new', { pageTitle: 'Create Post' });
});

app.post('/posts', (req, res) => {
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();

  if (!title || !content) {
    return res.status(400).render('new', {
      pageTitle: 'Create Post',
      error: 'Title and content are required.',
      form: { title, content },
    });
  }

  const newPost = {
    id: nextPostId++,
    title,
    content,
    createdAt: new Date(),
  };
  posts.unshift(newPost);

  res.redirect('/');
});

app.get('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const post = findPostById(id);
  if (!post) {
    return res.status(404).render('404', { pageTitle: 'Post Not Found' });
  }
  res.render('show', { pageTitle: post.title, post });
});

app.get('/posts/:id/edit', (req, res) => {
  const id = Number(req.params.id);
  const post = findPostById(id);
  if (!post) {
    return res.status(404).render('404', { pageTitle: 'Post Not Found' });
  }
  res.render('edit', { pageTitle: `Edit: ${post.title}`, post });
});

app.post('/posts/:id/update', (req, res) => {
  const id = Number(req.params.id);
  const post = findPostById(id);
  if (!post) {
    return res.status(404).render('404', { pageTitle: 'Post Not Found' });
  }

  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();

  if (!title || !content) {
    return res.status(400).render('edit', {
      pageTitle: `Edit: ${post.title}`,
      post: { ...post, title, content },
      error: 'Title and content are required.',
    });
  }

  post.title = title;
  post.content = content;
  post.updatedAt = new Date();

  res.redirect('/');
});

app.post('/posts/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).render('404', { pageTitle: 'Post Not Found' });
  }
  posts.splice(index, 1);
  res.redirect('/');
});

// Fallback 404
app.use((req, res) => {
  res.status(404).render('404', { pageTitle: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
