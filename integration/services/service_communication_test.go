package services

import (
	"dora-magic-box/internal/dal/db"
	testutils "dora-magic-box/test/utils"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type ServiceCommunicationIntegrationTestSuite struct {
	suite.Suite
}

func TestServiceCommunicationIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(ServiceCommunicationIntegrationTestSuite))
}

func (s *ServiceCommunicationIntegrationTestSuite) TestScriptToStoryboardFlow() {
	// 测试剧本服务到分镜服务的流程

	userID := uint64(100)
	project := testutils.ProjectFactory(func(p *db.Project) {
		p.UserID = userID
		p.ID = 10
	})

	// 剧本服务生成剧本
	script := testutils.ScriptFactory(func(s *db.Script) {
		s.ProjectID = project.ID
		s.ID = 10
		s.Status = "completed"
		s.Content = `
场景一：一个阳光明媚的早晨，主人公走在乡间小路上。
场景二：他来到了一片神秘的森林。
场景三：在森林深处发现了一个古老的宝箱。
场景四：打开宝箱，里面有一张藏宝图。
场景五：按照藏宝图的指引，最终找到了宝藏。
`
	})

	// 验证剧本
	assert.Equal(s.T(), "completed", script.Status)
	assert.NotEmpty(s.T(), script.Content)

	// 分镜服务接收剧本并拆解
	storyboards := testutils.BatchStoryboardFactory(5, project.ID, script.ID)

	// 设置分镜数据
	sceneDescriptions := []string{
		"阳光明媚的早晨，主人公走在乡间小路上",
		"主人公来到了一片神秘的森林",
		"在森林深处发现了一个古老的宝箱",
		"打开宝箱，里面有一张藏宝图",
		"按照藏宝图的指引，最终找到了宝藏",
	}

	for i, sb := range storyboards {
		sb.ID = uint64(i + 1)
		sb.Description = sceneDescriptions[i]
		sb.Prompt = "8k, cinematic, " + sceneDescriptions[i]
		sb.Duration = 5
		sb.Status = "pending"
	}

	// 验证分镜
	assert.Len(s.T(), storyboards, 5)
	for i, sb := range storyboards {
		assert.Equal(s.T(), project.ID, sb.ProjectID)
		assert.Equal(s.T(), script.ID, sb.ScriptID)
		assert.Equal(s.T(), i+1, sb.Sequence)
		assert.NotEmpty(s.T(), sb.Description)
		assert.NotEmpty(s.T(), sb.Prompt)
	}
}

func (s *ServiceCommunicationIntegrationTestSuite) TestStoryboardToImageFlow() {
	// 测试分镜服务到图片服务的流程

	userID := uint64(200)
	project := testutils.ProjectFactory(func(p *db.Project) {
		p.UserID = userID
		p.ID = 20
	})

	script := testutils.ScriptFactory(func(s *db.Script) {
		s.ProjectID = project.ID
		s.ID = 20
	})

	storyboards := testutils.BatchStoryboardFactory(3, project.ID, script.ID)
	for i, sb := range storyboards {
		sb.ID = uint64(i + 10)
		sb.Status = "completed"
	}

	// 图片服务为每个分镜生成图片
	var images []*db.Image
	for _, sb := range storyboards {
		img := testutils.ImageFactory(func(i *db.Image) {
			i.ID = sb.ID
			i.StoryboardID = sb.ID
			i.Prompt = sb.Prompt
			i.URL = "https://minio.local/images/" + string(rune(sb.ID)) + ".jpg"
			i.Model = "banana-2"
			i.Status = "completed"
		})
		images = append(images, img)
	}

	// 验证图片
	assert.Len(s.T(), images, 3)
	for _, img := range images {
		assert.NotZero(s.T(), img.StoryboardID)
		assert.NotEmpty(s.T(), img.URL)
		assert.Equal(s.T(), "banana-2", img.Model)
		assert.Equal(s.T(), "completed", img.Status)
	}
}

func (s *ServiceCommunicationIntegrationTestSuite) TestImageToVideoFlow() {
	// 测试图片服务到视频服务的流程

	userID := uint64(300)
	project := testutils.ProjectFactory(func(p *db.Project) {
		p.UserID = userID
		p.ID = 30
	})

	script := testutils.ScriptFactory(func(s *db.Script) {
		s.ProjectID = project.ID
		s.ID = 30
	})

	storyboards := testutils.BatchStoryboardFactory(3, project.ID, script.ID)
	for i, sb := range storyboards {
		sb.ID = uint64(i + 20)
	}

	var images []*db.Image
	var videos []*db.Video
	for _, sb := range storyboards {
		img := testutils.ImageFactory(func(i *db.Image) {
			i.ID = sb.ID
			i.StoryboardID = sb.ID
			i.Status = "completed"
		})
		images = append(images, img)

		// 视频服务为每个分镜生成视频
		video := testutils.VideoFactory(func(v *db.Video) {
			v.ID = sb.ID
			v.StoryboardID = sb.ID
			v.ImageURLs = `["` + img.URL + `"]`
			v.URL = "https://minio.local/videos/" + string(rune(sb.ID)) + ".mp4"
			v.Model = "seedance"
			v.Duration = 5
			v.Status = "completed"
		})
		videos = append(videos, video)
	}

	// 验证视频
	assert.Len(s.T(), videos, 3)
	for _, video := range videos {
		assert.NotZero(s.T(), video.StoryboardID)
		assert.NotEmpty(s.T(), video.ImageURLs)
		assert.NotEmpty(s.T(), video.URL)
		assert.Equal(s.T(), "seedance", video.Model)
		assert.Equal(s.T(), 5, video.Duration)
	}
}

