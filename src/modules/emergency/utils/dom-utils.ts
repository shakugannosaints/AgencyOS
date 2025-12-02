import type { EmergencyAction } from '@/lib/types'

export const EMERGENCY_COLOR = '#0047BB'

export function executeDomAction(action: EmergencyAction): string | null {
  const { type, selector, payload } = action
  
  // Special handling for addElement which might not have a selector for the element itself yet
  if (type === 'addElement') {
    // Security: Basic check to prevent execution of scripts or embedding of external content
    // This is not a full sanitizer, but prevents obvious XSS vectors in this simulation feature.
    if (/<script|iframe|object|embed|form|base|link|meta/i.test(payload.html)) {
      console.warn('[Emergency] Blocked potentially unsafe HTML injection')
      return null
    }

    const parent = document.querySelector(payload.parentSelector || 'body')
    if (parent) {
      const template = document.createElement('template')
      template.innerHTML = payload.html.trim()
      const newEl = template.content.firstElementChild
      
      if (newEl) {
        // Ensure the new element has the selector if provided in payload (e.g. id)
        // or we might need to track it.
        let addedId = newEl.id
        if (!addedId) {
            addedId = `urgency-${Date.now()}-${Math.floor(Math.random() * 10000)}`
            newEl.id = addedId
        }

        // Mark as LLM created for safety
        newEl.setAttribute('data-llm-created', 'true')

        if (payload.position === 'prepend') {
          parent.prepend(newEl)
        } else {
          parent.append(newEl)
        }
        return addedId
      }
    }
    return null
  }

  const element = document.querySelector(selector)
  if (!element) {
    // console.warn(`[Emergency] Element not found: ${selector}`)
    return null
  }

  switch (type) {
    case 'setStyle': {
      if (element instanceof HTMLElement) {
        const styles = payload.style || {}
        Object.assign(element.style, styles)
      }
      break
    }
    case 'updateText': {
      element.textContent = payload.text
      break
    }
    case 'removeElement': {
      const isLlmCreated = element.getAttribute('data-llm-created') === 'true'
      if (isLlmCreated) {
        element.remove()
      } else {
        // Safety: Only hide non-LLM elements instead of removing them
        if (element instanceof HTMLElement) {
          element.style.display = 'none'
        }
      }
      break
    }
    case 'runAnimation': {
      if (element instanceof HTMLElement) {
        triggerAnimation(element, payload.type)
      }
      break
    }
  }
  return null
}

