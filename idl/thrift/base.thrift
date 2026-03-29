namespace go base

// 基础响应结构
struct BaseResp {
    1: i64 code (go.tag = "json:\"code\""),
    2: string msg (go.tag = "json:\"msg\""),
}

// 分页请求
struct PaginationReq {
    1: i64 page (go.tag = "json:\"page\""),
    2: i64 page_size (go.tag = "json:\"page_size\""),
}

// 分页响应
struct PaginationResp {
    1: i64 total (go.tag = "json:\"total\""),
    2: i64 page (go.tag = "json:\"page\""),
    3: i64 page_size (go.tag = "json:\"page_size\""),
}
