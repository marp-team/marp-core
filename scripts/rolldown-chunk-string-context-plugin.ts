import type { OutputBundle, OutputChunk, Plugin } from 'rolldown'
import type { TsdownHooks } from 'tsdown'

const sourceMapCommentRegexp = /(?:\r?\n)?\/\/# sourceMappingURL=.*$/

interface ChunkStringResult {
  code: string
  watchFiles: string[]
}

export interface RolldownChunkStringContextOptions {
  filterWatchFile?: (id: string) => boolean
  name: string
  stringifyChunk?: (chunk: OutputChunk) => string
  pickChunk?: (bundle: OutputBundle) => OutputChunk | undefined
  stripSourceMapComment?: boolean
}

export interface RolldownChunkStringTargetPluginOptions {
  importSource: string
  virtualId?: string
}

const createDeferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

const defaultPickChunk = (bundle: OutputBundle) =>
  Object.values(bundle).find(
    (item): item is OutputChunk => item.type === 'chunk' && item.isEntry,
  )

const defaultFilterWatchFile = (id: string) => !id.startsWith('\0')

export const createRolldownChunkStringContext = ({
  filterWatchFile = defaultFilterWatchFile,
  name,
  stringifyChunk,
  pickChunk = defaultPickChunk,
  stripSourceMapComment = true,
}: RolldownChunkStringContextOptions) => {
  let deferred = createDeferred<ChunkStringResult>()

  const serializeChunk =
    stringifyChunk ||
    ((chunk: OutputChunk) =>
      stripSourceMapComment
        ? chunk.code.replace(sourceMapCommentRegexp, '')
        : chunk.code)

  const extractChunkStringResult = (
    bundle: OutputBundle,
  ): ChunkStringResult => {
    const chunk = pickChunk(bundle)

    if (!chunk) {
      throw new Error(`Failed to capture chunk output for ${name}.`)
    }

    return {
      code: serializeChunk(chunk),
      watchFiles: chunk.moduleIds.filter(filterWatchFile),
    }
  }

  return {
    hooks: {
      'build:prepare': () => {
        deferred = createDeferred<ChunkStringResult>()
      },
    } satisfies Partial<TsdownHooks>,

    sourcePlugin(): Plugin {
      return {
        name: `${name}-source`,
        buildEnd(error) {
          if (error) deferred.reject(error)
        },
        generateBundle(_, bundle) {
          deferred.resolve(extractChunkStringResult(bundle))
        },
      }
    },

    targetPlugin({
      importSource,
      virtualId = `\0${name}/${importSource}`,
    }: RolldownChunkStringTargetPluginOptions): Plugin {
      return {
        name: `${name}-target`,
        resolveId(source) {
          return source === importSource ? virtualId : null
        },
        async load(id) {
          if (id !== virtualId) return null

          const { code, watchFiles } = await deferred.promise

          for (const file of watchFiles) {
            this.addWatchFile(file)
          }

          return `export default ${JSON.stringify(code)}`
        },
      }
    },
  }
}
