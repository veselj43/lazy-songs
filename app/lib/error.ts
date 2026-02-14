type Success<T> = {
  data: T
  error: undefined
}

type Failure<E> = {
  data: undefined
  error: E
}

type Result<T, E = Error> = Success<T> | Failure<E>

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise
    return {
      data,
      error: undefined,
    }
  } catch (error) {
    return {
      data: undefined,
      error: error as E,
    }
  }
}

export function tryCatchSync<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    const data = fn()
    return {
      data,
      error: undefined,
    }
  } catch (error) {
    return {
      data: undefined,
      error: error as E,
    }
  }
}
