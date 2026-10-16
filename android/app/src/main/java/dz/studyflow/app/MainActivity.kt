package dz.studyflow.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dz.studyflow.app.model.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StudyFlowApp()
        }
    }
}

enum class Screen(val title: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    HOME("الرئيسية", Icons.Filled.Home),
    STUDY("الدراسة", Icons.Filled.MenuBook),
    COMMUNITY("المجتمع", Icons.Filled.Forum),
    NOTIFICATIONS("الإشعارات", Icons.Filled.Notifications),
    PROFILE("حسابي", Icons.Filled.Person)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudyFlowApp() {
    var currentScreen by remember { mutableStateOf(Screen.HOME) }
    var currentUser by remember {
        mutableStateOf<User?>(
            User(
                id = "user-student-1",
                name = "فوديل كابورة",
                email = "fodilkaboura1@gmail.com",
                avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                role = "student",
                specialtyId = "spec-management",
                specialtyName = "إدارة الأعمال (علوم التسيير)",
                levelId = "lvl-l3",
                levelName = "السنة الثالثة ليسانس",
                bio = "طالب سنة ثالثة ليسانس في إدارة الأعمال وعلوم التسيير — جامعة عبد الحميد بن باديس مستغانم.",
                verified = true,
                badge = "مشرف",
                followingIds = listOf("user-admin"),
                savedPostIds = listOf("post-official-1")
            )
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = Color(0xFF6366F1),
                            modifier = Modifier.size(36.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("📚", fontSize = 18.sp)
                            }
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("Study", fontWeight = FontWeight.Black, fontSize = 17.sp, color = Color.White)
                                Text("Flow", fontWeight = FontWeight.Black, fontSize = 17.sp, color = Color(0xFF38BDF8))
                            }
                            Text("منصتك الأكاديمية المتكاملة", fontSize = 10.sp, color = Color(0xFF94A3B8))
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0C1220),
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF0C1220),
                tonalElevation = 8.dp
            ) {
                Screen.values().forEach { screen ->
                    val selected = currentScreen == screen
                    NavigationBarItem(
                        selected = selected,
                        onClick = { currentScreen = screen },
                        icon = {
                            Icon(
                                screen.icon,
                                contentDescription = screen.title,
                                tint = if (selected) Color(0xFF818CF8) else Color(0xFF64748B)
                            )
                        },
                        label = {
                            Text(
                                screen.title,
                                fontSize = 10.sp,
                                fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                color = if (selected) Color(0xFF818CF8) else Color(0xFF64748B)
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            indicatorColor = Color(0xFF1E1B4B)
                        )
                    )
                }
            }
        },
        containerColor = Color(0xFF060A14)
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (currentScreen) {
                Screen.HOME -> HomeScreen(user = currentUser, onNavigateToStudy = { currentScreen = Screen.STUDY })
                Screen.STUDY -> StudyScreen(user = currentUser)
                Screen.COMMUNITY -> CommunityScreen(user = currentUser)
                Screen.NOTIFICATIONS -> NotificationsScreen()
                Screen.PROFILE -> ProfileScreen(user = currentUser)
            }
        }
    }
}

