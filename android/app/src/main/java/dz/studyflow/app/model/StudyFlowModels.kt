package dz.studyflow.app.model

import com.google.gson.annotations.SerializedName

data class User(
    val id: String,
    val name: String,
    val email: String,
    val avatar: String,
    val role: String, // "student" or "admin"
    val specialtyId: String,
    val specialtyName: String,
    val levelId: String,
    val levelName: String,
    val bio: String,
    val verified: Boolean,
    val badge: String?,
    val followingIds: List<String>?,
    val savedPostIds: List<String>?
)

data class LoginResponse(
    val token: String,
    val user: User
)

data class Course(
    val id: String,
    val code: String,
    val name: String,
    val specialtyId: String,
    val levelId: String,
    val semester: String,
    val credits: Int,
    val coefficient: Int,
    val instructor: String,
    val description: String,
    val icon: String,
    val lectureCount: Int
)

data class CoursesResponse(
    val courses: List<Course>
)

data class LectureResource(
    val id: String,
    val name: String,
    val type: String,
    val url: String,
    val size: String?
)

data class AIStudyQuestion(
    val question: String,
    val answer: String
)

data class Lecture(
    val id: String,
    val courseId: String,
    val courseName: String,
    val title: String,
    val week: Int,
    val summary: String,
    val keyTakeaways: List<String>,
    val slidesUrl: String?,
    val resources: List<LectureResource>,
    val aiStudyQuestions: List<AIStudyQuestion>,
    val createdAt: String
)

data class LecturesResponse(
    val lectures: List<Lecture>
)

data class PostAttachment(
    val type: String, // "image" or "file"
    val url: String,
    val name: String,
    val size: String?
)

data class PostComment(
    val id: String,
    val authorId: String,
    val authorName: String,
    val authorAvatar: String,
    val authorRole: String,
    val authorBadge: String?,
    val text: String,
    val createdAt: String
)

data class CommunityPost(
    val id: String,
    val authorId: String,
    val authorName: String,
    val authorAvatar: String,
    val authorRole: String,
    val isOfficial: Boolean,
    val authorBadge: String?,
    val category: String, // announcement, news, event, internship, competition, discussion
    val title: String,
    val content: String,
    val attachments: List<PostAttachment>,
    val likes: List<String>,
    val comments: List<PostComment>,
    val tags: List<String>,
    val createdAt: String
)

data class PostsResponse(
    val posts: List<CommunityPost>
)

data class AppNotification(
    val id: String,
    val userId: String,
    val title: String,
    val message: String,
    val type: String,
    val targetId: String?,
    val isRead: Boolean,
    val createdAt: String
)

data class NotificationsResponse(
    val notifications: List<AppNotification>
)

data class CreatePostRequest(
    val title: String,
    val content: String,
    val category: String,
    val attachments: List<PostAttachment> = emptyList(),
    val tags: List<String> = emptyList()
)

data class AIAssistantRequest(
    val lectureId: String?,
    val question: String,
    val courseName: String?
)

data class AIAssistantResponse(
    val answer: String,
    val source: String
)
