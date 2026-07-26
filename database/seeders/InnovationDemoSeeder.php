<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\AchievementAttachment;
use App\Models\CognitiveAssessment;
use App\Models\InnovationIndex;
use App\Models\User;
use App\Models\UserQualification;
use App\Models\UserSkill;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * بيانات تجريبية غنية لنظام "إرث المبتكرين":
 * مدرسة + مدربان + 18 طالباً موزعين على التصنيفات الستة،
 * مع إنجازات من الأنواع الثمانية ومهارات ومؤهلات وسجل مؤشرات
 * وتقييمات معرفية (ستانفورد-بينيه) لعدد من الطلاب.
 *
 * التشغيل: php artisan db:seed --class=InnovationDemoSeeder
 * حسابات الدخول: كل الحسابات كلمة مرورها password
 *  - المدرب: coach@demo.com / المدربة: coach2@demo.com
 *  - المدرسة: innovation-school@demo.com
 *  - الطلاب: student1@demo.com ... student18@demo.com
 */
class InnovationDemoSeeder extends Seeder
{
    public function run(): void
    {
        $school = User::updateOrCreate(
            ['email' => 'innovation-school@demo.com'],
            [
                'name' => 'مدرسة إرث المبتكرين النموذجية',
                'password' => Hash::make('password'),
                'role' => 'school',
                'membership_type' => 'subscription',
                'email_verified_at' => now(),
            ]
        );

        $teacher1 = User::updateOrCreate(
            ['email' => 'coach@demo.com'],
            [
                'name' => 'المدرب أحمد الهاشمي',
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'school_id' => $school->id,
                'membership_type' => 'subscription',
                'email_verified_at' => now(),
            ]
        );

        $teacher2 = User::updateOrCreate(
            ['email' => 'coach2@demo.com'],
            [
                'name' => 'المدربة نورة العامري',
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'school_id' => $school->id,
                'membership_type' => 'subscription',
                'email_verified_at' => now(),
            ]
        );

        foreach ($this->studentProfiles() as $i => $profile) {
            $teacher = ($i % 2 === 0) ? $teacher1 : $teacher2;
            $this->seedStudent($i + 1, $profile, $teacher, $school);
        }

        $this->command?->info('✅ تم إنشاء بيانات إرث المبتكرين: مدرسة + مدربان + ' . count($this->studentProfiles()) . ' طالباً.');
    }

    // ─────────────────────────────────────────────────────────
    //  ملفات الطلاب
    // ─────────────────────────────────────────────────────────

