import { describe, it, expect, beforeEach } from 'vitest'
import {addEventsById, removeEventsById, setupCarousel, handlers} from '../src/app.js'


describe('addEventsById', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="target-btn">Целевой элемент</button>
      <pre id="status">События ещё не добавлены…</pre>
    `
  })

  it('должна добавлять события к элементу по ID', () => {
    addEventsById('target-btn', ['click', 'mouseover'])

    expect(handlers['target-btn']).toBeDefined()
    expect(handlers['target-btn']['click']).toBeDefined()
    expect(handlers['target-btn']['mouseover']).toBeDefined()
    expect(handlers['target-btn']['click'].length).toBe(1)
    expect(handlers['target-btn']['mouseover'].length).toBe(1)
  })

  it('должна увеличивать счетчик при срабатывании события', () => {
    const element = document.getElementById('target-btn')

    addEventsById('target-btn', ['click'])

    expect(element.dataset.click).toBeUndefined()

    element.click()

    expect(Number(element.dataset.click)).toBe(1)

    element.click()
    expect(Number(element.dataset.click)).toBe(2)
  })

  it('должна обновлять статус после добавления событий', () => {
    const status = document.getElementById('status')

    addEventsById('target-btn', ['click', 'mouseover'])
    const element = document.getElementById('target-btn')
    element.click()

    expect(status.textContent).toContain('target-btn')
    expect(status.textContent).toContain('click')
    expect(status.textContent).toContain('активно')
  })

  it('должна добавлять несколько обработчиков одного события при повторных вызовах', () => {
    handlers['target-btn'] = {}
    addEventsById('target-btn', ['click'])
    expect(handlers['target-btn']['click'].length).toBe(1)

    addEventsById('target-btn', ['click'])
    expect(handlers['target-btn']['click'].length).toBe(2)

    const element = document.getElementById('target-btn')
    element.click()
    expect(Number(element.dataset.click)).toBe(2)
  })

  it('не должна падать при попытке добавить события к несуществующему элементу', () => {
    expect(() => {
      addEventsById('non-existent', ['click'])
    }).not.toThrow()

    expect(handlers['non-existent']).toBeUndefined()
  })

  it('должна работать с разными типами событий', () => {
    addEventsById('target-btn', ['click', 'mouseover', 'mouseout', 'focus'])

    expect(handlers['target-btn']['click']).toBeDefined()
    expect(handlers['target-btn']['mouseover']).toBeDefined()
    expect(handlers['target-btn']['mouseout']).toBeDefined()
    expect(handlers['target-btn']['focus']).toBeDefined()
  })
})

describe('removeEventsById', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="target-btn">Целевой элемент</button>
      <pre id="status">События ещё не добавлены…</pre>
    `
    addEventsById('target-btn', ['click', 'mouseover'])
  })

  it('должна удалять обработчики событий', () => {
    const element = document.getElementById('target-btn')

    expect(handlers['target-btn']['click'].length).toBeGreaterThan(0)

    removeEventsById('target-btn', ['click'])

    expect(handlers['target-btn']['click'].length).toBe(0)

    const initialCount = Number(element.dataset.click || 0)
    element.click()
    expect(Number(element.dataset.click || 0)).toBe(initialCount)
  })

  it('должна сохранять счетчики после удаления обработчиков', () => {
    const element = document.getElementById('target-btn')

    element.click()
    element.click()
    element.click()

    const countBefore = Number(element.dataset.click)
    expect(countBefore).toBe(3)

    removeEventsById('target-btn', ['click'])

    expect(Number(element.dataset.click)).toBe(3)
  })

  it('должна обновлять статус после удаления событий', () => {
    const status = document.getElementById('status')

    removeEventsById('target-btn', ['click'])

    expect(status.textContent).toContain('click')
    expect(status.textContent).toContain('удалено')
  })

  it('должна удалять только указанные события', () => {
    removeEventsById('target-btn', ['click'])

    expect(handlers['target-btn']['click'].length).toBe(0)
    expect(handlers['target-btn']['mouseover'].length).toBeGreaterThan(0)
  })

  it('не должна падать при попытке удалить события у несуществующего элемента', () => {
    expect(() => {
      removeEventsById('non-existent', ['click'])
    }).not.toThrow()
  })

  it('не должна падать при попытке удалить несуществующие события', () => {
    expect(() => {
      removeEventsById('target-btn', ['nonexistent-event'])
    }).not.toThrow()
  })
})

