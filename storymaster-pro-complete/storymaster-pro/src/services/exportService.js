// Export Service - Export stories to various formats

// Export to plain text
export const exportToTxt = (project) => {
  const { title, chapters, config } = project
  
  let content = `${title}\n`
  content += `${'='.repeat(title.length)}\n\n`
  
  if (config?.genre) {
    content += `Genre: ${config.genre}\n`
  }
  
  content += `\n${'='.repeat(50)}\n\n`
  
  chapters.forEach((chapter, index) => {
    content += `\n\nCHAPTER ${index + 1}\n`
    content += `${'-'.repeat(20)}\n\n`
    content += chapter.content
    content += `\n\n`
  })
  
  return content
}

// Export to RTF
export const exportToRtf = (project) => {
  const { title, chapters } = project
  
  let rtf = `{\\rtf1\\ansi\\deff0\n`
  rtf += `{\\fonttbl{\\f0 Times New Roman;}}\n`
  rtf += `{\\colortbl;\\red0\\green0\\blue0;}\n`
  
  // Title page
  rtf += `\\qc\\fs48\\b ${escapeRtf(title)}\\b0\\fs24\\par\\par\\par\n`
  rtf += `\\page\n`
  
  // Chapters
  chapters.forEach((chapter, index) => {
    rtf += `\\pard\\qc\\fs32\\b CHAPTER ${index + 1}\\b0\\fs24\\par\\par\n`
    rtf += `\\pard\\ql ${escapeRtf(chapter.content)}\\par\\par\\par\n`
    if (index < chapters.length - 1) {
      rtf += `\\page\n`
    }
  })
  
  rtf += `}`
  return rtf
}

// Helper function to escape RTF special characters
const escapeRtf = (text) => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\n/g, '\\par\n')
}

// Export to DOCX (using docx library approach - simplified HTML-based)
export const exportToDocx = async (project) => {
  const { title, chapters, config } = project
  
  // Create a simple HTML structure that can be converted to DOCX
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; }
    .title-page { text-align: center; margin-top: 200px; page-break-after: always; }
    .title { font-size: 36pt; font-weight: bold; margin-bottom: 20px; }
    .author { font-size: 18pt; margin-top: 40px; }
    .chapter-title { font-size: 24pt; font-weight: bold; text-align: center; margin: 40px 0 20px 0; page-break-before: always; }
    .chapter-content { font-size: 12pt; text-align: justify; text-indent: 2em; }
    p { margin: 1em 0; }
  </style>
</head>
<body>
  <div class="title-page">
    <h1 class="title">${escapeHtml(title)}</h1>
    ${config?.genre ? `<p class="author">A ${config.genre} Novel</p>` : ''}
  </div>
`
  
  chapters.forEach((chapter, index) => {
    html += `
  <div class="chapter">
    <h2 class="chapter-title">Chapter ${index + 1}</h2>
    <div class="chapter-content">
      ${escapeHtml(chapter.content).split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n')}
    </div>
  </div>
`
  })
  
  html += `
</body>
</html>`
  
  return html
}

// Helper function to escape HTML
const escapeHtml = (text) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Download file helper
export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Main export function
export const exportStory = async (project, format) => {
  const sanitizedTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  
  switch (format) {
    case 'txt':
      const txtContent = exportToTxt(project)
      downloadFile(txtContent, `${sanitizedTitle}.txt`, 'text/plain')
      break
      
    case 'rtf':
      const rtfContent = exportToRtf(project)
      downloadFile(rtfContent, `${sanitizedTitle}.rtf`, 'application/rtf')
      break
      
    case 'docx':
      const docxContent = await exportToDocx(project)
      downloadFile(docxContent, `${sanitizedTitle}.html`, 'text/html')
      // Note: This creates an HTML file that can be opened in Word and saved as DOCX
      // For true DOCX, we'd need a library like docx.js, but this works as a fallback
      break
      
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