    private function studentProfiles(): array
    {
        return [
            // 💎 ماسي
            ['name' => 'سارة المنصوري', 'tier' => 'diamond', 'overall' => 96,
             'indexes' => ['skills' => 97, 'innovation' => 98, 'intelligence' => 95, 'creativity' => 96, 'projects' => 98, 'leadership' => 93, 'ip' => 92, 'future_readiness' => 99],
             'bio' => 'مبتكرة شغوفة بالذكاء الاصطناعي والروبوتات، حاصلة على براءة اختراع.',
             'achievements' => 8, 'skills' => 9, 'cognitive' => 'gifted'],

            // 🏆 بلاتيني
            ['name' => 'محمد الكعبي', 'tier' => 'platinum', 'overall' => 89,
             'indexes' => ['skills' => 90, 'innovation' => 92, 'intelligence' => 88, 'creativity' => 87, 'projects' => 93, 'leadership' => 85, 'ip' => 78, 'future_readiness' => 94],
             'bio' => 'مطوّر تطبيقات وقائد فريق روبوتات المدرسة.',
             'achievements' => 7, 'skills' => 8, 'cognitive' => 'high_average'],
            ['name' => 'فاطمة الزعابي', 'tier' => 'platinum', 'overall' => 86,
             'indexes' => ['skills' => 85, 'innovation' => 90, 'intelligence' => 88, 'creativity' => 91, 'projects' => 87, 'leadership' => 75, 'ip' => 72, 'future_readiness' => 92],
             'bio' => 'باحثة صغيرة مهتمة بعلوم البيانات والاستدامة.',
             'achievements' => 7, 'skills' => 7, 'cognitive' => null],

            // 🥇 ذهبي
            ['name' => 'خالد البلوشي', 'tier' => 'gold', 'overall' => 80,
             'indexes' => ['skills' => 82, 'innovation' => 78, 'intelligence' => 84, 'creativity' => 76, 'projects' => 85, 'leadership' => 74, 'ip' => 65, 'future_readiness' => 83],
             'bio' => 'مهتم بالأمن السيبراني والبرمجة التنافسية.',
             'achievements' => 6, 'skills' => 6, 'cognitive' => 'average'],
            ['name' => 'مريم الشامسي', 'tier' => 'gold', 'overall' => 75,
             'indexes' => ['skills' => 76, 'innovation' => 74, 'intelligence' => 78, 'creativity' => 80, 'projects' => 73, 'leadership' => 70, 'ip' => 58, 'future_readiness' => 79],
             'bio' => 'مصممة جرافيك ومهتمة بتجربة المستخدم.',
             'achievements' => 5, 'skills' => 6, 'cognitive' => null],
            ['name' => 'عبدالله النعيمي', 'tier' => 'gold', 'overall' => 72,
             'indexes' => ['skills' => 74, 'innovation' => 70, 'intelligence' => 75, 'creativity' => 68, 'projects' => 76, 'leadership' => 72, 'ip' => 55, 'future_readiness' => 74],
             'bio' => 'رائد أعمال ناشئ ومؤسس نادي البرمجة.',
             'achievements' => 5, 'skills' => 5, 'cognitive' => null],

            // 🥈 فضي
            ['name' => 'أحمد إبراهيم بكر', 'tier' => 'silver', 'overall' => 65,
             'indexes' => ['skills' => 62, 'innovation' => 70, 'intelligence' => 60, 'creativity' => 72, 'projects' => 68, 'leadership' => 58, 'ip' => 45, 'future_readiness' => 71],
             'bio' => 'موهوب في حل المشكلات المجردة ويطوّر مهاراته خطوة بخطوة.',
             'achievements' => 4, 'skills' => 5, 'cognitive' => 'uneven'],
            ['name' => 'شمة الظاهري', 'tier' => 'silver', 'overall' => 62,
             'indexes' => ['skills' => 64, 'innovation' => 60, 'intelligence' => 65, 'creativity' => 63, 'projects' => 60, 'leadership' => 55, 'ip' => 40, 'future_readiness' => 66],
             'bio' => 'مهتمة بالكتابة العلمية والمقالات التقنية.',
             'achievements' => 4, 'skills' => 4, 'cognitive' => null],
            ['name' => 'سلطان القاسمي', 'tier' => 'silver', 'overall' => 60,
             'indexes' => ['skills' => 58, 'innovation' => 62, 'intelligence' => 61, 'creativity' => 59, 'projects' => 63, 'leadership' => 60, 'ip' => 38, 'future_readiness' => 62],
             'bio' => 'لاعب شطرنج ومهتم بالرياضيات التطبيقية.',
             'achievements' => 4, 'skills' => 4, 'cognitive' => 'average'],
            ['name' => 'لطيفة السويدي', 'tier' => 'silver', 'overall' => 57,
             'indexes' => ['skills' => 60, 'innovation' => 55, 'intelligence' => 58, 'creativity' => 62, 'projects' => 54, 'leadership' => 52, 'ip' => 35, 'future_readiness' => 60],
             'bio' => 'تتعلم تطوير الويب وتشارك في التحديات المدرسية.',
             'achievements' => 3, 'skills' => 4, 'cognitive' => null],

            // 🥉 برونزي
            ['name' => 'راشد المهيري', 'tier' => 'bronze', 'overall' => 50,
             'indexes' => ['skills' => 52, 'innovation' => 48, 'intelligence' => 51, 'creativity' => 47, 'projects' => 53, 'leadership' => 45, 'ip' => 25, 'future_readiness' => 52],
             'bio' => 'بدأ رحلته في البرمجة حديثاً ويحرز تقدماً ثابتاً.',
             'achievements' => 3, 'skills' => 3, 'cognitive' => null],
            ['name' => 'هند الرميثي', 'tier' => 'bronze', 'overall' => 45,
             'indexes' => ['skills' => 47, 'innovation' => 42, 'intelligence' => 48, 'creativity' => 50, 'projects' => 40, 'leadership' => 42, 'ip' => 20, 'future_readiness' => 46],
             'bio' => 'مهتمة بالتصوير والفنون الرقمية.',
             'achievements' => 3, 'skills' => 3, 'cognitive' => 'low_average'],
            ['name' => 'سيف الشحي', 'tier' => 'bronze', 'overall' => 42,
             'indexes' => ['skills' => 44, 'innovation' => 40, 'intelligence' => 43, 'creativity' => 41, 'projects' => 45, 'leadership' => 38, 'ip' => 18, 'future_readiness' => 44],
             'bio' => 'يشارك في الأنشطة المدرسية ويستكشف ميوله التقنية.',
             'achievements' => 2, 'skills' => 3, 'cognitive' => null],

            // 🌱 نامٍ
            ['name' => 'عائشة الحوسني', 'tier' => 'developing', 'overall' => 35,
             'indexes' => ['skills' => 38, 'innovation' => 32, 'intelligence' => 36, 'creativity' => 40, 'projects' => 30, 'leadership' => 28, 'ip' => 10, 'future_readiness' => 37],
             'bio' => 'في بداية رحلة الابتكار وتحب التجارب العلمية.',
             'achievements' => 2, 'skills' => 2, 'cognitive' => null],
            ['name' => 'ماجد الكتبي', 'tier' => 'developing', 'overall' => 28,
             'indexes' => ['skills' => 30, 'innovation' => 25, 'intelligence' => 29, 'creativity' => 32, 'projects' => 24, 'leadership' => 22, 'ip' => 5, 'future_readiness' => 30],
             'bio' => 'انضم حديثاً للمنصة ويستكشف اهتماماته.',
             'achievements' => 2, 'skills' => 2, 'cognitive' => 'needs_support'],
            ['name' => 'موزة الفلاسي', 'tier' => 'developing', 'overall' => 22,
             'indexes' => ['skills' => 25, 'innovation' => 18, 'intelligence' => 24, 'creativity' => 28, 'projects' => 15, 'leadership' => 18, 'ip' => 3, 'future_readiness' => 25],
             'bio' => 'تتعلم أساسيات الحاسوب وتشارك بحماس.',
             'achievements' => 1, 'skills' => 2, 'cognitive' => null],
            ['name' => 'حمدان العتيبة', 'tier' => 'developing', 'overall' => 15,
             'indexes' => ['skills' => 18, 'innovation' => 10, 'intelligence' => 15, 'creativity' => 22, 'projects' => 10, 'leadership' => 8, 'ip' => 0, 'future_readiness' => 18],
             'bio' => 'طالب مستجد يخطو خطواته الأولى.',
             'achievements' => 1, 'skills' => 1, 'cognitive' => null],
            ['name' => 'اليازية المزروعي', 'tier' => 'developing', 'overall' => 8,
             'indexes' => ['skills' => 10, 'innovation' => 5, 'intelligence' => 8, 'creativity' => 12, 'projects' => 5, 'leadership' => 4, 'ip' => 0, 'future_readiness' => 9],
             'bio' => null,
             'achievements' => 0, 'skills' => 1, 'cognitive' => null],
            ['name' => 'زايد الظنحاني', 'tier' => 'developing', 'overall' => 30,
             'indexes' => ['skills' => 32, 'innovation' => 28, 'intelligence' => 31, 'creativity' => 33, 'projects' => 26, 'leadership' => 24, 'ip' => 8, 'future_readiness' => 32],
             'bio' => 'مهتم بالألعاب الإلكترونية ويرغب بتعلم تطويرها.',
             'achievements' => 2, 'skills' => 2, 'cognitive' => null],
        ];
    }

