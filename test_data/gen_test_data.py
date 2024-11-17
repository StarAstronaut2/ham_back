import random
from faker import Faker
import bcrypt
from datetime import datetime, timedelta
import itertools
import uuid  # 添加库导入
import time

fake = Faker(['zh_CN'])

class DataGenerator:
    def __init__(self):
        self.current_time = datetime.now()  # 初始化当前时间
        self.departments = {
            'CS': '计算机科学与技术学院',
            'MATH': '数学与统计学院',
            'PHY': '物理科学与技术学院',
            'CHEM': '化学与分子工程学院',
            'BIO': '生命科学学院',
            'ENG': '外国语学院',
            'HIST': '历史文化学院',
            'LAW': '法学院',
            'ECON': '经济学院',
            'MANAGE': '管理学院',
            'MED': '医学院',
            'ART': '艺术学院',
            'EDU': '教育学院',
            'ENV': '环境科学与工程学院',
            'ARCH': '建筑学院'
        }
        self.classrooms = self._generate_classrooms()

        self.course_topics = {
            'CS': ['人工智能', '数据结构', '算法设计', '操作系统', '数据库系统', '计算机网络', '软件工程'],
            'MATH': ['微积分', '线性代数', '概率论', '数理统计', '离散数学', '数学分析', '拓扑学'],
            'PHY': ['量子力学', '电动力学', '热力学', '光学', '固体物理', '原子物理', '核物理'],
            'CHEM': ['有机化学', '无机化学', '物理化学', '分析化学', '生物化学', '高分子化学', '环境化学'],
            'BIO': ['细胞生物学', '遗传学', '生物化学', '生态学', '微生物学', '分子生物学', '神经生物学'],
            'ENG': ['英语文学', '语言学', '翻译理论', '英语写作', '口语交流', '跨文化交际', '英语教学法'],
            'HIST': ['世界史', '中国近现代史', '考古学', '历史文献学', '文化史', '经济史', '军事史'],
            'LAW': ['宪法学', '民法学', '刑法学', '行政法学', '国际法', '商法', '知识产权法'],
            'ECON': ['宏观经济学', '微观经济学', '国际经济学', '金融学', '计量经济学', '发展经济学', '劳动经济学'],
            'MANAGE': ['管理学原理', '市场营销', '人力资源管理', '财务管理', '运营管理', '战略管理', '组织行为学'],
            'MED': ['人体解剖学', '生理学', '病理学', '药理学', '内科学', '外科学', '儿科学'],
            'ART': ['艺术概论', '美术史', '音乐理论', '戏剧艺术', '舞蹈艺术', '影视艺术', '设计基础'],
            'EDU': ['教育学原理', '教育心理学', '课程与教学论', '教育技术学', '教育管理学', '特殊教育学', '比较教育学'],
            'ENV': ['环境科学', '环境工程', '环境监测', '环境影响评价', '环境管理', '生态环境保护', '环境化学'],
            'ARCH': ['建筑设计', '建筑史', '城市规划', '建筑结构', '建筑材料', '建筑物理', '建筑施工']
        }
        self.course_types = ['基础', '原理', '导论', '实验', '研究', '专题', '实践']
    def generate_course_name(self, department_code):
        topic = random.choice(self.course_topics[department_code])
        course_type = random.choice(self.course_types)
        return f"{topic}{course_type}"
    def _generate_classrooms(self):
        buildings = ['A', 'B', 'C', 'D']
        floors = range(1, 6)
        rooms = range(1, 11)
        regular_rooms = [f'{b}{f:01d}{r:02d}' for b in buildings
                        for f in floors for r in rooms]

        # 特殊教室
        special_rooms = [f'{b}{f:01d}{r:02d}实验室' for b in ['B', 'D']
                        for f in [1,2] for r in range(1,6)]
        special_rooms.extend([f'{b}{f:01d}{r:02d}机房' for b in ['B']
                            for f in [2,3] for r in range(1,6)])

        return regular_rooms + special_rooms

    def generate_password_hash(self, password='password123'):
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def generate_users(self, count=500):
        users = []
        used_usernames = set()

        # 先生成一个管理员
        admin = {
            'id': hash('admin') % (2**31),  # 生成唯一 ID
            'username': 'admin',
            'password': self.generate_password_hash(),
            'email': 'admin@university.edu.cn',
            'isAdmin': True
        }
        users.append(admin)
        used_usernames.add('admin')

        # 生成普通用户
        for i in range(count):
            while True:
                username = fake.user_name()
                if username not in used_usernames:
                    used_usernames.add(username)
                    break

            user = {
                'id': hash(username) % (2**31),  # 将哈希值映射到 0 至 2,147,483,647 范围内,  # 生成唯一 ID
                'username': username,
                'password': self.generate_password_hash(),
                'email': f'{username}@university.edu.cn',
                'isAdmin': False
            }
            users.append(user)

        return users

    def generate_courses(self, count=2000):
        courses = []
        used_course_ids = set()

        for dept_code, dept_name in self.departments.items():
            # 每个院系生成多个课程
            course_count = count // len(self.departments)

            for i in range(course_count):
                while True:
                    course_num = random.randint(100, 499)
                    course_id = f'{dept_code}{course_num}'
                    if course_id not in used_course_ids:
                        used_course_ids.add(course_id)
                        break

                capacity = random.randint(30, 120)
                enrolled = random.randint(0, capacity)

                course_name = self.generate_course_name(dept_code)

                course = {
                    'courseId': course_id,
                    'name': course_name,
                    'credit': random.choice([2.0, 2.5, 3.0, 4.0, 5.0]),
                    'instructor': fake.name() + random.choice(['教授', '副教授', '讲师']),
                    'department': dept_name,
                    'description': f'这是一门关于{course_name}的课程，适合对{course_name}感兴趣的学生。',
                    'capacity': capacity,
                    'enrolled': enrolled,
                    'academicYear': random.randint(2014,2024),
                    'semester': random.randint(1,3)
                }
                courses.append(course)

        return courses

    def generate_course_schedules(self, courses):
        schedules = []
        used_slots = set()  # 用于检查时间冲突

        for course in courses:
            # 每门课程1-3个时间段
            num_sessions = random.randint(1, 3)
            course_slots = []
            course_end_week = random.randint(10, 16)

            for _ in range(num_sessions):
                max_attempts = 50  # 防止无限循环
                attempts = 0

                while attempts < max_attempts:
                    day = random.randint(1, 5)  # 周一到周五
                    start_slot = random.randint(1, 8)  # 第1-8节课
                    duration = random.randint(2, 3)  # 持续2-3节课
                    end_slot = min(start_slot + duration - 1, 10)

                    # 检查时间冲突
                    slot_key = (day, tuple(range(start_slot, end_slot + 1)))
                    if slot_key not in used_slots:
                        used_slots.add(slot_key)
                        course_slots.append((day, start_slot, end_slot))
                        break

                    attempts += 1

            # 为每个时间段创建课程安排
            for day, start_slot, end_slot in course_slots:
                # 决定单双周
                week_type = random.choice(['all', 'odd', 'even'])
                # 随机选择教室
                classroom = random.choice(self.classrooms)

                schedule = {
                    'courseId': course['courseId'],
                    'dayOfWeek': day,
                    'startSlot': start_slot,
                    'endSlot': end_slot,
                    'classroom': classroom,
                    'weekStart': 1,
                    'weekEnd': course_end_week,
                    'weekType': week_type
                }
                schedules.append(schedule)

        return schedules

    def generate_student_courses(self, students, courses):
        student_courses = []

        for student in students:
            if student['isAdmin']:  # 跳过管理员
                continue

            # 每个学生选3-6门课
            num_courses = random.randint(3, 7)
            selected_courses = random.sample(courses, num_courses)

            base_time = self.current_time - timedelta(days=30)

            for course in selected_courses:
                # 大部分是已选状态，少部分退课
                status = random.choices(['selected', 'dropped'], weights=[0.9, 0.1])[0]

                # 选课时间在一定范围内随机
                select_time = base_time + timedelta(
                    hours=random.randint(0, 72),
                    minutes=random.randint(0, 59)
                )

                student_course = {
                    'studentId': student['id'],  # id
                    'courseId': course['courseId'],
                    'status': status,
                    'selectTime': select_time
                }
                student_courses.append(student_course)

        return student_courses

    def generate_sql(self):
        # 生成数据
        users = self.generate_users(500)
        courses = self.generate_courses(2000)
        schedules = self.generate_course_schedules(courses)
        student_courses = self.generate_student_courses(users, courses)

        # 生成SQL语句
        sql = []

        # 清空现有数据
        sql.append("DELETE FROM StudentCourses;")
        sql.append("DELETE FROM CourseSchedules;")
        sql.append("DELETE FROM Courses;")
        sql.append("DELETE FROM Users;")
        sql.append("")

        # 插入用户数据
        sql.append("INSERT INTO Users (id, username, password, email, isAdmin, createdAt, updatedAt) VALUES")
        user_values = []
        for user in users:
            user_values.append(
                f"('{user['id']}', '{user['username']}', '{user['password']}', '{user['email']}', "
                f"{'true' if user['isAdmin'] else 'false'}, NOW(), NOW())"
            )
        sql.append(",\n".join(user_values) + ";")
        sql.append("")

        # 插入课程数据
        sql.append("INSERT INTO Courses (courseId, name, credit, instructor, department, description, "
                  "capacity, enrolled, academicYear, semester, createdAt, updatedAt) VALUES")
        course_values = []
        for course in courses:
            course_values.append(
                f"('{course['courseId']}', '{course['name']}', {course['credit']}, "
                f"'{course['instructor']}', '{course['department']}', '{course['description']}', "
                f"{course['capacity']}, {course['enrolled']}, {course['academicYear']}, "
                f"{course['semester']}, NOW(), NOW())"
            )
        sql.append(",\n".join(course_values) + ";")
        sql.append("")

        # 插入课程安排数据
        sql.append("INSERT INTO CourseSchedules (courseId, dayOfWeek, startSlot, endSlot, classroom, "
                  "weekStart, weekEnd, weekType, createdAt, updatedAt) VALUES")
        schedule_values = []
        for schedule in schedules:
            schedule_values.append(
                f"('{schedule['courseId']}', {schedule['dayOfWeek']}, {schedule['startSlot']}, "
                f"{schedule['endSlot']}, '{schedule['classroom']}', {schedule['weekStart']}, "
                f"{schedule['weekEnd']}, '{schedule['weekType']}', NOW(), NOW())"
            )
        sql.append(",\n".join(schedule_values) + ";")
        sql.append("")

        # 插入选课数据
        sql.append("INSERT INTO StudentCourses (studentId, courseId, status, selectTime, "
                  "createdAt, updatedAt) VALUES")
        student_course_values = []
        for sc in student_courses:
            student_course_values.append(
                f"('{sc['studentId']}', '{sc['courseId']}', '{sc['status']}', "
                f"'{sc['selectTime'].strftime('%Y-%m-%d %H:%M:%S')}', NOW(), NOW())"
            )
        sql.append(",\n".join(student_course_values) + ";")

        return "\n".join(sql)

# 使用示例
if __name__ == "__main__":
    generator = DataGenerator()
    sql = generator.generate_sql()

    # 将SQL语句写入文件
    with open('generated_test_data-Big-Data.sql', 'w', encoding='utf-8') as f:
        f.write(sql)