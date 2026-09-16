<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * assignments
     * assignment_id (PK), course_id (FK), title, due_date, status
     * — Design Document §5.1 (US10, US12).
     *
     * Extended with `type` + `quiz_questions` to also cover US14 ("take a
     * quiz and get a result") without introducing a whole separate quiz
     * schema — a quiz is simply an assignment of type "quiz" whose
     * questions live as JSON and whose attempts are recorded in submissions.
     */
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id('assignment_id');
            $table->foreignId('course_id')->constrained('courses', 'course_id')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['assignment', 'quiz'])->default('assignment');
            $table->json('quiz_questions')->nullable(); // [{question, options[], correct_index}], quizzes only
            $table->date('due_date')->nullable();
            $table->enum('status', ['draft', 'open', 'closed'])->default('open');
            $table->unsignedSmallInteger('max_score')->default(100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
