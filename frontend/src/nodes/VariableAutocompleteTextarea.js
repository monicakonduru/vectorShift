import { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { shallow } from 'zustand/shallow';
import { useStore } from '../store';
import { collectAvailableVariables } from '../pipeline/variableEdges';
import { parseTemplateVariables } from './parseTemplateVariables';
import { fieldInputStyle } from './nodeTheme';
import {
  VAR_PILL_CLASS,
  formatVariable,
  serializeFromEditor,
  getCaretSerializedOffset,
  renderEditorContent,
  placeCaretAfterNode,
  placeCaretAtEnd,
} from './templateEditor';

const PARTIAL_VAR_PATTERN = /^[\s]*([a-zA-Z_$][a-zA-Z0-9_$]*)?[\s]*$/;

export const getTemplateContext = (text, cursorPos) => {
  const before = text.slice(0, cursorPos);
  const openIdx = before.lastIndexOf('{{');
  if (openIdx === -1) return null;

  const afterOpen = before.slice(openIdx + 2);
  if (afterOpen.includes('}}')) return null;
  if (!PARTIAL_VAR_PATTERN.test(afterOpen)) return null;

  const prefixMatch = afterOpen.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/);
  const prefix = prefixMatch?.[0] ?? '';

  return { openIdx, replaceStart: openIdx + 2, prefix };
};

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: '2px',
  maxHeight: '120px',
  overflowY: 'auto',
  background: '#1e293b',
  border: '1px solid #475569',
  borderRadius: '4px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
  zIndex: 20,
  listStyle: 'none',
  padding: '2px 0',
};

const optionStyle = (active) => ({
  padding: '4px 8px',
  fontSize: '12px',
  cursor: 'pointer',
  background: active ? '#334155' : 'transparent',
  color: '#f1f5f9',
});

const emptyStyle = {
  padding: '6px 8px',
  fontSize: '11px',
  color: '#94a3b8',
  fontStyle: 'italic',
};

const editorStyle = {
  ...fieldInputStyle,
  resize: 'none',
  overflow: 'hidden',
  minHeight: '28px',
  lineHeight: '20px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  outline: 'none',
};

const selectVariables = (state) => collectAvailableVariables(state.nodes);

const findAdjacentPill = () => {
  const selection = window.getSelection();
  if (!selection?.anchorNode) return null;

  const anchor = selection.anchorNode;
  if (anchor.nodeType === Node.ELEMENT_NODE && anchor.classList?.contains(VAR_PILL_CLASS)) {
    return anchor;
  }
  return anchor.parentElement?.closest?.(`.${VAR_PILL_CLASS}`) ?? null;
};

