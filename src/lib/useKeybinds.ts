// candidate for @vueuse/core - useKeybinds

import { useEventListener, type Arrayable } from '@vueuse/core'

const COMBINATION_SEPARATOR = '_'
const SEQUENCE_SEPARATOR = '-'
const SEQUENCE_DELAY_MS_DEFAULT = 300

type KeybindHandler = () => void
type KeybindsDef = { [key in string]?: KeybindHandler }

interface KeybindNode {
  handler?: () => void
  // combined key code to next keybind
  next?: { [key in string]?: KeybindNode }
}

type KeybindNext = Exclude<KeybindNode['next'], undefined>

/**
 * Build prefix tree (trie) from key code notation.
 * Note that this only handles sequence separator and is independent of key codes.
 */
export function buildKeybindTree(keybinds: KeybindsDef): KeybindNext {
  const tree: KeybindNext = {}

  for (const [keyCodeCombined, handler] of Object.entries(keybinds)) {
    const keybindSequence = keyCodeCombined.split(SEQUENCE_SEPARATOR)

    let currentNode = tree

    for (const [index, keybind] of keybindSequence.entries()) {
      if (!currentNode[keybind]) {
        currentNode[keybind] = {}
      }

      if (index + 1 === keybindSequence.length) {
        currentNode[keybind].handler = handler
      }
      else {
        if (!currentNode[keybind].next) {
          currentNode[keybind].next = {}
        }

        currentNode = currentNode[keybind].next
      }
    }
  }

  return tree
}

function isHTMLElement(target: unknown): target is HTMLElement {
  return (typeof target === 'object' && !!target && 'tagName' in target && !!target.tagName)
}

type IncludeElement = (e: KeyboardEvent) => boolean

const defaultIncludeEvent: IncludeElement = (e) => {
  const target = e.target

  if (!isHTMLElement(target)) {
    return true
  }

  if (
    ['BUTTON', 'INPUT', 'TEXTAREA'].includes(target.tagName)
    || ['plaintext-only', 'true'].includes(target.contentEditable)
  ) {
    return false
  }

  return true
}

type GetKeyCode = (e: KeyboardEvent) => string

const defaultGetKeyCode: GetKeyCode = (e) => {
  return e.code
}

type GetKeyCodeWithModifiers = (e: KeyboardEvent) => string

function createDefaultGetKeyCodeWithModifiers(deps: { getKeyCode: GetKeyCode }): GetKeyCodeWithModifiers {
  return (e: KeyboardEvent): string => {
    const keyParts: string[] = []

    if (e.altKey && e.key !== 'Alt')
      keyParts.push('alt')
    if (e.ctrlKey && e.key !== 'Control')
      keyParts.push('ctrl')
    if (e.metaKey && e.key !== 'Meta')
      keyParts.push('meta')
    if (e.shiftKey && e.key !== 'Shift')
      keyParts.push('shift')

    keyParts.push(deps.getKeyCode(e))

    return keyParts.join(COMBINATION_SEPARATOR)
  }
}

export interface UseKeybindsHandlerOptions {
  /**
   * Max delay between key events to consider them as a sequence.
   */
  sequenceDelayMs?: number
  /**
   * Custom implementation for key with modifiers.
   *
   * Default is [alt_][ctrl_][meta_][shift_]<keyCode>.
   * E.g. alt_meta_KeyG
   */
  getKeyCodeWithModifiers?: GetKeyCodeWithModifiers
  /**
   * Custom getter for key code.
   *
   * Will be used only if `getKeyCodeWithModifiers` is not provided.
   * Defaults to `event.code`.
   */
  getKeyCode?: GetKeyCode
  /**
   * Custom filter for events.
   *
   * Defaults to function, that excludes events from input and content editable fields.
   */
  includeEvent?: IncludeElement
}

type KeybindsEventHandler = (e: KeyboardEvent) => void

export function useKeybindsEventHandler(
  keybinds: KeybindsDef,
  {
    sequenceDelayMs = SEQUENCE_DELAY_MS_DEFAULT,
    getKeyCodeWithModifiers: getKeyCodeWithModifiersOption,
    getKeyCode = defaultGetKeyCode,
    includeEvent = defaultIncludeEvent,
  }: UseKeybindsHandlerOptions,
): KeybindsEventHandler {
  const keybindTree = buildKeybindTree(keybinds)
  const getKeyCodeCombined = getKeyCodeWithModifiersOption ?? createDefaultGetKeyCodeWithModifiers({ getKeyCode })

  let keybindState: KeybindNext = keybindTree
  let timeoutRef: ReturnType<typeof setTimeout> | undefined

  const keybindsEventHandler = (e: KeyboardEvent) => {
    const keyCodeCombined = getKeyCodeCombined(e)
    const isIncluded = includeEvent(e)
    const match = isIncluded ? keybindState[keyCodeCombined] : undefined

    if (match) {
      clearTimeout(timeoutRef)

      if (match.next) {
        keybindState = match.next

        timeoutRef = setTimeout(() => {
          keybindState = keybindTree
          match.handler?.()
        }, sequenceDelayMs)
      }
      else {
        match.handler?.()
        keybindState = keybindTree
      }
    }
    else {
      keybindState = keybindTree
    }
  }

  return keybindsEventHandler
}

export interface UseKeybindsOptions extends UseKeybindsHandlerOptions {
  target?: MaybeRefOrGetter<Arrayable<EventTarget> | null | undefined>
  event?: MaybeRefOrGetter<Arrayable<'keydown' | 'keypress' | 'keyup'>>
}

export function useKeybinds(
  keybinds: KeybindsDef,
  {
    target = window,
    event = 'keydown',
    ...options
  }: UseKeybindsOptions = {},
) {
  const keybindsEventHandler = useKeybindsEventHandler(keybinds, options)
  return useEventListener(target, event, keybindsEventHandler, true)
}

// debug

const getInterestingStuff = (e: KeyboardEvent) => {
  return {
    altKey: e.altKey,
    code: e.code,
    ctrlKey: e.ctrlKey,
    key: e.key,
    metaKey: e.metaKey,
    shiftKey: e.shiftKey,
  }
}