    // ─────────────────────────────────────────────────────────
    //  إنشاء طالب كامل الملف
    // ─────────────────────────────────────────────────────────

    private function seedStudent(int $num, array $profile, User $teacher, User $school): void
    {
        $user = User::updateOrCreate(
            ['email' => "student{$num}@demo.com"],
            [
                'name' => $profile['name'],
                'password' => Hash::make('password'),
                'role' => 'student',
                'teacher_id' => $teacher->id,
                'school_id' => $school->id,
                'membership_type' => 'subscription',
                'email_verified_at' => now(),
                'bio' => $profile['bio'],
                'innovator_classification' => $profile['tier'],
                'overall_innovation_score' => $profile['overall'],
            ]
        );

        $this->seedAchievements($user, $profile);
        $this->seedSkills($user, $profile);
        $this->seedQualifications($user, $profile);
        $this->seedIndexes($user, $profile);
        $this->seedHistory($user, $profile);
        $this->seedCognitiveAssessment($user, $profile, $teacher);
    }

    private function seedAchievements(User $user, array $profile): void
    {
        $pool = $this->achievementPool();
        $count = min($profile['achievements'], count($pool));

        // توزيع الأنواع حسب مستوى الطالب: المتقدمون يحصلون على الأنواع النادرة أولاً
        $selected = array_slice($pool, 0, $count);

        foreach ($selected as $i => $template) {
            $isTop = in_array($profile['tier'], ['diamond', 'platinum', 'gold']);
            $status = $isTop
                ? ($i % 5 === 4 ? 'pending' : 'validated')
                : ($i % 3 === 0 ? 'validated' : ($i % 3 === 1 ? 'pending' : 'flagged'));

            $confidence = match ($status) {
                'validated' => rand(85, 99),
                'flagged'   => rand(20, 45),
                default     => null,
            };

            $achievement = Achievement::updateOrCreate(
                ['user_id' => $user->id, 'title' => $template['title']],
                [
                    'type' => $template['type'],
                    'category' => $template['category'],
                    'date' => Carbon::now()->subMonths(($i * 2) + 1)->subDays($i * 3),
                    'description' => $template['description'],
                    'ai_validation_status' => $status,
                    'ai_confidence_score' => $confidence,
                    'evidence_score' => $status === 'validated' ? rand(70, 100) : ($status === 'flagged' ? rand(10, 40) : null),
                ]
            );

            // مرفق رابط رسمي للإنجازات المتحقق منها
            if ($status === 'validated' && $i % 2 === 0) {
                AchievementAttachment::updateOrCreate(
                    ['achievement_id' => $achievement->id, 'url' => "https://example.org/evidence/{$achievement->id}"],
                    [
                        'file_type' => 'url',
                        'ai_evidence_type' => 'official_website',
                        'ai_confidence_score' => 90,
                    ]
                );
            }
        }
    }