describe('setupCarousel', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="carousel-wrapper">
        <div class="carousel-container">
          <button class="arrow left">&lt;</button>
          <div class="carousel">
            <div class="item" data-id="1">Элемент 1</div>
            <div class="item" data-id="2">Элемент 2</div>
            <div class="item" data-id="3">Элемент 3</div>
          </div>
          <button class="arrow right">&gt;</button>
        </div>
      </div>
      <div id="modal" class="modal hidden">Модальное Окно</div>
    `
    setupCarousel('.carousel-wrapper', '#modal')
  })

  it('должна открывать модалку при клике на элемент карусели', () => {
    const modal = document.getElementById('modal')
    const item = document.querySelector('.item[data-id="1"]')

    expect(modal.classList.contains('hidden')).toBe(true)

    item.click()

    expect(modal.classList.contains('hidden')).toBe(false)
  })

  it('должна устанавливать правильный data-id в модалке при клике на элемент', () => {
    const modal = document.getElementById('modal')
    const item = document.querySelector('.item[data-id="2"]')

    item.click()

    expect(modal.dataset.itemId).toBe('2')
  })

  it('должна прокручивать карусель влево при клике на левую стрелку', () => {
    const carousel = document.querySelector('.carousel')
    const btnLeft = document.querySelector('.arrow.left')

    let scrollByCalled = false
    let scrollByArgs = null
    carousel.scrollBy = function(...args) {
      scrollByCalled = true
      scrollByArgs = args
      this.scrollLeft = (this.scrollLeft || 0) - 200
    }

    const initialScroll = carousel.scrollLeft || 0

    btnLeft.click()

    expect(scrollByCalled).toBe(true)
    expect(scrollByArgs[0].left).toBe(-200)
    expect(scrollByArgs[0].behavior).toBe('smooth')
  })

  it('должна прокручивать карусель вправо при клике на правую стрелку', () => {
    const carousel = document.querySelector('.carousel')
    const btnRight = document.querySelector('.arrow.right')

    let scrollByCalled = false
    let scrollByArgs = null
    carousel.scrollBy = function(...args) {
      scrollByCalled = true
      scrollByArgs = args
      this.scrollLeft = (this.scrollLeft || 0) + 200
    }

    const initialScroll = carousel.scrollLeft || 0

    btnRight.click()

    expect(scrollByCalled).toBe(true)
    expect(scrollByArgs[0].left).toBe(200)
    expect(scrollByArgs[0].behavior).toBe('smooth')
  })

  it('должна закрывать модалку при клике вне модалки и карусели', () => {
    const modal = document.getElementById('modal')
    const item = document.querySelector('.item[data-id="1"]')

    item.click()
    expect(modal.classList.contains('hidden')).toBe(false)

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    })
    document.body.dispatchEvent(clickEvent)

    expect(modal.classList.contains('hidden')).toBe(true)
    expect(modal.dataset.itemId).toBeUndefined()
  })

  it('не должна закрывать модалку при клике внутри модалки', () => {
    const modal = document.getElementById('modal')
    const item = document.querySelector('.item[data-id="1"]')

    item.click()
    expect(modal.classList.contains('hidden')).toBe(false)

    modal.click()

    expect(modal.classList.contains('hidden')).toBe(false)
  })

  it('не должна закрывать модалку при клике на элемент карусели', () => {
    const modal = document.getElementById('modal')
    const item1 = document.querySelector('.item[data-id="1"]')
    const item2 = document.querySelector('.item[data-id="2"]')

    item1.click()
    expect(modal.classList.contains('hidden')).toBe(false)
    expect(modal.dataset.itemId).toBe('1')

    item2.click()

    expect(modal.classList.contains('hidden')).toBe(false)
    expect(modal.dataset.itemId).toBe('2')
  })

  it('не должна падать при вызове с несуществующими селекторами', () => {
    expect(() => {
      setupCarousel('.non-existent', '#non-existent')
    }).not.toThrow()
  })
})
