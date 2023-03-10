export default class ModalWindow {
  constructor(selector, options) {
    let defaultOptions = {
      isOpen: () => { },
      isClose: () => { },

      defaultSpeed: 300,
      autoFocusToCloseBtn: false,

      modalOverlayName: 'data-modal-overlay',
      modalWindowName: 'data-modal-target',
      modalWindowSpeedName: 'data-modal-speed',
      modalCloseBtnName: 'data-modal-close',
      modalOverlayBlockName: 'overlay-show',
      disableScrollName: 'dis-scroll',
      modalWindowBlockName: 'block',
      modalWindowShowName: 'window-show',
      fixElemName: 'data-modal-fix',
    };

    this.options = Object.assign(defaultOptions, options);
    this.btns = document.querySelectorAll(selector);

    this.modalOpened = false;
    this.speed = null;

    this.modalOverlay = document.querySelector(`[${this.options.modalOverlayName}]`);
    this.window = null;
    this.modalCloseBtn = null;
    this.modalFocusElems = null;
    this.previusFocusElem = null;
    this.documentFocusElems = null;
    this.previusActiveWindow = null;

    this.focusElems = [
      'a[href]',
      'input',
      'button',
      'select',
      'textarea',
      '[tabindex]'
    ]

    this.events();
  }

  events() {
    document.addEventListener('DOMContentLoaded', () => {
      if (this.btns.length > 0) {
        this.btns.forEach(btnEl => {
          document.addEventListener('click', (e) => {
            if (e.target == btnEl) {
              this.getDataPath(btnEl);

              if (!this.modalOpened) {
                if (new Date().getTime() - this.lastClick < this.speed) return;
                this.lastClick = new Date().getTime();
                this.openModal(this.window);
                e.preventDefault();
              }

              if (this.modalOpened) {
                if (new Date().getTime() - this.lastClick < this.speed) return;
                this.lastClick = new Date().getTime();
                this.previusActiveWindow = document.querySelector(`.${this.options.modalWindowBlockName}.${this.options.modalWindowShowName}`);
                if (this.previusActiveWindow != this.window) {
                  this.reOpenModal(this.previusActiveWindow, this.window);
                }
              }
            }

            if (e.target == this.modalCloseBtn || e.target == this.modalOverlay) {
              if (new Date().getTime() - this.lastClick < this.speed) return;
              this.lastClick = new Date().getTime();
              if (this.modalOpened) {
                this.closeModal(this.window);
                e.preventDefault();
              }
            }
          })
        })

        document.addEventListener('keydown', (e) => {
          if (this.modalOpened) {
            if (e.code === 'Tab') {
              this.focusInModal(e);
            }

            if (e.code === 'Escape') {
              if (new Date().getTime() - this.lastClick < this.speed) return;
              this.lastClick = new Date().getTime();
              this.closeModal(this.window);
              e.preventDefault();
            }
          }
        })
      }
    })
  }

  getDataPath(btnEl) {
    const getDataTarget = btnEl.dataset.modal;
    this.window = document.querySelector(`[${this.options.modalWindowName}="${getDataTarget}"]`);
    this.modalCloseBtn = this.window.querySelector(`[${this.options.modalCloseBtnName}]`);

    if (btnEl.hasAttribute(`${this.options.modalWindowSpeedName}`)) {
      this.speed = btnEl.dataset.modalSpeed;
    } else {
      this.speed = this.options.defaultSpeed;
    }
  }

  openModal(windowEl) {
    this.options.isOpen(this);
    this.previusFocusElem = document.activeElement;
    this.documentFocusElems = document.querySelectorAll(this.focusElems);
    this.navigationOff(this.documentFocusElems);
    this.focusToModal(windowEl);
    this.disableScroll();
    this.modalOverlay.classList.add(this.options.modalOverlayBlockName);
    this.modalOverlay.style.setProperty('--transition-modal-time', `${this.speed / 1000}s`);
    windowEl.classList.add(this.options.modalWindowBlockName);
    setTimeout(() => {
      windowEl.classList.add(this.options.modalWindowShowName);
    });
    setTimeout(() => {
      this.modalOpened = true;
      this.navigationOn(this.documentFocusElems);
    }, this.speed);
  }

  closeModal(windowEl) {
    this.focusToBtn();
    this.modalOverlay.classList.remove(this.options.modalOverlayBlockName);
    windowEl.classList.remove(this.options.modalWindowShowName);
    setTimeout(() => {
      this.modalOverlay.removeAttribute('style');
      windowEl.classList.remove(this.options.modalWindowBlockName);
      this.modalOpened = false;
      this.enableScroll();
      this.navigationOn(this.documentFocusElems);
    }, this.speed);
    this.options.isClose(this);
  }

  focusToModal(windowEl) {
    this.modalFocusElems = Array.from(windowEl.querySelectorAll(this.focusElems));
    if (this.modalFocusElems.length > 0) {
      setTimeout(() => {
        this.modalFocusElems[0].focus();
      }, this.speed);
    }

    if (this.modalCloseBtn && this.options.autoFocusToCloseBtn) {
      setTimeout(() => {
        this.modalCloseBtn.focus();
      }, this.speed);
    }
  }

  focusToBtn() {
    setTimeout(() => {
      this.previusFocusElem.focus();
    }, this.speed);
  }

  focusInModal(e) {
    const focusArray = Array.prototype.slice.call(this.modalFocusElems);
    const focusedIndex = focusArray.indexOf(document.activeElement);
    if (!e.shiftKey && focusedIndex === focusArray.length - 1 && focusArray.length > 0) {
      this.modalFocusElems[0].focus();
      e.preventDefault();
    }

    if (focusArray.length === 0) {
      this.navigationOff(this.documentFocusElems);
    }

    if (e.shiftKey && focusedIndex === 0) {
      this.modalFocusElems[this.modalFocusElems.length - 1].focus();
      e.preventDefault();
    }
  }

  navigationOn(documentFocusElems) {
    documentFocusElems.forEach(documentFocusEl => {
      documentFocusEl.removeAttribute('tabIndex');
    })
  }

  navigationOff(documentFocusElems) {
    documentFocusElems.forEach(documentFocusEl => {
      documentFocusEl.tabIndex = -1;
    })
  }

  disableScroll() {
    const fixBlocks = document?.querySelectorAll(`[${this.options.fixElemName}]`);
    const pagePosition = window.scrollY;
    const paddingOffset = `${(window.innerWidth - document.body.offsetWidth)}px`;

    document.documentElement.style.scrollBehavior = 'none';
    fixBlocks.forEach(el => { el.style.paddingRight = paddingOffset; });
    document.body.style.paddingRight = paddingOffset;
    document.body.classList.add(this.options.disableScrollName);
    document.body.dataset.position = pagePosition;
    document.body.style.top = `-${pagePosition}px`;
  }

  enableScroll() {
    const fixBlocks = document?.querySelectorAll(`[${this.options.fixElemName}]`);
    document.body.classList.remove(this.options.disableScrollName);
    document.body.removeAttribute('style');
    fixBlocks.forEach(el => { el.removeAttribute('style'); });
    let pagePosition = parseInt(document.body.dataset.position, 10);
    window.scroll({ top: pagePosition, left: 0 });
    document.body.removeAttribute('data-position');
  }

  reOpenModal(previusActiveWindowEl, windowEl) {
    previusActiveWindowEl.classList.remove(this.options.modalWindowShowName);
    setTimeout(() => {
      this.enableScroll();
      previusActiveWindowEl.classList.remove(this.options.modalWindowBlockName);
      this.openModal(windowEl);
    }, this.speed);
  }
}