import debounce from './debounce.js';

export default class Slide {
  constructor(wrapper, slide, controlNav) {
    this.wrapper = this.select(wrapper);
    this.slide = this.select(slide);
    this.posx = 0;
    this.touch = { start: 0, move: 0 };
    this.mouse = { move: 0 };
    this.activeSlide = 0;
    this.controlNav = controlNav ? this.select(controlNav) : this.createDefaultNav();
  }

  select(e) {
    return document.querySelector(e);
  }

  selectAll(e) {
    return document.querySelectorAll(e);
  }

  addEvent(target, event, callback) {
    target.addEventListener(event, callback);
  }

  removeEvent(target, event, callback) {
    target.removeEventListener(event, callback);
  }

  createElement(e, c, t) {
    e = document.createElement(e);
    e.className = c;
    e.innerText = t;
    return e;
  }

  createDefaultNav() {
    const prev = this.createElement('button', 'prev-nav', '<');
    const next = this.createElement('button', 'prev-nav', '>');
    const navControls = this.createElement('div', 'nav-controls', '');
    navControls.appendChild(prev);
    navControls.appendChild(next);
    document.body.insertBefore(navControls, this.wrapper.nextSibling);
    return { prev, next, navControls };
  }

  // Add Nav Functions
  addNavFunctions() {
    this.addEvent(this.controlNav.children[0], 'click', this.prevSlide);
    this.addEvent(this.controlNav.children[1], 'click', this.nextSlide);
  }

  // Create Custom Controls
  createCustomControls() {
    const { length } = this.slide.children;
    const controls = this.createElement('ul', 'custom-controls', '');
    let i;
    // eslint-disable-next-line no-plusplus
    for (i = 1; i <= length; i++) {
      controls.appendChild(this.createElement('li', '', ''));
    }
    return controls;
  }

  // Add Functions to Custom Controls
  addFunctionToCustomControls() {
    document.body.insertBefore(this.customControls, this.wrapper);
    const controls = [...this.customControls.children];
    controls.forEach((elem, i) => {
      elem.addEventListener('click', () => this.changeSlide(i));
    });
  }

  // Mouse Events
  onStart(e) {
    e.preventDefault();
    this.transition(false);
    this.addEvent(this.wrapper, 'mousemove', this.onMove);
    this.addEvent(this.wrapper, 'mouseup', this.onEnd);
    this.addEvent(this.wrapper, 'mouseout', this.onEnd);
  }

  onMove(e) {
    this.posx += e.movementX;
    this.mouse.move += e.movementX;
    this.move(this.slide, this.posx);
  }

  onEnd() {
    this.checkPosition(this.mouse.move);
    this.mouse.move = 0;
    this.removeEvent(this.wrapper, 'mousemove', this.onMove);
  }

  // Touch Events
  touchStart(e) {
    this.addEvent(this.wrapper, 'touchmove', this.touchMove);
    this.addEvent(this.wrapper, 'touchend', this.touchEnd);
    this.touch.start = e.touches[0].clientX;
    this.transition(false);
  }

  touchMove(e) {
    this.touch.move = e.touches[0].clientX - this.touch.start;
    this.move(this.slide, this.posx + this.touch.move);
  }

  touchEnd() {
    this.posx += this.touch.move;
    this.checkPosition(this.touch.move);
    this.touch.move = 0;
    this.removeEvent(this.wrapper, 'touchmove', this.touchMove);
  }

  checkPosition(pos) {
    if (pos < -120) this.nextSlide();
    else if (pos > 120) this.prevSlide();
    else this.changeSlide(this.activeSlide);
  }

  move(target, x) {
    target.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  calcPosition(index) {
    const slides = [...this.slide.children].map((elem) => (
      { position: -elem.offsetLeft, width: elem.offsetWidth }));
    const { position, width } = slides[index];
    const margin = (this.wrapper.offsetWidth - width) / 2;
    return { position: () => position + margin, margin };
  }

  changeSlide(index) {
    this.transition(true);
    const { length } = this.slide.children;
    if (index < 0 || index >= length) {
      this.posx = this.calcPosition(this.activeSlide).position();
      this.move(this.slide, this.posx);
      return undefined;
    }
    this.activeSlide = index;
    this.posx = this.calcPosition(index).position();
    this.move(this.slide, this.posx);
    this.active(index);
    return this.activeSlide;
  }

  prevSlide() {
    return this.changeSlide(this.activeSlide - 1);
  }

  nextSlide() {
    return this.changeSlide(this.activeSlide + 1);
  }

  // Add transition effect
  transition(active) {
    this.slide.style.transition = active ? 'transform .6s' : 'none';
  }

  // Add class active to active slide
  active(index) {
    const slides = [...this.slide.children];
    slides.forEach((elem, i) => {
      elem.classList.remove('active');
    });
    slides[index].classList.add('active');
  }

  // Control the window resize.
  resize() {
    this.changeSlide(this.activeSlide);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.prevSlide = this.prevSlide.bind(this);
    this.nextSlide = this.nextSlide.bind(this);
    this.changeSlide = this.changeSlide.bind(this);
    this.checkPosition = this.checkPosition.bind(this);
    this.active = this.active.bind(this);
    this.resize = debounce(this.resize.bind(this), 400);
  }

  init() {
    this.changeSlide(0);
    this.bindEvents();
    this.addNavFunctions();
    window.addEventListener('resize', this.resize);
    this.transition(true);
    this.addEvent(this.wrapper, 'mousedown', this.onStart);
    this.addEvent(this.wrapper, 'touchstart', this.touchStart);
    return this;
  }
}
