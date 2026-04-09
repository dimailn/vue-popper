import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, it, expect, afterEach } from 'vitest';
import VuePopper from '../src/index';

function cleanupPopperNodes() {
  document.body.querySelectorAll('.popper').forEach((node) => {
    const container = node.parentElement;
    if (container && container.parentNode === document.body) {
      document.body.removeChild(container);
    }
  });
}

describe('Vue 3 remount cleanup', () => {
  afterEach(() => {
    cleanupPopperNodes();
  });

  it('не оставляет дубликаты popper в body при key-remount', async () => {
    const Host = defineComponent({
      data() {
        return { step: 1 };
      },
      render() {
        return h('div', [
          h(
            VuePopper,
            {
              key: this.step,
              forceShow: true,
              appendToBody: true,
              trigger: 'click',
              rootClass: 'popper'
            },
            {
              reference: () => h('button', { class: 'target' }, 'target'),
              default: () => h('span', { class: 'content' }, 'content')
            }
          )
        ]);
      }
    });

    const wrapper = mount(Host, { attachTo: document.body });

    await nextTick();
    await nextTick();

    wrapper.vm.step = 2;
    await nextTick();
    await nextTick();

    const poppers = document.body.querySelectorAll('.popper');
    expect(poppers.length).toBe(1);

    wrapper.unmount();
  });

  it('создает popper в body при appendToBody', async () => {
    const Host = defineComponent({
      render() {
        return h(
          VuePopper,
          {
            forceShow: true,
            appendToBody: true,
            trigger: 'click',
            rootClass: 'popper'
          },
          {
            reference: () => h('button', { class: 'target' }, 'target'),
            default: () => h('span', { class: 'content' }, 'content')
          }
        );
      }
    });

    const wrapper = mount(Host, { attachTo: document.body });

    await nextTick();
    await nextTick();

    expect(document.body.querySelectorAll('.popper').length).toBe(1);
    wrapper.unmount();
  });

  it('не добавляет дубликат после первого переключения key', async () => {
    const Host = defineComponent({
      data() {
        return { step: 1 };
      },
      render() {
        return h('div', [
          h(
            VuePopper,
            {
              key: this.step,
              forceShow: true,
              appendToBody: true,
              trigger: 'click',
              rootClass: 'popper'
            },
            {
              reference: () => h('button', { class: 'target' }, 'target'),
              default: () => h('span', { class: 'content' }, 'content')
            }
          )
        ]);
      }
    });

    const wrapper = mount(Host, { attachTo: document.body });

    await nextTick();
    await nextTick();

    wrapper.vm.step = 2;
    await nextTick();
    await nextTick();

    const poppers = document.body.querySelectorAll('.popper');
    expect(poppers.length).toBe(1);

    wrapper.unmount();
  });

  it('корректно удаляет popper из body при unmount', async () => {
    const Host = defineComponent({
      render() {
        return h(
          VuePopper,
          {
            forceShow: true,
            appendToBody: true,
            trigger: 'click',
            rootClass: 'popper'
          },
          {
            reference: () => h('button', { class: 'target' }, 'target'),
            default: () => h('span', { class: 'content' }, 'content')
          }
        );
      }
    });

    const wrapper = mount(Host, { attachTo: document.body });

    await nextTick();
    await nextTick();

    expect(document.body.querySelectorAll('.popper').length).toBe(1);

    wrapper.unmount();
    await nextTick();

    expect(document.body.querySelectorAll('.popper').length).toBe(0);
  });

  it('не оставляет дубликаты при множественных key-remount (ui-tour сценарий)', async () => {
    const Host = defineComponent({
      data() {
        return { step: 1 };
      },
      render() {
        return h('div', [
          h(
            VuePopper,
            {
              key: this.step,
              forceShow: true,
              appendToBody: true,
              trigger: 'click',
              rootClass: 'popper'
            },
            {
              reference: () => h('button', { class: 'target' }, 'target'),
              default: () => h('span', { class: 'content' }, `step ${this.step}`)
            }
          )
        ]);
      }
    });

    const wrapper = mount(Host, { attachTo: document.body });

    await nextTick();
    await nextTick();

    for (let step = 2; step <= 5; step++) {
      wrapper.vm.step = step;
      await nextTick();
      await nextTick();

      const poppers = document.body.querySelectorAll('.popper');
      expect(poppers.length).toBe(1);
    }

    wrapper.unmount();
  });
});
