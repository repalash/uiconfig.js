// The playground's code editor: CodeMirror 6 with JavaScript support. Loaded on demand.
// Tab indents; Escape then Tab moves the focus out of the editor (CodeMirror's default for indentWithTab).
import {EditorState} from '@codemirror/state'
import {EditorView, drawSelection, highlightActiveLine, keymap, lineNumbers} from '@codemirror/view'
import {defaultKeymap, history, historyKeymap, indentWithTab} from '@codemirror/commands'
import {bracketMatching, HighlightStyle, indentOnInput, indentUnit, LanguageSupport, syntaxHighlighting} from '@codemirror/language'
import {closeBrackets, closeBracketsKeymap} from '@codemirror/autocomplete'
import {javascriptLanguage} from '@codemirror/lang-javascript'
import {tags as t} from '@lezer/highlight'

// the same colors as the static code samples (see .tk-* in styles.css)
const highlightStyle = HighlightStyle.define([
    {tag: [t.comment, t.lineComment, t.blockComment], class: 'tk-comment'},
    {tag: [t.string, t.special(t.string), t.regexp], class: 'tk-string'},
    {tag: [t.number, t.bool, t.null], class: 'tk-number'},
    {tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword, t.self], class: 'tk-keyword'},
    {tag: [t.propertyName, t.definition(t.propertyName)], class: 'tk-property'},
    {tag: [t.function(t.variableName), t.function(t.propertyName)], class: 'tk-call'},
    {tag: [t.className, t.typeName], class: 'tk-type'},
])

const theme = EditorView.theme({
    '&': {height: '100%', fontSize: 'var(--code-size)', backgroundColor: 'transparent', color: 'var(--ink)'},
    '.cm-scroller': {fontFamily: 'var(--font-code)', lineHeight: '1.6', overflow: 'auto'},
    '.cm-content': {caretColor: 'var(--accent)', padding: '14px 0'},
    '.cm-gutters': {backgroundColor: 'transparent', color: 'var(--ink-3)', border: 'none'},
    '.cm-activeLine': {backgroundColor: 'var(--line-active)'},
    '.cm-activeLineGutter': {backgroundColor: 'transparent', color: 'var(--ink-2)'},
    '&.cm-focused': {outline: 'none'},
    '&.cm-focused .cm-cursor': {borderLeftColor: 'var(--accent)'},
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {backgroundColor: 'var(--selection) !important'},
    '.cm-matchingBracket': {backgroundColor: 'var(--line-active)', outline: '1px solid var(--rule)'},
})

export interface CodeEditor {
    getValue(): string
    setValue(code: string): void
}

export function createEditor(parent: HTMLElement, doc: string, onChange: (code: string) => void, label: string): CodeEditor {
    const view = new EditorView({
        parent,
        state: EditorState.create({
            doc,
            extensions: [
                lineNumbers(),
                history(),
                drawSelection(),
                highlightActiveLine(),
                indentOnInput(),
                indentUnit.of('  '),
                EditorState.tabSize.of(2),
                bracketMatching(),
                closeBrackets(),
                // the JavaScript grammar without the completions and snippets of javascript()
                new LanguageSupport(javascriptLanguage),
                syntaxHighlighting(highlightStyle),
                keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
                EditorView.contentAttributes.of({'aria-label': label}),
                EditorView.updateListener.of(u => {
                    if (u.docChanged) onChange(u.state.doc.toString())
                }),
                theme,
            ],
        }),
    })
    return {
        getValue: () => view.state.doc.toString(),
        setValue: code => view.dispatch({changes: {from: 0, to: view.state.doc.length, insert: code}}),
    }
}
