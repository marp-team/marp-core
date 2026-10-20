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

  it('requires pele lazily only when used', async () => {
    const mockRenderMermaidSVG = jest.fn(() => '<svg>mermaid</svg>')
    const mockPele = jest.fn(() => ({
      render: mockRenderMermaidSVG,
    }))

    jest.doMock('pele', mockPele)

    try {
      await jest.isolateModulesAsync(async () => {
        const { pele } = await import('../../src/internals/mermaid.node')
        expect(mockPele).not.toHaveBeenCalled()

        // Load pele lazily on first use
        expect(pele('flowchart TD\nA --> B')).toBe('<svg>mermaid</svg>')
        expect(mockPele).toHaveBeenCalledTimes(1)
        expect(mockRenderMermaidSVG).toHaveBeenCalledWith(
          'flowchart TD\nA --> B',
        )

        pele('sequenceDiagram\nA ->> B: Hello')
        expect(mockPele).toHaveBeenCalledTimes(1) // pele is loaded only once
        expect(mockRenderMermaidSVG).toHaveBeenCalledTimes(2)
      })
    } finally {
      jest.dontMock('pele')
    }
  })
})
