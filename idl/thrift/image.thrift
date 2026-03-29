include "base.thrift"
namespace go image

// 画面信息
struct ImageInfo {
    1: string id (go.tag = "json:\"id\""),
    2: string storyboard_id (go.tag = "json:\"storyboard_id\""),
    3: string url (go.tag = "json:\"url\""),                  // 画面URL
    4: string prompt (go.tag = "json:\"prompt\""),            // 提示词
    5: string model (go.tag = "json:\"model\""),              // 使用的模型
    6: string status (go.tag = "json:\"status\""),
    7: string created_at (go.tag = "json:\"created_at\""),
}

// 生成画面请求
struct GenerateImageReq {
    1: string storyboard_id (go.tag = "json:\"storyboard_id\""),
    2: string prompt (go.tag = "json:\"prompt\""),
}

struct GenerateImageResp {
    1: base.BaseResp base,
    2: ImageInfo data (go.tag = "json:\"data\""),
}

// 批量生成画面请求
struct BatchGenerateImagesReq {
    1: list<string> storyboard_ids (go.tag = "json:\"storyboard_ids\""),
}

struct BatchGenerateImagesResp {
    1: base.BaseResp base,
    2: list<ImageInfo> data (go.tag = "json:\"data\""),
}

service ImageService {
    GenerateImageResp GenerateImage(1: GenerateImageReq req),
    BatchGenerateImagesResp BatchGenerateImages(1: BatchGenerateImagesReq req),
}
