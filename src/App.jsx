import { useMemo, useRef, useState } from 'react'
import './App.css'

function App() {
  const chunksRef = useRef([])
  const autoTimerRef = useRef(null)

  const [chunkSizeMb, setChunkSizeMb] = useState(256)
  const [intervalMs, setIntervalMs] = useState(400)
  const [chunksCount, setChunksCount] = useState(0)
  const [totalAllocatedMb, setTotalAllocatedMb] = useState(0)
  const [autoRunning, setAutoRunning] = useState(false)
  const [lastAction, setLastAction] = useState('No action yet')

  const estimatedGb = useMemo(
    () => (totalAllocatedMb / 1024).toFixed(2),
    [totalAllocatedMb],
  )

  const allocateChunk = (sizeMb) => {
    const parsedSizeMb = Number(sizeMb)
    if (!Number.isFinite(parsedSizeMb) || parsedSizeMb <= 0) {
      setLastAction('Invalid chunk size')
      return
    }

    const bytes = Math.floor(parsedSizeMb * 1024 * 1024)
    const block = new Uint8Array(bytes)

    // Touch memory pages so the engine commits the allocation.
    for (let index = 0; index < block.length; index += 4096) {
      block[index] = 1
    }

    chunksRef.current.push(block)
    setChunksCount(chunksRef.current.length)
    setTotalAllocatedMb((prev) => prev + parsedSizeMb)
    setLastAction(`Allocated ${parsedSizeMb} MB`)
  }

  const releaseLastChunk = () => {
    const lastChunk = chunksRef.current.pop()
    if (!lastChunk) {
      setLastAction('No chunks to release')
      return
    }

    const releasedMb = lastChunk.byteLength / (1024 * 1024)
    setChunksCount(chunksRef.current.length)
    setTotalAllocatedMb((prev) => Math.max(0, prev - releasedMb))
    setLastAction(`Released ${releasedMb.toFixed(0)} MB`)
  }

  const releaseAll = () => {
    chunksRef.current = []
    setChunksCount(0)
    setTotalAllocatedMb(0)
    setLastAction('Released all chunks')
  }

  const stopAutoAllocate = () => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current)
      autoTimerRef.current = null
    }
    setAutoRunning(false)
  }

  const startAutoAllocate = () => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current)
      autoTimerRef.current = null
    }

    const parsedIntervalMs = Number(intervalMs)
    if (!Number.isFinite(parsedIntervalMs) || parsedIntervalMs < 50) {
      setLastAction('Interval must be at least 50 ms')
      return
    }

    autoTimerRef.current = setInterval(() => {
      allocateChunk(chunkSizeMb)
    }, parsedIntervalMs)

    setAutoRunning(true)
    setLastAction(`Auto-allocate started (${chunkSizeMb} MB every ${parsedIntervalMs} ms)`)
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Memory Stress React App</h1>
        <p className="subtext">
          Use this page to deliberately consume huge browser memory for load and
          stability testing.
        </p>

        <div className="grid">
          <label>
            Chunk size (MB)
            <input
              type="number"
              min="1"
              step="1"
              value={chunkSizeMb}
              onChange={(event) => setChunkSizeMb(event.target.value)}
            />
          </label>

          <label>
            Auto interval (ms)
            <input
              type="number"
              min="50"
              step="50"
              value={intervalMs}
              onChange={(event) => setIntervalMs(event.target.value)}
            />
          </label>
        </div>

        <div className="buttons">
          <button onClick={() => allocateChunk(chunkSizeMb)}>
            Allocate Once
          </button>
          {!autoRunning ? (
            <button className="danger" onClick={startAutoAllocate}>
              Start Auto Allocate
            </button>
          ) : (
            <button className="warning" onClick={stopAutoAllocate}>
              Stop Auto Allocate
            </button>
          )}
          <button className="warning" onClick={releaseLastChunk}>
            Release Last Chunk
          </button>
          <button className="danger" onClick={releaseAll}>
            Release All
          </button>
        </div>

        <div className="stats">
          <article>
            <h2>Total Allocated</h2>
            <p>
              {Math.round(totalAllocatedMb)} MB ({estimatedGb} GB)
            </p>
          </article>
          <article>
            <h2>Chunk Count</h2>
            <p>{chunksCount}</p>
          </article>
          <article>
            <h2>Mode</h2>
            <p>{autoRunning ? 'Auto' : 'Manual'}</p>
          </article>
        </div>

        <p className="status">Last action: {lastAction}</p>
        <p className="notice">
          Warning: this can freeze or crash your browser tab when memory is
          exhausted.
        </p>
      </section>
    </main>
  )
}

export default App
