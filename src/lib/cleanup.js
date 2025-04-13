export default function cleanMarkdown(markdown) {
    return markdown
      .replace(/^## /gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[*`#>]/g, '')
      .replace(/\n{2,}/g, '\n\n')
      .trim();
  }
  