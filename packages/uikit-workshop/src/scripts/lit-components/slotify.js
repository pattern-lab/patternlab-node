export const Slotify = (Base) =>
  class extends Base {
    templateMap = new Map();

    assignSlotToContent(child) {
      return child.slot || child.getAttribute
        ? child.getAttribute('slot')
        : 'default';
    }

    isEmptyTextNode(child) {
      return child && (!child.textContent || !child.textContent.trim());
    }

    // Save a reference to the pseudoSlot content before lit-element renders
    saveSlots() {
      const childNodes = [];
      Array.from(this.childNodes).forEach((child) => {
        const slot = this.assignSlotToContent(child);

        if (!child.textContent || child.textContent.trim().length > 0) {
          if (!this.templateMap.has(slot)) {
            this.templateMap.set(slot, [child]);
          } else {
            this.templateMap.set(slot, [...this.templateMap.get(slot), child]);
          }
        }
      });

      const shouldSlotChildren =
        childNodes.length > 1 ||
        childNodes.some((child) => !this.isEmptyTextNode(child));

      if (shouldSlotChildren) {
        const fragment = document.createDocumentFragment();

        childNodes.forEach((child) => {
          fragment.appendChild(child);
        });

        this.templateMap.set('', fragment);
      }
    }

    update(changedProperties) {
      if (!this.hasUpdated) {
        this.saveSlots();
      }

      super.update(changedProperties);
    }

    slotify(slot = '', defaultContent) {
      const slotContent = this.templateMap.get(slot);

      // render slots when using Shadow DOM
      if (this.shadowRoot && slotContent) {
        const realSlot = document.createElement('slot');
        if (slot !== 'default') {
          realSlot.setAttribute('name', slot);
        }
        return realSlot;
      }

      if (slotContent && slotContent.content) {
        return slotContent.content;
      } else if (slotContent && slotContent.childNodes) {
        return Array.from(slotContent.childNodes);
      } else if (slotContent) {
        return slotContent;
      } else if (defaultContent) {
        return defaultContent;
      } else {
        // eslint-disable-next-line consistent-return
        return;
      }
    }
  };
