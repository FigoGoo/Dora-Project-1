namespace go workflow

include "base.thrift"

struct CreateWorkflowReq {
    1: required string project_id (api.body="project_id");
    2: required string inspiration (api.body="inspiration");
    3: optional string model (api.body="model", api.vd="len($)>0");
}

struct CreateWorkflowResp {
    1: required base.BaseResp base;
    2: optional WorkflowInfo data;
}

struct GetWorkflowReq {
    1: required string id (api.path="id");
}

struct GetWorkflowResp {
    1: required base.BaseResp base;
    2: optional WorkflowInfo data;
}

struct GetWorkflowByProjectReq {
    1: required string project_id (api.path="project_id");
}

struct GetWorkflowByProjectResp {
    1: required base.BaseResp base;
    2: optional WorkflowInfo data;
}

struct WorkflowInfo {
    1: optional string id;
    2: optional string project_id;
    3: optional string status;
    4: optional string current_step;
    5: optional i32 total_steps;
    6: optional i32 progress;
    7: optional map<string, string> step_status; // 各步骤的状态 map
    8: optional string created_at;
    9: optional string updated_at;
}

struct StartWorkflowReq {
    1: required string id (api.path="id");
}

struct StartWorkflowResp {
    1: required base.BaseResp base;
    2: optional WorkflowInfo data;
}

struct GetWorkflowListReq {
    1: optional i32 page (api.query="page", api.vd="$>0");
    2: optional i32 page_size (api.query="page_size", api.vd="$>0 && $<=100");
}

struct GetWorkflowListResp {
    1: required base.BaseResp base;
    2: optional base.Pagination pagination;
    3: optional list<WorkflowInfo> data;
}

service WorkflowService {
    CreateWorkflowResp CreateWorkflow(1: CreateWorkflowReq req) (api.post="/api/v1/workflow");
    GetWorkflowResp GetWorkflow(1: GetWorkflowReq req) (api.get="/api/v1/workflow/{id}");
    GetWorkflowByProjectResp GetWorkflowByProject(1: GetWorkflowByProjectReq req) (api.get="/api/v1/workflow/project/{project_id}");
    StartWorkflowResp StartWorkflow(1: StartWorkflowReq req) (api.post="/api/v1/workflow/{id}/start");
    GetWorkflowListResp GetWorkflowList(1: GetWorkflowListReq req) (api.get="/api/v1/workflow/list");
}
