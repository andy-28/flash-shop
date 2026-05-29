interface RichTextDisplayProps {
  html: string;
}

export function RichTextDisplay({ html }: Readonly<RichTextDisplayProps>) {
  if (!html) {
    return null;
  }

  return <div className="rich-text-display text-sm leading-7 text-zinc-300" dangerouslySetInnerHTML={{ __html: html }} />;
}
