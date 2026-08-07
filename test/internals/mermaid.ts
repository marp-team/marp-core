/* eslint-disable import-x/no-duplicates */
import * as marpMermaidBase from '../../src/internals/mermaid'
import * as marpMermaidNode from '../../src/internals/mermaid.node'
import * as marpMermaid from '#marp-mermaid'

describe('#marp-mermaid', () => {
  it('exports src/internals/mermaid', () => {
    expect(marpMermaid).toStrictEqual(marpMermaidBase)
  })
})

describe('#marp-mermaid for Node.js', () => {
  it('has same interface with #marp-mermaid', () => {
    expect(Object.keys(marpMermaidNode)).toStrictEqual(Object.keys(marpMermaid))
  })

  it('requires beautiful-mermaid lazily only when used', async () => {
    const mockRenderMermaidSVG = jest.fn(() => '<svg>mermaid</svg>')
    const mockBeautifulMermaid = jest.fn(() => ({
      renderMermaidSVG: mockRenderMermaidSVG,
    }))

    jest.doMock('#marp-beautiful-mermaid', mockBeautifulMermaid)

    try {
      await jest.isolateModulesAsync(async () => {
        const { beautifulMermaid } =
          await import('../../src/internals/mermaid.node')
        expect(mockBeautifulMermaid).not.toHaveBeenCalled()

        // Load beautiful-mermaid lazily on first use
        expect(beautifulMermaid('flowchart TD\nA --> B')).toBe(
          '<svg>mermaid</svg>',
        )
        expect(mockBeautifulMermaid).toHaveBeenCalledTimes(1)
        expect(mockRenderMermaidSVG).toHaveBeenCalledWith(
          'flowchart TD\nA --> B',
        )

        beautifulMermaid('sequenceDiagram\nA ->> B: Hello')
        expect(mockBeautifulMermaid).toHaveBeenCalledTimes(1) // beautiful-mermaid is loaded only once
        expect(mockRenderMermaidSVG).toHaveBeenCalledTimes(2)
      })
    } finally {
      jest.dontMock('#marp-beautiful-mermaid')
    }
  })
})
