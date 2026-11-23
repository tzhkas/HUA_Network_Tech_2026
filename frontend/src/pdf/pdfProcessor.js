import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

/**
 * Loads a PDF file and returns its PDF.js document.
 */
export async function loadPdfDocument(file) {
  if (!(file instanceof File)) {
    throw new Error('A valid PDF file is required.')
  }

  if (file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('The selected file is not a PDF.')
  }

  const data = await file.arrayBuffer()

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(data)
  })

  return await loadingTask.promise
}

/**
 * Returns basic information about a PDF document.
 */
export function getPdfInfo(pdfDocument) {
  return {
    totalPages: pdfDocument.numPages,
    title: pdfDocument.getMetadata
      ? undefined
      : undefined
  }
}

/**
 * Renders one PDF page as a small JPEG thumbnail.
 */
export async function renderThumbnail(
  pdfDocument,
  pageNumber,
  maxWidth = 180
) {
  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    pageNumber > pdfDocument.numPages
  ) {
    throw new Error('Invalid PDF page number.')
  }

  const page = await pdfDocument.getPage(pageNumber)
  const originalViewport = page.getViewport({ scale: 1 })

  const scale = Math.min(1, maxWidth / originalViewport.width)
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Could not create canvas context.')
  }

  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)

  await page.render({
    canvasContext: context,
    viewport
  }).promise

  const thumbnail = canvas.toDataURL('image/jpeg', 0.75)

  canvas.width = 0
  canvas.height = 0

  return {
    pageNumber,
    width: Math.ceil(viewport.width),
    height: Math.ceil(viewport.height),
    thumbnail
  }
}

/**
 * Renders all PDF pages sequentially and reports progress.
 */
export async function generateThumbnails(
  pdfDocument,
  onProgress = () => {},
  maxWidth = 180
) {
  const thumbnails = []

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
    const result = await renderThumbnail(
      pdfDocument,
      pageNumber,
      maxWidth
    )

    thumbnails.push(result)

    onProgress({
      completed: pageNumber,
      total: pdfDocument.numPages
    })
  }

  return thumbnails
}
