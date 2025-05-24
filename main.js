import Slide from "./src/scripts/slide.js";

const showContent = () => {
  const loadingElement = document.querySelector("#loading");
  const instagramPostsWrapperElement = document.querySelector(".instagram-posts-wrapper");

  loadingElement.classList.add('hidden')
  instagramPostsWrapperElement.classList.remove('hidden')
}

const initialize = () => {
  const slideElement = document.querySelector(".instagram-posts");

  const observer = new MutationObserver(() => {
    const hasBlockquotes = document.querySelectorAll(".instagram-posts blockquote")?.length ?? 0;
    if (hasBlockquotes) {
      return;
    }

    const sl = new Slide(".instagram-posts-container.wrapper", ".slide", ".nav-controls");
    sl.init();
    observer.disconnect();
    showContent();
  });

  observer.observe(slideElement, { childList: true, subtree: true });
};

initialize();
