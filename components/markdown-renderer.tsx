"use client"

import type { JSX } from "react"

// Very small Markdown renderer covering the app needs:
// - #, ##, ### headers
// - bullet and numbered lists (-, *, •, 1. 2. ...)
// - paragraphs with **bold**, *italic*, _italic_, and `code` inline
// - simple links [text](url)
export function parseMarkdownToJSX(markdown: string): JSX.Element[] {
  if (typeof markdown !== "string") {
  console.error("MarkdownRenderer: content is not a string:", markdown);
  return [];
}


  const lines = markdown.split("\n")
  const elements: JSX.Element[] = []
  let listBuffer: string[] = []
  let listType: "ul" | "ol" | null = null

  const flushList = () => {
    if (listBuffer.length === 0) return
    if (listType === "ol") {
      elements.push(
        <ol
          key={`ol-${elements.length}`}
          className="list-decimal list-inside space-y-1 mb-3 pl-4 text-sm text-foreground"
        >
          {listBuffer.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>,
      )
    } else {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 mb-3 pl-4 text-sm text-foreground">
          {listBuffer.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      )
    }
    listBuffer = []
    listType = null
  }

  const renderInline = (text: string): (string | JSX.Element)[] => {
    // Break on links first: [text](url)
    const linkRegex = /\[([^\]]+)\]$$(https?:\/\/[^\s)]+)$$/g
    const partsWithLinks: Array<string | { link: { label: string; href: string } }> = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) partsWithLinks.push(text.slice(lastIndex, match.index))
      partsWithLinks.push({ link: { label: match[1], href: match[2] } })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) partsWithLinks.push(text.slice(lastIndex))

    const renderItalicsAndBold = (segment: string) => {
      // Support **bold**, *italic*, _italic_, and `code`
      const inlineRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g
      const chunks = segment.split(inlineRegex)
      return chunks.map((chunk, i) => {
        if (!chunk) return null
        if (chunk.startsWith("**") && chunk.endsWith("**")) return <strong key={i}>{chunk.slice(2, -2)}</strong>
        if ((chunk.startsWith("*") && chunk.endsWith("*")) || (chunk.startsWith("_") && chunk.endsWith("_"))) {
          return <em key={i}>{chunk.slice(1, -1)}</em>
        }
        if (chunk.startsWith("`") && chunk.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-muted px-1 py-0.5 text-xs">
              {chunk.slice(1, -1)}
            </code>
          )
        }
        return <span key={i}>{chunk}</span>
      })
    }

    return partsWithLinks.map((p, idx) => {
      if (typeof p === "string") return <span key={idx}>{renderItalicsAndBold(p)}</span>
      return (
        <a
          key={idx}
          href={p.link.href}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-primary/40 underline-offset-2 hover:decoration-primary text-foreground"
        >
          {p.link.label}
        </a>
      )
    })
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() ?? ""
    if (!line) {
      flushList()
      continue
    }

    if (line.startsWith("# ")) {
      flushList()
      elements.push(
        <h1 key={`h1-${i}`} className="text-lg font-semibold text-foreground mb-2">
          {line.slice(2)}
        </h1>,
      )
      continue
    }
    if (line.startsWith("## ")) {
      flushList()
      elements.push(
        <h2 key={`h2-${i}`} className="text-base font-semibold text-foreground mb-2">
          {line.slice(3)}
        </h2>,
      )
      continue
    }
    if (line.startsWith("### ")) {
      flushList()
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-semibold text-foreground mb-1">
          {line.slice(4)}
        </h3>,
      )
      continue
    }

    // Lists
    if (line.match(/^\d+\.\s+/)) {
      if (listType !== "ol") {
        flushList()
        listType = "ol"
      }
      listBuffer.push(line.replace(/^\d+\.\s+/, ""))
      continue
    }
    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      if (listType !== "ul") {
        flushList()
        listType = "ul"
      }
      listBuffer.push(line.slice(2))
      continue
    }

    // Paragraph
    flushList()
    elements.push(
      <p key={`p-${i}`} className="text-sm text-muted-foreground leading-relaxed mb-2">
        {renderInline(line)}
      </p>,
    )
  }

  flushList()
  return elements
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return <div className="space-y-1">{parseMarkdownToJSX(content)}</div>
}
