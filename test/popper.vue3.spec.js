import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import VuePopper from '../src/index';

function directBodyChildrenWithPopperClass() {
  return Array.from(document.body.children).filter((el) => el.classList.contains('popper'));
}

/** Порталы appendToBody — прямые дети body с классом из rootClass (в тестах задан `popper`). */
function cleanupPopperNodes() {
  directBodyChildrenWithPopperClass().forEach((node) => {
    document.body.removeChild(node);
  });
}

function injectStaticRootClassStyle() {
  const id = 'popper-root-class-static-test-style';
  if (document.getElementById(id)) {
    return;
  }
  const el = document.createElement('style');
  el.id = id;
  el.textContent = '.popper-root-static-override { position: static !important; }';
  document.head.appendChild(el);
}

function removeStaticRootClassStyle() {
  document.getElementById('popper-root-class-static-test-style')?.remove();
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

    expect(directBodyChildrenWithPopperClass().length).toBe(1);

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

    expect(directBodyChildrenWithPopperClass().length).toBe(1);
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

    expect(directBodyChildrenWithPopperClass().length).toBe(1);

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

    expect(directBodyChildrenWithPopperClass().length).toBe(1);

    wrapper.unmount();
    await nextTick();

    expect(directBodyChildrenWithPopperClass().length).toBe(0);
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

      expect(directBodyChildrenWithPopperClass().length).toBe(1);
    }

    wrapper.unmount();
  });
});

describe('rootClass и цель Popper.js', () => {
  beforeEach(() => {
    injectStaticRootClassStyle();
  });

  afterEach(() => {
    removeStaticRootClassStyle();
    cleanupPopperNodes();
  });

  it('Popper.js позиционирует vm.popper (первый узел слота); rootClass на обёртке может быть static', async () => {
    const Host = defineComponent({
      render() {
        return h(
          VuePopper,
          {
            forceShow: true,
            appendToBody: true,
            trigger: 'click',
            visibleArrow: true,
            rootClass: 'popper-root-static-override popper'
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

    const popperVm = wrapper.findComponent(VuePopper).vm;
    // ref="popper" в шаблоне — обёртка; в Popper передаётся первый элементный ребёнок слота (см. syncPopperTarget / mounted).
    const positionedEl = popperVm.popper;
    const rootWrapper = positionedEl?.parentElement;

    expect(positionedEl).toBeTruthy();
    expect(rootWrapper).toBeTruthy();
    expect(rootWrapper.classList.contains('popper-root-static-override')).toBe(true);

    expect(getComputedStyle(rootWrapper).position).toBe('static');

    expect(positionedEl.style.position).toBe('absolute');

    const arrow = positionedEl.querySelector('.popper__arrow');
    expect(arrow).toBeTruthy();
    expect(positionedEl.contains(arrow)).toBe(true);

    wrapper.unmount();
  });
});
