import { ApiResponse } from "./api.response";

export class PagingApiResponse extends ApiResponse {
  private page: number = 0;
  private size: number = 0;
  private total: number = 0;

  setPaging(page: number, size: number, total: number) {
    this.page = page;
    this.size = size;
    this.total = total;
    return this;
  }

  setPage(page: number) {
    this.page = page;
    return this;
  }

  setSize(size: number) {
    this.size = size;
    return this;
  }

  setTotal(total: number) {
    this.total = total;
    return this;
  }
}
