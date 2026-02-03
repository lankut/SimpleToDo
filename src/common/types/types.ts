export type FieldError = {
  error: string
  field: string
}

export type BaseResponse<T = {}> = {
  data: T
  resultCode: number
  messages: string[]
  fieldsErrors: FieldError[]
}

export type CaptchaResponse = {
  url: string
}

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed"