func (s *ServiceCommunicationIntegrationTestSuite) TestVideoToMergeFlow() {
	// 测试视频服务到拼接服务的流程

	userID := uint64(400)
	project := testutils.ProjectFactory(func(p *db.Project) {
		p.UserID = userID
		p.ID = 40
	})

	script := testutils.ScriptFactory(func(s *db.Script) {
		s.ProjectID = project.ID
		s.ID = 40
	})

	storyboards := testutils.BatchStoryboardFactory(5, project.ID, script.ID)
	for i, sb := range storyboards {
		sb.ID = uint64(i + 30)
	}

	var videos []*db.Video
	var segmentURLs []string
	for _, sb := range storyboards {
		video := testutils.VideoFactory(func(v *db.Video) {
			v.ID = sb.ID
			v.StoryboardID = sb.ID
			v.URL = "https://minio.local/videos/seg_" + string(rune(sb.ID)) + ".mp4"
			v.Status = "completed"
		})
		videos = append(videos, video)
		segmentURLs = append(segmentURLs, video.URL)
	}

	// 拼接服务合并视频
	mergedVideo := testutils.MergedVideoFactory(func(mv *db.MergedVideo) {
		mv.ID = 40
		mv.ProjectID = project.ID
		mv.SegmentURLs = `["` + segmentURLs[0] + `","` + segmentURLs[1] + `","` + segmentURLs[2] + `","` + segmentURLs[3] + `","` + segmentURLs[4] + `"]`
		mv.URL = "https://minio.local/videos/final_" + string(rune(project.ID)) + ".mp4"
		mv.Duration = 25 // 5个镜头，每个5秒
		mv.Status = "completed"
	})

	// 验证合并后的视频
	assert.NotNil(s.T(), mergedVideo)
	assert.Equal(s.T(), project.ID, mergedVideo.ProjectID)
	assert.NotEmpty(s.T(), mergedVideo.SegmentURLs)
	assert.NotEmpty(s.T(), mergedVideo.URL)
	assert.Equal(s.T(), 25, mergedVideo.Duration)
	assert.Equal(s.T(), "completed", mergedVideo.Status)
}

func (s *ServiceCommunicationIntegrationTestSuite) TestFullWorkflowDataTransfer() {
	// 测试完整工作流的数据传递

	userID := uint64(500)
	project, script, storyboards, images, videos, mergedVideo := testutils.CreateCompleteProject(userID)

	// 设置完整的ID关系链
	project.ID = 50
	script.ID = 50
	script.ProjectID = project.ID

	var imageURLs []string
	var videoURLs []string
	var segmentURLs []string

	for i, sb := range storyboards {
		sb.ID = uint64(i + 100)
		sb.ProjectID = project.ID
		sb.ScriptID = script.ID

		images[i].ID = uint64(i + 200)
		images[i].StoryboardID = sb.ID
		imageURLs = append(imageURLs, images[i].URL)

		videos[i].ID = uint64(i + 300)
		videos[i].StoryboardID = sb.ID
		videos[i].ImageURLs = `["` + images[i].URL + `"]`
		videoURLs = append(videoURLs, videos[i].URL)
		segmentURLs = append(segmentURLs, videos[i].URL)
	}

	mergedVideo.ID = 50
	mergedVideo.ProjectID = project.ID
	mergedVideo.SegmentURLs = `["` + segmentURLs[0] + `","` + segmentURLs[1] + `","` + segmentURLs[2] + `","` + segmentURLs[3] + `","` + segmentURLs[4] + `"]`

	// 验证完整数据链的正确性
	assert.Equal(s.T(), script.ProjectID, project.ID)

	for i, sb := range storyboards {
		assert.Equal(s.T(), sb.ProjectID, project.ID)
		assert.Equal(s.T(), sb.ScriptID, script.ID)
		assert.Equal(s.T(), images[i].StoryboardID, sb.ID)
		assert.Equal(s.T(), videos[i].StoryboardID, sb.ID)
	}

	assert.Equal(s.T(), mergedVideo.ProjectID, project.ID)
}
