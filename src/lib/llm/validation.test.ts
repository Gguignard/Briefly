import { describe, it, expect } from 'vitest'
import { parseLLMResponse } from './validation'

describe('parseLLMResponse', () => {
  it('parse un JSON valide avec tous les champs', () => {
    const json = JSON.stringify({
      title: 'Mon titre',
      keyPoints: ['A', 'B', 'C'],
      sourceUrl: 'https://example.com',
    })

    const result = parseLLMResponse(json)

    expect(result.title).toBe('Mon titre')
    expect(result.keyPoints).toEqual(['A', 'B', 'C'])
    expect(result.sourceUrl).toBe('https://example.com')
  })

  it('gère sourceUrl null', () => {
    const json = JSON.stringify({
      title: 'Titre',
      keyPoints: ['Point'],
      sourceUrl: null,
    })

    const result = parseLLMResponse(json)
    expect(result.sourceUrl).toBeNull()
  })

  it('retourne des valeurs par défaut pour les champs manquants', () => {
    const result = parseLLMResponse('{}')

    expect(result.title).toBe('')
    expect(result.keyPoints).toEqual([])
    expect(result.sourceUrl).toBeNull()
  })

  it('filtre les keyPoints non-string', () => {
    const json = JSON.stringify({
      title: 'Titre',
      keyPoints: ['valide', 42, null, 'aussi valide'],
      sourceUrl: null,
    })

    const result = parseLLMResponse(json)
    expect(result.keyPoints).toEqual(['valide', 'aussi valide'])
  })

  it('ignore les champs supplémentaires du LLM', () => {
    const json = JSON.stringify({
      title: 'Titre',
      keyPoints: ['A'],
      sourceUrl: null,
      extraField: 'malicious',
      __proto__: { admin: true },
    })

    const result = parseLLMResponse(json)
    expect(result).toEqual({
      title: 'Titre',
      keyPoints: ['A'],
      sourceUrl: null,
    })
    expect((result as Record<string, unknown>).extraField).toBeUndefined()
  })

  it('rejette si raw est null', () => {
    expect(() => parseLLMResponse(null)).toThrow('LLM returned empty response')
  })

  it('rejette si raw est undefined', () => {
    expect(() => parseLLMResponse(undefined)).toThrow('LLM returned empty response')
  })

  it('rejette si raw est une chaîne vide', () => {
    expect(() => parseLLMResponse('')).toThrow('LLM returned empty response')
  })

  it('rejette si raw est du JSON invalide', () => {
    expect(() => parseLLMResponse('not json')).toThrow('LLM returned invalid JSON')
  })

  it('rejette si raw est un tableau JSON', () => {
    expect(() => parseLLMResponse('[1,2,3]')).toThrow('LLM response is not a JSON object')
  })

  it('rejette si raw est un string JSON', () => {
    expect(() => parseLLMResponse('"hello"')).toThrow('LLM response is not a JSON object')
  })
})
