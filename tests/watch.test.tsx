import { describe, expect, it, vi } from 'vitest'
import { proxy } from 'valtio'
import { watch } from 'valtio/utils'

describe('watch', () => {
  it('should re-run for individual proxy updates', async () => {
    const reference = proxy({ value: 'Example' })

    const callback = vi.fn()

    watch((get) => {
      get(reference)
      callback()
    })

    expect(callback).toBeCalledTimes(1)
    reference.value = 'Update'
    await Promise.resolve()
    expect(callback).toBeCalledTimes(2)
  })
  it('should re-run for multiple proxy updates', async () => {
    const A = proxy({ value: 'A' })
    const B = proxy({ value: 'B' })

    const callback = vi.fn()

    watch((get) => {
      get(A)
      get(B)
      callback()
    })

    expect(callback).toBeCalledTimes(1)
    A.value = 'B'
    await Promise.resolve()
    expect(callback).toBeCalledTimes(2)
    B.value = 'C'
    await Promise.resolve()
    expect(callback).toBeCalledTimes(3)
  })
  it('should cleanup when state updates', async () => {
    const reference = proxy({ value: 'Example' })

    const callback = vi.fn()

    watch((get) => {
      get(reference)

      return () => {
        callback()
      }
    })

    expect(callback).toBeCalledTimes(0)
    reference.value = 'Update'
    await Promise.resolve()
    expect(callback).toBeCalledTimes(1)
  })
  it('should cleanup when stopped', () => {
    const callback = vi.fn()

    const stop = watch(() => callback)

    expect(callback).toBeCalledTimes(0)
    stop()
    expect(callback).toBeCalledTimes(1)
  })
  it('should cleanup internal effects when stopped', () => {
    const callback = vi.fn()

    const stop = watch(() => {
      watch(() => {
        watch(() => {
          watch(() => {
            watch(() => () => {
              callback()
            })
          })
        })
      })
    })

    expect(callback).toBeCalledTimes(0)
    stop()
    expect(callback).toBeCalledTimes(1)
  })
  it('should not loop infinitely with sync (#382)', () => {
    const reference = proxy({ value: 'Example' })

    watch(
      (get) => {
        get(reference)
      },
      { sync: true },
    )

    reference.value = 'Update'
  })
})
