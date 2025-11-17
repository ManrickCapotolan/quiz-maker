export type ApiResult = SuccessResponse | ErrorResponse;

export interface SuccessResponse {
  ok: string;
}

export interface ErrorResponse {
  error: string;
}
