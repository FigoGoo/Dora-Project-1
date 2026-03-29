include "base.thrift"
namespace go storyboard

// 分镜信息
struct StoryboardInfo {
    1: string id (go.tag = "json:\"id\""),
    2: string project_id (go.tag = "json:\"project_id\""),
    3: string script_id (go.tag = "json:\"script_id\""),
    4: i32 sequence (go.tag = "json:\"sequence\""),           // 镜头序号
    5: string description (go.tag = "json:\"description\""),   // 镜头描述
    6: string prompt (go.tag = "json:\"prompt\""),             // 画面提示词
    7: i32 duration (go.tag = "json:\"duration\""),             // 镜头时长(秒)
    8: string status (go.tag = "json:\"status\""),
}

// 分镜拆解请求
struct SplitStoryboardReq {
    1: string script_id (go.tag = "json:\"script_id\""),
}

struct SplitStoryboardResp {
    1: base.BaseResp base,
    2: list<StoryboardInfo> data (go.tag = "json:\"data\""),
}

// 获取分镜列表请求
struct GetStoryboardsReq {
    1: string project_id (go.tag = "json:\"project_id\""),
}

struct GetStoryboardsResp {
    1: base.BaseResp base,
    2: list<StoryboardInfo> data (go.tag = "json:\"data\""),
}

service StoryboardService {
    SplitStoryboardResp SplitStoryboard(1: SplitStoryboardReq req),
    GetStoryboardsResp GetStoryboards(1: GetStoryboardsReq req),
}
