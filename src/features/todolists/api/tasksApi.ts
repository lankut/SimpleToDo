import { baseApi } from "@/app/baseApi"
import type { BaseResponse } from "@/common/types"
import type { DomainTask, GetTasksResponse, UpdateTaskModel } from "./tasksApi.types"
import { PAGE_COUNT } from "@/common/constants"

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<GetTasksResponse, { id: string; params: { page: number } }>({
      // getTasks: build.query<GetTasksResponse, { id: string; params: { page: number; count: number } }>({
      query: ({ id, params }) => {
        return {
          url: `todo-lists/${id}/tasks`,
          params: { ...params, count: PAGE_COUNT },
        }
      },
      keepUnusedDataFor: 15,
      // query: ({ id, params}) => `todo-lists/${id}/tasks?page=${params.page}&count=${params.count}`,
      providesTags: (_res, _error, arg) => [{ type: "Task", id: arg.id }],
      // res ? [...res.items.map(({ id }) => ({ type: "Task", id }) as const), { type: "Task", id: arg }] : ["Task"],
    }),
    addTask: build.mutation<BaseResponse<{ item: DomainTask }>, { todolistId: string; title: string }>({
      query: ({ todolistId, title }) => ({
        url: `todo-lists/${todolistId}/tasks`,
        method: "POST",
        body: { title },
      }),
      invalidatesTags: (_res, _error, arg) => [{ type: "Task", id: arg.todolistId }],
    }),
    removeTask: build.mutation<BaseResponse, { todolistId: string; taskId: string }>({
      query: ({ todolistId, taskId }) => ({
        url: `todo-lists/${todolistId}/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _error, { todolistId }) => [{ type: "Task", id: todolistId }],
      // invalidatesTags: (_res, _error, { taskId }) => [{ type: "Task", id: taskId }],
    }),
    updateTask: build.mutation<
      BaseResponse<{ item: DomainTask }>,
      { todolistId: string; taskId: string; model: UpdateTaskModel }
    >({
      query: ({ todolistId, taskId, model }) => ({
        url: `todo-lists/${todolistId}/tasks/${taskId}`,
        method: "PUT",
        body: model,
      }),
      onQueryStarted: async ({ todolistId, taskId, model }, { dispatch, queryFulfilled, getState }) => {
        const cachedArgsForQuery = tasksApi.util.selectCachedArgsForQuery(getState(), "getTasks")

        let patchResults: any[] = []

        cachedArgsForQuery.forEach(({ params }) => {
          // debugger
          patchResults.push(
            dispatch(
              tasksApi.util.updateQueryData("getTasks", { id: todolistId, params: { page: params.page } }, (state) => {
                const index = state.items.findIndex((item) => item.id === taskId)
                if (index !== -1) {
                  state.items[index] = { ...state.items[index], ...model }
                }
              }),
            ),
          )
        })

        try {
          await queryFulfilled
        } catch {
          patchResults.forEach((patchResult) => {
            patchResult.undo()
          })
        }
      },
      invalidatesTags: (_res, _error, { todolistId }) => [{ type: "Task", id: todolistId }],
    }),
  }),
})

export const { useGetTasksQuery, useAddTaskMutation, useRemoveTaskMutation, useUpdateTaskMutation } = tasksApi