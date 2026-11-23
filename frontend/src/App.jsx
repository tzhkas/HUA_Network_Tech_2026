import { useRef, useState } from 'react'
import {
  loadPdfDocument,
  getPdfInfo,
  generateThumbnails
} from './pdf/pdfProcessor'
import './App.css'

export default function App() {
  const [page, setPage] = useState('server')
  const [wizardStep, setWizardStep] = useState(1)
  const [deviceCount, setDeviceCount] = useState(2)

  const [pdfDocument, setPdfDocument] = useState(null)
  const [pdfName, setPdfName] = useState('')
  const [pdfInfo, setPdfInfo] = useState(null)
  const [thumbnails, setThumbnails] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [startPage, setStartPage] = useState(1)
  const [endPage, setEndPage] = useState(1)

  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!file) return

    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      setError('Please select a valid PDF document.')
      return
    }

    if (file.size === 0) {
      setError('The selected file is empty.')
      return
    }

    setError('')
    setLoading(true)
    setProgress(0)
    setThumbnails([])
    setPdfInfo(null)
    setWizardStep(1)

    if (pdfDocument) {
      await pdfDocument.destroy()
      setPdfDocument(null)
    }

    try {
      const document = await loadPdfDocument(file)
      const info = getPdfInfo(document)

      setPdfDocument(document)
      setPdfName(file.name)
      setPdfInfo(info)
      setStartPage(1)
      setEndPage(info.totalPages)

      const images = await generateThumbnails(
        document,
        ({ completed, total }) => {
          setProgress(Math.round((completed / total) * 100))
        },
        160
      )

      setThumbnails(images)
    } catch (err) {
      console.error('PDF processing error:', err)
      setError(err.message || 'Could not process this PDF.')
      setPdfDocument(null)
      setPdfInfo(null)
    } finally {
      setLoading(false)
    }
  }

  async function removePdf() {
    if (pdfDocument) {
      await pdfDocument.destroy()
    }

    setPdfDocument(null)
    setPdfName('')
    setPdfInfo(null)
    setThumbnails([])
    setProgress(0)
    setStartPage(1)
    setEndPage(1)
    setWizardStep(1)
    setError('')

    if (inputRef.current) inputRef.current.value = ''
  }

  function updateStart(value) {
    const number = Number(value)
    if (!pdfInfo || !Number.isInteger(number)) return
    setStartPage(Math.max(1, Math.min(number, endPage)))
  }

  function updateEnd(value) {
    const number = Number(value)
    if (!pdfInfo || !Number.isInteger(number)) return
    setEndPage(Math.min(pdfInfo.totalPages, Math.max(number, startPage)))
  }

  const selectedPages = pdfInfo
    ? endPage - startPage + 1
    : 0

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">L</div>
          <div>
            <h2>LEGO<span>Link</span></h2>
            <small>INSTRUCTION SYSTEM</small>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <button
          className={page === 'server' ? 'nav active' : 'nav'}
          onClick={() => setPage('server')}
        >
          ▦ &nbsp; Server Dashboard
        </button>

        <button
          className={page === 'client' ? 'nav active' : 'nav'}
          onClick={() => setPage('client')}
        >
          ▣ &nbsp; Client Interface
        </button>

        <div className="sidebar-footer">
          <span className="dot" /> Backend offline
          <small>LEGO-DP · Version 1.0</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span>
            Workspace / {page === 'server' ? 'Server' : 'Client'}
          </span>
          <span className="dev">DEVELOPMENT</span>
        </header>

        <div className="content">
          {page === 'server' ? (
            <>
              <div className="heading">
                <div>
                  <span className="eyebrow">SERVER CONTROL CENTER</span>
                  <h1>Server Dashboard</h1>
                  <p>Manage LEGO instruction distribution and connected devices.</p>
                </div>
                <span className="badge">● Offline</span>
              </div>

              {pdfInfo && (
                <div className="wizard-progress">
                  {[
                    ['1', 'PDF & Pages'],
                    ['2', 'Devices'],
                    ['3', 'Assignment']
                  ].map(([number, label]) => (
                    <div
                      key={number}
                      className={`wizard-step ${
                        wizardStep === Number(number) ? 'current' :
                        wizardStep > Number(number) ? 'completed' : ''
                      }`}
                    >
                      <span>{number}</span>
                      <strong>{label}</strong>
                    </div>
                  ))}
                </div>
              )}

              {wizardStep === 1 && (
                <>
                  <div className="stats">
                    {[
                      ['Connected devices', '0', 'Currently connected clients'],
                      ['Active sessions', '0', 'Running sessions'],
                      ['PDF documents', pdfInfo ? '1' : '0', 'Available instruction files'],
                      ['Data transferred', '0 MB', 'Total transfer volume']
                    ].map(([label, value, detail]) => (
                      <div className="stat" key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                        <small>{detail}</small>
                      </div>
                    ))}
                  </div>

                  <section className="panel">
                    <h3>Instruction Library</h3>
                    <p>Upload a LEGO instruction PDF to prepare a distribution session.</p>

                    <input
                      ref={inputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      hidden
                      onChange={event => {
                        handleFile(event.target.files[0])
                        event.target.value = ''
                      }}
                    />

                    {!pdfInfo && !loading && (
                      <div
                        className="upload"
                        onDragOver={event => event.preventDefault()}
                        onDrop={event => {
                          event.preventDefault()
                          handleFile(event.dataTransfer.files[0])
                        }}
                      >
                        <div className="upload-symbol">↑</div>
                        <h3>Drop your PDF here</h3>
                        <p>or select a file from your computer</p>
                        <button
                          className="upload-button"
                          onClick={() => inputRef.current?.click()}
                        >
                          Choose PDF
                        </button>
                        <small className="file-hint">PDF documents only</small>
                      </div>
                    )}

                    {loading && (
                      <div className="processing">
                        <div className="processing-spinner" />
                        <h3>Processing PDF</h3>
                        <p>Generating page thumbnails...</p>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <strong>{progress}%</strong>
                      </div>
                    )}

                    {pdfInfo && !loading && (
                      <div className="pdf-workspace">
                        <div className="pdf-file-header">
                          <div>
                            <strong>{pdfName}</strong>
                            <p>{pdfInfo.totalPages} pages · PDF processed</p>
                          </div>
                          <button className="remove-button" onClick={removePdf}>
                            Remove PDF
                          </button>
                        </div>

                        <div className="pdf-summary">
                          <div>
                            <span>Total pages</span>
                            <strong>{pdfInfo.totalPages}</strong>
                          </div>
                          <div>
                            <span>Selected pages</span>
                            <strong>{selectedPages}</strong>
                          </div>
                          <div>
                            <span>Processing</span>
                            <strong className="success-text">Complete</strong>
                          </div>
                        </div>

                        <div className="range-section">
                          <div>
                            <h3>Page Range Selection</h3>
                            <p>Choose the pages available for distribution.</p>
                          </div>

                          <div className="range-inputs">
                            <label>
                              Start page
                              <input
                                type="number"
                                min="1"
                                max={endPage}
                                value={startPage}
                                onChange={event => updateStart(event.target.value)}
                              />
                            </label>
                            <label>
                              End page
                              <input
                                type="number"
                                min={startPage}
                                max={pdfInfo.totalPages}
                                value={endPage}
                                onChange={event => updateEnd(event.target.value)}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="thumbnail-heading">
                          <h3>PDF Pages</h3>
                          <span>{thumbnails.length} thumbnails</span>
                        </div>

                        <div className="thumbnail-grid">
                          {thumbnails.map(item => {
                            const selected =
                              item.pageNumber >= startPage &&
                              item.pageNumber <= endPage

                            return (
                              <button
                                key={item.pageNumber}
                                className={`thumbnail-card ${selected ? 'selected' : ''}`}
                                onClick={() => {
                                  setStartPage(item.pageNumber)
                                  setEndPage(item.pageNumber)
                                }}
                              >
                                <img
                                  src={item.thumbnail}
                                  alt={`PDF page ${item.pageNumber}`}
                                />
                                <span>Page {item.pageNumber}</span>
                              </button>
                            )
                          })}
                        </div>

                        <div className="distribution-summary">
                          <div>
                            <strong>Selected pages</strong>
                            <p>Pages {startPage}–{endPage} ({selectedPages} pages)</p>
                          </div>
                          <span className="badge">Ready</span>
                        </div>

                        <div className="wizard-actions wizard-actions-end">
                          <button
                            className="primary-button"
                            onClick={() => setWizardStep(2)}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    )}

                    {error && <div className="upload-error">{error}</div>}
                  </section>
                </>
              )}

              {wizardStep === 2 && (
                <section className="panel wizard-panel">
                  <span className="eyebrow">STEP 2 OF 3</span>
                  <h2>How many devices will participate?</h2>
                  <p>
                    Choose how many people or devices will receive
                    a part of the LEGO instructions.
                  </p>

                  <div className="device-selector">
                    <label htmlFor="device-count">Number of devices</label>
                    <select
                      id="device-count"
                      value={deviceCount}
                      onChange={event => setDeviceCount(Number(event.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map(count => (
                        <option key={count} value={count}>
                          {count} {count === 1 ? 'device' : 'devices'}
                        </option>
                      ))}
                    </select>
                    <small>Maximum 5 devices per session.</small>
                  </div>

                  <div className="selection-summary">
                    <div>
                      <span>PDF document</span>
                      <strong>{pdfName}</strong>
                    </div>
                    <div>
                      <span>Selected page range</span>
                      <strong>{startPage} – {endPage}</strong>
                    </div>
                    <div>
                      <span>Pages to distribute</span>
                      <strong>{selectedPages}</strong>
                    </div>
                  </div>

                  <div className="wizard-actions">
                    <button
                      className="secondary-button"
                      onClick={() => setWizardStep(1)}
                    >
                      ← Back
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => setWizardStep(3)}
                    >
                      Next →
                    </button>
                  </div>
                </section>
              )}

              {wizardStep === 3 && (
                <section className="panel wizard-panel">
                  <span className="eyebrow">STEP 3 OF 3</span>
                  <h2>Device Assignment</h2>
                  <p>
                    These are the devices participating in this LEGO session.
                    The page ranges have not been assigned yet.
                  </p>

                  <div className="assignment-grid">
                    {Array.from({ length: deviceCount }, (_, index) => (
                      <div className="assignment-card" key={index}>
                        <div className="device-number">{index + 1}</div>
                        <div>
                          <strong>Device {index + 1}</strong>
                          <small>Waiting for page assignment</small>
                        </div>
                        <span className="badge">Pending</span>
                      </div>
                    ))}
                  </div>

                  <div className="selection-summary">
                    <div>
                      <span>Selected pages</span>
                      <strong>{startPage} – {endPage}</strong>
                    </div>
                    <div>
                      <span>Participating devices</span>
                      <strong>{deviceCount}</strong>
                    </div>
                  </div>

                  <div className="wizard-actions">
                    <button
                      className="secondary-button"
                      onClick={() => setWizardStep(2)}
                    >
                      ← Back
                    </button>
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              <div className="heading">
                <div>
                  <span className="eyebrow">DEVICE WORKSPACE</span>
                  <h1>LEGO Instructions</h1>
                  <p>Follow your assigned building instructions.</p>
                </div>
                <span className="badge">● Disconnected</span>
              </div>

              <section className="viewer panel">
                <div className="upload-symbol">▧</div>
                <h2>No instructions available</h2>
                <p>Connect to a LEGO server to receive your assigned pages.</p>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