@Composable
fun HomeScreen(user: User?, onNavigateToStudy: () -> Unit) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Welcome Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0C1220)),
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("مساء الخير، ${user?.name ?: "فوديل كابورة"} 👋", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Text("15 أكتوبر 2026 — خميس", color = Color(0xFF8894B0), fontSize = 11.sp)
                        }
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = Color(0xFF6366F1),
                            modifier = Modifier.size(36.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("ف", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFF141C2E),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            "🏛️ جامعة عبد الحميد بن باديس مستغانم - إدارة الأعمال",
                            color = Color(0xFFCBD5E1),
                            fontSize = 11.sp,
                            modifier = Modifier.padding(8.dp)
                        )
                    }
                }
            }
        }

        // Thursday Schedule
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0C1220)),
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("🕒 جدول اليوم (خميس)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF141C2E), RoundedCornerShape(10.dp))
                            .padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("إدارة المشاريع", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text("محاضرة • أ/ قبايلي • مدرج 04", color = Color(0xFF8894B0), fontSize = 10.sp)
                        }
                        Text("08:00 - 09:30", color = Color(0xFF818CF8), fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF141C2E), RoundedCornerShape(10.dp))
                            .padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("هياكل وتنظيم المؤسسة", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text("محاضرة • أ/ دحمان • مدرج 04", color = Color(0xFF8894B0), fontSize = 10.sp)
                        }
                        Text("09:30 - 11:00", color = Color(0xFF818CF8), fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                }
            }
        }

        // 8 Course Subjects
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0C1220)),
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("📚 المواد الدراسية (8)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        TextButton(onClick = onNavigateToStudy) {
                            Text("عرض الكل ←", color = Color(0xFF818CF8), fontSize = 11.sp)
                        }
                    }
                    val subjects = listOf(
                        "⚖️ قانون الأعمال",
                        "🔤 لغة أجنبية متخصصة",
                        "💰 إدارة مالية",
                        "👥 إدارة الموارد البشرية",
                        "📊 تقنيات الاستقصاء",
                        "💻 إدارة تكنولوجيا المعلومات",
                        "📋 إدارة المشاريع",
                        "🏢 هياكل وتنظيم المؤسسة"
                    )
                    subjects.chunked(2).forEach { rowSubjects ->
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            rowSubjects.forEach { subj ->
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = Color(0xFF141C2E),
                                    modifier = Modifier.weight(1f).padding(vertical = 4.dp)
                                ) {
                                    Text(subj, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(8.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StudyScreen(user: User?) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("قسم الدراسة — المقاييس والمحاضرات", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Text(
            "المواد المعتمدة: إدارة الأعمال (علوم التسيير) - السنة الثالثة ليسانس",
            color = Color(0xFF8894B0),
            fontSize = 11.sp
        )
        Spacer(modifier = Modifier.height(14.dp))

        val coursesList = listOf(
            Triple("إدارة المشاريع", "أ/ قبايلي • مدرج 04", "3 محاضرات"),
            Triple("هياكل وتنظيم المؤسسة", "أ/ دحمان • مدرج 04", "3 محاضرات"),
            Triple("إدارة مالية", "د. بوعلام توفيق", "4 محاضرات"),
            Triple("قانون الأعمال", "أ.د. بن علي مختار", "3 محاضرات"),
            Triple("إدارة الموارد البشرية", "د. حيمود فايزة", "3 محاضرات"),
            Triple("إدارة تكنولوجيا المعلومات", "د. مزيان رياض", "3 محاضرات")
        )

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(coursesList) { (title, inst, lecs) ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0C1220)),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(inst, color = Color(0xFF8894B0), fontSize = 10.sp)
                            Text(lecs, color = Color(0xFF38BDF8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CommunityScreen(user: User?) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("المجتمع الطلابي والأكاديمي", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(12.dp))
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0C1220)),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text("📢 إعلان رسمي: جدول امتحانات المراقبة المستمرة للفصل الأول", color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    "تعلن نيابة العمادة عن نشر الجداول الرسمية لجميع الأطوار. يُرجى مراجعة المدرجات المخصصة.",
                    color = Color(0xFFCBD5E0),
                    fontSize = 11.sp,
                    lineHeight = 17.sp
                )
            }
        }
    }
}

@Composable
fun NotificationsScreen() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("مركز الإشعارات", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(12.dp))
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0C1220)),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text("إعلان رسمي جديد", color = Color(0xFF818CF8), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                Text("تم تحديث جداول محاضرات السداسي الأول لكلية العلوم الاقتصادية.", color = Color(0xFFCBD5E0), fontSize = 11.sp)
            }
        }
    }
}

@Composable
fun ProfileScreen(user: User?) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Surface(
            shape = RoundedCornerShape(32.dp),
            color = Color(0xFF6366F1),
            modifier = Modifier.size(64.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text("ف", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
            }
        }
        Spacer(modifier = Modifier.height(10.dp))
        Text(user?.name ?: "فوديل كابورة", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Text(user?.email ?: "fodilkaboura1@gmail.com", color = Color(0xFF8894B0), fontSize = 11.sp)
        Spacer(modifier = Modifier.height(16.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0C1220)),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("🏛️ جامعة عبد الحميد بن باديس مستغانم", color = Color.White, fontSize = 12.sp)
                Text("🎓 ليسانس / السنة الثالثة", color = Color(0xFFCBD5E0), fontSize = 12.sp)
                Text("📚 إدارة الأعمال (علوم التسيير)", color = Color(0xFF818CF8), fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
}