export function revertDomAction(action: EmergencyAction): void {
  const { type, selector, originalState } = action
  
  if (type === 'addElement') {
    // Revert add = remove
    
    // 1. Try to find by stored ID
    if (originalState?.addedElementId) {
        const el = document.getElementById(originalState.addedElementId)
        if (el) {
            el.remove()
            return
        }
    }

    // 2. Fallback: Try to find by ID in payload HTML
    const match = action.payload.html.match(/id=['"]([^'"]+)['"]/)
    if (match) {
      const el = document.getElementById(match[1])
      el?.remove()
    }
    return
  }

  const element = document.querySelector(selector)
  
  switch (type) {
    case 'setStyle': {
      if (element instanceof HTMLElement && originalState?.style) {
        Object.assign(element.style, originalState.style)
      }
      break
    }
    case 'updateText': {
      if (element && originalState?.text !== undefined) {
        element.textContent = originalState.text
      }
      break
    }
    case 'removeElement': {
      // Revert remove = add back OR show
      if (originalState?.method === 'hide') {
          if (element instanceof HTMLElement) {
              element.style.display = originalState.originalDisplay || ''
          }
          return
      }

      if (originalState?.html && originalState?.parentSelector) {
        const parent = document.querySelector(originalState.parentSelector)
        if (parent) {
          const template = document.createElement('template')
          template.innerHTML = originalState.html
          const newEl = template.content.firstElementChild
          if (newEl) {
             // Try to put it back in place
             if (originalState.nextSiblingSelector) {
                 const nextSibling = document.querySelector(originalState.nextSiblingSelector)
                 if (nextSibling) {
                     parent.insertBefore(newEl, nextSibling)
                     return
                 }
             }
             parent.append(newEl)
          }
        }
      }
      break
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function captureState(action: Omit<EmergencyAction, 'id' | 'timestamp'>): any {
  const { type, selector } = action
  const element = document.querySelector(selector)

  if (!element && type !== 'addElement') return null

  switch (type) {
    case 'setStyle': {
      if (element instanceof HTMLElement) {
        const stylePayload = action.payload.style || {}
        const originalStyles: Record<string, string> = {}
        for (const key of Object.keys(stylePayload)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          originalStyles[key] = element.style[key as any] || ''
        }
        return { style: originalStyles }
      }
      return null
    }
    case 'updateText':
      return { text: element?.textContent }
    case 'removeElement':
      if (element) {
         const isLlmCreated = element.getAttribute('data-llm-created') === 'true'
         if (isLlmCreated) {
            return {
                method: 'remove',
                parentSelector: getUniqueSelector(element.parentElement),
                nextSiblingSelector: element.nextElementSibling ? getUniqueSelector(element.nextElementSibling) : null,
                html: element.outerHTML
            }
         } else {
            return {
                method: 'hide',
                originalDisplay: (element as HTMLElement).style.display
            }
         }
      }
      return null
    case 'addElement':
      return null // Nothing to capture for add
    default:
      return null
  }
}

function getUniqueSelector(el: Element | null): string | null {
  if (!el) return null
  if (el.id) return `#${el.id}`
  // Fallback to simple tag + class if unique, or just tag
  // This is a simplified version.
  let selector = el.tagName.toLowerCase()
  if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(c => c.trim()).join('.')
      if (classes) selector += `.${classes}`
  }
  return selector
}

function triggerAnimation(element: HTMLElement, type: string) {
  // Add a temporary class or style to trigger animation
  // We can use Web Animations API
  
  const rect = element.getBoundingClientRect()
  
  // Create an overlay for the effect
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.left = `${rect.left}px`
  overlay.style.top = `${rect.top}px`
  overlay.style.width = `${rect.width}px`
  overlay.style.height = `${rect.height}px`
  overlay.style.pointerEvents = 'none'
  overlay.style.zIndex = '9999'
  
  if (type === 'glitch') {
      overlay.style.backgroundColor = EMERGENCY_COLOR
      overlay.style.opacity = '0.5'
      overlay.style.mixBlendMode = 'hard-light'
      // Simple glitch keyframes
      overlay.animate([
          { transform: 'translate(0,0)', opacity: 0.5 },
          { transform: 'translate(-5px, 2px)', opacity: 0.8 },
          { transform: 'translate(5px, -2px)', opacity: 0.5 },
          { transform: 'translate(0,0)', opacity: 0 }
      ], {
          duration: 300,
          iterations: 3
      }).onfinish = () => overlay.remove()
  } else if (type === 'flow') {
      overlay.style.border = `2px solid ${EMERGENCY_COLOR}`
      overlay.style.boxShadow = `0 0 10px ${EMERGENCY_COLOR}`
      overlay.animate([
          { opacity: 0, transform: 'scale(1)' },
          { opacity: 1, transform: 'scale(1.05)' },
          { opacity: 0, transform: 'scale(1.1)' }
      ], {
          duration: 1000,
          easing: 'ease-out'
      }).onfinish = () => overlay.remove()
  } else {
      // Pulse
      overlay.style.backgroundColor = EMERGENCY_COLOR
      overlay.animate([
          { opacity: 0 },
          { opacity: 0.3 },
          { opacity: 0 }
      ], {
          duration: 500
      }).onfinish = () => overlay.remove()
  }
  
  document.body.appendChild(overlay)
}
