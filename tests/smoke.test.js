const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const supertest = require('supertest');

const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Video = require('../src/models/Video');
const Blog = require('../src/models/Blog');
const Comment = require('../src/models/Comment');
const BlogComment = require('../src/models/BlogComment');

let app;
let request;
let agent;
let mongoServer;

jest.setTimeout(30000);

function extractCsrfToken(html) {
  const inputMatch = html.match(/name="_csrf"\s+value="([^"]+)"/i);
  if (inputMatch) return inputMatch[1];
  const metaMatch = html.match(/name="csrf-token"\s+content="([^"]*)"/i);
  return metaMatch ? metaMatch[1] : '';
}

async function getCsrfFor(agentInstance, path) {
  const res = await agentInstance.get(path);
  return { res, token: extractCsrfToken(res.text) };
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.SESSION_SECRET = 'test-secret';
  process.env.SITE_NAME = 'CyberGuruIndia';

  await mongoose.connect(process.env.MONGODB_URI, { autoIndex: true });

  app = require('../src/app');
  request = supertest(app);
  agent = supertest.agent(app);
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close(true);
    }
  } finally {
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Video.deleteMany({}),
    Blog.deleteMany({}),
    Comment.deleteMany({}),
    BlogComment.deleteMany({}),
  ]);
});

test('GET /videos returns 200', async () => {
  const res = await request.get('/videos');
  expect(res.status).toBe(200);
  expect(res.text).toMatch(/Videos/i);
});

test('GET /blogs returns 200', async () => {
  const res = await request.get('/blogs');
  expect(res.status).toBe(200);
  expect(res.text).toMatch(/Blogs/i);
});

test('GET /admin/login returns 200', async () => {
  const res = await request.get('/admin/login');
  expect(res.status).toBe(200);
  expect(res.text).toMatch(/Admin Login/i);
});

test('public can post video comment and vote', async () => {
  const category = await Category.create({ name: 'General' });
  const video = await Video.create({
    title: 'Test Video',
    description: 'This is a test video description.',
    youtubeId: 'dQw4w9WgXcQ',
    category: category._id,
    discussionEnabled: true,
  });

  const { token } = await getCsrfFor(agent, `/videos/${video.slug}`);

  const commentRes = await agent
    .post(`/videos/${video.slug}/comments`)
    .type('form')
    .send({ authorName: 'Tester', message: 'Nice video!', _csrf: token });

  expect(commentRes.status).toBe(302);

  const voteRes = await agent
    .post(`/videos/${video._id}/vote`)
    .set('X-CSRF-Token', token)
    .send({ type: 'like' });

  expect(voteRes.status).toBe(200);
  expect(voteRes.body.likes).toBe(1);
});

test('public can post blog comment and vote', async () => {
  const category = await Category.create({ name: 'News' });
  const blog = await Blog.create({
    title: 'Test Blog',
    content: 'This is a test blog content.',
    category: category._id,
    discussionEnabled: true,
  });

  const { token } = await getCsrfFor(agent, `/blogs/${blog.slug}`);

  const commentRes = await agent
    .post(`/blogs/${blog.slug}/comments`)
    .type('form')
    .send({ authorName: 'Tester', message: 'Great blog!', _csrf: token });

  expect(commentRes.status).toBe(302);

  const voteRes = await agent
    .post(`/blogs/${blog._id}/vote`)
    .set('X-CSRF-Token', token)
    .send({ type: 'like' });

  expect(voteRes.status).toBe(200);
  expect(voteRes.body.likes).toBe(1);
});

test('admin can create, update, and delete video and blog', async () => {
  await User.create({ username: 'admin', password: 'admin123', role: 'admin' });

  const loginPage = await getCsrfFor(agent, '/admin/login');
  const loginToken = loginPage.token;

  const loginRes = await agent
    .post('/admin/login')
    .type('form')
    .send({ username: 'admin', password: 'admin123', _csrf: loginToken });

  expect(loginRes.status).toBe(302);

  const dashboardPage = await getCsrfFor(agent, '/admin/dashboard');
  const adminToken = dashboardPage.token;

  const categoryRes = await agent
    .post('/admin/categories')
    .type('form')
    .send({ name: 'AdminCat', _csrf: adminToken });

  expect(categoryRes.status).toBe(302);

  const category = await Category.findOne({ name: 'AdminCat' });
  expect(category).toBeTruthy();

  const createVideoRes = await agent
    .post('/admin/videos')
    .field('title', 'Admin Video')
    .field('description', 'Admin video description text.')
    .field('youtubeId', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    .field('category', String(category._id))
    .field('discussionEnabled', 'on')
    .field('_csrf', adminToken);

  expect(createVideoRes.status).toBe(302);

  const video = await Video.findOne({ title: 'Admin Video' });
  expect(video).toBeTruthy();

  const updateVideoPage = await getCsrfFor(agent, `/admin/videos/${video._id}/edit`);
  const updateVideoToken = updateVideoPage.token;

  const updateVideoRes = await agent
    .put(`/admin/videos/${video._id}`)
    .field('title', 'Admin Video Updated')
    .field('description', 'Updated description for admin video.')
    .field('youtubeId', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    .field('category', String(category._id))
    .field('discussionEnabled', 'on')
    .field('_csrf', updateVideoToken);

  expect(updateVideoRes.status).toBe(302);

  const updatedVideo = await Video.findById(video._id);
  expect(updatedVideo.title).toBe('Admin Video Updated');

  const deleteVideoRes = await agent
    .delete(`/admin/videos/${video._id}`)
    .set('X-CSRF-Token', updateVideoToken);

  expect(deleteVideoRes.status).toBe(302);
  const deletedVideo = await Video.findById(video._id);
  expect(deletedVideo).toBeNull();

  const createBlogRes = await agent
    .post('/admin/blogs')
    .field('title', 'Admin Blog')
    .field('content', 'Admin blog content text here.')
    .field('category', String(category._id))
    .field('discussionEnabled', 'on')
    .field('_csrf', adminToken);

  expect(createBlogRes.status).toBe(302);

  const blog = await Blog.findOne({ title: 'Admin Blog' });
  expect(blog).toBeTruthy();

  const updateBlogPage = await getCsrfFor(agent, `/admin/blogs/${blog._id}/edit`);
  const updateBlogToken = updateBlogPage.token;

  const updateBlogRes = await agent
    .put(`/admin/blogs/${blog._id}`)
    .field('title', 'Admin Blog Updated')
    .field('content', 'Updated admin blog content here.')
    .field('category', String(category._id))
    .field('discussionEnabled', 'on')
    .field('_csrf', updateBlogToken);

  expect(updateBlogRes.status).toBe(302);

  const updatedBlog = await Blog.findById(blog._id);
  expect(updatedBlog.title).toBe('Admin Blog Updated');

  const deleteBlogRes = await agent
    .delete(`/admin/blogs/${blog._id}`)
    .set('X-CSRF-Token', updateBlogToken);

  expect(deleteBlogRes.status).toBe(302);
  const deletedBlog = await Blog.findById(blog._id);
  expect(deletedBlog).toBeNull();
});