    private function achievementPool(): array
    {
        return [
            ['type' => 'project', 'category' => 'الذكاء الاصطناعي',
             'title' => 'نظام ذكي لتحليل الصور الطبية',
             'description' => 'مشروع يستخدم التعلم العميق لتحليل الصور الطبية والمساعدة في التشخيص المبكر، بُني باستخدام Python وTensorFlow.'],
            ['type' => 'award', 'category' => 'مسابقات',
             'title' => 'المركز الأول في هاكاثون الابتكار الوطني',
             'description' => 'الفوز بالمركز الأول من بين 50 فريقاً في تحدي تطوير حلول ذكية للمدن المستدامة.'],
            ['type' => 'certificate', 'category' => 'تعليم ذاتي',
             'title' => 'شهادة علوم البيانات من Coursera',
             'description' => 'إتمام تخصص علوم البيانات المكوّن من 5 دورات تشمل التحليل الإحصائي وتعلم الآلة.'],
            ['type' => 'patent', 'category' => 'ملكية فكرية',
             'title' => 'براءة اختراع: جهاز ري ذكي موفّر للمياه',
             'description' => 'تسجيل براءة اختراع لجهاز يستشعر رطوبة التربة ويتحكم بالري تلقائياً موفراً 40% من استهلاك المياه.'],
            ['type' => 'research', 'category' => 'بحث علمي',
             'title' => 'بحث: أثر التعلم التكيفي على تحصيل الطلبة',
             'description' => 'دراسة ميدانية على 120 طالباً تقيس أثر أنظمة التعلم التكيفي على التحصيل الدراسي، مع تحليل إحصائي كامل.'],
            ['type' => 'article', 'category' => 'كتابة علمية',
             'title' => 'مقال: مستقبل الحوسبة الكمومية في التعليم',
             'description' => 'مقال علمي مبسّط منشور في مجلة المدرسة يشرح مبادئ الحوسبة الكمومية وتطبيقاتها المستقبلية.'],
            ['type' => 'product', 'category' => 'ريادة أعمال',
             'title' => 'تطبيق "رحلتي" لتنظيم الرحلات المدرسية',
             'description' => 'تطبيق جوال متكامل يستخدمه منسقو الرحلات المدرسية للتسجيل والمتابعة، وصل لـ 500 مستخدم.'],
            ['type' => 'skill', 'category' => 'مهارات تقنية',
             'title' => 'إتقان تطوير الواجهات بـ React',
             'description' => 'بناء 4 مشاريع واجهات تفاعلية باستخدام React وTailwind ضمن معسكر تدريبي مكثف.'],
        ];
    }

