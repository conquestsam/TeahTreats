export interface ApiResponseDto<TData> {
  data: TData;
  meta?: Record<string, unknown>;
}
