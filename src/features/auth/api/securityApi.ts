import { baseApi } from "@/app/baseApi.ts"
import { CaptchaResponse } from "@/common/types"

export const securityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCaptchaUrl: builder.query<CaptchaResponse, void>({
      query: () => "security/get-captcha-url",
    }),
  }),
})

export const { useGetCaptchaUrlQuery, useLazyGetCaptchaUrlQuery } = securityApi