export const VariableAutocompleteTextarea = ({ field, value, onChange }) => {
  const editorRef = useRef(null);
  const skipSyncRef = useRef(false);
  const variables = useStore(selectVariables, shallow);
  const [menu, setMenu] = useState(null);

  const resize = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const emitChange = useCallback(
    (nextValue) => {
      skipSyncRef.current = true;
      onChange(nextValue);
    },
    [onChange]
  );

  const insertVariable = useCallback(
    (varName) => {
      const el = editorRef.current;
      if (!el) return;

      const serialized = serializeFromEditor(el);
      const cursorPos = getCaretSerializedOffset(el);
      const ctx = getTemplateContext(serialized, cursorPos);
      if (!ctx) return;

      const before = serialized.slice(0, ctx.openIdx);
      const after = serialized.slice(cursorPos);
      const nextValue = before + formatVariable(varName) + after;

      emitChange(nextValue);
      setMenu(null);

      requestAnimationFrame(() => {
        renderEditorContent(el, nextValue);
        resize();

        const pills = el.querySelectorAll(`.${VAR_PILL_CLASS}`);
        const pill = pills[pills.length - 1];
        if (pill) {
          if (!pill.nextSibling) {
            el.appendChild(document.createTextNode('\u00a0'));
          }
          placeCaretAfterNode(pill);
        } else {
          placeCaretAtEnd(el);
        }

        el.focus();
      });
    },
    [emitChange, resize]
  );

  const refreshMenu = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;

    const serialized = serializeFromEditor(el);
    const cursorPos = getCaretSerializedOffset(el);
    const ctx = getTemplateContext(serialized, cursorPos);

    if (!ctx) {
      setMenu(null);
      return;
    }

    const filtered = variables.filter((name) => name.startsWith(ctx.prefix));

    // Single match: commit as soon as {{ is opened or the name is fully typed — no Enter/click.
    if (filtered.length === 1) {
      const only = filtered[0];
      if (ctx.prefix === '' || ctx.prefix === only) {
        queueMicrotask(() => insertVariable(only));
        return;
      }
    }

    setMenu({
      prefix: ctx.prefix,
      options: filtered,
      activeIndex: 0,
    });
  }, [variables, insertVariable]);

  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      resize();
      return;
    }

    const current = serializeFromEditor(el);
    if (current !== value) {
      renderEditorContent(el, value);
    }
    resize();
  }, [value, resize]);

  const removePill = (pill) => {
    pill.remove();
    emitChange(serializeFromEditor(editorRef.current));
    requestAnimationFrame(() => {
      editorRef.current?.focus();
      resize();
    });
  };

  const normalizeEditor = useCallback(() => {
    const el = editorRef.current;
    if (!el) return '';

    let serialized = serializeFromEditor(el);
    const caret = getCaretSerializedOffset(el);

    if (!getTemplateContext(serialized, caret)) {
      const variableCount = parseTemplateVariables(serialized).length;
      const pillCount = el.querySelectorAll(`.${VAR_PILL_CLASS}`).length;
      if (variableCount > pillCount) {
        renderEditorContent(el, serialized);
        serialized = serializeFromEditor(el);
        placeCaretAtEnd(el);
      }
    }

    return serialized;
  }, []);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    const serialized = normalizeEditor();
    emitChange(serialized);
    refreshMenu();
  };

  const handleBlur = () => {
    const el = editorRef.current;
    if (!el) return;
    const serialized = normalizeEditor();
    emitChange(serialized);
    setMenu(null);
  };

  const handleEditorClick = (e) => {
    const pill = e.target.closest(`.${VAR_PILL_CLASS}`);
    if (pill) {
      e.preventDefault();
      e.stopPropagation();
      removePill(pill);
      return;
    }
    refreshMenu();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const pill = findAdjacentPill();
      if (pill) {
        e.preventDefault();
        removePill(pill);
        return;
      }
    }

    if (!menu) return;

    if (e.key === 'ArrowDown' && menu.options.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      setMenu((prev) => ({
        ...prev,
        activeIndex: Math.min(prev.activeIndex + 1, prev.options.length - 1),
      }));
      return;
    }

    if (e.key === 'ArrowUp' && menu.options.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      setMenu((prev) => ({
        ...prev,
        activeIndex: Math.max(prev.activeIndex - 1, 0),
      }));
      return;
    }

    if ((e.key === 'Enter' || e.key === 'Tab') && menu.options.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      insertVariable(menu.options[menu.activeIndex]);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setMenu(null);
    }
  };

  const showMenu = menu !== null;
  const hasOptions = menu?.options?.length > 0;

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={editorRef}
        className="nodrag template-text-editor"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={handleInput}
        onBlur={handleBlur}
        onClick={handleEditorClick}
        onKeyUp={refreshMenu}
        onKeyDown={handleKeyDown}
        data-empty={!value}
        style={editorStyle}
      />
      {showMenu && (
        <ul
          className="nodrag"
          style={dropdownStyle}
          role="listbox"
          onMouseDown={(e) => e.preventDefault()}
        >
          {hasOptions ? (
            menu.options.map((name, index) => (
              <li
                key={name}
                role="option"
                aria-selected={index === menu.activeIndex}
                style={optionStyle(index === menu.activeIndex)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  insertVariable(name);
                }}
              >
                {name}
              </li>
            ))
          ) : (
            <li style={emptyStyle}>No variables — add an Input node</li>
          )}
        </ul>
      )}
    </div>
  );
};
