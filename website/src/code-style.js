// One highlighter for every piece of code on the page: the build highlights the static samples with it
// (scripts/highlight.mjs) and the playground editor uses it through CodeMirror. Token classes are .tk-*
// in styles.css, with a light and a dark set of colors.
import {styleTags, tagHighlighter, tags as t} from '@lezer/highlight'

/** Extra tags for the JavaScript grammar: decorator names (`@uiSlider`) get their own color. */
export const decoratorTags = styleTags({
    'Decorator/VariableName Decorator/CallExpression/VariableName': t.macroName,
    'Decorator/MemberExpression/PropertyName Decorator/CallExpression/MemberExpression/PropertyName': t.macroName,
})

export const tokenHighlighter = tagHighlighter([
    {tag: [t.comment, t.lineComment, t.blockComment], class: 'tk-comment'},
    {tag: [t.string, t.special(t.string), t.regexp, t.escape], class: 'tk-string'},
    {tag: [t.number, t.bool, t.null, t.atom], class: 'tk-number'},
    {tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword, t.modifier, t.self], class: 'tk-keyword'},
    {tag: [t.propertyName, t.definition(t.propertyName)], class: 'tk-property'},
    {tag: [t.function(t.variableName), t.function(t.propertyName), t.function(t.definition(t.variableName))], class: 'tk-call'},
    {tag: [t.typeName, t.className, t.definition(t.className), t.definition(t.typeName)], class: 'tk-type'},
    {tag: [t.macroName, t.meta], class: 'tk-decorator'},
    {tag: [t.definition(t.variableName)], class: 'tk-def'},
    {tag: [t.paren, t.squareBracket, t.brace, t.separator, t.punctuation, t.derefOperator], class: 'tk-punct'},
])
