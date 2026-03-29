include "base.thrift"
namespace go merge

// 合并后的视频信息
struct MergedVideoInfo {
    1: string id (go.tag = "json:\"id\""),
    2: string project_id (go.tag = "json:\"project_id\""),
    3: string url (go.tag = "json:\"url\""),                  // 最终视频URL
    4: list<string> segment_urls (go.tag = "json:\"segment_urls\""), // 片段URL列表
    5: i32 duration (go.tag = "json:\"duration\""),           // 总时长(秒)
    6: string status (go.tag = "json:\"status\""),
    7: string created_at (go.tag = "json:\"created_at\""),
}

// 合并视频请求
struct MergeVideoReq {
    1: string project_id (go.tag = "json:\"project_id\""),
    2: list<string> segment_urls (go.tag = "json:\"segment_urls\""),
    3: optional i32 transition (go.tag = "json:\"transition\""),  // 转场效果(秒)
}

struct MergeVideoResp {
    1: base.BaseResp base,
    2: MergedVideoInfo data (go.tag = "json:\"data\""),
}

// 下载视频请求
struct DownloadVideoReq {
    1: string id (go.tag = "json:\"id\""),
}

struct DownloadVideoResp {
    1: base.BaseResp base,
    2: string download_url (go.tag = "json:\"download_url\""),
}

// 发布视频请求
struct PublishVideoReq {
    1: string id (go.tag = "json:\"id\""),
    2: string platform (go.tag = "json:\"platform\""),          // 发布平台
    3: optional string title (go.tag = "json:\"title\""),      // 发布标题
    4: optional string description (go.tag = "json:\"description\""), // 发布描述
}

struct PublishVideoResp {
    1: base.BaseResp base,
    2: string published_url (go.tag = "json:\"published_url\""),
}

service MergeService {
    MergeVideoResp MergeVideo(1: MergeVideoReq req),
    DownloadVideoResp DownloadVideo(1: DownloadVideoReq req),
    PublishVideoResp PublishVideo(1: PublishVideoReq req),
}
