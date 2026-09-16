<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * course_materials — Phase 2 addition covering US9 ("upload videos and
     * documents to a course"). Files are written via the Storage facade to
     * the "public" disk; material_path is the stored path on that disk.
     */
    public function up(): void
    {
        Schema::create('course_materials', function (Blueprint $table) {
            $table->id('material_id');
            $table->foreignId('course_id')->constrained('courses', 'course_id')->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['video', 'document', 'link', 'other'])->default('document');
            $table->string('material_path');
            $table->string('original_filename')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users', 'user_id')->nullOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_materials');
    }
};
