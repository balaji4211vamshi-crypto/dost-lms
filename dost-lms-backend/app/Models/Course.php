<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'course_id';

    protected $fillable = [
        'title',
        'description',
        'department',
        'duration',
        'level',
        'thumbnail_path',
        'created_by',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    // --- Relationships ---

    public function enrolments(): HasMany
    {
        return $this->hasMany(Enrolment::class, 'course_id', 'course_id');
    }

    public function learners(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrolments', 'course_id', 'user_id', 'course_id', 'user_id')
            ->withPivot(['progress', 'status', 'enrolled_at', 'completed_at'])
            ->withTimestamps();
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'course_id', 'course_id');
    }

    public function materials(): HasMany
    {
        return $this->hasMany(CourseMaterial::class, 'course_id', 'course_id')->orderBy('sort_order');
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'course_id', 'course_id');
    }

    public function progressReports(): HasMany
    {
        return $this->hasMany(ProgressReport::class, 'course_id', 'course_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }
}