    private function seedSkills(User $user, array $profile): void
    {
        $skillPool = [
            ['name' => 'Python', 'category' => 'برمجة', 'level' => 'advanced'],
            ['name' => 'Machine Learning', 'category' => 'ذكاء اصطناعي', 'level' => 'advanced'],
            ['name' => 'القيادة', 'category' => 'مهارات قيادية', 'level' => 'intermediate'],
            ['name' => 'تحليل البيانات', 'category' => 'علوم بيانات', 'level' => 'advanced'],
            ['name' => 'React', 'category' => 'تطوير ويب', 'level' => 'intermediate'],
            ['name' => 'حل المشكلات', 'category' => 'مهارات ذهنية', 'level' => 'advanced'],
            ['name' => 'التصميم الجرافيكي', 'category' => 'تصميم', 'level' => 'intermediate'],
            ['name' => 'الكتابة العلمية', 'category' => 'تواصل', 'level' => 'intermediate'],
            ['name' => 'HTML & CSS', 'category' => 'تطوير ويب', 'level' => 'beginner'],
        ];

        $count = min($profile['skills'], count($skillPool));
        $isTop = in_array($profile['tier'], ['diamond', 'platinum']);

        foreach (array_slice($skillPool, 0, $count) as $i => $skill) {
            UserSkill::updateOrCreate(
                ['user_id' => $user->id, 'name' => $skill['name']],
                [
                    'category' => $skill['category'],
                    'proficiency_level' => $isTop ? $skill['level'] : ($i === 0 ? $skill['level'] : 'beginner'),
                    'source' => $i % 2 === 0 ? 'ai_extracted' : 'manual',
                ]
            );
        }
    }

    private function seedQualifications(User $user, array $profile): void
    {
        if (!in_array($profile['tier'], ['diamond', 'platinum', 'gold', 'silver'])) {
            return;
        }

        UserQualification::updateOrCreate(
            ['user_id' => $user->id, 'title' => 'برنامج الموهوبين الصيفي'],
            [
                'institution' => 'مؤسسة أوج للنشر والتدريب',
                'field' => 'الابتكار والتفكير التصميمي',
                'start_date' => Carbon::now()->subYear(),
                'end_date' => Carbon::now()->subMonths(10),
                'description' => 'برنامج مكثف لمدة شهرين في مهارات الابتكار وريادة الأعمال.',
            ]
        );
    }

