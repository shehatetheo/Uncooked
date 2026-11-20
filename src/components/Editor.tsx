"use client";
import { defaultKeymap, history, historyKeymap, indentLess, indentMore, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { sql, SQLite } from "@codemirror/lang-sql";
import { bracketMatching, HighlightStyle, indentOnInput, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState } from "@codemirror/state";
import { drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { useEffect, useRef, useState } from "react";

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: "var(--color-accent)" },
  { tag: [t.string, t.special(t.string)], color: "#a8c99a" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--color-faint)", fontStyle: "italic" },
  { tag: [t.number, t.bool, t.null], color: "#d6a77a" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "var(--color-dim)" },
]);

interface Props {
  value: string;
  onChange: (v: string) => void;
  language: "python" | "sql";
  readOnly?: boolean;
  onRun?: () => void;
  onSubmit?: () => void;
  /** 1-based line the cursor is on. */
  onCursorLine?: (line: number) => void;
  onFocus?: (focused: boolean) => void;
}

const KEYS = ["(", ")", "[", "]", "{", "}", ":", "=", '"', "'"];

/** CodeMirror 6, with phone-friendly input settings and a symbol key row. */
export function Editor({ value, onChange, language, readOnly = false, onRun, onSubmit, onCursorLine, onFocus }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const lock = useRef(new Compartment());
  const [focused, setFocused] = useState(false);
  const cb = useRef({ onChange, onRun, onSubmit, onCursorLine, onFocus });
  cb.current = { onChange, onRun, onSubmit, onCursorLine, onFocus };

  useEffect(() => {
    if (!host.current) return;
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        selection: { anchor: value.length },
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          indentUnit.of("    "),
          EditorState.tabSize.of(4),
          language === "python" ? python() : sql({ dialect: SQLite, upperCaseKeywords: true }),
          syntaxHighlighting(highlight),
          lock.current.of([EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]),
          keymap.of([{ key: "Mod-Enter", run: () => (cb.current.onRun?.(), true) }, { key: "Shift-Mod-Enter", run: () => (cb.current.onSubmit?.(), true) }, indentWithTab, ...defaultKeymap, ...historyKeymap]),
          // phones: no autocorrect, no auto-capitals, no suggestions
          EditorView.contentAttributes.of({ autocapitalize: "off", autocorrect: "off", autocomplete: "off", spellcheck: "false", "aria-label": "Code editor", "data-typing": "true" }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) cb.current.onChange(u.state.doc.toString());
            if (u.focusChanged) {
              setFocused(u.view.hasFocus);
              cb.current.onFocus?.(u.view.hasFocus);
            }
            if (u.selectionSet || u.docChanged) cb.current.onCursorLine?.(u.state.doc.lineAt(u.state.selection.main.head).number);
          }),
        ],
      }),
    });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // the editor owns its document after mount; outside changes go through the effects below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value }, selection: { anchor: value.length } });
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: lock.current.reconfigure([EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]) });
  }, [readOnly]);

  return (
    <>
      <div ref={host} className="h-full min-h-0 overflow-hidden" data-testid="editor" />
      <KeyRow active={focused && !readOnly} onKey={(text) => view.current?.dispatch(view.current.state.replaceSelection(text))} onIndent={() => view.current && indentMore(view.current)} onDedent={() => view.current && indentLess(view.current)} onDone={() => view.current?.contentDOM.blur()} />
    </>
  );
}

/**
 * Symbol row pinned above the on-screen keyboard, on touch devices only.
 * Buttons use pointerdown + preventDefault so the editor keeps focus.
 */
function KeyRow({ active, onKey, onIndent, onDedent, onDone }: { active: boolean; onKey: (ch: string) => void; onIndent: () => void; onDedent: () => void; onDone: () => void }) {
  const [bottom, setBottom] = useState(0);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    const vv = window.visualViewport;
    if (!vv) return;
    const place = () => setBottom(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    place();
    vv.addEventListener("resize", place);
    vv.addEventListener("scroll", place);
    return () => {
      vv.removeEventListener("resize", place);
      vv.removeEventListener("scroll", place);
    };
  }, []);

  if (!active || !touch) return null;
  const press = (fn: () => void) => (e: React.PointerEvent) => {
    e.preventDefault();
    fn();
  };
  const cls = "flex h-11 min-w-10 shrink-0 items-center justify-center border-r border-line px-2 font-mono text-base active:bg-hover";
  return (
    // above the keyboard when it's up; otherwise just above the Run and Submit bar
    <div className="fixed inset-x-0 z-50 flex overflow-x-auto border-t border-line-strong bg-panel" style={{ bottom: bottom > 0 ? bottom : "calc(env(safe-area-inset-bottom) + 3.6rem)" }} data-testid="key-row">
      <button type="button" className={cls} onPointerDown={press(onIndent)} aria-label="Tab (indent)">tab</button>
      <button type="button" className={cls} onPointerDown={press(onDedent)} aria-label="Remove indent">⇤</button>
      {KEYS.map((k) => (
        <button type="button" key={k} className={cls} onPointerDown={press(() => onKey(k))}>{k}</button>
      ))}
      <button type="button" className={`${cls} text-accent`} onPointerDown={press(onDone)} aria-label="Close the keyboard">done</button>
    </div>
  );
}
