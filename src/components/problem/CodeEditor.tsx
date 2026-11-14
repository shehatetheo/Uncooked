"use client";
import { defaultKeymap, history, historyKeymap, indentLess, indentMore, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { sql, SQLite } from "@codemirror/lang-sql";
import { bracketMatching, HighlightStyle, indentOnInput, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { useEffect, useRef, useState } from "react";
import { KeyRow } from "./KeyRow";

// Syntax colours come from the design tokens only.
const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: "var(--color-second)" },
  { tag: [t.string, t.special(t.string)], color: "var(--color-accent)" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--color-ghost)" },
  { tag: [t.number, t.bool, t.null], color: "var(--color-text)" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.className, t.definition(t.variableName)], color: "var(--color-text)" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "var(--color-dim)" },
]);

interface Props {
  value: string;
  onChange: (v: string) => void;
  language: "python" | "sql";
  onRun?: () => void;
  onSubmit?: () => void;
  minHeight?: number;
  label: string;
}

export function CodeEditor({ value, onChange, language, onRun, onSubmit, minHeight = 280, label }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const [focused, setFocused] = useState(false);
  const cb = useRef({ onChange, onRun, onSubmit });
  cb.current = { onChange, onRun, onSubmit };

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
          keymap.of([
            { key: "Mod-Enter", run: () => (cb.current.onRun?.(), true) },
            { key: "Shift-Mod-Enter", run: () => (cb.current.onSubmit?.(), true) },
            indentWithTab,
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          EditorView.contentAttributes.of({ autocapitalize: "off", autocorrect: "off", autocomplete: "off", spellcheck: "false", "aria-label": label, "data-typing": "true" }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) cb.current.onChange(u.state.doc.toString());
            if (u.focusChanged) setFocused(u.view.hasFocus);
          }),
        ],
      }),
    });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // the editor owns its document after mount; external resets go through the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // external value changes (reset, load draft)
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value }, selection: { anchor: value.length } });
  }, [value]);

  const insert = (text: string) => {
    const v = view.current;
    if (!v) return;
    v.dispatch(v.state.replaceSelection(text));
  };
  const move = (dir: -1 | 1) => {
    const v = view.current;
    if (!v) return;
    const pos = Math.min(v.state.doc.length, Math.max(0, v.state.selection.main.head + dir));
    v.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
  };

  return (
    <>
      <div ref={host} style={{ minHeight }} className="h-full overflow-hidden bg-inset" data-testid="code-editor" />
      <KeyRow active={focused} onKey={insert} onIndent={() => view.current && indentMore(view.current)} onDedent={() => view.current && indentLess(view.current)} onMove={move} />
    </>
  );
}
