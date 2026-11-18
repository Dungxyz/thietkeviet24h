import React from 'react';

interface MarkdownContentProps {
  content: string;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 text-[13px] font-mono bg-slate-100 text-slate-800 rounded border border-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre
          key={`code-${i}`}
          className="my-4 p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${i}`} className="font-display text-xl font-semibold text-slate-900 mt-6 mb-3 first:mt-0">
          {renderInline(line.slice(3))}
        </h2>,
      );
      i += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${i}`} className="font-display text-base font-semibold text-slate-900 mt-5 mb-2">
          {renderInline(line.slice(4))}
        </h3>,
      );
      i += 1;
      continue;
    }

    if (line.trim().startsWith('- ')) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        listItems.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-3 space-y-2 list-disc pl-5 text-slate-700 leading-relaxed">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      const orderedItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        orderedItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i += 1;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="my-3 space-y-2 list-decimal pl-5 text-slate-700 leading-relaxed">
          {orderedItems.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    blocks.push(
      <p key={`p-${i}`} className="my-3 text-slate-700 leading-relaxed text-[15px]">
        {renderInline(line)}
      </p>,
    );
    i += 1;
  }

  return <div className="max-w-[72ch]">{blocks}</div>;
}
