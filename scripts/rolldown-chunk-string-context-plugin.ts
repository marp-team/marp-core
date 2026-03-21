import { exactRegex } from '@rolldown/pluginutils'
import type { OutputBundle, OutputChunk, Plugin } from 'rolldown'
import { mergeConfig } from 'tsdown'
import type { TsdownHooks, UserConfig } from 'tsdown'

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
  let deferred = Promise.withResolvers<ChunkStringResult>()

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
        deferred = Promise.withResolvers<ChunkStringResult>()
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
        resolveId: {
          filter: { id: exactRegex(importSource) },
          handler: () => virtualId,
        },
        load: {
          filter: { id: exactRegex(virtualId) },
          async handler() {
            const { code, watchFiles } = await deferred.promise
            for (const file of watchFiles) this.addWatchFile(file)

            return `export default ${JSON.stringify(code)}`
          },
        },
      }
    },

    withTarget(
      base: Omit<UserConfig, 'hooks'>,
      targetOptions: RolldownChunkStringTargetPluginOptions,
    ) {
      return mergeConfig(base, {
        hooks: this.hooks,
        plugins: [this.targetPlugin(targetOptions)],
      })
    },
  }
}
