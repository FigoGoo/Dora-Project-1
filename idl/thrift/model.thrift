include "base.thrift"
namespace go model

// 模型配置
struct ModelConfig {
    1: string id (go.tag = "json:\"id\""),
    2: string name (go.tag = "json:\"name\""),
    3: string type (go.tag = "json:\"type\""),              // text, image, video
    4: string provider (go.tag = "json:\"provider\""),      // deepseek, gemini, banana, seedance
    5: string endpoint (go.tag = "json:\"endpoint\""),
        6: map<string, string> params (go.tag = "json:\"params\""), // 模型参数
    7: bool enabled (go.tag = "json:\"enabled\""),
}

// 获取模型配置列表请求
struct GetModelConfigsReq {
    1: optional string model_type (go.tag = "json:\"model_type\""),
}

struct GetModelConfigsResp {
    1: base.BaseResp base,
    2: list<ModelConfig> data (go.tag = "json:\"data\""),
}

// 更新模型配置请求
struct UpdateModelConfigReq {
    1: string id (go.tag = "json:\"id\""),
    2: optional string endpoint (go.tag = "json:\"endpoint\""),
    3: optional map<string, string> params (go.tag = "json:\"params\""),
    4: optional bool enabled (go.tag = "json:\"enabled\""),
}

struct UpdateModelConfigResp {
    1: base.BaseResp base,
}

// 调用文本模型请求
struct CallTextModelReq {
    1: string prompt (go.tag = "json:\"prompt\""),
    2: optional string model_id (go.tag = "json:\"model_id\""),
    3: optional map<string, string> params (go.tag = "json:\"params\""),
}

struct CallTextModelResp {
    1: base.BaseResp base,
    2: string result (go.tag = "json:\"result\""),
}

// 调用图片模型请求
struct CallImageModelReq {
    1: string prompt (go.tag = "json:\"prompt\""),
    2: optional string model_id (go.tag = "json:\"model_id\""),
    3: optional map<string, string> params (go.tag = "json:\"params\""),
}

struct CallImageModelResp {
    1: base.BaseResp base,
    2: string image_url (go.tag = "json:\"image_url\""),
}

// 调用视频模型请求
struct CallVideoModelReq {
    1: list<string> image_urls (go.tag = "json:\"image_urls\""),
    2: optional string model_id (go.tag = "json:\"model_id\""),
    3: optional map<string, string> params (go.tag = "json:\"params\""),
}

struct CallVideoModelResp {
    1: base.BaseResp base,
    2: string video_url (go.tag = "json:\"video_url\""),
}

service ModelService {
    GetModelConfigsResp GetModelConfigs(1: GetModelConfigsReq req),
    UpdateModelConfigResp UpdateModelConfig(1: UpdateModelConfigReq req),
    CallTextModelResp CallTextModel(1: CallTextModelReq req),
    CallImageModelResp CallImageModel(1: CallImageModelReq req),
    CallVideoModelResp CallVideoModel(1: CallVideoModelReq req),
}
