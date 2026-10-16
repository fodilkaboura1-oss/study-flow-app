package dz.studyflow.app.network

import dz.studyflow.app.model.*
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

interface StudyFlowApiService {

    @POST("auth/login")
    suspend fun login(
        @Body credentials: Map<String, String>
    ): Response<LoginResponse>

    @GET("auth/me")
    suspend fun getProfile(
        @Header("Authorization") token: String
    ): Response<Map<String, User>>

    @GET("academic/courses")
    suspend fun getCourses(
        @Query("specialtyId") specialtyId: String?,
        @Query("levelId") levelId: String?
    ): Response<CoursesResponse>

    @GET("academic/lectures")
    suspend fun getLectures(
        @Query("courseId") courseId: String
    ): Response<LecturesResponse>

    @GET("community/posts")
    suspend fun getPosts(
        @Query("category") category: String?,
        @Query("search") search: String?
    ): Response<PostsResponse>

    @POST("community/posts")
    suspend fun createPost(
        @Header("Authorization") token: String,
        @Body request: CreatePostRequest
    ): Response<Map<String, CommunityPost>>

    @POST("community/posts/{id}/like")
    suspend fun toggleLike(
        @Header("Authorization") token: String,
        @Path("id") postId: String
    ): Response<Map<String, Any>>

    @POST("community/posts/{id}/comment")
    suspend fun addComment(
        @Header("Authorization") token: String,
        @Path("id") postId: String,
        @Body body: Map<String, String>
    ): Response<Map<String, PostComment>>

    @GET("notifications")
    suspend fun getNotifications(
        @Header("Authorization") token: String
    ): Response<NotificationsResponse>

    @POST("ai/study-assistant")
    suspend fun askAIAssistant(
        @Header("Authorization") token: String,
        @Body request: AIAssistantRequest
    ): Response<AIAssistantResponse>

    companion object {
        // Point to the live StudyFlow Backend URL or local emulator IP (10.0.2.2)
        const val BASE_URL = "http://10.0.2.2:3000/api/"

        fun create(): StudyFlowApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(StudyFlowApiService::class.java)
        }
    }
}