    private function seedIndexes(User $user, array $profile): void
    {
        InnovationIndex::updateOrCreate(
            ['user_id' => $user->id],
            [
                'skills_index' => $profile['indexes']['skills'],
                'innovation_index' => $profile['indexes']['innovation'],
                'intelligence_index' => $profile['indexes']['intelligence'],
                'creativity_index' => $profile['indexes']['creativity'],
                'projects_index' => $profile['indexes']['projects'],
                'leadership_index' => $profile['indexes']['leadership'],
                'ip_index' => $profile['indexes']['ip'],
                'future_readiness_index' => $profile['indexes']['future_readiness'],
                'overall_score' => $profile['overall'],
                'classification' => $profile['tier'],
                'calculated_at' => now(),
            ]
        );
    }

    /**
     * سجل 6 أشهر من التطور التصاعدي للدرجة الكلية وأقوى مؤشرين
     */
    private function seedHistory(User $user, array $profile): void
    {
        if ($profile['overall'] < 20) {
            return; // الطلاب المستجدون لا سجل لهم بعد
        }

        DB::table('index_history')->where('user_id', $user->id)->delete();

        $tracked = ['overall' => $profile['overall']];
        arsort($profile['indexes']);
        foreach (array_slice($profile['indexes'], 0, 2, true) as $name => $final) {
            $tracked[$name] = $final;
        }

        $rows = [];
        foreach ($tracked as $indexName => $finalValue) {
            $start = max(5, round($finalValue * 0.55));
            $step = ($finalValue - $start) / 6;

            for ($month = 6; $month >= 1; $month--) {
                $old = round($start + $step * (6 - $month), 2);
                $new = round($start + $step * (7 - $month), 2);

                $rows[] = [
                    'user_id' => $user->id,
                    'index_name' => $indexName,
                    'old_value' => $old,
                    'new_value' => $new,
                    'trigger_type' => $month % 2 === 0 ? 'achievement_added' : 'system_recalc',
                    'created_at' => Carbon::now()->subMonths($month)->addDays(rand(1, 20)),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('index_history')->insert($rows);
    }

    /**
     * تقييمات معرفية (ستانفورد-بينيه) بملفات متنوعة واقعية
     */
    private function seedCognitiveAssessment(User $user, array $profile, User $teacher): void
    {
        $template = match ($profile['cognitive']) {
            'gifted' => [
                'full_scale_iq' => 132, 'verbal_iq' => 128, 'nonverbal_iq' => 134,
                'fluid_reasoning' => 138, 'knowledge' => 126, 'quantitative_reasoning' => 135,
                'visual_spatial' => 130, 'working_memory' => 124,
                'composite_abilities' => ['planning' => 133, 'attention_focus' => 122, 'trial_error_solving' => 128, 'time_pressure_performance' => 125],
                'strengths' => ['الاستدلال الاستقرائي والاستنباطي', 'التخطيط طويل المدى', 'حل المشكلات الكمية المعقدة'],
                'weaknesses' => ['قد تحتاج تحدياً أعلى لتجنب الملل'],
                'notes' => 'أداء استثنائي عبر جميع العوامل. يُنصح بمسار إثرائي متقدم ومسابقات دولية.',
            ],
            'high_average' => [
                'full_scale_iq' => 114, 'verbal_iq' => 110, 'nonverbal_iq' => 117,
                'fluid_reasoning' => 118, 'knowledge' => 108, 'quantitative_reasoning' => 115,
                'visual_spatial' => 116, 'working_memory' => 106,
                'composite_abilities' => ['planning' => 115, 'attention_focus' => 108, 'trial_error_solving' => 112, 'time_pressure_performance' => 105],
                'strengths' => ['المعالجة البصرية المكانية', 'الاستدلال الكمي'],
                'weaknesses' => ['الذاكرة العاملة السمعية'],
                'notes' => 'أداء فوق المتوسط بثبات. تمارين الذاكرة العاملة سترفع كفاءته في المهام متعددة الخطوات.',
            ],
            'average' => [
                'full_scale_iq' => 101, 'verbal_iq' => 99, 'nonverbal_iq' => 103,
                'fluid_reasoning' => 104, 'knowledge' => 98, 'quantitative_reasoning' => 102,
                'visual_spatial' => 100, 'working_memory' => 97,
                'composite_abilities' => ['planning' => 102, 'attention_focus' => 99, 'trial_error_solving' => 101, 'time_pressure_performance' => 96],
                'strengths' => ['توازن عام بين العوامل الخمسة'],
                'weaknesses' => ['الأداء تحت ضغط الوقت'],
                'notes' => 'ملف متوازن. التدريب على تحديات موقوتة سيحسّن جاهزيته للمسابقات.',
            ],
            // ملف مطابق لنمط التقرير الحقيقي: قوة سائلة مع ضعف معرفة وذاكرة عاملة
            'uneven' => [
                'full_scale_iq' => 84, 'verbal_iq' => 82, 'nonverbal_iq' => 88,
                'fluid_reasoning' => 112, 'knowledge' => 71, 'quantitative_reasoning' => 86,
                'visual_spatial' => 95, 'working_memory' => 76,
                'composite_abilities' => ['planning' => 99, 'attention_focus' => 83, 'trial_error_solving' => 89, 'time_pressure_performance' => 80],
                'strengths' => ['الاستدلال السائل (متفوق)', 'تتبع التسلسلات البصرية', 'القدرة على التخطيط', 'استراتيجيات المحاولة والخطأ'],
                'weaknesses' => ['رصيد المعلومات العامة', 'الذاكرة العاملة', 'الأداء تحت ضغط الوقت', 'مدى اتساع الانتباه السمعي'],
                'notes' => 'نمط غير متجانس: استدلال سائل متفوق (95 مئيني) مقابل ضعف واضح في المعرفة المتبلورة والذاكرة العاملة. يُنصح بمهام تحدي الخوارزميات لاستثمار قوته، مع برنامج إثرائي للمفردات والمعلومات العامة وتمارين تتبع بصري لتقوية الذاكرة العاملة، والتدرج في التحديات الموقوتة.',
            ],
            'low_average' => [
                'full_scale_iq' => 88, 'verbal_iq' => 86, 'nonverbal_iq' => 91,
                'fluid_reasoning' => 92, 'knowledge' => 84, 'quantitative_reasoning' => 87,
                'visual_spatial' => 94, 'working_memory' => 85,
                'composite_abilities' => ['planning' => 90, 'attention_focus' => 86, 'trial_error_solving' => 92, 'time_pressure_performance' => 84],
                'strengths' => ['المعالجة البصرية', 'المثابرة في المهام اليدوية'],
                'weaknesses' => ['المعرفة اللفظية', 'الاستدلال الكمي'],
                'notes' => 'يستفيد من التعلم البصري والعملي. يُنصح بربط المفاهيم المجردة بأمثلة ملموسة.',
            ],
            'needs_support' => [
                'full_scale_iq' => 78, 'verbal_iq' => 75, 'nonverbal_iq' => 82,
                'fluid_reasoning' => 84, 'knowledge' => 72, 'quantitative_reasoning' => 76,
                'visual_spatial' => 86, 'working_memory' => 74,
                'composite_abilities' => ['planning' => 80, 'attention_focus' => 75, 'trial_error_solving' => 83, 'time_pressure_performance' => 72],
                'strengths' => ['التعلم بالمحاولة والخطأ', 'الأنشطة البصرية الحركية'],
                'weaknesses' => ['الذاكرة العاملة', 'الانتباه الممتد', 'المعرفة العامة'],
                'notes' => 'يحتاج خطة دعم فردية بجلسات قصيرة متكررة وأنشطة عملية، مع تعزيز إيجابي مستمر.',
            ],
            default => null,
        };

        if (!$template) {
            return;
        }

        CognitiveAssessment::updateOrCreate(
            ['user_id' => $user->id, 'assessment_date' => Carbon::now()->subMonths(3)->toDateString()],
            array_merge($template, [
                'entered_by' => $teacher->id,
                'assessor_name' => 'د. دينا محمد ضيف',
            ])
        );
    }
}
