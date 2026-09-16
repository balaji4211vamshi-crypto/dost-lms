<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseMaterial;
use App\Models\Enrolment;
use App\Models\ProgressReport;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Realistic demo data for the DOST Academy System (Implementation Plan
 * step 6: "seed database with realistic demo data"). Run with:
 *   php artisan migrate --seed
 * or, on an existing database:
 *   php artisan db:seed
 *
 * Known logins (all passwords: "password"):
 *   admin@dost.gov.au     — administrator
 *   j.employee@dost.gov.au — employee, several courses in progress
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- Users ---
        $admin = User::create([
            'name' => 'Alex Morgan',
            'email' => 'admin@dost.gov.au',
            'password' => 'password',
            'role' => 'admin',
            'department' => 'IT Services',
            'job_title' => 'Learning & Development Administrator',
        ]);

        $namedEmployee = User::create([
            'name' => 'Jordan Employee',
            'email' => 'j.employee@dost.gov.au',
            'password' => 'password',
            'role' => 'employee',
            'department' => 'Policy & Research',
            'job_title' => 'Policy Officer',
        ]);

        $employees = collect([$namedEmployee])->merge(User::factory()->count(9)->create());

        // --- Courses (each with 3-5 materials, 2 assignments incl. 1 quiz) ---
        $courseBlueprints = [
            ['title' => 'Workplace Health & Safety Fundamentals', 'department' => 'Human Resources', 'level' => 'Beginner'],
            ['title' => 'Introduction to Public Sector Cyber Security', 'department' => 'IT Services', 'level' => 'Beginner'],
            ['title' => 'Effective Policy Writing', 'department' => 'Policy & Research', 'level' => 'Intermediate'],
            ['title' => 'Financial Reporting Essentials', 'department' => 'Finance', 'level' => 'Intermediate'],
            ['title' => 'Leadership for New Managers', 'department' => 'Human Resources', 'level' => 'Advanced'],
            ['title' => 'Field Data Collection Standards', 'department' => 'Field Operations', 'level' => 'Intermediate'],
        ];

        $courses = collect();

        foreach ($courseBlueprints as $blueprint) {
            $course = Course::create($blueprint + [
                'description' => "A DOST Academy course covering {$blueprint['title']} for staff in {$blueprint['department']}.",
                'duration' => fake()->randomElement(['2 hours', '4 hours', '1 day']),
                'created_by' => $admin->user_id,
                'is_published' => true,
            ]);
            $courses->push($course);

            foreach (['Introduction slides', 'Reference handbook (PDF)', 'External reading'] as $i => $title) {
                CourseMaterial::create([
                    'course_id' => $course->course_id,
                    'title' => $title,
                    'type' => $i === 2 ? 'link' : 'document',
                    'material_path' => $i === 2
                        ? 'https://www.qld.gov.au/'
                        : "course-materials/{$course->course_id}/placeholder-{$i}.pdf",
                    'original_filename' => $i === 2 ? null : Str::slug($title).'.pdf',
                    'size_bytes' => $i === 2 ? null : fake()->numberBetween(150_000, 4_000_000),
                    'uploaded_by' => $admin->user_id,
                    'sort_order' => $i,
                ]);
            }

            Assignment::create([
                'course_id' => $course->course_id,
                'title' => "{$blueprint['title']}: Written Assignment",
                'description' => 'Summarise the key takeaways from this course in your own words.',
                'type' => 'assignment',
                'due_date' => now()->addWeeks(2),
                'status' => 'open',
                'max_score' => 100,
            ]);

            Assignment::create([
                'course_id' => $course->course_id,
                'title' => "{$blueprint['title']}: Knowledge Check",
                'description' => 'Short quiz to confirm understanding of this course.',
                'type' => 'quiz',
                'quiz_questions' => [
                    ['question' => 'This course is primarily intended for which audience?', 'options' => ['DOST employees', 'Members of the public', 'Contractors only'], 'correct_index' => 0],
                    ['question' => 'How is your progress in this course tracked?', 'options' => ['It is not tracked', 'Via your enrolment progress percentage', 'Only by your manager'], 'correct_index' => 1],
                    ['question' => 'What happens when you complete a course?', 'options' => ['Nothing', 'You may be issued a certificate', 'Your account is closed'], 'correct_index' => 1],
                ],
                'due_date' => now()->addWeeks(2),
                'status' => 'open',
                'max_score' => 100,
            ]);
        }

        // --- Enrolments, progress, submissions, certificates ---
        foreach ($employees as $index => $employee) {
            $enrolledCourses = $courses->random(min(3, $courses->count()));

            foreach ($enrolledCourses as $ci => $course) {
                // Vary progress: first course completed, second in progress, rest not started.
                $progress = match ($ci) {
                    0 => 100,
                    1 => fake()->numberBetween(20, 80),
                    default => fake()->numberBetween(0, 10),
                };
                $status = $progress >= 100 ? 'completed' : ($progress > 0 ? 'in_progress' : 'not_started');

                $enrolment = Enrolment::create([
                    'user_id' => $employee->user_id,
                    'course_id' => $course->course_id,
                    'progress' => $progress,
                    'status' => $status,
                    'enrolled_at' => now()->subDays(fake()->numberBetween(5, 60)),
                    'completed_at' => $status === 'completed' ? now()->subDays(fake()->numberBetween(0, 4)) : null,
                ]);

                ProgressReport::create([
                    'user_id' => $employee->user_id,
                    'course_id' => $course->course_id,
                    'progress' => $progress,
                    'last_updated' => $enrolment->updated_at,
                ]);

                if ($status !== 'not_started') {
                    $assignment = $course->assignments()->where('type', 'assignment')->first();
                    if ($assignment) {
                        Submission::create([
                            'assignment_id' => $assignment->assignment_id,
                            'user_id' => $employee->user_id,
                            'file_path' => "submissions/{$assignment->assignment_id}/placeholder-{$employee->user_id}.pdf",
                            'notes' => 'Submitted via DOST Academy.',
                            'result' => $status === 'completed' ? 'pass' : 'pending',
                            'score' => $status === 'completed' ? fake()->numberBetween(70, 100) : null,
                            'submitted_at' => now()->subDays(fake()->numberBetween(1, 10)),
                            'graded_at' => $status === 'completed' ? now()->subDays(fake()->numberBetween(0, 3)) : null,
                        ]);
                    }

                    $quiz = $course->assignments()->where('type', 'quiz')->first();
                    if ($quiz && $status === 'completed') {
                        Submission::create([
                            'assignment_id' => $quiz->assignment_id,
                            'user_id' => $employee->user_id,
                            'quiz_answers' => [0, 1, 1],
                            'score' => 100,
                            'result' => 'pass',
                            'submitted_at' => now()->subDays(fake()->numberBetween(1, 10)),
                            'graded_at' => now()->subDays(fake()->numberBetween(0, 3)),
                        ]);
                    }
                }

                if ($status === 'completed') {
                    Certificate::create([
                        'user_id' => $employee->user_id,
                        'course_id' => $course->course_id,
                        'certificate_number' => 'DOST-'.now()->format('Y').'-'.Str::upper(Str::random(8)),
                        'issued_date' => now()->subDays(fake()->numberBetween(0, 3)),
                        'issued_by' => $admin->user_id,
                    ]);
                }
            }
        }

        $this->command?->info('Seeded DOST Academy System demo data: '.User::count().' users, '.Course::count().' courses.');
    }
}
