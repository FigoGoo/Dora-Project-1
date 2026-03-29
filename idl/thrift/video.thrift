include "base.thrift"
namespace go video

// 视频信息
struct
VideoInfo {
    1: string id (go.tag = "json:\"id\""),
    2: string storyboard_id (go.tag = "json:\"storyboard_id\""),
    3: string url (go.tag = "json:\"url\""),                  // 视频URL
    4: list<string> image_urls (go.tag = "json:\"image_urls\""),  // 使用的画面
    5: string model (go.tag = "json:\"model\""),              // 使用的模型
    6: i32 duration (go.tag = "json:\"duration\""),           // 时长(秒)
    7: string status (go.tag = "json:\"status\""),
    8: string created_at (go.tag = "json:\"created_at\""),
}

// 生成视频请求
struct GenerateVideoReq {
    1: string storyboard_id (go.tag = "json:\"storyboard_id\""),
    2: list<string> image_urls (go.tag = "json:\"image_urls\""),
}

struct GenerateVideoResp {
    1: base.BaseResp base,
    2: VideoInfo data (go.tag = "json:\"data\""),
}

// 获取视频请求
struct GetVideoReq {
    1: string id (go.tag = "json:\"id\""),
}

struct GetVideoResp {
    1: base.BaseResp base,
    2: VideoInfo data (go.tag = "json:\"data\""),
}

service VideoService {
    GenerateVideoResp GenerateVideo(1: GenerateVideoReq req),
    GetVideoResp GetVideo(1: GetVideoReq req),
}
