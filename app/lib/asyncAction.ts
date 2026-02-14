import type { AsyncDataRequestStatus } from '#app'
import { loggerPush } from '~/service/logger.service'

interface UseAsyncActionExecuteWithoutParams {
  execute(): Promise<void>
}

interface UseAsyncActionExecuteWithParams<TParams> {
  execute(params: TParams): Promise<void>
}

interface UseAsyncActionResultBase<TData = unknown, TError = unknown> {
  clear(): void
  status: Ref<AsyncDataRequestStatus>
  data: Ref<TData | undefined>
  error: Ref<TError | unknown | undefined>
}

export function useAsyncAction<TData = unknown, TError = unknown>(
  action: () => Promise<TData>,
): UseAsyncActionResultBase<TData, TError> & UseAsyncActionExecuteWithoutParams
export function useAsyncAction<TData = unknown, TError = unknown, TParams = any>(
  action: (params: TParams) => Promise<TData>,
): UseAsyncActionResultBase<TData, TError> & UseAsyncActionExecuteWithParams<TParams>

export function useAsyncAction<TData = unknown, TError = unknown, TParams = void>(
  action: (params: TParams) => Promise<TData>,
): UseAsyncActionResultBase<TData, TError> &
  (UseAsyncActionExecuteWithoutParams | UseAsyncActionExecuteWithParams<TParams>) {
  const status = ref<AsyncDataRequestStatus>('idle')
  const data = ref<TData>()
  const error = ref<TError | unknown>()

  const execute = async (params: TParams) => {
    status.value = 'pending'
    data.value = undefined
    error.value = undefined

    try {
      const result = await action(params)
      data.value = result
      status.value = 'success'
    } catch (err) {
      error.value = err
      status.value = 'error'
      console.error(err)
      loggerPush('Error:', err instanceof Error ? `${err.name} ${err.message}` : JSON.stringify(err))
    }
  }

  const clear = () => {
    status.value = 'idle'
    data.value = undefined
    error.value = undefined
  }

  return {
    status,
    data,
    error,
    clear,
    execute,
  }
}
