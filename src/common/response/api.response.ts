export class ApiResponse {
  private statusCode: "success" | "fail" | "error" = "success";
  private message: string = "";
  private data: any = {};

  setStatusCode(statusCode: "success" | "fail" | "error") {
    this.statusCode = statusCode;
    return this;
  }

  setMessage(message: string) {
    this.message = message;
    return this;
  }

  setData(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.data = data;
    return this;
  }
}
