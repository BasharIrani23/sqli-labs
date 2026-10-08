import React from 'react'

/**
 * SQL Syntax Highlighter and Payload Highlighter.
 * Tokenizes SQL query text and highlights keywords, strings, comments,
 * and specifically marks injected user payloads.
 */

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'UNION', 'ALL',
  'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'JOIN', 'LEFT', 'RIGHT',
  'INNER', 'OUTER', 'AS', 'IN', 'IS', 'NULL', 'LIKE', 'ILIKE',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'DROP',
  'CREATE', 'TABLE', 'ALTER', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'EXTRACTVALUE', 'UPDATEXML', 'SLEEP', 'BENCHMARK', 'IF', 'CONCAT',
  'SUBSTRING', 'SUBSTR', 'LENGTH', 'COUNT', 'FLOOR', 'RAND', 'VERSION',
  'DATABASE', 'USER', 'SYSTEM_USER', 'SESSION_USER', 'SCHEMA',
  'INFORMATION_SCHEMA', 'TABLES', 'COLUMNS', 'DUAL', 'TRUE', 'FALSE'
])

export function highlightSql(query, payloadText = null) {
  if (!query) return null

  // If there's an injected payload string to highlight specifically,
  // we find where it occurs in the query
  if (payloadText && payloadText.trim().length > 0 && query.includes(payloadText)) {
    const parts = query.split(payloadText)
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {tokenizeSql(part)}
            {index < parts.length - 1 && (
              <span className="sql-payload-highlight" title="Injected User Payload">
                {payloadText}
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    )
  }

  return tokenizeSql(query)
}

function tokenizeSql(text) {
  if (!text) return null

  // Regex matching comments (-- ... or /* ... */), single-quoted strings, double-quoted strings, numbers, and words
  const regex = /(--.*$|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|"(?:""|[^"])*"|\b\d+(?:\.\d+)?\b|[a-zA-Z_][a-zA-Z0-9_]*|[^\s\w'"]+)/gm

  const elements = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text preceding the match
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index))
    }

    const token = match[0]
    const upper = token.toUpperCase()

    if (token.startsWith('--') || token.startsWith('/*')) {
      elements.push(<span key={match.index} className="sql-comment">{token}</span>)
    } else if (token.startsWith("'") || token.startsWith('"')) {
      elements.push(<span key={match.index} className="sql-string">{token}</span>)
    } else if (/^\d+(?:\.\d+)?$/.test(token)) {
      elements.push(<span key={match.index} className="sql-number">{token}</span>)
    } else if (SQL_KEYWORDS.has(upper)) {
      elements.push(<span key={match.index} className="sql-keyword">{token}</span>)
    } else {
      elements.push(<span key={match.index} className="sql-ident">{token}</span>)
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex))
  }

  return elements
}
