include "base.thrift"
namespace go script

// 剧本生成请求
struct GenerateScriptReq {
    1: string project_id (go.tag = "json:\"project_id\""),
    2: string inspiration (go.tag = "json:\"inspiration\""),  // 灵感输入
    3: optional string style (go.tag = "json:\"style\""),      // 剧本风格
    4: optional i64 duration (go.tag = "json:\"duration\""),    // 预计时长(秒)
}

// 剧本响应
struct ScriptInfo {
    1: string id (go.tag = "json:\"id\""),
    2: string project_id (go.tag = "json:\"project_id\""),
    3: string content (go.tag = "json:\"content\""),
    4: string model (go.tag = "json:\"model\""),
    5: string status (go.tag = "json:\"status\""),
    6: string created_at (go.tag = "json:\"created_at\""),
}

struct GenerateScriptResp {
    1: base.BaseResp base,
    2: ScriptInfo data (go.tag = "json:\"data\""),
}

// 获取剧本请求
struct GetScriptReq {
    1: string id (go.tag = "json:\"id\""),
}

struct GetScriptResp {
    1: base.BaseResp base,
    2: ScriptInfo data (go.tag = "json:\"data\""),
}

service ScriptService {
    GenerateScriptResp GenerateScript(1: GenerateScriptReq req),
    GetScriptResp GetScript(1: GetScriptReq req),
}
