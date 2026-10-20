#!/usr/bin/env node
// Synthesises a short, gentle looping melody so the music control works out of the box.
// Replace public/audio/wedding-theme.wav (or change config/wedding.ts) with your own track.
import { mkdirSync, writeFileSync } from 'node:fs'

const sampleRate = 22050
const beat = 0.75
const chords = [
  [261.63, 329.63, 392.0, 523.25], // C
  [220.0, 261.63, 329.63, 440.0], // Am
  [174.61, 220.0, 261.63, 349.23], // F
  [196.0, 246.94, 293.66, 392.0], // G
]
const bars = chords.length * 2
const total = Math.floor(sampleRate * beat * 4 * bars)
const samples = new Float32Array(total)

function pluck(freq, start, length, gain) {
  const begin = Math.floor(start * sampleRate)
  const count = Math.floor(length * sampleRate)
  for (let i = 0; i < count && begin + i < total; i += 1) {
    const t = i / sampleRate
    const envelope = Math.min(1, t / 0.01) * Math.exp(-t * 2.2)
    const tone = Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(2 * Math.PI * freq * 2 * t)
    samples[begin + i] += tone * envelope * gain
  }
}

for (let bar = 0; bar < bars; bar += 1) {
  const chord = chords[bar % chords.length]
  const barStart = bar * beat * 4
  pluck(chord[0] / 2, barStart, beat * 4, 0.18)
  for (let step = 0; step < 8; step += 1) {
    pluck(chord[step % 4] * (step > 3 ? 2 : 1), barStart + step * (beat / 2), 1.6, 0.11)
  }
}

let peak = 0
for (const s of samples) peak = Math.max(peak, Math.abs(s))
const fade = Math.floor(sampleRate * 0.05)
const pcm = Buffer.alloc(total * 2)
for (let i = 0; i < total; i += 1) {
  const edge = Math.min(1, i / fade, (total - i) / fade)
  pcm.writeInt16LE(Math.round((samples[i] / peak) * 0.7 * edge * 32767), i * 2)
}

const header = Buffer.alloc(44)
header.write('RIFF', 0)
header.writeUInt32LE(36 + pcm.length, 4)
header.write('WAVEfmt ', 8)
header.writeUInt32LE(16, 16)
header.writeUInt16LE(1, 20)
header.writeUInt16LE(1, 22)
header.writeUInt32LE(sampleRate, 24)
header.writeUInt32LE(sampleRate * 2, 28)
header.writeUInt16LE(2, 32)
header.writeUInt16LE(16, 34)
header.write('data', 36)
header.writeUInt32LE(pcm.length, 40)

mkdirSync('public/audio', { recursive: true })
writeFileSync('public/audio/wedding-theme.wav', Buffer.concat([header, pcm]))
console.log(`Wrote public/audio/wedding-theme.wav (${((header.length + pcm.length) / 1024).toFixed(0)} KB)`)
