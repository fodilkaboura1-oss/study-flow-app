import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { StudyFlowLogo } from '../StudyFlowLogo.tsx';
import {
  Smartphone,
  Terminal,
  FileCode,
  ShieldCheck,
  Copy,
  Cpu,
  Layers,
} from 'lucide-react';

interface AndroidProjectViewProps {
  isDayMode?: boolean;
}

export const AndroidProjectView: React.FC<AndroidProjectViewProps> = ({ isDayMode = false }) => {
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<string>('MainActivity.kt');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getAndroidProjectInfo().then(setProjectInfo).catch(console.error);
  }, []);

  const filesMap: Record<string, string> = {
    'MainActivity.kt': `package dz.studyflow.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.*
import androidx.compose.runtime.*
import dz.studyflow.app.network.StudyFlowApiService

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            // Native Jetpack Compose App with Bottom Navigation & Shared API
            StudyFlowApp()
        }
    }
}`,
    'StudyFlowApiService.kt': `package dz.studyflow.app.network

import retrofit2.http.*
import retrofit2.Response
import dz.studyflow.app.model.*

interface StudyFlowApiService {
    @POST("auth/login")
    suspend fun login(@Body credentials: Map<String, String>): Response<LoginResponse>

    @GET("academic/courses")
    suspend fun getCourses(
        @Query("specialtyId") specialtyId: String?,
        @Query("levelId") levelId: String?
    ): Response<CoursesResponse>

    @GET("academic/lectures")
    suspend fun getLectures(@Query("courseId") courseId: String): Response<LecturesResponse>

    @GET("community/posts")
    suspend fun getPosts(@Query("category") category: String?): Response<PostsResponse>

    @POST("community/posts")
    suspend fun createPost(
        @Header("Authorization") token: String,
        @Body request: CreatePostRequest
    ): Response<Map<String, CommunityPost>>
}`,
    'AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="dz.studyflow.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="StudyFlow"
        android:theme="@style/Theme.StudyFlow"
        android:supportsRtl="true">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    'build.gradle (app)': `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'dz.studyflow.app'
    compileSdk 34

    defaultConfig {
        applicationId "dz.studyflow.app"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }

    buildFeatures {
        compose true
    }
}

dependencies {
    implementation 'androidx.compose.material3:material3:1.2.0'
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
}`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(filesMap[selectedFile] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex-1 overflow-y-auto p-6 space-y-6 font-sans transition-colors duration-200 ${
        isDayMode ? 'bg-slate-50 text-slate-800' : 'text-slate-100'
      }`}
    >
      {/* Header */}
      <div
        className={`border p-6 rounded-3xl transition-colors ${
          isDayMode
            ? 'bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/80 border-indigo-200 shadow-xs'
            : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <StudyFlowLogo size="lg" isDayMode={isDayMode} />
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-xl font-black ${
                    isDayMode ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  تطبيق StudyFlow أندرويد المستقل
                </h2>
                <span className="text-xs bg-emerald-500/20 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  مشروع أصلي (Native Kotlin)
                </span>
              </div>
              <p
                className={`text-xs mt-1 ${
                  isDayMode ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                تطبيق موبايل مستقل تم إنشاؤه داخل مجلد{' '}
                <code
                  className={`px-1.5 py-0.5 rounded font-mono ${
                    isDayMode ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-800 text-indigo-300'
                  }`}
                >
                  /android
                </code>{' '}
                يتصل عبر REST API آمنة بالمنصة المشتركة.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`p-4 border rounded-2xl ${
            isDayMode
              ? 'bg-white border-slate-200 shadow-xs text-slate-800'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2">
            <Cpu className="w-4 h-4" />
            <span>التقنية المعمارية</span>
          </div>
          <p
            className={`text-xs leading-relaxed ${
              isDayMode ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Kotlin + Jetpack Compose (Material3) لتجربة استخدام أندرويد أصلية وسلسة مع شريط تنقل سفلي مخصص ودعم كامل لاتجاه RTL.
          </p>
        </div>

        <div
          className={`p-4 border rounded-2xl ${
            isDayMode
              ? 'bg-white border-slate-200 shadow-xs text-slate-800'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 text-sky-600 font-bold text-sm mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>المصادقة والأمان</span>
          </div>
          <p
            className={`text-xs leading-relaxed ${
              isDayMode ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            حساب الطالب الموحد (Bearer Token) دون تخزين كلمات المرور محلياً، مع حماية الإعلانات الرسمية بحيث تقتصر على الحسابات الإدارية الموثقة.
          </p>
        </div>

        <div
          className={`p-4 border rounded-2xl ${
            isDayMode
              ? 'bg-white border-slate-200 shadow-xs text-slate-800'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-2">
            <Layers className="w-4 h-4" />
            <span>تزامن البيانات المشتركة</span>
          </div>
          <p
            className={`text-xs leading-relaxed ${
              isDayMode ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            المواد والمحاضرات والإعلانات تتطابق 100% بين المنصة والتطبيق، وعزل تام لمحاضرات كل مقياس لمنع أي تداخل.
          </p>
        </div>
      </div>

      {/* APK Compilation Instructions */}
      <div
        className={`border rounded-2xl p-6 space-y-4 ${
          isDayMode
            ? 'bg-white border-slate-200 shadow-xs text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <h3
          className={`text-base font-bold flex items-center gap-2 ${
            isDayMode ? 'text-slate-900' : 'text-white'
          }`}
        >
          <Terminal className="w-5 h-5 text-indigo-600" />
          <span>خطوات بناء ملف الـ APK وتجربته على الهاتف المحمول</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div
            className={`p-3.5 rounded-xl border space-y-1.5 ${
              isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
            }`}
          >
            <span className="font-bold text-indigo-600">1. فتح المشروع في Android Studio</span>
            <p
              className={`leading-relaxed ${
                isDayMode ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              افتح Android Studio واختر <strong>Open</strong> ثم حدد مجلد{' '}
              <code className="text-indigo-600 font-mono">/android</code> الموجود في المشروع.
            </p>
          </div>

          <div
            className={`p-3.5 rounded-xl border space-y-1.5 ${
              isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
            }`}
          >
            <span className="font-bold text-indigo-600">2. ضبط رابط الخادم BASE_URL</span>
            <p
              className={`leading-relaxed ${
                isDayMode ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              في ملف <code className="text-indigo-600 font-mono">StudyFlowApiService.kt</code> اضبط رابط الـ API على خادم المنصة.
            </p>
          </div>

          <div
            className={`p-3.5 rounded-xl border space-y-1.5 ${
              isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
            }`}
          >
            <span className="font-bold text-indigo-600">3. أمر البناء المباشر (Terminal)</span>
            <div
              className={`p-2 rounded font-mono text-[11px] select-all ${
                isDayMode ? 'bg-slate-100 text-emerald-700' : 'bg-slate-900 text-emerald-400'
              }`}
            >
              ./gradlew assembleRelease
            </div>
            <p
              className={`text-[11px] ${
                isDayMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              أو Build &gt; Build APK(s) من واجهة Android Studio.
            </p>
          </div>

          <div
            className={`p-3.5 rounded-xl border space-y-1.5 ${
              isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
            }`}
          >
            <span className="font-bold text-indigo-600">4. مسار ملف الـ APK الناتج</span>
            <div
              className={`p-2 rounded font-mono text-[10px] ${
                isDayMode ? 'bg-slate-100 text-slate-800' : 'bg-slate-900 text-slate-300'
              }`}
            >
              android/app/build/outputs/apk/release/app-release.apk
            </div>
          </div>
        </div>
      </div>

      {/* Source Code Inspector */}
      <div
        className={`border rounded-2xl overflow-hidden shadow-xs ${
          isDayMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div
          className={`p-4 border-b flex items-center justify-between flex-wrap gap-2 ${
            isDayMode ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-600" />
            <span
              className={`text-xs font-bold ${
                isDayMode ? 'text-slate-900' : 'text-white'
              }`}
            >
              معاينة الملفات المصدرية لمشروع Android
            </span>
          </div>

          <div className="flex items-center gap-2">
            {Object.keys(filesMap).map((fileName) => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`px-3 py-1 text-xs rounded-lg transition font-mono ${
                  selectedFile === fileName
                    ? 'bg-indigo-600 text-white font-bold'
                    : isDayMode
                    ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {fileName}
              </button>
            ))}

            <button
              onClick={handleCopyCode}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition mr-2 ${
                isDayMode
                  ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="نسخ الكود"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
            </button>
          </div>
        </div>

        <div
          dir="ltr"
          className="p-4 bg-slate-950 font-mono text-xs text-slate-300 text-left overflow-x-auto max-h-96 whitespace-pre leading-relaxed select-text"
        >
          {filesMap[selectedFile]}
        </div>
      </div>
    </div>
  );
};
