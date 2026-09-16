<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * submissions
     * submission_id (PK), assignment_id (FK), user_id (FK), submitted_at, result
     * — Design Document §5.1 (US10, US12, US14).
     */
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id('submission_id');
            $table->foreignId('assignment_id')->constrained('assignments', 'assignment_id')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users', 'user_id')->cascadeOnDelete();
            $table->string('file_path')->nullable(); // for assignment file submissions
            $table->text('notes')->nullable();
            $table->json('quiz_answers')->nullable(); // [selected_index, ...] for quiz attempts
            $table->unsignedSmallInteger('score')->nullable();
            $table->enum('result', ['pending', 'pass', 'fail'])->default('pending');
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('graded_at')->nullable();
            $table->timestamps();

            $table->unique(['assignment_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
