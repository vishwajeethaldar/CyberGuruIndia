function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
}

async function postVote(url, type) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
    },
    body: JSON.stringify({ type }),
  });

  return response.json();
}

document.addEventListener('click', async (event) => {
  const shareBtn = event.target.closest('.js-copy-share');
  if (shareBtn) {
    const wrapper = shareBtn.closest('.input-group');
    const input = wrapper ? wrapper.querySelector('.js-share-input') : null;
    const shareUrl = shareBtn.getAttribute('data-share-url') || (input ? input.value : '');

    if (!shareUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({ url: shareUrl });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        const originalText = shareBtn.textContent;
        shareBtn.textContent = 'Copied';
        setTimeout(() => {
          shareBtn.textContent = originalText;
        }, 1200);
      }
    } catch (error) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    }

    return;
  }

  const videoBtn = event.target.closest('.js-video-vote');
  if (videoBtn) {
    const id = videoBtn.getAttribute('data-target-id');
    const type = videoBtn.getAttribute('data-type');
    const result = await postVote(`/videos/${id}/vote`, type);
    if (result.likes !== undefined) {
      const likesEl = document.querySelector('.js-video-likes');
      const dislikesEl = document.querySelector('.js-video-dislikes');
      if (likesEl) likesEl.textContent = result.likes;
      if (dislikesEl) dislikesEl.textContent = result.dislikes;
    }
    return;
  }

  const blogBtn = event.target.closest('.js-blog-vote');
  if (blogBtn) {
    const id = blogBtn.getAttribute('data-target-id');
    const type = blogBtn.getAttribute('data-type');
    const result = await postVote(`/blogs/${id}/vote`, type);
    if (result.likes !== undefined) {
      const likesEl = document.querySelector('.js-blog-likes');
      const dislikesEl = document.querySelector('.js-blog-dislikes');
      if (likesEl) likesEl.textContent = result.likes;
      if (dislikesEl) dislikesEl.textContent = result.dislikes;
    }
    return;
  }

  const commentBtn = event.target.closest('.js-comment-vote');
  if (commentBtn) {
    const id = commentBtn.getAttribute('data-target-id');
    const type = commentBtn.getAttribute('data-type');
    const result = await postVote(`/comments/${id}/vote`, type);
    if (result.likes !== undefined) {
      const wrapper = commentBtn.closest('.d-flex');
      const likeCount = wrapper ? wrapper.querySelector('.count-like') : null;
      const dislikeCount = wrapper ? wrapper.querySelector('.count-dislike') : null;
      if (likeCount) likeCount.textContent = result.likes;
      if (dislikeCount) dislikeCount.textContent = result.dislikes;
    }
    return;
  }

  const blogCommentBtn = event.target.closest('.js-blog-comment-vote');
  if (blogCommentBtn) {
    const id = blogCommentBtn.getAttribute('data-target-id');
    const type = blogCommentBtn.getAttribute('data-type');
    const result = await postVote(`/blog-comments/${id}/vote`, type);
    if (result.likes !== undefined) {
      const wrapper = blogCommentBtn.closest('.d-flex');
      const likeCount = wrapper ? wrapper.querySelector('.count-like') : null;
      const dislikeCount = wrapper ? wrapper.querySelector('.count-dislike') : null;
      if (likeCount) likeCount.textContent = result.likes;
      if (dislikeCount) dislikeCount.textContent = result.dislikes;
    }
  }
});
